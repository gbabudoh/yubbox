import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

  const { id } = await params;
  await prisma.savedSearch.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
