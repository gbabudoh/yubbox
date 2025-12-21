import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

/**
 * GET - Get a single category
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
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
        error: error.message || 'Failed to fetch category',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a category
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
    const { name, description, order, isActive, type } = body;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (name) {
      category.name = name;
      // Auto-generate slug from name when name changes
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (type && ['product', 'service'].includes(type)) category.type = type;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return NextResponse.json({
      success: true,
      data: category,
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
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
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
        error: error.message || 'Failed to delete category',
      },
      { status: 500 }
    );
  }
}

