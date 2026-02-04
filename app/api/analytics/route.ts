import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Analytics from '@/models/Analytics';
import Ad from '@/models/Ad';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { adId, eventType, country, ipAddress, userAgent, referrer } = body;

    if (!adId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Ad ID and event type are required' },
        { status: 400 }
      );
    }

    // Verify ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Get user session if available
    const session = await getServerSession(authOptions);

    // Create analytics record
    const analytics = await Analytics.create({
      adId,
      eventType,
      country: country || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      referrer: referrer || null,
      userId: session?.user?.id || null,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record analytics';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get('adId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the ad
    const ad = await Ad.findById(adId);
    if (!ad || ad.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Build query
    const query: {
      adId: string;
      eventType?: string;
      timestamp?: { $gte?: Date; $lte?: Date };
    } = { adId };

    if (eventType) {
      query.eventType = eventType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const analytics = await Analytics.find(query).sort({ timestamp: -1 });

    // Aggregate statistics
    const totalViews = await Analytics.countDocuments({
      adId,
      eventType: 'view',
    });
    const totalClicks = await Analytics.countDocuments({
      adId,
      eventType: 'click',
    });

    // Country breakdown
    const countryStats = await Analytics.aggregate([
      { $match: { adId: ad._id, eventType: 'click' } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Hourly breakdown
    const hourlyStats = await Analytics.aggregate([
      { $match: { adId: ad._id, eventType: 'click' } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily breakdown (last 30 days)
    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          adId: ad._id,
          eventType: 'click',
          timestamp: {
            $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        statistics: {
          totalViews,
          totalClicks,
          clickThroughRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
          countryStats,
          hourlyStats,
          dailyStats,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

