/**
 * Spend Score Algorithm
 * Computes a 0–100 efficiency rating per advertiser: how much value they
 * extract per dollar spent versus category peers.
 */

import { prisma } from '@/lib/prisma';

export interface SpendScoreResult {
  userId:          string;
  score:           number;          // 0–100
  viewsPerDollar:  number;
  clicksPerDollar: number;
  engagementRate:  number;          // yubboxes per view
  categoryRank:    number;          // percentile 0–100 (higher = better)
  breakdown: {
    viewEfficiency:  number;        // contribution pts
    clickEfficiency: number;
    engagementBonus: number;
    premiumROI:      number;
    trend:           number;
  };
  improvementTip: string;
}

export async function computeSpendScore(userId: string): Promise<SpendScoreResult | null> {
  // All ads for this user
  const ads = await prisma.ad.findMany({
    where:   { userId },
    include: { payments: { where: { status: 'completed' } }, analytics: true },
  });

  if (ads.length === 0) return null;

  const totalSpend = ads
    .flatMap((a) => a.payments)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (totalSpend === 0) return null;

  const totalViews   = ads.flatMap((a) => a.analytics).filter((e) => e.eventType === 'view').length;
  const totalClicks  = ads.flatMap((a) => a.analytics).filter((e) => e.eventType === 'click').length;
  const totalYubboxes = ads.reduce((s, a) => s + a.yubboxCount, 0);

  const viewsPerDollar  = totalViews  / totalSpend;
  const clicksPerDollar = totalClicks / totalSpend;
  const engagementRate  = totalViews > 0 ? totalYubboxes / totalViews : 0;

  // Score components (sum = 100)
  const viewEfficiency  = Math.min(viewsPerDollar * 2, 30);
  const clickEfficiency = Math.min(clicksPerDollar * 20, 35);
  const engagementBonus = Math.min(engagementRate * 100, 15);

  // Premium ROI: did Top Lens / Stories produce proportional uplift?
  const paidAds   = ads.filter((a) => a.topLensExpiry || a.storiesExpiry);
  const premiumROI = paidAds.length > 0 ? Math.min(paidAds.length * 3, 10) : 0;

  // Trend: compare last 7 days vs prior 7 days
  const now = new Date();
  const week1Start = new Date(now.getTime() - 14 * 86400000);
  const week2Start = new Date(now.getTime() - 7 * 86400000);

  const allEvents = ads.flatMap((a) => a.analytics);
  const prevWeekClicks = allEvents.filter(
    (e) => e.eventType === 'click' && e.timestamp >= week1Start && e.timestamp < week2Start,
  ).length;
  const thisWeekClicks = allEvents.filter(
    (e) => e.eventType === 'click' && e.timestamp >= week2Start,
  ).length;

  const trend = prevWeekClicks > 0
    ? Math.min(((thisWeekClicks - prevWeekClicks) / prevWeekClicks) * 10, 10)
    : 0;

  const rawScore = viewEfficiency + clickEfficiency + engagementBonus + premiumROI + Math.max(trend, 0);
  const score    = Math.round(Math.min(rawScore, 100));

  // Category benchmark — compare against all users in the same category
  const firstCategoryId = ads[0]?.categoryId;
  let categoryRank = 50;

  if (firstCategoryId) {
    const categoryScores = await prisma.spendScore.findMany({
      where:  { user: { ads: { some: { categoryId: firstCategoryId } } } },
      select: { score: true },
    });
    const below = categoryScores.filter((s) => s.score < score).length;
    categoryRank = categoryScores.length > 1
      ? Math.round((below / (categoryScores.length - 1)) * 100)
      : 50;
  }

  // Improvement tip
  let improvementTip = 'Your spend efficiency is strong — keep your current strategy.';
  if (clickEfficiency < 15)
    improvementTip = 'Your click rate per dollar is below average — refresh your ad image or title to boost CTR.';
  else if (viewEfficiency < 10)
    improvementTip = 'You are generating few views per dollar — try broader country targeting.';
  else if (engagementBonus < 5)
    improvementTip = 'Low Yubbox engagement — a clearer call-to-action could increase interactions.';

  // Persist
  await prisma.spendScore.upsert({
    where:  { userId },
    create: {
      userId,
      score,
      viewsPerDollar:  viewsPerDollar,
      clicksPerDollar: clicksPerDollar,
      engagementRate:  engagementRate,
      categoryRank,
      breakdown: { viewEfficiency, clickEfficiency, engagementBonus, premiumROI, trend },
    },
    update: {
      score,
      viewsPerDollar:  viewsPerDollar,
      clicksPerDollar: clicksPerDollar,
      engagementRate:  engagementRate,
      categoryRank,
      breakdown: { viewEfficiency, clickEfficiency, engagementBonus, premiumROI, trend },
    },
  });

  return {
    userId,
    score,
    viewsPerDollar:  Math.round(viewsPerDollar * 100) / 100,
    clicksPerDollar: Math.round(clicksPerDollar * 100) / 100,
    engagementRate:  Math.round(engagementRate * 1000) / 1000,
    categoryRank,
    breakdown: {
      viewEfficiency:  Math.round(viewEfficiency),
      clickEfficiency: Math.round(clickEfficiency),
      engagementBonus: Math.round(engagementBonus),
      premiumROI:      Math.round(premiumROI),
      trend:           Math.round(trend),
    },
    improvementTip,
  };
}
