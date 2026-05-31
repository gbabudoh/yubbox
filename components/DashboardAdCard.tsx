'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Globe, MapPin, Building2, BarChart2, RefreshCw, Eye } from 'lucide-react';
import { IAd } from '@/types/models';
import { getCountryByCode } from '@/lib/countries';
import { paymentService } from '@/services/paymentService';
import { useI18n } from '@/lib/i18n-context';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import Modal from './ui/Modal';
import AdAnalytics from './AdAnalytics';
import CountdownTimer from './CountdownTimer';

const BRAND       = '#790e61';
const BRAND_GRAD  = 'linear-gradient(135deg, #790e61, #c41e8a)';

const DashboardAdCard: React.FC<{ ad: IAd }> = ({ ad }) => {
  const { t } = useI18n();
  const [isPaying,       setIsPaying]       = useState(false);
  const [isRelisting,    setIsRelisting]    = useState(false);
  const [showAnalytics,  setShowAnalytics]  = useState(false);

  const now       = new Date();
  const isExpired = ad.expiryDate && new Date(ad.expiryDate) < now;
  const isLive    = ad.isPaid && ad.isActive && ad.expiryDate && !isExpired;

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
      alert(error instanceof Error ? error.message : 'Failed to relist ad');
    }
  };

  const imageUrl = ad.imageUrl
    ? getImageUrlSync(ad.imageUrl, { width: 400, height: 300, quality: 80, format: 'webp' })
    : null;

  const countries = (ad.countries || ad.countries || []);

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-full">

        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-neutral-100 text-neutral-300 gap-2">
              <Globe className="w-10 h-10 opacity-30" />
              <span className="text-xs">{t('ad.noImage')}</span>
            </div>
          )}

          {/* Status pill */}
          <div className="absolute top-3 right-3">
            {isExpired ? (
              <span className="px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {t('ad.expired')}
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {t('ad.active')}
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-neutral-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {t('ad.unpaid')}
              </span>
            )}
          </div>

          {/* Countdown overlay — only when live */}
          {isLive && ad.expiryDate && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 bg-black/30 text-white text-xs font-bold">
                <Clock className="w-3 h-3 opacity-70" />
                <CountdownTimer expiryDate={ad.expiryDate} />
              </div>
            </div>
          )}

          {/* Expired date — only when expired */}
          {isExpired && ad.expiryDate && (
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-orange-500/80 text-white text-xs font-semibold">
                <Clock className="w-3 h-3" />
                {t('ad.expiredOn')} {new Date(ad.expiryDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-4">

          {/* Title + description */}
          <div>
            <h3 className="text-base font-bold text-neutral-900 line-clamp-1 mb-1">{ad.title}</h3>
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{ad.description}</p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ad.companyName && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Building2 className="w-3.5 h-3.5" style={{ color: BRAND }} />
                <span className="truncate max-w-[120px]">{ad.companyName}</span>
              </div>
            )}
            {ad.location && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate max-w-[120px]">{ad.location}</span>
              </div>
            )}
          </div>

          {/* Country pills */}
          {countries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {countries.slice(0, 3).map((code) => {
                const country = getCountryByCode(code);
                return (
                  <span
                    key={code}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    style={{ background: 'rgba(121,14,97,0.06)', borderColor: 'rgba(121,14,97,0.15)', color: BRAND }}
                  >
                    <span>{country?.flag || '🏳️'}</span>
                    <span>{country?.name || code}</span>
                  </span>
                );
              })}
              {countries.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-neutral-400 bg-neutral-100">
                  +{countries.length - 3} {t('ad.more')}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto pt-3 border-t border-neutral-100 flex gap-2">
            {isExpired ? (
              <button
                onClick={handleRelist}
                disabled={isRelisting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND_GRAD }}
              >
                {isRelisting
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />
                }
                {t('ad.relist')}
              </button>
            ) : !ad.isPaid ? (
              <button
                onClick={handlePayment}
                disabled={isPaying}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND_GRAD }}
              >
                {isPaying
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : null
                }
                {t('ad.payNow')}
              </button>
            ) : null}

            <Link href={`/ads/${ad.id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-700">
                <Eye className="w-3.5 h-3.5" />
                {t('ad.view')}
              </button>
            </Link>

            <button
              onClick={() => setShowAnalytics(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-700"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {t('ad.analytics')}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title={`${t('ad.analytics')} — ${ad.title}`}
        size="xl"
      >
        <AdAnalytics ad={ad} />
      </Modal>
    </>
  );
};

export default DashboardAdCard;
