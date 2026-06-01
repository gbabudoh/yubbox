'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock, Globe, MapPin, Building2, BarChart2, RefreshCw,
  Eye, MousePointerClick, Heart, Edit3, Zap, TrendingUp,
  TrendingDown, Minus,
} from 'lucide-react';
import { IAd } from '@/types/models';
import { getCountryByCode } from '@/lib/countries';
import { paymentService } from '@/services/paymentService';
import { useI18n } from '@/lib/i18n-context';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import Modal from './ui/Modal';
import AdAnalytics from './AdAnalytics';
import CountdownTimer from './CountdownTimer';

const BRAND      = '#790e61';
const BRAND_GRAD = 'linear-gradient(135deg, #790e61, #c41e8a)';

interface AnalyticsData {
  totalViews:   number;
  totalClicks:  number;
  countryStats: { country: string; count: number }[];
  dailyStats:   { date: string; count: number }[];
}

interface Props {
  ad:            IAd;
  analyticsData?: AnalyticsData;
}

function performanceLevel(views: number, ctr: number): { label: string; color: string; bg: string; icon: typeof TrendingUp } {
  if (views >= 500 || ctr >= 5)  return { label: 'High',   color: '#059669', bg: 'rgba(16,185,129,0.08)',  icon: TrendingUp   };
  if (views >= 100 || ctr >= 2)  return { label: 'Medium', color: '#d97706', bg: 'rgba(245,158,11,0.08)',  icon: Minus         };
  return                                { label: 'Low',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   icon: TrendingDown  };
}

const DashboardAdCard: React.FC<Props> = ({ ad, analyticsData }) => {
  const { t }                           = useI18n();
  const [isPaying,      setIsPaying]    = useState(false);
  const [isRelisting,   setIsRelisting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const now       = new Date();
  const isExpired = ad.expiryDate && new Date(ad.expiryDate) < now;
  const isLive    = ad.isPaid && ad.isActive && ad.expiryDate && !isExpired;

  // Days remaining bar (0–100%)
  const daysTotal   = 30;
  const daysLeft    = ad.expiryDate
    ? Math.max((new Date(ad.expiryDate).getTime() - now.getTime()) / 86400000, 0)
    : 0;
  const expiryPct   = Math.min((daysLeft / daysTotal) * 100, 100);
  const expiryColor = expiryPct > 50 ? '#059669' : expiryPct > 20 ? '#d97706' : '#ef4444';

  // Analytics-derived values
  const views  = analyticsData?.totalViews  || 0;
  const clicks = analyticsData?.totalClicks || 0;
  const ctr    = views > 0 ? ((clicks / views) * 100) : 0;
  const perf   = performanceLevel(views, ctr);

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      const { url } = await paymentService.payForAd(ad.id);
      window.location.href = url;
    } catch (error) {
      setIsPaying(false);
      alert(error instanceof Error ? error.message : 'Failed to process payment');
    }
  };

  const handleRelist = async () => {
    try {
      setIsRelisting(true);
      const { url } = await paymentService.relistAd(ad.id);
      window.location.href = url;
    } catch (error) {
      setIsRelisting(false);
      alert(error instanceof Error ? error.message : 'Failed to relist');
    }
  };

  const imageUrl = ad.imageUrl
    ? getImageUrlSync(ad.imageUrl, { width: 400, height: 300, quality: 80, format: 'webp' })
    : null;

  const countries = ad.countries || [];

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-full group">

        {/* ── Image ──────────────────────────────────────────────────────────── */}
        <div className="relative w-full aspect-video overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={ad.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-neutral-100 text-neutral-300 gap-2">
              <Globe className="w-8 h-8 opacity-30" />
              <span className="text-xs">{t('ad.noImage')}</span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isExpired ? (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Expired
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-neutral-800/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Unpaid
              </span>
            )}

            {/* Performance badge */}
            {isLive && (
              <span className="flex items-center gap-1 px-2.5 py-1 backdrop-blur-sm text-[10px] font-bold rounded-full"
                style={{ background: `${perf.color}cc`, color: '#fff' }}>
                <perf.icon className="w-2.5 h-2.5" />
                {perf.label}
              </span>
            )}
          </div>

          {/* Flags */}
          {countries.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-0.5">
              {countries.slice(0, 2).map(code => {
                const c = getCountryByCode(code);
                return (
                  <div key={code} className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-sm">
                    {c?.flag || '🏳️'}
                  </div>
                );
              })}
              {countries.length > 2 && (
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[9px] font-bold text-white">
                  +{countries.length - 2}
                </div>
              )}
            </div>
          )}

          {/* Countdown */}
          {isLive && ad.expiryDate && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/20 bg-black/30 text-white text-[11px] font-bold">
                <Clock className="w-3 h-3 opacity-70" />
                <CountdownTimer expiryDate={ad.expiryDate} />
              </div>
            </div>
          )}
          {isExpired && ad.expiryDate && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md bg-orange-500/80 text-white text-[11px] font-semibold">
                <Clock className="w-3 h-3" />
                Expired {new Date(ad.expiryDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1 gap-3">

          {/* Title */}
          <div>
            <h3 className="text-[13px] font-bold text-neutral-900 line-clamp-1 mb-0.5">{ad.title}</h3>
            <p className="text-[11px] text-neutral-400 line-clamp-1">{ad.description}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {ad.companyName && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <Building2 className="w-3 h-3" style={{ color: BRAND }} />
                <span className="truncate max-w-[100px]">{ad.companyName}</span>
              </div>
            )}
            {ad.location && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span className="truncate max-w-[100px]">{ad.location}</span>
              </div>
            )}
          </div>

          {/* ── Inline analytics strip ─────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
            {[
              { icon: Eye,              val: views.toLocaleString(),   label: 'Views',   color: '#6366f1' },
              { icon: MousePointerClick,val: clicks.toLocaleString(),  label: 'Clicks',  color: '#d97706' },
              { icon: Heart,            val: ad.yubboxCount || 0,      label: 'Yubboxes',color: BRAND     },
              { icon: Globe,            val: (analyticsData?.countryStats?.length || 0), label: 'Countries', color: '#0ea5e9' },
            ].map(({ icon: Icon, val, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 py-1">
                <Icon className="w-3 h-3 mb-0.5" style={{ color }} />
                <span className="text-xs font-black text-neutral-900">{val}</span>
                <span className="text-[9px] text-neutral-400 leading-none">{label}</span>
              </div>
            ))}
          </div>

          {/* CTR badge */}
          {views > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border"
              style={{ background: `${perf.color}08`, borderColor: `${perf.color}20` }}>
              <span className="text-[11px] text-neutral-500 font-medium">Click-through rate</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black" style={{ color: perf.color }}>{ctr.toFixed(1)}%</span>
                <perf.icon className="w-3 h-3" style={{ color: perf.color }} />
              </div>
            </div>
          )}

          {/* Expiry progress bar */}
          {isLive && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-neutral-400">Time remaining</span>
                <span className="text-[10px] font-bold" style={{ color: expiryColor }}>
                  {Math.ceil(daysLeft)}d left
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div style={{ width: `${expiryPct}%`, background: expiryColor, height: '100%', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )}

          {/* Upgrade prompt for non-premium live ads */}
          {isLive && !ad.topLensExpiry && !ad.storiesExpiry && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed"
              style={{ borderColor: 'rgba(121,14,97,0.25)', background: 'rgba(121,14,97,0.03)' }}>
              <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND }} />
              <span className="text-[11px] font-medium" style={{ color: BRAND }}>
                Boost with Top Lens for more reach
              </span>
            </div>
          )}

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="mt-auto pt-3 border-t border-neutral-100 flex gap-2">
            {isExpired ? (
              <button onClick={handleRelist} disabled={isRelisting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND_GRAD }}>
                {isRelisting
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
                {t('ad.relist')}
              </button>
            ) : !ad.isPaid ? (
              <button onClick={handlePayment} disabled={isPaying}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND_GRAD }}>
                {isPaying && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {t('ad.payNow')} — $1
              </button>
            ) : null}

            {/* Edit — stays within dashboard */}
            <Link href={`/ads/${ad.id}/edit`} className={isExpired || !ad.isPaid ? 'w-9' : 'flex-1'}>
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600">
                <Edit3 className="w-3.5 h-3.5" />
                {!isExpired && ad.isPaid && <span>{t('ad.edit')}</span>}
              </button>
            </Link>

            {/* View — opens in new tab so user never leaves the dashboard */}
            <a href={`/ads/${ad.id}`} target="_blank" rel="noopener noreferrer" className="flex-none">
              <button className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600"
                title="View Yubbox (opens in new tab)">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </a>

            <button onClick={() => setShowAnalytics(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600">
              <BarChart2 className="w-3.5 h-3.5" />
              {t('ad.analytics')}
            </button>
          </div>
        </div>
      </div>

      {/* Full analytics modal */}
      <Modal isOpen={showAnalytics} onClose={() => setShowAnalytics(false)}
        title={`Analytics — ${ad.title}`} size="xl">
        <AdAnalytics ad={ad} />
      </Modal>
    </>
  );
};

export default DashboardAdCard;
