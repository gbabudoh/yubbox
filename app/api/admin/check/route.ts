import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

/**
 * Check if current user is admin
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin();
    return NextResponse.json({
      success: true,
      isAdmin: admin,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        isAdmin: false,
        error: error.message || 'Failed to check admin status',
      },
      { status: 500 }
    );
  }
}

