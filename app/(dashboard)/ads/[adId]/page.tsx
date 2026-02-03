'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { IAd, IReview } from '@/types/models';
import { adService } from '@/services/adService';
import { MOCK_ADS } from '@/lib/mockData';
import { reviewService } from '@/services/reviewService';
import { analyticsService } from '@/services/analyticsService';
import Button from '@/components/ui/Button';
import CountdownTimer from '@/components/CountdownTimer';
import { useI18n } from '@/lib/i18n-context';
import { getCountryByCode } from '@/lib/countries';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();
  const adId = params.adId as string;

  const [ad, setAd] = useState<IAd | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    userName: '',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAdAndReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for mock ad first
      const mockAd = MOCK_ADS.find(a => String(a._id) === adId);
      
      if (mockAd) {
        setAd(mockAd as IAd);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      // If not mock, fetch from API
      const [adData, reviewsData] = await Promise.all([
        adService.getAdById(adId),
        reviewService.getReviewsByAdId(adId),
      ]);
      setAd(adData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Failed to fetch ad:', err);
      setError(
        err instanceof Error ? err.message : t('errors.failedToLoad')
      );
    } finally {
      setIsLoading(false);
    }
  }, [adId, t]);

  useEffect(() => {
    fetchAdAndReviews();
  }, [fetchAdAndReviews]);
  useEffect(() => {
    // Track view when ad is loaded
    if (ad && ad.isActive && ad.expiryDate && new Date(ad.expiryDate) >= new Date()) {
      analyticsService.trackEvent(String(ad._id), 'view', {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    }
  }, [ad]);

  const handleWebsiteClick = () => {
    if (ad) {
      analyticsService.trackEvent(String(ad._id), 'click', {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setError(null);

    try {
      await reviewService.createReview(
        adId,
        reviewForm.rating,
        reviewForm.comment,
        reviewForm.userName || undefined
      );
      setReviewForm({ rating: 5, comment: '', userName: '' });
      fetchAdAndReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit review'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !ad) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Get optimized image URL
  const imageUrl = ad.imageUrl 
    ? getImageUrlSync(ad.imageUrl, { width: 1280, height: 960, quality: 90, format: 'webp' })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← {t('common.back')}
        </Button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative w-full h-96 bg-gray-200">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
                <div className="absolute top-4 right-4">
                  <Image
                    src="/icon.png"
                    alt="Zupplet"
                    width={32}
                    height={32}
                    className="rounded-full shadow-lg border-2 border-white"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {t('ad.noImage') || 'No Image'}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {ad.title}
              </h1>
              {ad.isPaid && ad.isActive && ad.expiryDate && ad.paymentDate && new Date(ad.expiryDate) >= new Date() && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-3 rounded-lg border-2 border-blue-300 shadow-md">
                  <div className="text-xs text-gray-700 font-medium mb-1.5 text-center">
                    {t('ad.expiresIn') || 'Expires in'}
                  </div>
                  <CountdownTimer expiryDate={ad.expiryDate} />
                  {ad.paymentDate && (
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      Paid: {new Date(ad.paymentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              {ad.isPaid && ad.expiryDate && new Date(ad.expiryDate) < new Date() && (
                <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <div className="text-xs text-red-600 font-semibold">
                    {t('ad.expired') || 'Expired'}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{ad.description}</p>
            </div>

            {/* Product Owner Information */}
            {(ad.ownerName || ad.companyName || ad.location) && (
              <div className="mb-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Seller Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {ad.ownerName && (
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 block">Owner</span>
                        <span className="text-lg font-semibold text-gray-900">{ad.ownerName}</span>
                      </div>
                    </div>
                  )}
                  {ad.companyName && (
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2H4v8h12V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 block">Company</span>
                        <span className="text-lg font-semibold text-gray-900">{ad.companyName}</span>
                      </div>
                    </div>
                  )}
                  {ad.location && (
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 block">Location</span>
                        <span className="text-lg font-semibold text-gray-900">{ad.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {((ad.countries && ad.countries.length > 0) || (ad.targetLocations && ad.targetLocations.length > 0)) && (
              <div className="mb-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a1 1 0 001 1h4a1 1 0 001-1v-1a1.5 1.5 0 011.5-1.5c.526 0 .988.27 1.256.679A6.012 6.012 0 0118.668 8.027c-.083.124-.173.244-.27.36l-1.598 2.318a1 1 0 01-.832.445H8.332a1 1 0 01-.832-.445l-1.598-2.318a3.013 3.013 0 01-.27-.36z" clipRule="evenodd" />
                    </svg>
                    Target Countries
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {(ad.countries || ad.targetLocations || []).map((code, index) => {
                      const country = getCountryByCode(code);
                      return (
                        <div
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {country ? (
                            <>
                              <span className="text-lg">{country.flag}</span>
                              <span>{country.name}</span>
                            </>
                          ) : (
                            code
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <a
                href={ad.webLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWebsiteClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                Visit Website
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('ad.reviews')} ({reviews.length})
              </h2>

              {reviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {averageRating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {reviews.map((review) => (
                  <div
                    key={String(review._id)}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {review.userName || t('ad.anonymous') || 'Anonymous'}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('ad.writeReview')}
                </h3>
                {!session ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-2">
                      {t('ad.signInToReview')}
                    </p>
                    <Link href="/login">
                      <Button variant="primary">{t('nav.login')}</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('ad.rating')}
                      </label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            rating: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} {rating === 1 ? t('ad.star') || 'star' : t('ad.stars') || 'stars'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('ad.comment')}
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            comment: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        maxLength={500}
                        placeholder={t('ad.commentPlaceholder')}
                      />
                    </div>
                    <Button type="submit" isLoading={isSubmittingReview}>
                      {t('ad.submitReview')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

