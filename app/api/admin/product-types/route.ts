import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import ProductType from '@/models/ProductType';

/**
 * GET - Get all product types
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const type = searchParams.get('type'); // 'service' or 'physical'

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (type) {
      query.type = type;
    }

    const productTypes = await ProductType.find(query).sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: productTypes,
    });
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch product types',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new product type
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { name, type, description, order, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product type name is required' },
        { status: 400 }
      );
    }

    if (!type || !['service', 'physical'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Product type must be "service" or "physical"' },
        { status: 400 }
      );
    }

    const productType = await ProductType.create({
      name,
      type,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: productType,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product type with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create product type',
      },
      { status: 500 }
    );
  }
}

