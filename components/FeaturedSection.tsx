'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, MapPin, Heart } from 'lucide-react';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import { getCountryByCode } from '@/lib/countries';
import { MOCK_ADS } from '@/lib/mockData';

interface FeaturedAd {
  id: string;
  title: string;
  description: string;
  companyName: string;
  ownerName: string;
  imageUrl: string;
  webLink: string;
  location: string;
  countries: string[];
  yubboxCount: number;
  topLensExpiry: string;
}

// Use the real MOCK_ADS ObjectIds so the detail page can resolve them
const MOCK_FEATURED: FeaturedAd[] = MOCK_ADS.map((ad) => ({
  id: ad.id ?? '',
  title: ad.title ?? '',
  description: ad.description ?? '',
  companyName: ad.companyName ?? '',
  ownerName: ad.ownerName ?? '',
  imageUrl: ad.imageUrl ?? '',
  webLink: ad.webLink ?? '#',
  location: ad.location ?? '',
  countries: ad.countries ?? [],
  yubboxCount: ad.yubboxCount ?? 0,
  topLensExpiry: new Date(Date.now() + 30 * 86400000).toISOString(),
}));

function getImageSrc(imageUrl: string) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }
  return getImageUrlSync(imageUrl, { width: 480, height: 320, quality: 85, format: 'webp' });
}

export default function FeaturedSection() {
  const [ads, setAds] = useState<FeaturedAd[]>([]);

  useEffect(() => {
    fetch('/api/ads/toplens')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setAds(d.data);
        } else {
          setAds(MOCK_FEATURED);
        }
      })
      .catch(() => { setAds(MOCK_FEATURED); });
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="w-full py-4 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase" style={{ color: '#790e61' }}>
            Top Lens
          </span>
          <span className="text-xs text-neutral-400 font-medium">· Featured placements</span>
        </div>

        {/* Horizontal scroll strip */}
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ads.map((ad, i) => {
            const imgSrc = getImageSrc(ad.imageUrl);

            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="shrink-0 w-64 group"
              >
                <Link href={`/ads/${ad.id}`} className="block">
                  <div
                    className="rounded-2xl p-[1.5px]"
                    style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}
                  >
                    <div className="rounded-2xl bg-white overflow-hidden">
                      {/* Image */}
                      <div className="relative w-full aspect-video overflow-hidden">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={ad.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="256px"
                            unoptimized={imgSrc.startsWith('/api/')}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100" />
                        )}

                        {/* TOP LENS badge */}
                        <div
                          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-black tracking-wider uppercase"
                          style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)', boxShadow: '0 2px 8px rgba(121,14,97,0.4)' }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          Top Lens
                        </div>

                        {/* Country flags */}
                        <div className="absolute top-2 right-2 flex gap-0.5">
                          {(ad.countries || []).slice(0, 2).map((code) => {
                            const country = getCountryByCode(code);
                            return (
                              <div key={code} className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-sm">
                                {country?.flag || '🏳️'}
                              </div>
                            );
                          })}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            View <ArrowUpRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-sm font-black text-neutral-900 line-clamp-1 group-hover:text-[#790e61] transition-colors">
                          {ad.title}
                        </h3>
                        <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{ad.companyName}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{ad.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#790e61' }}>
                            <Heart className="w-3 h-3" fill="currentColor" />
                            <span>{ad.yubboxCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
