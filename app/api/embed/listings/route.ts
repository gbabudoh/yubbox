import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categorySlug = searchParams.get('category') ?? undefined;
  const country      = searchParams.get('country')  ?? undefined;
  const limit        = Math.min(Number(searchParams.get('limit') ?? 6), 12);

  const now = new Date();

  const ads = await prisma.ad.findMany({
    where: {
      isActive:   true,
      isPaid:     true,
      expiryDate: { gte: now },
      ...(country      && { countries: { has: country } }),
      ...(categorySlug && { category: { slug: categorySlug } }),
    },
    orderBy: { visibilityScore: 'desc' },
    take:    limit,
    select:  { id: true, title: true, description: true, imageUrl: true, companyName: true },
  });

  const cards = ads.map((ad) => {
    const img  = ad.imageUrl.startsWith('http') ? ad.imageUrl : `${BASE_URL}${ad.imageUrl}`;
    const link = `${BASE_URL}/ads/${ad.id}`;
    return `
    <a href="${link}" target="_blank" rel="noopener noreferrer" style="display:flex;gap:12px;padding:12px;border-radius:10px;border:1px solid #eee;background:#fff;text-decoration:none;font-family:sans-serif;transition:box-shadow .2s" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
      <img src="${img}" alt="" width="80" height="64" style="border-radius:8px;object-fit:cover;flex-shrink:0"/>
      <div style="overflow:hidden">
        <p style="margin:0 0 2px;font-size:13px;font-weight:800;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ad.title}</p>
        <p style="margin:0 0 6px;font-size:11px;color:#888">${ad.companyName}</p>
        <p style="margin:0;font-size:11px;color:#555;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${ad.description.slice(0, 100)}</p>
      </div>
    </a>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Yubbox Listings</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{background:#f9f9f9;padding:12px}</style>
</head>
<body>
  <div style="display:flex;flex-direction:column;gap:10px">${cards}</div>
  <div style="text-align:center;margin-top:12px">
    <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer" style="font-family:sans-serif;font-size:11px;color:#790e61;font-weight:700;text-decoration:none">Powered by Yubbox ↗</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type':              'text/html; charset=UTF-8',
      'Cache-Control':             'public, max-age=300',
      'X-Frame-Options':           'ALLOWALL',
      'Content-Security-Policy':   "frame-ancestors *",
      'Access-Control-Allow-Origin': '*',
    },
  });
}
