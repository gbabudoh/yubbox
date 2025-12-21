import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

/**
 * GET - Get all categories
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await Category.find(query).sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: categories,
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
        error: error.message || 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { name, description, order, isActive, type } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!type || !['product', 'service'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type is required and must be either "product" or "service"' },
        { status: 400 }
      );
    }

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      type,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
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
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create category',
      },
      { status: 500 }
    );
  }
}

