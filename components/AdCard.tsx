'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Building, User, Clock, Globe, ArrowUpRight, Sparkles } from 'lucide-react';
import { IAd } from '@/types/models';
import { cn } from '@/lib/utils';
import { getCountryByCode } from '@/lib/countries';
import { analyticsService } from '@/services/analyticsService';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import { adService } from '@/services/adService';
import { MOCK_ADS } from '@/lib/mockData';
import CountdownTimer from './CountdownTimer';
import { useI18n } from '@/lib/i18n-context';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'yb_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function getScrollDepth(): number {
  if (typeof window === 'undefined') return 0;
  const scrollable = document.body.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(Math.round((window.scrollY / scrollable) * 100), 100);
}

// Walk up the DOM from the click target to find a data-element attribute
function getClickElement(target: EventTarget | null): string {
  let node = target as HTMLElement | null;
  while (node && node !== document.body) {
    const el = node.dataset?.element;
    if (el) return el;
    node = node.parentElement;
  }
  return 'card';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AdCardProps {
  ad: IAd;
  className?: string;
}

const AdCard: React.FC<AdCardProps> = ({ ad, className }) => {
  const { t } = useI18n();
  const [yc, setYc]           = useState(ad.yubboxCount || 0);
  const [isVoting, setIsVoting] = useState(false);

  // Refs for behavioural signal tracking
  const cardRef          = useRef<HTMLDivElement>(null);
  const viewStartTimeRef = useRef<number | null>(null);
  const viewTrackedRef   = useRef(false);

  const isActive = ad.expiryDate && new Date(ad.expiryDate) >= new Date() && ad.isActive;

  // ── View tracking (IntersectionObserver) ───────────────────────────────────
  useEffect(() => {
    if (!isActive || viewTrackedRef.current) return;
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewTrackedRef.current) {
          viewTrackedRef.current = true;
          viewStartTimeRef.current = Date.now();

          analyticsService.trackEvent(ad.id, 'view', {
            userAgent:   navigator.userAgent,
            referrer:    document.referrer,
            sessionId:   getOrCreateSessionId(),
            deviceType:  getDeviceType(),
            scrollDepth: getScrollDepth(),
          });

          observer.disconnect();
        }
      },
      { threshold: 0.5 }, // card must be 50% visible before counting as a view
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad.id, isActive]);

  // ── Click tracking ─────────────────────────────────────────────────────────
  const handleCardClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) return;
    const timeOnAd = viewStartTimeRef.current
      ? Math.round((Date.now() - viewStartTimeRef.current) / 1000)
      : 0;

    analyticsService.trackEvent(ad.id, 'click', {
      userAgent:    navigator.userAgent,
      referrer:     document.referrer,
      sessionId:    getOrCreateSessionId(),
      deviceType:   getDeviceType(),
      scrollDepth:  getScrollDepth(),
      timeOnAd,
      clickElement: getClickElement(e.target),
    });
  }, [ad.id, isActive]);

  // ── Vote ───────────────────────────────────────────────────────────────────
  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVoting) return;
    const isMock = MOCK_ADS.some((m) => m.id === ad.id);
    if (isMock) { setYc((p) => p + 1); return; }
    try {
      setIsVoting(true);
      const newCount = await adService.voteAd(ad.id);
      setYc(newCount);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const imageUrl = ad.imageUrl
    ? getImageUrlSync(ad.imageUrl, { width: 640, height: 480, quality: 85, format: 'webp' })
    : null;

  return (
    <div ref={cardRef} className={cn('group relative h-full', className)}>
      <Link href={`/ads/${ad.id}`} onClick={handleCardClick}>
        <div className="glass-card rounded-4xl overflow-hidden h-full flex flex-col group/card">

          {/* Image Section */}
          <div className="relative w-full aspect-4/3 overflow-hidden" data-element="image">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                unoptimized={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-neutral-100 text-neutral-400">
                <Globe className="w-12 h-12 opacity-20" />
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="yc-badge cursor-pointer" data-element="yubbox" onClick={handleVote}>
                <Heart className={cn('w-3.5 h-3.5', isVoting && 'animate-pulse')} fill="currentColor" />
                <span>{yc} <span className="opacity-70 font-normal">yc</span></span>
              </div>
              {ad.topLensExpiry && new Date(ad.topLensExpiry) >= new Date() && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-black tracking-wider uppercase w-fit"
                  style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)', boxShadow: '0 2px 8px rgba(121,14,97,0.4)' }}>
                  <Sparkles className="w-2.5 h-2.5" />
                  Top Lens
                </div>
              )}
            </div>

            {/* Country Flags */}
            <div className="absolute top-4 right-4 flex gap-1">
              {(ad.countries || []).slice(0, 2).map((code) => {
                const country = getCountryByCode(code);
                return (
                  <div key={code} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg shadow-sm" title={country?.name}>
                    {country?.flag || '🏳️'}
                  </div>
                );
              })}
            </div>

            {/* View Details Hover Button */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div data-element="cta" className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                {t('ad.viewDetails')}
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <h3 data-element="title" className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1 group-hover/card:text-[#790e61] transition-colors">
                {ad.title}
              </h3>
              <p data-element="description" className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div data-element="company" className="flex items-center gap-2 text-xs text-neutral-500">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate">{ad.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                <span className="truncate">{ad.location}</span>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <User className="w-4 h-4" style={{ color: '#790e61' }} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">{t('ad.seller')}</span>
                  <span className="text-xs font-semibold text-neutral-700">{ad.ownerName}</span>
                </div>
              </div>

              {ad.expiryDate && new Date(ad.expiryDate) > new Date() && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 text-neutral-500 border border-neutral-100">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <div className="text-[10px] font-bold">
                    <CountdownTimer expiryDate={ad.expiryDate} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AdCard;
