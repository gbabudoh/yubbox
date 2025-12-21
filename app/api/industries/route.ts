import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Industry from '@/models/Industry';

/**
 * GET - Get all active industries (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const industries = await Industry.find({ isActive: true })
      .select('name slug description')
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch industries',
      },
      { status: 500 }
    );
  }
}

