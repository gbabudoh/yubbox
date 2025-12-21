import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ProductType from '@/models/ProductType';

/**
 * GET - Get all active product types (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // Optional filter: 'service' or 'physical'

    const query: any = { isActive: true };
    if (type && ['service', 'physical'].includes(type)) {
      query.type = type;
    }

    const productTypes = await ProductType.find(query)
      .select('name slug type description')
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: productTypes,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch product types',
      },
      { status: 500 }
    );
  }
}

