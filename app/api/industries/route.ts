import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Get all active industries (public endpoint)
 */
export async function GET() {
  try {
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: industries,
    });
  } catch (error: unknown) {
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
