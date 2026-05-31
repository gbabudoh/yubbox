import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [adsCount, paymentsCount, completedPayments] = await Promise.all([
          prisma.ad.count({ where: { userId: user.id } }),
          prisma.payment.count({ where: { userId: user.id, status: 'completed' } }),
          prisma.payment.findMany({
            where: { userId: user.id, status: 'completed' },
            select: { amount: true },
          }),
        ]);
        const totalSpent = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          ...user,
          adsCount,
          paymentsCount,
          totalSpent,
        };
      })
    );

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
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, name, email, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: { name?: string; email?: string; role?: Role } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = role as Role;
    }

    let user;
    try {
      user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (updateError: unknown) {
      if (
        typeof updateError === 'object' &&
        updateError !== null &&
        'code' in updateError &&
        (updateError as { code: string }).code === 'P2025'
      ) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

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

    // Cascade deletes are handled by Prisma schema (onDelete: Cascade on User relations)
    // But Payment doesn't cascade from User in schema, so delete manually first
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
