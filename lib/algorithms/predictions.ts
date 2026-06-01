/**
 * Yubbox AI — Prediction Engine
 * Estimates expected views, clicks, and ROI for a listing before/during its run,
 * using category/country baselines derived from platform-wide historical data.
 */

import { prisma } from '@/lib/prisma';

export interface PredictionResult {
  adId:                string;
  predictedViews14d:   [number, number];   // [low, high]
  predictedClicks14d:  [number, number];
  targetingTip:        string | null;
  boostTiming:         string | null;
  expiryVelocityAlert: string | null;
  cpcBenchmark: {
    yourCPC:      number | null;
    categoryAvg:  number;
    percentile:   number | null;
  };
}

export async function generatePredictions(adId: string): Promise<PredictionResult | null> {
  const ad = await prisma.ad.findUnique({
    where:   { id: adId },
    include: {
      analytics: { select: { eventType: true, timestamp: true, country: true } },
      payments:  { where: { status: 'completed' }, select: { amount: true } },
    },
  });

  if (!ad) return null;

  const now          = new Date();
  const ageDays      = Math.max((now.getTime() - ad.createdAt.getTime()) / 86400000, 0.5);
  const totalViews   = ad.analytics.filter((e) => e.eventType === 'view').length;
  const totalClicks  = ad.analytics.filter((e) => e.eventType === 'click').length;

  // ── Category baseline: median views/clicks per 14d for similar ads ────────
  const categoryAds = await prisma.ad.findMany({
    where: {
      categoryId: ad.categoryId,
      isActive:   true,
      id:         { not: adId },
    },
    include: { analytics: { select: { eventType: true } } },
    take: 100,
  });

  const categoryViews  = categoryAds.map((a) => a.analytics.filter((e) => e.eventType === 'view').length);
  const categoryClicks = categoryAds.map((a) => a.analytics.filter((e) => e.eventType === 'click').length);

  const medianViews  = median(categoryViews)  || 200;
  const medianClicks = median(categoryClicks) || 14;

  // Extrapolate current ad velocity to 14 days
  const dailyViews  = totalViews  / ageDays;
  const dailyClicks = totalClicks / ageDays;

  // Blend personal velocity with category median (50/50 when young, 80/20 when mature)
  const maturity   = Math.min(ageDays / 14, 1);
  const blendViews  = dailyViews  * 14 * maturity + (medianViews  / 14) * 14 * (1 - maturity);
  const blendClicks = dailyClicks * 14 * maturity + (medianClicks / 14) * 14 * (1 - maturity);

  const predictedViews14d:  [number, number] = [Math.round(blendViews * 0.75), Math.round(blendViews * 1.35)];
  const predictedClicks14d: [number, number] = [Math.round(blendClicks * 0.75), Math.round(blendClicks * 1.35)];

  // ── Targeting tip: find high-performing countries for this category ────────
  const countryPerf = await prisma.analytics.groupBy({
    by:     ['country'],
    where:  { ad: { categoryId: ad.categoryId }, eventType: 'click', country: { not: null } },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
    take: 5,
  });

  const topCountries = countryPerf.map((r) => r.country!).filter((c) => !ad.countries.includes(c));
  const targetingTip = topCountries.length >= 2
    ? `Ads in your category perform well in ${topCountries.slice(0, 3).join(', ')} — consider adding them to your targeting.`
    : null;

  // ── Boost timing: predict if this week vs next ─────────────────────────────
  const recentVelocity = ad.analytics.filter(
    (e) => e.eventType === 'click' && e.timestamp >= new Date(now.getTime() - 3 * 86400000),
  ).length;

  let boostTiming: string | null = null;
  if (recentVelocity >= 5) {
    boostTiming = 'Your click velocity is building now — boosting to Top Lens this week will amplify existing momentum.';
  } else if (ageDays < 3) {
    boostTiming = 'Wait 3–5 days for organic signals to accumulate before boosting — you\'ll get better algorithmic uplift.';
  }

  // ── Expiry velocity alert ─────────────────────────────────────────────────
  let expiryVelocityAlert: string | null = null;
  if (ad.expiryDate) {
    const daysLeft   = (ad.expiryDate.getTime() - now.getTime()) / 86400000;
    const projClicks = dailyClicks * daysLeft;
    if (daysLeft > 0 && projClicks < 5 && daysLeft < 7) {
      expiryVelocityAlert = `At your current click rate you'll exhaust organic reach in ${Math.ceil(daysLeft)} days — consider relisting now for continuity.`;
    }
  }

  // ── CPC benchmark ─────────────────────────────────────────────────────────
  const totalSpend = ad.payments.reduce((s, p) => s + Number(p.amount), 0);
  const yourCPC    = totalSpend > 0 && totalClicks > 0 ? totalSpend / totalClicks : null;

  const categorySpend = await prisma.payment.aggregate({
    where: { ad: { categoryId: ad.categoryId }, status: 'completed' },
    _sum:  { amount: true },
  });
  const categoryClickCount = await prisma.analytics.count({
    where: { ad: { categoryId: ad.categoryId }, eventType: 'click' },
  });

  const categoryAvgCPC = categoryClickCount > 0
    ? Number(categorySpend._sum.amount ?? 0) / categoryClickCount
    : 4.0;

  let percentile: number | null = null;
  if (yourCPC !== null && yourCPC < categoryAvgCPC) {
    percentile = Math.round((1 - yourCPC / categoryAvgCPC) * 100);
  }

  return {
    adId,
    predictedViews14d,
    predictedClicks14d,
    targetingTip,
    boostTiming,
    expiryVelocityAlert,
    cpcBenchmark: {
      yourCPC:     yourCPC !== null ? Math.round(yourCPC * 100) / 100 : null,
      categoryAvg: Math.round(categoryAvgCPC * 100) / 100,
      percentile,
    },
  };
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid    = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
