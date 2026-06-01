import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

  const searches = await prisma.savedSearch.findMany({
    where:   { userId: session.user.id },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: searches });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

  const { label, query, country, categoryId } = await request.json();

  const search = await prisma.savedSearch.create({
    data: {
      userId: session.user.id,
      label:  label || null,
      query:  query || null,
      country:    country    || null,
      categoryId: categoryId || null,
    },
    include: { category: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: search }, { status: 201 });
}
