import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Industry from '@/models/Industry';

/**
 * GET - Get all industries
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query: { isActive?: boolean } = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const industries = await Industry.find(query).sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
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

/**
 * POST - Create a new industry
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { name, description, order, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Industry name is required' },
        { status: 400 }
      );
    }

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const industry = await Industry.create({
      name,
      slug,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: industry,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Industry with this name already exists' },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create industry';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

