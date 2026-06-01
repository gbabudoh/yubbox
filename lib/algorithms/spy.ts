/**
 * Yubbox Spy — Anonymised Market Intelligence
 * Aggregates platform-wide signals for a category to show benchmarks,
 * timing patterns, and untapped geographic demand.
 * No individual advertiser data is ever exposed — minimum cohort of 5.
 */

import { prisma } from '@/lib/prisma';

export interface SpyResult {
  categoryId:      string;
  userCTR:         number;
  benchmarkCTR:    number;
  userPercentile:  number;           // 0–100
  topHour:         number | null;    // UTC hour with highest category engagement
  topHourLift:     number;           // × lift vs average hour
  hotCountries:    { country: string; demand: 'high' | 'medium' | 'low'; competition: 'high' | 'low' }[];
  trendingKeywords: string[];
  timingAdvice:    string | null;
}

export async function getSpyData(adId: string): Promise<SpyResult | null> {
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) return null;

  const { categoryId } = ad;

  // User's own CTR
  const [myViews, myClicks] = await Promise.all([
    prisma.analytics.count({ where: { adId, eventType: 'view' } }),
    prisma.analytics.count({ where: { adId, eventType: 'click' } }),
  ]);
  const userCTR = myViews > 0 ? (myClicks / myViews) * 100 : 0;

  // Category-wide CTR (all ads in the category, minimum 5 ads for privacy)
  const categoryAdIds = await prisma.ad.findMany({
    where:  { categoryId, id: { not: adId } },
    select: { id: true },
    take:   200,
  });

  if (categoryAdIds.length < 5) {
    return null; // not enough cohort for anonymised data
  }

  const ids = categoryAdIds.map((a) => a.id);

  const [catViews, catClicks] = await Promise.all([
    prisma.analytics.count({ where: { adId: { in: ids }, eventType: 'view' } }),
    prisma.analytics.count({ where: { adId: { in: ids }, eventType: 'click' } }),
  ]);

  const benchmarkCTR = catViews > 0 ? (catClicks / catViews) * 100 : 0;

  // Per-ad CTR for percentile ranking
  const perAdStats = await Promise.all(
    ids.map(async (id) => {
      const [v, c] = await Promise.all([
        prisma.analytics.count({ where: { adId: id, eventType: 'view' } }),
        prisma.analytics.count({ where: { adId: id, eventType: 'click' } }),
      ]);
      return v > 0 ? (c / v) * 100 : 0;
    }),
  );

  const below = perAdStats.filter((ctr) => ctr < userCTR).length;
  const userPercentile = Math.round((below / perAdStats.length) * 100);

  // Best hour of day across the category
  const recentEvents = await prisma.analytics.findMany({
    where: {
      adId:      { in: ids },
      eventType: 'click',
      timestamp: { gte: new Date(Date.now() - 30 * 86400000) },
    },
    select: { timestamp: true },
    take:   5000,
  });

  const hourCounts: Record<number, number> = {};
  recentEvents.forEach((e) => {
    const h = new Date(e.timestamp).getUTCHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  });

  const avgHourly = recentEvents.length / 24;
  const topHourEntry = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0];

  const topHour     = topHourEntry ? Number(topHourEntry[0]) : null;
  const topHourLift = topHourEntry && avgHourly > 0
    ? Math.round((Number(topHourEntry[1]) / avgHourly) * 10) / 10
    : 1;

  // Geographic demand vs competition
  const geoData = await prisma.analytics.groupBy({
    by:     ['country'],
    where:  { adId: { in: ids }, eventType: 'click', country: { not: null } },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take:   20,
  });

  const totalGeoClicks = geoData.reduce((s, r) => s + r._count.country, 0);
  const avgPerCountry  = totalGeoClicks / Math.max(geoData.length, 1);

  const hotCountries = geoData.slice(0, 8).map((r) => ({
    country:     r.country!,
    demand:      r._count.country >= avgPerCountry * 1.5
      ? 'high'
      : r._count.country >= avgPerCountry * 0.5
        ? 'medium'
        : 'low' as 'high' | 'medium' | 'low',
    competition: r._count.country >= avgPerCountry * 1.5 ? 'high' : 'low' as 'high' | 'low',
  }));

  // Timing advice
  let timingAdvice: string | null = null;
  if (topHour !== null && topHourLift >= 1.5) {
    timingAdvice = `Category engagement peaks at ${topHour}:00 UTC (${topHourLift}× average) — schedule your boost to land around this time.`;
  }

  return {
    categoryId,
    userCTR:          Math.round(userCTR * 10) / 10,
    benchmarkCTR:     Math.round(benchmarkCTR * 10) / 10,
    userPercentile,
    topHour,
    topHourLift,
    hotCountries,
    trendingKeywords: [], // placeholder — would require full-text search index
    timingAdvice,
  };
}
