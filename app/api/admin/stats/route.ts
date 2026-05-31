import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const [totalAds, totalUsers, totalPayments, activeAds] = await Promise.all([
      prisma.ad.count(),
      prisma.user.count(),
      prisma.payment.count({ where: { status: 'completed' } }),
      prisma.ad.count({ where: { isActive: true, expiryDate: { gte: new Date() } } }),
    ]);

    // Calculate total revenue
    const completedPayments = await prisma.payment.findMany({
      where: { status: 'completed' },
      select: { amount: true },
    });
    const totalRevenue = completedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent ads (last 10)
    const recentAds = await prisma.ad.findMany({
      select: { id: true, title: true, isPaid: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
      select: { id: true, amount: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalAds,
        activeAds,
        totalPayments,
        totalRevenue,
        recentUsers,
        recentAds,
        recentPayments,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
