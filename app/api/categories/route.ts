import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

/**
 * GET - Get all active categories (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .select('name slug description type')
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

