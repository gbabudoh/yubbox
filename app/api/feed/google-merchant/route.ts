import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

function escXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const now = new Date();

  const ads = await prisma.ad.findMany({
    where: {
      isActive:   true,
      isPaid:     true,
      expiryDate: { gte: now },
      category:   { type: 'product' },
    },
    include: { category: true },
    orderBy: { visibilityScore: 'desc' },
    take:    1000,
  });

  const items = ads.map((ad) => {
    const link      = `${BASE_URL}/ads/${ad.id}`;
    const imageLink = ad.imageUrl.startsWith('http')
      ? ad.imageUrl
      : `${BASE_URL}${ad.imageUrl}`;

    return `
  <item>
    <g:id>${escXml(ad.id)}</g:id>
    <g:title>${escXml(ad.title)}</g:title>
    <g:description>${escXml(ad.description.slice(0, 500))}</g:description>
    <g:link>${escXml(link)}</g:link>
    <g:image_link>${escXml(imageLink)}</g:image_link>
    <g:price>1.00 USD</g:price>
    <g:availability>in_stock</g:availability>
    <g:condition>new</g:condition>
    <g:brand>${escXml(ad.companyName || ad.ownerName || 'Yubbox')}</g:brand>
    <g:google_product_category>${escXml(ad.category.name)}</g:google_product_category>
    <g:identifier_exists>no</g:identifier_exists>
  </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Yubbox — Global Product Listings</title>
    <link>${BASE_URL}</link>
    <description>Products and services listed on Yubbox, the global advertising platform.</description>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type':  'application/rss+xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
