import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { AD_DURATION_DAYS } from '@/lib/stripe-shared';
import { sendPushNotification } from '@/lib/webpush';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

const AD_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true, type: true } },
  industry: { select: { id: true, name: true, slug: true } },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');
    const country = searchParams.get('country');

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Filter by country - ads that include this country in their countries array
    if (country) {
      where.countries = { has: country };
    }

    // Only show non-expired ads for public feed
    if (!userId) {
      where.expiryDate = { gte: new Date() };
    }

    const ads = await prisma.ad.findMany({
      where,
      include: AD_INCLUDE,
      // Public feed: rank by visibility score (algorithmic), then recency as tiebreaker
      orderBy: userId
        ? { createdAt: 'desc' }
        : [{ visibilityScore: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ads';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const webLink = formData.get('webLink') as string;
    const ownerName = formData.get('ownerName') as string;
    const location = formData.get('location') as string;
    const companyName = formData.get('companyName') as string;
    // Support both countries and targetLocations for backward compatibility
    const countries = formData.getAll('countries').length > 0
      ? formData.getAll('countries') as string[]
      : formData.getAll('targetLocations') as string[];
    const categoryId = formData.get('categoryId') as string | null;
    const industryId = formData.get('industryId') as string | null;
    const isTopLens = formData.get('isTopLens') === 'true';
    const isStories = formData.get('isStories') === 'true';

    // Validation
    if (!title || !description || !imageUrl || !webLink || !ownerName || !location || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (countries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one country' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!industryId) {
      return NextResponse.json(
        { success: false, error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Set initial expiry dates
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        imageUrl,
        webLink,
        ownerName,
        location,
        companyName,
        countries,
        userId: session.user.id,
        categoryId,
        industryId,
        isActive: true,
        isPaid: false,
        expiryDate,
        topLensExpiry: isTopLens ? expiryDate : null,
        storiesExpiry: isStories ? expiryDate : null,
      },
      include: AD_INCLUDE,
    });

    // Fire-and-forget: notify users with matching saved searches
    dispatchPushNotifications(ad.id, ad.title, ad.categoryId, ad.countries).catch(() => null);

    return NextResponse.json(
      {
        success: true,
        data: ad,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

async function dispatchPushNotifications(
  adId: string,
  adTitle: string,
  categoryId: string,
  countries: string[],
) {
  const matches = await prisma.savedSearch.findMany({
    where: {
      OR: [
        { categoryId },
        { country: { in: countries } },
        { categoryId: null, country: null },
      ],
    },
    include: { user: { include: { pushSubscriptions: true } } },
  });

  const seen  = new Set<string>();
  const sends: Promise<unknown>[] = [];
  for (const s of matches) {
    for (const sub of s.user.pushSubscriptions) {
      if (seen.has(sub.id)) continue;
      seen.add(sub.id);
      sends.push(
        sendPushNotification(sub, {
          title: 'New Yubbox matches your search',
          body:  adTitle,
          url:   `${BASE_URL}/ads/${adId}`,
        }).catch(() => null)
      );
    }
  }
  await Promise.allSettled(sends);
}
