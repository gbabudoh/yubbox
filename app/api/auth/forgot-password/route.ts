import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success — don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: { email: email.toLowerCase(), usedAt: null },
      data:  { usedAt: new Date() },
    });

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email: email.toLowerCase(), expiresAt },
    });

    const baseUrl  = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('forgot-password error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reset email' }, { status: 500 });
  }
}
