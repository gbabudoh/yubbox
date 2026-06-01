/**
 * Insight Algorithm
 * Detects performance patterns and anomalies across an ad's analytics,
 * then writes ranked AdInsight cards to the database.
 */

import { prisma } from '@/lib/prisma';
import { InsightType, Prisma } from '@prisma/client';

interface InsightDraft {
  type:     InsightType;
  title:    string;
  body:     string;
  impact:   'high' | 'medium' | 'low';
  priority: number;
  data?:    Record<string, unknown>;
}

export async function generateInsights(adId: string): Promise<number> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [ad, events] = await Promise.all([
    prisma.ad.findUnique({
      where:   { id: adId },
      include: { payments: { where: { status: 'completed' } } },
    }),
    prisma.analytics.findMany({
      where:  { adId, timestamp: { gte: thirtyDaysAgo } },
      select: {
        eventType:    true,
        country:      true,
        timestamp:    true,
        deviceType:   true,
        timeOnAd:     true,
        scrollDepth:  true,
        clickElement: true,
      },
    }),
  ]);

  if (!ad) return 0;

  const views  = events.filter((e) => e.eventType === 'view');
  const clicks = events.filter((e) => e.eventType === 'click');
  const ctr    = views.length > 0 ? (clicks.length / views.length) * 100 : 0;

  const drafts: InsightDraft[] = [];

  // ── 1. CTR anomaly (alert) ────────────────────────────────────────────────
  const week2Start = new Date(now.getTime() - 7  * 86400000);
  const week1Start = new Date(now.getTime() - 14 * 86400000);

  const prevViews  = views.filter((e)  => e.timestamp >= week1Start && e.timestamp < week2Start).length;
  const prevClicks = clicks.filter((e) => e.timestamp >= week1Start && e.timestamp < week2Start).length;
  const thisViews  = views.filter((e)  => e.timestamp >= week2Start).length;
  const thisClicks = clicks.filter((e) => e.timestamp >= week2Start).length;

  const prevCTR = prevViews > 0 ? (prevClicks / prevViews) * 100 : 0;
  const thisCTR = thisViews > 0 ? (thisClicks / thisViews) * 100 : 0;

  if (prevCTR > 0 && thisCTR < prevCTR * 0.8) {
    const drop = Math.round(((prevCTR - thisCTR) / prevCTR) * 100);
    drafts.push({
      type:     'alert',
      title:    `Click rate dropped ${drop}% this week`,
      body:     `Your CTR fell from ${prevCTR.toFixed(1)}% to ${thisCTR.toFixed(1)}%. Consider refreshing your ad image or headline to regain momentum.`,
      impact:   'high',
      priority: 90,
      data:     { prevCTR, thisCTR, drop },
    });
  }

  // ── 2. Best time of day ───────────────────────────────────────────────────
  const hourBuckets: Record<number, { v: number; c: number }> = {};
  views.forEach((e)  => { const h = new Date(e.timestamp).getUTCHours(); hourBuckets[h] = { v: (hourBuckets[h]?.v ?? 0) + 1, c: hourBuckets[h]?.c ?? 0 }; });
  clicks.forEach((e) => { const h = new Date(e.timestamp).getUTCHours(); if (hourBuckets[h]) hourBuckets[h].c++; });

  const bestHourEntry = Object.entries(hourBuckets)
    .filter(([, d]) => d.v >= 3)
    .sort(([, a], [, b]) => (b.c / b.v) - (a.c / a.v))[0];

  if (bestHourEntry) {
    const [h, d] = bestHourEntry;
    const hNum   = Number(h);
    const peakCTR = ((d.c / d.v) * 100).toFixed(1);
    drafts.push({
      type:     'timing',
      title:    `Peak engagement at ${hNum}:00–${hNum + 1}:00 UTC`,
      body:     `Your Yubbox achieves ${peakCTR}% CTR during this hour — ${(Number(peakCTR) / Math.max(ctr, 0.1)).toFixed(1)}× your daily average. Schedule boosts around this window.`,
      impact:   'medium',
      priority: 60,
      data:     { peakHour: hNum, peakCTR: Number(peakCTR), avgCTR: Math.round(ctr * 10) / 10 },
    });
  }

  // ── 3. Top performing country ─────────────────────────────────────────────
  const countryData: Record<string, { v: number; c: number; time: number[] }> = {};
  events.forEach((e) => {
    if (!e.country) return;
    if (!countryData[e.country]) countryData[e.country] = { v: 0, c: 0, time: [] };
    if (e.eventType === 'view')  countryData[e.country].v++;
    if (e.eventType === 'click') {
      countryData[e.country].c++;
      if (e.timeOnAd) countryData[e.country].time.push(e.timeOnAd);
    }
  });

  const topCountryEntry = Object.entries(countryData)
    .filter(([, d]) => d.v >= 5)
    .sort(([, a], [, b]) => (b.c / b.v) - (a.c / a.v))[0];

  if (topCountryEntry) {
    const [country, d] = topCountryEntry;
    const countryCTR   = ((d.c / d.v) * 100).toFixed(1);
    const avgTime      = d.time.length > 0
      ? (d.time.reduce((a, b) => a + b, 0) / d.time.length).toFixed(0)
      : null;
    const timePart = avgTime ? ` and spend ${avgTime}s on average viewing your listing` : '';
    drafts.push({
      type:     'geo',
      title:    `${country} is your highest-intent market`,
      body:     `Visitors from ${country} click at ${countryCTR}%${timePart} — well above your global average. Consider geo-targeting ${country} in your next boost.`,
      impact:   'medium',
      priority: 65,
      data:     { country, ctr: Number(countryCTR), avgTimeOnAd: Number(avgTime) },
    });
  }

  // ── 4. Yubbox count spike (opportunity) ──────────────────────────────────
  if (ad.yubboxCount > 0) {
    const prevYubboxes = ad.yubboxCount; // proxy: if count is high relative to age
    const ageDays = Math.max((now.getTime() - ad.createdAt.getTime()) / 86400000, 1);
    const yubboxesPerDay = prevYubboxes / ageDays;
    if (yubboxesPerDay >= 2) {
      drafts.push({
        type:     'opportunity',
        title:    `Yubbox momentum building — ideal time to boost`,
        body:     `Your Yubbox count is growing at ${yubboxesPerDay.toFixed(1)}/day. Boosting to Top Lens now amplifies organic momentum rather than starting from cold.`,
        impact:   'high',
        priority: 80,
        data:     { yubboxCount: ad.yubboxCount, yubboxesPerDay },
      });
    }
  }

  // ── 5. Spend efficiency (spend insight) ──────────────────────────────────
  const totalSpend = ad.payments.reduce((s, p) => s + Number(p.amount), 0);
  if (totalSpend > 0 && clicks.length > 0) {
    const cpc = totalSpend / clicks.length;
    if (cpc < 2) {
      drafts.push({
        type:     'spend',
        title:    `Excellent cost-per-click: $${cpc.toFixed(2)}`,
        body:     `You're paying $${cpc.toFixed(2)} per click — category average is typically $3–5. Your creative is outperforming peers at current spend.`,
        impact:   'low',
        priority: 40,
        data:     { cpc, totalSpend, totalClicks: clicks.length },
      });
    }
  }

  // ── 6. Element-level engagement ───────────────────────────────────────────
  const elementCounts: Record<string, number> = {};
  clicks.forEach((e) => {
    const el = e.clickElement ?? 'unknown';
    elementCounts[el] = (elementCounts[el] ?? 0) + 1;
  });
  const totalElementClicks = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  const topElementEntry    = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];

  if (topElementEntry && totalElementClicks >= 5) {
    const [el, count] = topElementEntry;
    const pct = Math.round((count / totalElementClicks) * 100);
    const elementLabels: Record<string, string> = {
      image:       'ad image',
      title:       'headline',
      cta:         'call-to-action',
      description: 'description',
      company:     'company name',
    };
    const label = elementLabels[el] ?? el;
    const advice =
      el === 'image'       ? 'Investing in higher-quality visuals will have the biggest impact on your CTR.' :
      el === 'title'       ? 'Your headline is the strongest hook — test variations to push CTR further.' :
      el === 'cta'         ? 'Your call-to-action is converting well — keep the wording clear and direct.' :
      el === 'description' ? 'Viewers read your description before clicking — make the first sentence count.' :
                             `Clicks are concentrated on your ${label} — optimise this element first.`;
    drafts.push({
      type:     'performance',
      title:    `Your ${label} drives ${pct}% of all clicks`,
      body:     `${pct}% of clicks on this Yubbox come from the ${label}. ${advice}`,
      impact:   pct >= 60 ? 'high' : 'medium',
      priority: 55,
      data:     { topElement: el, pct, breakdown: elementCounts },
    });
  }

  // ── 7. Weekday vs weekend pattern ─────────────────────────────────────────
  const wkday = { v: 0, c: 0 };
  const wkend = { v: 0, c: 0 };

  views.forEach((e) => {
    const d = new Date(e.timestamp).getUTCDay();
    (d === 0 || d === 6 ? wkend : wkday).v++;
  });
  clicks.forEach((e) => {
    const d = new Date(e.timestamp).getUTCDay();
    (d === 0 || d === 6 ? wkend : wkday).c++;
  });

  const wkdayCTR = wkday.v >= 5 ? (wkday.c / wkday.v) * 100 : null;
  const wkendCTR = wkend.v >= 5 ? (wkend.c / wkend.v) * 100 : null;

  if (wkdayCTR !== null && wkendCTR !== null) {
    const better     = wkdayCTR >= wkendCTR ? 'weekdays' : 'weekends';
    const betterCTR  = Math.max(wkdayCTR, wkendCTR);
    const worseCTR   = Math.min(wkdayCTR, wkendCTR);
    const ratio      = betterCTR / Math.max(worseCTR, 0.1);

    if (ratio >= 1.3 && (betterCTR - worseCTR) >= 0.5) {
      // Find the best hour within the winning day group
      const isWkendBetter = better === 'weekends';
      const dayHourBuckets: Record<number, { v: number; c: number }> = {};

      views.forEach((e) => {
        const d = new Date(e.timestamp).getUTCDay();
        if ((d === 0 || d === 6) === isWkendBetter) {
          const h = new Date(e.timestamp).getUTCHours();
          dayHourBuckets[h] = { v: (dayHourBuckets[h]?.v ?? 0) + 1, c: dayHourBuckets[h]?.c ?? 0 };
        }
      });
      clicks.forEach((e) => {
        const d = new Date(e.timestamp).getUTCDay();
        if ((d === 0 || d === 6) === isWkendBetter) {
          const h = new Date(e.timestamp).getUTCHours();
          if (dayHourBuckets[h]) dayHourBuckets[h].c++;
        }
      });

      const bestDayHour = Object.entries(dayHourBuckets)
        .filter(([, d]) => d.v >= 2)
        .sort(([, a], [, b]) => (b.c / b.v) - (a.c / a.v))[0];
      const hourTip = bestDayHour
        ? ` Peak window on ${better}: ${bestDayHour[0]}:00–${Number(bestDayHour[0]) + 1}:00 UTC.`
        : '';

      drafts.push({
        type:     'timing',
        title:    `${better.charAt(0).toUpperCase() + better.slice(1)} deliver ${ratio.toFixed(1)}× more clicks`,
        body:     `Your ${better} CTR is ${betterCTR.toFixed(1)}% vs ${worseCTR.toFixed(1)}% on ${better === 'weekdays' ? 'weekends' : 'weekdays'}.${hourTip} Concentrate your boost budget on ${better} for maximum ROI.`,
        impact:   ratio >= 1.8 ? 'high' : 'medium',
        priority: 70,
        data:     { wkdayCTR, wkendCTR, better, ratio },
      });
    }
  }

  if (drafts.length === 0) return 0;

  // Delete stale insights and write fresh ones
  await prisma.adInsight.deleteMany({ where: { adId, expiresAt: { lt: now } } });

  const expiresAt = new Date(now.getTime() + 6 * 3600 * 1000); // 6-hour TTL

  await prisma.adInsight.createMany({
    data: drafts.map((d) => ({
      adId,
      type:      d.type,
      title:     d.title,
      body:      d.body,
      impact:    d.impact,
      priority:  d.priority,
      data:      d.data ? (d.data as Prisma.InputJsonValue) : Prisma.JsonNull,
      isRead:    false,
      expiresAt,
    })),
    skipDuplicates: true,
  });

  return drafts.length;
}
