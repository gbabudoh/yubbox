import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import ProductType from '@/models/ProductType';

/**
 * GET - Get a single product type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const productType = await ProductType.findById(id);

    if (!productType) {
      return NextResponse.json(
        { success: false, error: 'Product type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: productType,
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
        error: error.message || 'Failed to fetch product type',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a product type
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { name, type, description, order, isActive } = body;

    const productType = await ProductType.findById(id);

    if (!productType) {
      return NextResponse.json(
        { success: false, error: 'Product type not found' },
        { status: 404 }
      );
    }

    if (name) productType.name = name;
    if (type && ['service', 'physical'].includes(type)) productType.type = type;
    if (description !== undefined) productType.description = description;
    if (order !== undefined) productType.order = order;
    if (isActive !== undefined) productType.isActive = isActive;

    await productType.save();

    return NextResponse.json({
      success: true,
      data: productType,
    });
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
        error: error.message || 'Failed to update product type',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a product type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const productType = await ProductType.findByIdAndDelete(id);

    if (!productType) {
      return NextResponse.json(
        { success: false, error: 'Product type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product type deleted successfully',
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
        error: error.message || 'Failed to delete product type',
      },
      { status: 500 }
    );
  }
}

