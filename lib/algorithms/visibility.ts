/**
 * Auto-Visibility Algorithm
 * Computes a 0–100 score that determines a Yubbox's position in the public feed.
 * High-performing, high-engagement, recently active ads float to the top organically.
 * Premium placements (Top Lens, Stories) add a guaranteed floor.
 */

import { prisma } from '@/lib/prisma';

interface AdInput {
  id:            string;
  yubboxCount:   number;
  isPaid:        boolean;
  createdAt:     Date;
  expiryDate:    Date | null;
  topLensExpiry: Date | null;
  storiesExpiry: Date | null;
}

export function computeVisibilityScore(
  ad:     AdInput,
  views:  number,
  clicks: number,
): number {
  const now      = new Date();
  const ageDays  = Math.max((now.getTime() - new Date(ad.createdAt).getTime()) / 86400000, 0.1);
  const ctr      = views > 0 ? (clicks / views) * 100 : 0;

  // CTR component — 0–30 pts (5 pts per 1% CTR, capped at 30)
  const ctrScore       = Math.min(ctr * 5, 30);

  // View velocity — 0–20 pts (views per day, capped at 20)
  const velocityScore  = Math.min(views / ageDays, 20);

  // Yubbox engagement — 0–15 pts
  const engageScore    = Math.min(ad.yubboxCount * 1.5, 15);

  // Recency boost — 0–15 pts, decays linearly over 30 days
  const recencyScore   = Math.max(15 - ageDays * 0.5, 0);

  // Premium placement floor — 0–15 pts
  const topLensActive  = ad.topLensExpiry && new Date(ad.topLensExpiry) >= now;
  const storiesActive  = ad.storiesExpiry && new Date(ad.storiesExpiry) >= now;
  const premiumScore   = topLensActive ? 15 : storiesActive ? 8 : 0;

  // Paid status — 0–5 pts
  const paidScore      = ad.isPaid ? 5 : 0;

  return Math.round(
    ctrScore + velocityScore + engageScore + recencyScore + premiumScore + paidScore,
  );
}

/**
 * Recompute and persist the visibility score for a single ad.
 * Lightweight — call this after any state change on one ad (vote, payment, update).
 */
export async function recomputeAdVisibilityScore(adId: string): Promise<void> {
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad) return;

  const [views, clicks] = await Promise.all([
    prisma.analytics.count({ where: { adId, eventType: 'view' } }),
    prisma.analytics.count({ where: { adId, eventType: 'click' } }),
  ]);

  const score = computeVisibilityScore(ad, views, clicks);
  if (score !== ad.visibilityScore) {
    await prisma.ad.update({ where: { id: adId }, data: { visibilityScore: score } });
  }
}

/**
 * Recompute and persist visibility scores for all active ads.
 * Called by the /api/ads/rerank endpoint or as a scheduled job.
 */
export async function recomputeAllVisibilityScores(): Promise<number> {
  const ads = await prisma.ad.findMany({
    where: { isActive: true, expiryDate: { gte: new Date() } },
  });

  let updated = 0;

  await Promise.all(
    ads.map(async (ad) => {
      const [viewRow, clickRow] = await Promise.all([
        prisma.analytics.count({ where: { adId: ad.id, eventType: 'view' } }),
        prisma.analytics.count({ where: { adId: ad.id, eventType: 'click' } }),
      ]);

      const score = computeVisibilityScore(ad, viewRow, clickRow);

      if (score !== ad.visibilityScore) {
        await prisma.ad.update({ where: { id: ad.id }, data: { visibilityScore: score } });
        updated++;
      }
    }),
  );

  return updated;
}
