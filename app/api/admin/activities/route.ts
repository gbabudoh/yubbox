import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'all'; // all, user_created, ad_created, payment, ad_view, ad_click

    const skip = (page - 1) * limit;
    const activities: Array<{
      type: string;
      description: string;
      user?: string;
      userId?: string;
      adId?: string;
      amount?: number;
      status?: string;
      timestamp: Date;
      country?: string;
    }> = [];

    const fetchLimit = type === 'all' ? limit : 50;
    const fetchSkip = type === 'all' ? skip : 0;

    // User registrations
    if (type === 'all' || type === 'user_created') {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: fetchSkip,
        take: fetchLimit,
      });

      users.forEach((user) => {
        activities.push({
          type: 'user_created',
          description: `New user registered: ${user.name} (${user.email})`,
          user: user.name,
          userId: user.id,
          timestamp: user.createdAt,
        });
      });
    }

    // Ad creations
    if (type === 'all' || type === 'ad_created') {
      const ads = await prisma.ad.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: fetchSkip,
        take: fetchLimit,
      });

      ads.forEach((ad) => {
        activities.push({
          type: 'ad_created',
          description: `Ad created: "${ad.title}"`,
          user: ad.user?.name || 'Unknown',
          userId: ad.user?.id,
          adId: ad.id,
          timestamp: ad.createdAt,
        });
      });
    }

    // Payments
    if (type === 'all' || type === 'payment') {
      const payments = await prisma.payment.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          ad: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: fetchSkip,
        take: fetchLimit,
      });

      payments.forEach((payment) => {
        activities.push({
          type: 'payment',
          description: `Payment ${payment.status}: $${Number(payment.amount).toFixed(2)} for "${payment.ad?.title || 'Unknown Ad'}"`,
          user: payment.user?.name || 'Unknown',
          userId: payment.user?.id,
          amount: Number(payment.amount),
          status: payment.status,
          timestamp: payment.createdAt,
        });
      });
    }

    // Ad views
    if (type === 'all' || type === 'ad_view') {
      const views = await prisma.analytics.findMany({
        where: { eventType: EventType.view },
        select: {
          id: true,
          country: true,
          createdAt: true,
          ad: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: fetchSkip,
        take: fetchLimit,
      });

      views.forEach((view) => {
        activities.push({
          type: 'ad_view',
          description: `Ad viewed: "${view.ad?.title || 'Unknown'}" from ${view.country || 'Unknown'}`,
          adId: view.ad?.id,
          country: view.country ?? undefined,
          timestamp: view.createdAt,
        });
      });
    }

    // Ad clicks
    if (type === 'all' || type === 'ad_click') {
      const clicks = await prisma.analytics.findMany({
        where: { eventType: EventType.click },
        select: {
          id: true,
          country: true,
          createdAt: true,
          ad: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: fetchSkip,
        take: fetchLimit,
      });

      clicks.forEach((click) => {
        activities.push({
          type: 'ad_click',
          description: `Ad clicked: "${click.ad?.title || 'Unknown'}" from ${click.country || 'Unknown'}`,
          adId: click.ad?.id,
          country: click.country ?? undefined,
          timestamp: click.createdAt,
        });
      });
    }

    // Sort all activities by timestamp and paginate
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
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
