import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Industry from '@/models/Industry';

/**
 * GET - Get all active industries (public endpoint)
 */
export async function GET() {
  try {
    await dbConnect();

    const industries = await Industry.find({ isActive: true })
      .select('name slug description')
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch industries';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

