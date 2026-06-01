import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdDetailClient from './AdDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

async function getAd(adId: string) {
  try {
    return await prisma.ad.findUnique({
      where: { id: adId },
      include: { category: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ adId: string }> }
): Promise<Metadata> {
  const { adId } = await params;
  const ad = await getAd(adId);
  if (!ad) return { title: 'Listing not found — Yubbox' };

  const title       = `${ad.title} — Yubbox`;
  const description = ad.description.slice(0, 160);
  const url         = `${BASE_URL}/ads/${adId}`;
  const image       = ad.imageUrl.startsWith('http') ? ad.imageUrl : `${BASE_URL}${ad.imageUrl}`;

  return {
    title,
    description,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Yubbox',
      type:     'website',
      images:   [{ url: image, width: 1200, height: 630, alt: ad.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [image],
    },
  };
}

export default async function AdDetailPage(
  { params }: { params: Promise<{ adId: string }> }
) {
  const { adId } = await params;
  const ad = await getAd(adId);

  // Redirect unknown real IDs to 404; mock IDs still handled client-side
  const isMockId = adId.startsWith('mock-');
  if (!ad && !isMockId) notFound();

  const isProduct   = ad?.category?.type === 'product';
  const url         = `${BASE_URL}/ads/${adId}`;
  const image       = ad?.imageUrl?.startsWith('http') ? ad.imageUrl : `${BASE_URL}${ad?.imageUrl ?? ''}`;

  const jsonLd = ad ? {
    '@context': 'https://schema.org',
    '@type':    isProduct ? 'Product' : 'Service',
    name:       ad.title,
    description:ad.description,
    image,
    url,
    brand: {
      '@type': 'Brand',
      name:    ad.companyName || ad.ownerName || 'Yubbox Advertiser',
    },
    offers: {
      '@type':         'Offer',
      priceCurrency:   'USD',
      price:           '1.00',
      availability:    ad.isActive ? 'https://schema.org/InStock' : 'https://schema.org/Discontinued',
      url,
    },
    ...(ad.location && { areaServed: ad.location }),
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AdDetailClient adId={adId} />
    </>
  );
}
