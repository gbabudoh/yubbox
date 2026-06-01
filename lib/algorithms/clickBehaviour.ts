/**
 * Click Behaviour Algorithm
 * Scores click quality based on intent signals: timing, scroll depth,
 * element clicked, device context, and post-click return behaviour.
 */

import { prisma } from '@/lib/prisma';

export interface ClickQualityResult {
  adId:             string;
  totalClicks:      number;
  highIntentClicks: number;
  intentScore:      number;       // 0–100
  topClickElement:  string | null;
  topCountry:       string | null;
  mobileRatio:      number;
  avgTimeOnAd:      number;       // seconds
  avgScrollDepth:   number;       // 0–100
}

function scoreClick(event: {
  timeOnAd:    number | null;
  scrollDepth: number | null;
  clickElement: string | null;
}): number {
  let score = 0;

  // Time on ad before click (max 40 pts)
  const t = event.timeOnAd ?? 0;
  score += t >= 30 ? 40 : t >= 10 ? 25 : t >= 3 ? 10 : 2;

  // Scroll depth before click (max 30 pts)
  const s = event.scrollDepth ?? 0;
  score += s >= 80 ? 30 : s >= 50 ? 20 : s >= 25 ? 10 : 0;

  // Element clicked (max 30 pts — CTA/link = highest intent)
  const elementScores: Record<string, number> = {
    cta:         30,
    title:       20,
    description: 15,
    image:       10,
    company:      5,
  };
  score += elementScores[event.clickElement ?? ''] ?? 5;

  return Math.min(score, 100);
}

export async function getClickQuality(adId: string): Promise<ClickQualityResult> {
  const clicks = await prisma.analytics.findMany({
    where:  { adId, eventType: 'click' },
    select: { country: true, deviceType: true, timeOnAd: true, scrollDepth: true, clickElement: true },
  });

  if (clicks.length === 0) {
    return {
      adId,
      totalClicks:      0,
      highIntentClicks: 0,
      intentScore:      0,
      topClickElement:  null,
      topCountry:       null,
      mobileRatio:      0,
      avgTimeOnAd:      0,
      avgScrollDepth:   0,
    };
  }

  const scores = clicks.map(scoreClick);
  const highIntent = scores.filter((s) => s >= 60).length;
  const intentScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Top element
  const elementCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    const el = c.clickElement ?? 'unknown';
    elementCounts[el] = (elementCounts[el] ?? 0) + 1;
  });
  const topClickElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Top country
  const countryCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    if (c.country) countryCounts[c.country] = (countryCounts[c.country] ?? 0) + 1;
  });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const mobileRatio = clicks.filter((c) => c.deviceType === 'mobile').length / clicks.length;
  const avgTimeOnAd = Math.round(clicks.reduce((a, c) => a + (c.timeOnAd ?? 0), 0) / clicks.length);
  const avgScrollDepth = Math.round(clicks.reduce((a, c) => a + (c.scrollDepth ?? 0), 0) / clicks.length);

  return {
    adId,
    totalClicks:      clicks.length,
    highIntentClicks: highIntent,
    intentScore,
    topClickElement,
    topCountry,
    mobileRatio:      Math.round(mobileRatio * 100) / 100,
    avgTimeOnAd,
    avgScrollDepth,
  };
}
