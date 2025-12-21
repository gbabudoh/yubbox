import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Industry from '@/models/Industry';

/**
 * GET - Get a single industry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const industry = await Industry.findById(id);

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: industry,
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
        error: error.message || 'Failed to fetch industry',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an industry
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
    const { name, description, order, isActive } = body;

    const industry = await Industry.findById(id);

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    if (name) {
      industry.name = name;
      // Auto-generate slug from name
      industry.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) industry.description = description;
    if (order !== undefined) industry.order = order;
    if (isActive !== undefined) industry.isActive = isActive;

    await industry.save();

    return NextResponse.json({
      success: true,
      data: industry,
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
        { success: false, error: 'Industry with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update industry',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete an industry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = await params;
    const industry = await Industry.findByIdAndDelete(id);

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Industry deleted successfully',
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
        error: error.message || 'Failed to delete industry',
      },
      { status: 500 }
    );
  }
}

