import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Ad from '@/models/Ad';
import Payment from '@/models/Payment';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalAds = await Ad.countDocuments();
    const activeAds = await Ad.countDocuments({ isActive: true, isPaid: true });
    const totalPayments = await Payment.countDocuments({ status: 'completed' });

    // Calculate total revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Get recent users (last 10)
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get recent ads (last 10)
    const recentAds = await Ad.find({})
      .select('title isPaid isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get recent payments (last 10)
    const recentPayments = await Payment.find({})
      .select('amount status createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}

