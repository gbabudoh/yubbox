/**
 * Geo Patterns Algorithm
 * Builds a country-level demand map: views, clicks, engagement quality,
 * untapped organic traffic, and regional cluster recommendations.
 */

import { prisma } from '@/lib/prisma';

export interface CountrySignal {
  country:        string;
  views:          number;
  clicks:         number;
  ctr:            number;           // percentage
  avgTimeOnAd:    number;           // seconds
  intentScore:    number;           // 0–100
  isTargeted:     boolean;          // was this country in the advertiser's list?
  trend:          'rising' | 'stable' | 'declining';
}

export interface GeoPatternResult {
  adId:            string;
  countries:       CountrySignal[];
  untappedMarkets: string[];        // organic traffic from non-targeted countries
  clusterTip:      string | null;   // e.g. "SG demand — also check MY, HK"
}

// Rough regional clusters for suggestion logic
const CLUSTERS: Record<string, string[]> = {
  SG: ['MY', 'HK', 'PH', 'TH'],
  FR: ['BE', 'CH', 'LU'],
  DE: ['AT', 'CH', 'NL'],
  GB: ['IE', 'AU', 'NZ', 'CA'],
  US: ['CA', 'GB', 'AU'],
  BR: ['PT', 'AR', 'CL'],
  AE: ['SA', 'KW', 'QA', 'BH'],
  NG: ['GH', 'KE', 'ZA'],
};

export async function getGeoPatterns(adId: string, targetedCountries: string[]): Promise<GeoPatternResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 86400000);

  const events = await prisma.analytics.findMany({
    where:  { adId, timestamp: { gte: thirtyDaysAgo } },
    select: { eventType: true, country: true, timeOnAd: true, scrollDepth: true, timestamp: true },
  });

  // Group by country
  const byCountry: Record<string, { views: number; clicks: number; timeOnAd: number[]; recent: number; total: number }> = {};

  events.forEach((e) => {
    const c = e.country ?? 'Unknown';
    if (!byCountry[c]) byCountry[c] = { views: 0, clicks: 0, timeOnAd: [], recent: 0, total: 0 };
    byCountry[c].total++;
    if (e.timestamp >= fifteenDaysAgo) byCountry[c].recent++;
    if (e.eventType === 'view') byCountry[c].views++;
    if (e.eventType === 'click') {
      byCountry[c].clicks++;
      if (e.timeOnAd) byCountry[c].timeOnAd.push(e.timeOnAd);
    }
  });

  const countries: CountrySignal[] = Object.entries(byCountry).map(([country, d]) => {
    const ctr = d.views > 0 ? Math.round((d.clicks / d.views) * 1000) / 10 : 0;
    const avgTimeOnAd = d.timeOnAd.length > 0
      ? Math.round(d.timeOnAd.reduce((a, b) => a + b, 0) / d.timeOnAd.length)
      : 0;
    // Simple intent proxy: normalised blend of CTR and avg time
    const intentScore = Math.min(Math.round(ctr * 5 + avgTimeOnAd * 0.5), 100);
    const halfRatio = d.total > 0 ? d.recent / d.total : 0.5;
    const trend: CountrySignal['trend'] = halfRatio >= 0.6 ? 'rising' : halfRatio <= 0.35 ? 'declining' : 'stable';

    return {
      country,
      views:       d.views,
      clicks:      d.clicks,
      ctr,
      avgTimeOnAd,
      intentScore,
      isTargeted:  targetedCountries.includes(country),
      trend,
    };
  });

  // Sort by views desc
  countries.sort((a, b) => b.views - a.views);

  const untappedMarkets = countries
    .filter((c) => !c.isTargeted && c.clicks > 0)
    .map((c) => c.country);

  // Cluster tip: find the top non-targeted country with a cluster
  let clusterTip: string | null = null;
  for (const c of untappedMarkets) {
    const related = CLUSTERS[c];
    if (related) {
      const suggestions = related.filter((r) => !targetedCountries.includes(r)).join(', ');
      if (suggestions) {
        clusterTip = `You're getting organic traffic from ${c} — consider also targeting ${suggestions}`;
        break;
      }
    }
  }

  return { adId, countries, untappedMarkets, clusterTip };
}
