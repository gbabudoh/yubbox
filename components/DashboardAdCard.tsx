'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IAd } from '@/types/models';
import { cn } from '@/lib/utils';
import { getCountryByCode } from '@/lib/countries';
import { paymentService } from '@/services/paymentService';
import { useI18n } from '@/lib/i18n-context';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import Button from './ui/Button';
import Modal from './ui/Modal';
import AdAnalytics from './AdAnalytics';
import CountdownTimer from './CountdownTimer';

interface DashboardAdCardProps {
  ad: IAd;
  onUpdate: () => void;
}

const DashboardAdCard: React.FC<DashboardAdCardProps> = ({ ad, onUpdate }) => {
  const { t } = useI18n();
  const [isPaying, setIsPaying] = useState(false);
  const [isRelisting, setIsRelisting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isExpired = ad.expiryDate && new Date(ad.expiryDate) < new Date();

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      const { url } = await paymentService.payForAd(String(ad._id));
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      setIsPaying(false);
      alert(
        error instanceof Error ? error.message : 'Failed to process payment'
      );
    }
  };

  const handleRelist = async () => {
    try {
      setIsRelisting(true);
      const { url } = await paymentService.relistAd(String(ad._id));
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      setIsRelisting(false);
      alert(
        error instanceof Error ? error.message : 'Failed to relist ad'
      );
    }
  };

  // Get optimized image URL
  const imageUrl = ad.imageUrl 
    ? getImageUrlSync(ad.imageUrl, { width: 400, height: 300, quality: 80, format: 'webp' })
    : null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <div className="absolute top-2 left-2">
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
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {isExpired ? (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                {t('ad.expired') || 'Expired'}
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                {t('ad.active') || 'Active'}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ad.description}
          </p>

          {/* Payment Status & Expiry - Counter only shows after payment */}
          <div className="mb-3 space-y-2">
            {isExpired ? (
              <div className="text-sm text-orange-700 font-bold bg-orange-100 p-3 rounded-lg border-2 border-orange-400">
                {t('ad.expiredOn') || 'Expired on'}{' '}
                {ad.expiryDate && new Date(ad.expiryDate).toLocaleDateString()}
              </div>
            ) : ad.expiryDate ? (
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg border-4 border-blue-500 shadow-xl">
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-gray-900">
                    {t('ad.expiresIn') || 'Expires in'}:
                  </span>
                  <span className="text-xs text-gray-600 mt-1">
                    Active • Expires {new Date(ad.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <CountdownTimer expiryDate={ad.expiryDate} />
              </div>
            ) : (
              <div className="text-sm text-green-600 font-semibold bg-green-50 p-3 rounded-lg border-2 border-green-300">
                {t('ad.active') || 'Active'}
                <div className="text-xs text-gray-600 mt-1">
                  Your ad is now live and visible to users
                </div>
              </div>
            )}
          </div>

          {/* Countries */}
          {((ad.countries && ad.countries.length > 0) ||
            (ad.targetLocations && ad.targetLocations.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(ad.countries || ad.targetLocations || [])
                .slice(0, 3)
                .map((code, index) => {
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

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {isExpired ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleRelist}
                isLoading={isRelisting}
                className="flex-1"
              >
                {t('ad.relist') || 'Relist ($1.00)'}
              </Button>
            ) : null}

            <Link href={`/ads/${ad._id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                {t('ad.view') || 'View'}
              </Button>
            </Link>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAnalytics(true)}
              className="flex-1"
            >
              {t('ad.analytics') || 'Analytics'}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={t('ad.payment') || 'Payment'}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t('ad.paymentDescription') ||
              'Pay $1.00 to activate your ad for 30 days'}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>{t('ad.listingFee') || 'Listing Fee'}:</span>
              <span className="font-semibold">$1.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t('ad.duration') || 'Duration'}:</span>
              <span className="font-semibold">30 {t('ad.days') || 'days'}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">
                  {t('ad.total') || 'Total'}:
                </span>
                <span className="font-bold text-lg">$1.00</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              isLoading={isPaying}
              className="flex-1"
            >
              {t('ad.confirmPayment') || 'Confirm Payment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title={`${t('ad.analytics') || 'Analytics'} - ${ad.title}`}
        size="xl"
      >
        <AdAnalytics ad={ad} />
      </Modal>
    </>
  );
};

export default DashboardAdCard;

