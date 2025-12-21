import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IAd } from '@/types/models';
import { cn } from '@/lib/utils';
import { getCountryByCode } from '@/lib/countries';
import { analyticsService } from '@/services/analyticsService';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import CountdownTimer from './CountdownTimer';
import { useI18n } from '@/lib/i18n-context';

interface AdCardProps {
  ad: IAd;
  className?: string;
}

const AdCard: React.FC<AdCardProps> = ({ ad, className }) => {
  const { t } = useI18n();
  
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

  // Get optimized image URL
  const imageUrl = ad.imageUrl 
    ? getImageUrlSync(ad.imageUrl, { width: 640, height: 480, quality: 85, format: 'webp' })
    : null;

  return (
    <Link href={`/ads/${ad._id}`}>
      <div
        className={cn(
          'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
          className
        )}
      >
        <div className="relative w-full h-48 bg-gray-200">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={ad.title}
                fill
                className="object-cover"
                unoptimized={true}
              />
              <div className="absolute top-2 right-2">
                <Image
                  src="/icon.png"
                  alt="Zupplet"
                  width={24}
                  height={24}
                  className="rounded-full shadow-md border-2 border-white"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {t('ad.noImage') || 'No Image'}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ad.description}
          </p>
          {((ad.countries && ad.countries.length > 0) || (ad.targetLocations && ad.targetLocations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(ad.countries || ad.targetLocations || []).slice(0, 3).map((code, index) => {
                const country = getCountryByCode(code);
                return (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1"
                  >
                    {country ? (
                      <>
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </>
                    ) : (
                      code
                    )}
                  </span>
                );
              })}
              {(ad.countries || ad.targetLocations || []).length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{(ad.countries || ad.targetLocations || []).length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Product Owner Information */}
          {(ad.ownerName || ad.companyName || ad.location) && (
            <div className="mb-3 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Seller Information
                </h4>
              </div>
              <div className="p-4 space-y-3">
                {ad.ownerName && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Owner</span>
                      <span className="text-sm font-semibold text-gray-900">{ad.ownerName}</span>
                    </div>
                  </div>
                )}
                {ad.companyName && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2H4v8h12V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Company</span>
                      <span className="text-sm font-semibold text-gray-900">{ad.companyName}</span>
                    </div>
                  </div>
                )}
                {ad.location && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-gray-500 block">Location</span>
                      <span className="text-sm font-semibold text-gray-900">{ad.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {new Date(ad.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2">
              {ad.isPaid && ad.isActive && ad.expiryDate && ad.paymentDate && new Date(ad.expiryDate) >= new Date() && (
                <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border-2 border-blue-300 shadow-md">
                  <span className="text-gray-700 font-semibold">{t('ad.expires') || 'Expires'}:</span>
                  <CountdownTimer expiryDate={ad.expiryDate} />
                </div>
              )}
              {ad.topLensExpiry && new Date(ad.topLensExpiry) > new Date() && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  Top Lens
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdCard;

