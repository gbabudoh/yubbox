import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

  const { code } = await request.json();
  if (!code) return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });

  const referral = await prisma.referralCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!referral) return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 404 });

  // Can't refer yourself
  if (referral.userId === session.user.id) {
    return NextResponse.json({ success: false, error: 'You cannot use your own referral code' }, { status: 400 });
  }

  // Already used a referral code
  const existing = await prisma.referralUsage.findUnique({ where: { referredUserId: session.user.id } });
  if (existing) return NextResponse.json({ success: false, error: 'Already used a referral code' }, { status: 400 });

  await prisma.$transaction([
    prisma.referralUsage.create({
      data: { referralCodeId: referral.id, referredUserId: session.user.id },
    }),
    prisma.user.update({
      where: { id: referral.userId },
      data:  { credits: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
