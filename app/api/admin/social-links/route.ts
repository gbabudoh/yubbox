import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();
    const links = await prisma.socialLink.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ success: true, data: links });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg === 'Admin access required' ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { platform, label, url, symbol, isActive, order } = await request.json();

    if (!platform || !label || !url || !symbol) {
      return NextResponse.json(
        { success: false, error: 'platform, label, url and symbol are required' },
        { status: 400 }
      );
    }

    const link = await prisma.socialLink.create({
      data: {
        platform: platform.toLowerCase().trim(),
        label:    label.trim(),
        url:      url.trim(),
        symbol:   symbol.trim(),
        isActive: isActive !== undefined ? isActive : true,
        order:    order ?? 0,
      },
    });
    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg === 'Admin access required' ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
