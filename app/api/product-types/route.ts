import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductKind } from '@prisma/client';

/**
 * GET - Get all active product types (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // Optional filter: 'service' or 'physical'

    const where: { isActive: boolean; type?: ProductKind } = { isActive: true };
    if (type && ['service', 'physical'].includes(type)) {
      where.type = type as ProductKind;
    }

    const productTypes = await prisma.productType.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: productTypes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product types';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
