'use client';

/**
 * Platform Intelligence Suite — dashboard panel
 * Shows: Brain Score, Insight cards, AI Predictions, Spend Score, Spy benchmarks
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Lightbulb, TrendingUp, Globe, DollarSign,
  AlertTriangle, ChevronDown, RefreshCw, Eye, MapPin,
  Sparkles, Target, Clock, BarChart2, Radar,
} from 'lucide-react';
import { IAd } from '@/types/models';

const BRAND      = '#790e61';
const BRAND_GRAD = 'linear-gradient(135deg, #790e61, #c41e8a)';
const glass      = 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BrainData {
  brainScore: number;
  signals: {
    views: number; clicks: number; ctr: number;
    yubboxCount: number; isPaid: boolean;
    hasTopLens: boolean; hasStories: boolean; unreadInsights: number;
  };
}

interface Insight {
  id: string; type: string; title: string; body: string;
  impact: 'high' | 'medium' | 'low'; priority: number; isRead: boolean;
  data?: Record<string, unknown>;
}

interface Prediction {
  predictedViews14d: [number, number];
  predictedClicks14d: [number, number];
  targetingTip: string | null;
  boostTiming: string | null;
  expiryVelocityAlert: string | null;
  cpcBenchmark: { yourCPC: number | null; categoryAvg: number; percentile: number | null };
}

interface SpendScoreData {
  score: number;
  viewsPerDollar: number; clicksPerDollar: number;
  engagementRate: number; categoryRank: number;
  breakdown: { viewEfficiency: number; clickEfficiency: number; engagementBonus: number; premiumROI: number; trend: number };
  improvementTip: string;
}

interface SpyData {
  userCTR: number; benchmarkCTR: number; userPercentile: number;
  topHour: number | null; topHourLift: number;
  hotCountries: { country: string; demand: 'high' | 'medium' | 'low'; competition: 'high' | 'low' }[];
  timingAdvice: string | null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 96, label }: { score: number; size?: number; label: string }) {
  const r     = (size - 12) / 2;
  const circ  = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  const color = score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth="10" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round" />
      </svg>
      <div className="text-center -mt-[88px]" style={{ height: size }}>
        <p className="text-2xl font-black text-neutral-900 mt-7">{score}</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const impactColors: Record<string, { bg: string; text: string; border: string }> = {
    high:   { bg: 'rgba(239,68,68,0.06)',    text: '#ef4444', border: 'rgba(239,68,68,0.18)' },
    medium: { bg: 'rgba(245,158,11,0.06)',   text: '#d97706', border: 'rgba(245,158,11,0.18)' },
    low:    { bg: 'rgba(99,102,241,0.06)',   text: '#6366f1', border: 'rgba(99,102,241,0.18)' },
  };
  const typeIcons: Record<string, typeof Lightbulb> = {
    alert: AlertTriangle, timing: Clock, geo: Globe,
    opportunity: TrendingUp, spend: DollarSign, performance: BarChart2,
  };
  const c      = impactColors[insight.impact] ?? impactColors.low;
  const Icon   = typeIcons[insight.type] ?? Lightbulb;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border flex gap-3"
      style={{ background: c.bg, borderColor: c.border }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${c.text}15` }}>
        <Icon className="w-4 h-4" style={{ color: c.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-xs font-bold text-neutral-900 leading-snug">{insight.title}</p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
            style={{ background: `${c.text}15`, color: c.text }}>
            {insight.impact}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">{insight.body}</p>
      </div>
    </motion.div>
  );
}

function SpendBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-500 font-medium">{label}</span>
        <span className="text-[11px] font-black text-neutral-900">{value}pts</span>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.7 }} className="h-full rounded-full"
          style={{ background: color }} />
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props { ads: IAd[] }

const IntelligencePanel: React.FC<Props> = ({ ads }) => {
  const [selectedAdId, setSelectedAdId] = useState<string>(ads[0]?.id ?? '');
  const [brain,        setBrain]        = useState<BrainData | null>(null);
  const [insights,     setInsights]     = useState<Insight[]>([]);
  const [predictions,  setPredictions]  = useState<Prediction | null>(null);
  const [spendScore,   setSpendScore]   = useState<SpendScoreData | null>(null);
  const [spyData,      setSpyData]      = useState<SpyData | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  const fetchAll = useCallback(async (adId: string, isRefresh = false) => {
    if (!adId) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [brainRes, insightsRes, predictRes, spendRes, spyRes] = await Promise.all([
        fetch(`/api/intelligence/brain?adId=${adId}`),
        fetch(`/api/intelligence/insights?adId=${adId}`),
        fetch(`/api/intelligence/predictions?adId=${adId}`),
        fetch('/api/intelligence/spend-score'),
        fetch(`/api/intelligence/spy?adId=${adId}`),
      ]);

      const [b, i, p, s, spy] = await Promise.all([
        brainRes.json(), insightsRes.json(), predictRes.json(), spendRes.json(), spyRes.json(),
      ]);

      if (b.success)   setBrain(b.data);
      if (i.success)   setInsights(i.data ?? []);
      if (p.success)   setPredictions(p.data);
      if (s.success)   setSpendScore(s.data);
      if (spy.success) setSpyData(spy.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAdId) fetchAll(selectedAdId);
  }, [selectedAdId, fetchAll]);

  const selectedAd = ads.find((a) => a.id === selectedAdId);

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Brain className="w-12 h-12 text-neutral-200 mb-4" />
        <p className="text-sm font-bold text-neutral-400">No Yubboxes yet</p>
        <p className="text-xs text-neutral-300 mt-1">Create and activate a Yubbox to unlock Intelligence insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Ad selector + refresh ─────────────────────────────────────────────── */}
      <div className={`p-4 rounded-2xl ${glass} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
            <Brain className="w-4 h-4" style={{ color: BRAND }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Platform Intelligence Suite</p>
            <p className="text-sm font-black text-neutral-900">Yubbox Brain</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <select
              value={selectedAdId}
              onChange={(e) => setSelectedAdId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': BRAND } as React.CSSProperties}>
              {ads.map((ad) => (
                <option key={ad.id} value={ad.id}>{ad.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
          <button onClick={() => fetchAll(selectedAdId, true)} disabled={refreshing}
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
            title="Refresh intelligence">
            <RefreshCw className={`w-4 h-4 text-neutral-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#790e61]/20 border-t-[#790e61] rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={selectedAdId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* ── Row 1: Brain Score + Insights ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Brain Score */}
              <div className={`p-6 rounded-3xl ${glass} flex flex-col items-center text-center`}>
                <div className="flex items-center gap-2 mb-5 self-start">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
                    <Brain className="w-3.5 h-3.5" style={{ color: BRAND }} />
                  </div>
                  <p className="text-xs font-bold text-neutral-700">Brain Score</p>
                </div>
                {brain ? (
                  <>
                    <ScoreRing score={brain.brainScore} label="Health" />
                    <div className="grid grid-cols-2 gap-2 w-full mt-4">
                      {[
                        { label: 'Views',    val: brain.signals.views.toLocaleString(),      color: '#6366f1' },
                        { label: 'Clicks',   val: brain.signals.clicks.toLocaleString(),     color: '#d97706' },
                        { label: 'CTR',      val: `${brain.signals.ctr.toFixed(1)}%`,        color: BRAND    },
                        { label: 'Yubboxes', val: brain.signals.yubboxCount.toLocaleString(), color: '#059669' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex flex-col items-center py-2 rounded-xl border border-neutral-100 bg-white/40">
                          <span className="text-sm font-black text-neutral-900">{val}</span>
                          <span className="text-[10px] text-neutral-400 font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                    {brain.signals.unreadInsights > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl w-full"
                        style={{ background: 'rgba(121,14,97,0.06)', border: '1px solid rgba(121,14,97,0.14)' }}>
                        <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND }} />
                        <p className="text-[11px] font-semibold" style={{ color: BRAND }}>
                          {brain.signals.unreadInsights} new insight{brain.signals.unreadInsights > 1 ? 's' : ''} available
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-300 mt-8">No data yet</p>
                )}
              </div>

              {/* Insight Cards */}
              <div className={`p-6 rounded-3xl ${glass} lg:col-span-2`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs font-bold text-neutral-700">Yubbox Intelligence — Insight Cards</p>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                    Ranked by impact
                  </span>
                </div>
                {insights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Lightbulb className="w-8 h-8 text-neutral-200 mb-2" />
                    <p className="text-xs text-neutral-400 font-medium">Insights will appear once your Yubbox accumulates traffic</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {insights.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
                  </div>
                )}
              </div>
            </div>

            {/* ── Row 2: AI Predictions + Spend Score ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* AI Predictions */}
              <div className={`p-6 rounded-3xl ${glass}`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-50">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-xs font-bold text-neutral-700">Yubbox AI — Predictions</p>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    14-day forecast
                  </span>
                </div>
                {predictions ? (
                  <div className="space-y-4">
                    {/* Forecast range */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Predicted Views', range: predictions.predictedViews14d,  color: '#6366f1', icon: Eye },
                        { label: 'Predicted Clicks', range: predictions.predictedClicks14d, color: '#d97706', icon: Target },
                      ].map(({ label, range, color, icon: Icon }) => (
                        <div key={label} className="p-4 rounded-2xl border border-neutral-100 bg-white/40 text-center">
                          <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
                          <p className="text-[10px] text-neutral-400 font-medium mb-1">{label}</p>
                          <p className="text-lg font-black text-neutral-900">
                            {range[0].toLocaleString()}–{range[1].toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Tips */}
                    <div className="space-y-2">
                      {[
                        { text: predictions.targetingTip,        icon: Globe,          color: '#0ea5e9' },
                        { text: predictions.boostTiming,         icon: Sparkles,       color: BRAND    },
                        { text: predictions.expiryVelocityAlert, icon: AlertTriangle,  color: '#ef4444' },
                      ].filter(t => t.text).map(({ text, icon: Icon, color }) => (
                        <div key={text} className="flex gap-2.5 p-3 rounded-xl border border-neutral-100 bg-white/30">
                          <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color }} />
                          <p className="text-[11px] text-neutral-600 leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>

                    {/* CPC benchmark */}
                    {predictions.cpcBenchmark.yourCPC !== null && (
                      <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Your CPC</p>
                          <p className="text-lg font-black text-emerald-900">${predictions.cpcBenchmark.yourCPC.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600">Category avg: ${predictions.cpcBenchmark.categoryAvg.toFixed(2)}</p>
                          {predictions.cpcBenchmark.percentile !== null && (
                            <p className="text-[11px] font-bold text-emerald-800">Top {100 - predictions.cpcBenchmark.percentile}%</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs text-neutral-300">Predictions require at least a few days of traffic data</p>
                  </div>
                )}
              </div>

              {/* Spend Score */}
              <div className={`p-6 rounded-3xl ${glass}`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-neutral-700">Spend Score</p>
                </div>
                {spendScore ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <ScoreRing score={spendScore.score} size={88} label="Efficiency" />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-neutral-400 font-medium">Category Rank</p>
                          <p className="text-xs font-black text-neutral-900">Top {100 - spendScore.categoryRank}%</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-neutral-400 font-medium">Views / $1</p>
                          <p className="text-xs font-black text-neutral-900">{spendScore.viewsPerDollar.toFixed(1)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-neutral-400 font-medium">Clicks / $1</p>
                          <p className="text-xs font-black text-neutral-900">{spendScore.clicksPerDollar.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <SpendBar label="View Efficiency" value={spendScore.breakdown.viewEfficiency}  max={30} color="#6366f1" />
                      <SpendBar label="Click Efficiency" value={spendScore.breakdown.clickEfficiency} max={35} color={BRAND}   />
                      <SpendBar label="Engagement Bonus" value={spendScore.breakdown.engagementBonus} max={15} color="#059669" />
                      <SpendBar label="Premium ROI"      value={spendScore.breakdown.premiumROI}      max={10} color="#0ea5e9" />
                    </div>

                    <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 flex gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-800 leading-relaxed">{spendScore.improvementTip}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <p className="text-xs text-neutral-300">Activate a paid Yubbox to unlock your Spend Score</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Row 3: Yubbox Spy ───────────────────────────────────────────── */}
            <div className={`p-6 rounded-3xl ${glass}`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.08)' }}>
                  <Radar className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <p className="text-xs font-bold text-neutral-700">Yubbox Spy — Market Intelligence</p>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Anonymised data
                </span>
              </div>

              {spyData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* CTR Benchmark */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">CTR Benchmark</p>
                    <div className="flex items-end gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-black" style={{ color: BRAND }}>{spyData.userCTR.toFixed(1)}%</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Your CTR</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-neutral-400">{spyData.benchmarkCTR.toFixed(1)}%</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Category avg</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-neutral-100 bg-white/40">
                      <p className="text-xs font-bold text-neutral-800">
                        You rank in the top <span style={{ color: BRAND }}>{100 - spyData.userPercentile}%</span> of your category
                      </p>
                    </div>
                    {spyData.timingAdvice && (
                      <div className="flex gap-2 p-3 rounded-xl border border-sky-100 bg-sky-50">
                        <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-sky-800 leading-relaxed">{spyData.timingAdvice}</p>
                      </div>
                    )}
                  </div>

                  {/* Hot Countries */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Category Heat Map</p>
                    <div className="space-y-2">
                      {spyData.hotCountries.slice(0, 5).map(({ country, demand, competition }) => {
                        const demandColor = demand === 'high' ? '#059669' : demand === 'medium' ? '#d97706' : '#9ca3af';
                        return (
                          <div key={country} className="flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-100 bg-white/40">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-neutral-300" />
                              <span className="text-xs font-semibold text-neutral-700">{country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: `${demandColor}15`, color: demandColor }}>
                                {demand} demand
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                competition === 'low'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}>
                                {competition} comp.
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Geo Opportunity */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Geo Opportunity</p>
                    <div className="p-4 rounded-2xl border border-neutral-100 bg-white/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-500" />
                        <p className="text-xs font-bold text-neutral-800">Untapped Markets</p>
                      </div>
                      {spyData.hotCountries.filter(c => c.demand === 'high' && c.competition === 'low').length > 0 ? (
                        <>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">
                            High demand, low competition in these markets — ideal for your next targeting expansion:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {spyData.hotCountries
                              .filter(c => c.demand === 'high' && c.competition === 'low')
                              .map(c => (
                                <span key={c.country} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {c.country}
                                </span>
                              ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-[11px] text-neutral-400">
                          No clear untapped markets yet — your current targeting is well-optimised.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Radar className="w-8 h-8 text-neutral-200 mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">Spy data requires at least 5 ads in your category</p>
                  <p className="text-[11px] text-neutral-300 mt-1">All benchmarks are fully anonymised</p>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default IntelligencePanel;
