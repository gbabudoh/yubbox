import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

/**
 * Check if current user is admin
 */
export async function GET() {
  try {
    const admin = await isAdmin();
    return NextResponse.json({
      success: true,
      isAdmin: admin,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check admin status';
    return NextResponse.json(
      {
        success: false,
        isAdmin: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

