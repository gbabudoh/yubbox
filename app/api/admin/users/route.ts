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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user: any) => {
        const adsCount = await Ad.countDocuments({ userId: user._id });
        const paymentsCount = await Payment.countDocuments({ userId: user._id, status: 'completed' });
        const payments = await Payment.find({ userId: user._id, status: 'completed' });
        const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          ...user,
          adsCount,
          paymentsCount,
          totalSpent,
        };
      })
    );

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { userId, name, email, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update user',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/nextauth');
    const session = await getServerSession(authOptions);
    if (session?.user?.id === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user's ads and payments
    await Ad.deleteMany({ userId });
    await Payment.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete user',
      },
      { status: 500 }
    );
  }
}

