'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Building, User, Clock, Globe, ArrowUpRight } from 'lucide-react';
import { IAd } from '@/types/models';
import { cn } from '@/lib/utils';
import { getCountryByCode } from '@/lib/countries';
import { analyticsService } from '@/services/analyticsService';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import { adService } from '@/services/adService';
import { MOCK_ADS } from '@/lib/mockData';
import CountdownTimer from './CountdownTimer';
import { useI18n } from '@/lib/i18n-context';

interface AdCardProps {
  ad: IAd;
  className?: string;
}

const AdCard: React.FC<AdCardProps> = ({ ad, className }) => {
  const { t } = useI18n();
  const [yc, setYc] = useState(ad.yubboxCount || 0);
  const [isVoting, setIsVoting] = useState(false);
  
  // Track view when card is rendered (only for active ads)
  useEffect(() => {
    if (
      ad.expiryDate &&
      new Date(ad.expiryDate) >= new Date() &&
      ad.isActive
    ) {
      analyticsService.trackEvent(String(ad._id), 'view', {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
      });
    }
  }, [ad]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVoting) return;
    
    // Check if it's a mock ad
    const isMock = MOCK_ADS.some(m => String(m._id) === String(ad._id));
    if (isMock) {
      setYc(prev => prev + 1);
      return;
    }

    try {
      setIsVoting(true);
      const newCount = await adService.voteAd(String(ad._id));
      setYc(newCount);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  // Get optimized image URL
  const imageUrl = ad.imageUrl 
    ? getImageUrlSync(ad.imageUrl, { width: 640, height: 480, quality: 85, format: 'webp' })
    : null;

  return (
    <div className={cn('group relative h-full', className)}>
      <Link href={`/ads/${ad._id}`}>
        <div className="glass-card rounded-[2rem] overflow-hidden h-full flex flex-col group/card">
          {/* Image Section */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
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
              <div className="yc-badge cursor-pointer" onClick={handleVote}>
                <Heart className={cn("w-3.5 h-3.5", isVoting && "animate-pulse")} fill="currentColor" />
                <span>{yc} <span className="opacity-70 font-normal">yc</span></span>
              </div>
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
              <div className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                {t('ad.viewDetails')}
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col flex-1">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1 group-hover/card:text-indigo-600 transition-colors">
                {ad.title}
              </h3>
              <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-500" />
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

