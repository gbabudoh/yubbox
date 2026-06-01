import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      where:   { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ success: true, data: links });
  } catch {
    return NextResponse.json({ success: false, data: [] });
  }
}
