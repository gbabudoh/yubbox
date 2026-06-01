import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

  let referral = await prisma.referralCode.findUnique({
    where:   { userId: session.user.id },
    include: { usages: true },
  });

  if (!referral) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    referral = await prisma.referralCode.create({
      data:    { userId: session.user.id, code },
      include: { usages: true },
    });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { credits: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      code:     referral.code,
      usages:   referral.usages.length,
      credits:  user?.credits ?? 0,
    },
  });
}
