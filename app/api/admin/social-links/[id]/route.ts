import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { platform, label, url, symbol, isActive, order } = await request.json();

    const link = await prisma.socialLink.update({
      where: { id },
      data: {
        ...(platform  !== undefined && { platform:  platform.toLowerCase().trim() }),
        ...(label     !== undefined && { label:     label.trim() }),
        ...(url       !== undefined && { url:       url.trim() }),
        ...(symbol    !== undefined && { symbol:    symbol.trim() }),
        ...(isActive  !== undefined && { isActive }),
        ...(order     !== undefined && { order }),
      },
    });
    return NextResponse.json({ success: true, data: link });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg === 'Admin access required' ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed';
    const status = msg === 'Admin access required' ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
