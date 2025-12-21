import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Ad from '@/models/Ad';
import Payment from '@/models/Payment';
import Analytics from '@/models/Analytics';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'all'; // all, user_created, ad_created, payment, ad_view, ad_click

    const skip = (page - 1) * limit;
    const activities: any[] = [];

    // User registrations
    if (type === 'all' || type === 'user_created') {
      const users = await User.find({})
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? skip : 0)
        .limit(type === 'all' ? limit : 50)
        .lean();

      users.forEach((user: any) => {
        activities.push({
          type: 'user_created',
          description: `New user registered: ${user.name} (${user.email})`,
          user: user.name,
          userId: user._id,
          timestamp: user.createdAt,
        });
      });
    }

    // Ad creations
    if (type === 'all' || type === 'ad_created') {
      const ads = await Ad.find({})
        .populate('userId', 'name email')
        .select('title userId createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? skip : 0)
        .limit(type === 'all' ? limit : 50)
        .lean();

      ads.forEach((ad: any) => {
        activities.push({
          type: 'ad_created',
          description: `Ad created: "${ad.title}"`,
          user: ad.userId?.name || 'Unknown',
          userId: ad.userId?._id,
          adId: ad._id,
          timestamp: ad.createdAt,
        });
      });
    }

    // Payments
    if (type === 'all' || type === 'payment') {
      const payments = await Payment.find({})
        .populate('userId', 'name email')
        .populate('adId', 'title')
        .select('amount status userId adId createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? skip : 0)
        .limit(type === 'all' ? limit : 50)
        .lean();

      payments.forEach((payment: any) => {
        activities.push({
          type: 'payment',
          description: `Payment ${payment.status}: $${payment.amount?.toFixed(2)} for "${payment.adId?.title || 'Unknown Ad'}"`,
          user: payment.userId?.name || 'Unknown',
          userId: payment.userId?._id,
          amount: payment.amount,
          status: payment.status,
          timestamp: payment.createdAt,
        });
      });
    }

    // Ad views
    if (type === 'all' || type === 'ad_view') {
      const views = await Analytics.find({ type: 'view' })
        .populate('adId', 'title')
        .select('adId country userAgent createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? skip : 0)
        .limit(type === 'all' ? limit : 50)
        .lean();

      views.forEach((view: any) => {
        activities.push({
          type: 'ad_view',
          description: `Ad viewed: "${view.adId?.title || 'Unknown'}" from ${view.country || 'Unknown'}`,
          adId: view.adId?._id,
          country: view.country,
          timestamp: view.createdAt,
        });
      });
    }

    // Ad clicks
    if (type === 'all' || type === 'ad_click') {
      const clicks = await Analytics.find({ type: 'click' })
        .populate('adId', 'title')
        .select('adId country userAgent createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? skip : 0)
        .limit(type === 'all' ? limit : 50)
        .lean();

      clicks.forEach((click: any) => {
        activities.push({
          type: 'ad_click',
          description: `Ad clicked: "${click.adId?.title || 'Unknown'}" from ${click.country || 'Unknown'}`,
          adId: click.adId?._id,
          country: click.country,
          timestamp: click.createdAt,
        });
      });
    }

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const paginatedActivities = activities.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          page,
          limit,
          total: activities.length,
          pages: Math.ceil(activities.length / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}

