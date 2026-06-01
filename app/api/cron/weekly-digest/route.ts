import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWeeklyDigestEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Top 5 ads per active category, ranked by visibilityScore
    const categories = await prisma.category.findMany({
      where:   { isActive: true },
      orderBy: { order: 'asc' },
    });

    const digest = await Promise.all(
      categories.map(async (cat) => {
        const ads = await prisma.ad.findMany({
          where: {
            categoryId:  cat.id,
            isActive:    true,
            isPaid:      true,
            expiryDate:  { gte: now },
          },
          orderBy: { visibilityScore: 'desc' },
          take:    5,
          select:  { id: true, title: true, description: true, imageUrl: true },
        });
        return { name: cat.name, ads };
      })
    );

    // Filter out empty categories
    const activeDigest = digest.filter((c) => c.ads.length > 0).slice(0, 6);
    if (activeDigest.length === 0) {
      return NextResponse.json({ success: true, message: 'No active listings to send' });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: { email: true, name: true },
    });

    // Send in batches of 50 to avoid SMTP rate limits
    const BATCH = 50;
    let sent = 0;
    for (let i = 0; i < users.length; i += BATCH) {
      const batch = users.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map((u) => sendWeeklyDigestEmail(u.email, u.name, activeDigest))
      );
      sent += batch.length;
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('weekly-digest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send digest' }, { status: 500 });
  }
}
