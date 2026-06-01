'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Globe, MapPin, Building2, User, Clock, Heart,
  ExternalLink, Star, Send, ChevronRight, Copy, Check,
} from 'lucide-react';
import { IAd, IReview } from '@/types/models';
import { adService } from '@/services/adService';
import { MOCK_ADS } from '@/lib/mockData';
import { reviewService } from '@/services/reviewService';
import { analyticsService } from '@/services/analyticsService';
import CountdownTimer from '@/components/CountdownTimer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n-context';
import { getCountryByCode } from '@/lib/countries';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import { adService as adSvc } from '@/services/adService';

// ─── Share Buttons ───────────────────────────────────────────────────────────
function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} — ${url}`);
  const enc  = encodeURIComponent(url);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 w-full mb-1">Share</span>

      {/* WhatsApp */}
      <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#25D366' }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.546 4.07 1.503 5.778L.057 23.428l5.793-1.518A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.951 0-3.776-.525-5.344-1.441l-.383-.228-3.44.902.917-3.35-.25-.398A9.934 9.934 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        WhatsApp
      </a>

      {/* Telegram */}
      <a href={`https://t.me/share/url?url=${enc}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#2AABEE' }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg>
        Telegram
      </a>

      {/* Facebook */}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#1877F2' }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </a>

      {/* LinkedIn */}
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#0A66C2' }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>

      {/* Copy link */}
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all">
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}

// ─── Star picker ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star className="w-7 h-7 transition-colors"
            fill={(hovered || value) >= star ? '#f59e0b' : 'none'}
            stroke={(hovered || value) >= star ? '#f59e0b' : '#d1d5db'} />
        </button>
      ))}
    </div>
  );
}

function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-${size} h-${size}`}
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );
}

// ─── Main client component ───────────────────────────────────────────────────
export default function AdDetailClient({ adId }: { adId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();

  const [ad, setAd] = useState<IAd | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [yc, setYc] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', userName: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchAdAndReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const mockAd = MOCK_ADS.find((a) => a.id === adId);
      if (mockAd) {
        setAd(mockAd as IAd);
        setYc(mockAd.yubboxCount || 0);
        setReviews([]);
        setIsLoading(false);
        return;
      }
      const [adData, reviewsData] = await Promise.all([
        adService.getAdById(adId),
        reviewService.getReviewsByAdId(adId),
      ]);
      setAd(adData);
      setYc(adData.yubboxCount || 0);
      setReviews(reviewsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [adId, t]);

  useEffect(() => { fetchAdAndReviews(); }, [fetchAdAndReviews]);

  useEffect(() => {
    if (ad?.isActive && ad.expiryDate && new Date(ad.expiryDate) >= new Date()) {
      analyticsService.trackEvent(ad.id, 'view', {
        userAgent: navigator.userAgent,
        referrer:  document.referrer,
      });
    }
  }, [ad]);

  const handleWebsiteClick = () => {
    if (ad) analyticsService.trackEvent(ad.id, 'click', { userAgent: navigator.userAgent, referrer: document.referrer });
  };

  const handleVote = async () => {
    if (isVoting || !ad) return;
    const isMock = MOCK_ADS.some((m) => m.id === ad.id);
    if (isMock) { setYc((p) => p + 1); return; }
    try {
      setIsVoting(true);
      const newCount = await adSvc.voteAd(ad.id);
      setYc(newCount);
    } catch { /* silent */ } finally { setIsVoting(false); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setError(null);
    try {
      await reviewService.createReview(adId, reviewForm.rating, reviewForm.comment, reviewForm.userName || undefined);
      setReviewForm({ rating: 5, comment: '', userName: '' });
      fetchAdAndReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#790e61]/20 border-t-[#790e61] animate-spin mx-auto" />
            <p className="mt-4 text-sm text-neutral-500">{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !ad) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="glass-morphism rounded-3xl p-12">
            <p className="text-red-500 font-medium mb-6">{error}</p>
            <button onClick={() => router.back()} className="px-6 py-2.5 rounded-full border border-neutral-200 text-sm font-semibold hover:bg-neutral-50 transition-colors">
              {t('common.back')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ad) return null;

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const isExpired = ad.expiryDate && new Date(ad.expiryDate) < new Date();
  const isLive    = ad.isPaid && ad.isActive && ad.expiryDate && !isExpired;

  const imageUrl = ad.imageUrl
    ? getImageUrlSync(ad.imageUrl, { width: 1280, height: 960, quality: 90, format: 'webp' })
    : null;

  const countries  = ad.countries || [];
  const pageUrl    = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/ads/${adId}`;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
            <Link href="/" className="hover:text-[#790e61] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-700 font-medium line-clamp-1">{ad.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            {/* LEFT — Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col gap-4">
              <div className="relative w-full aspect-4/3 rounded-4xl overflow-hidden glass-card">
                {imageUrl ? (
                  <Image src={imageUrl} alt={ad.title} fill className="object-cover" unoptimized priority />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-300 gap-3">
                    <Globe className="w-16 h-16 opacity-30" />
                    <span className="text-sm">{t('ad.noImage')}</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <button onClick={handleVote} className={`yc-badge ${isVoting ? 'opacity-70' : ''}`}>
                    <Heart className="w-3.5 h-3.5" fill="currentColor" />
                    <span>{yc} <span className="opacity-70 font-normal">yc</span></span>
                  </button>
                </div>
                <div className="absolute top-4 right-4">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                    </span>
                  ) : isExpired ? (
                    <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">Expired</span>
                  ) : null}
                </div>
              </div>

              {countries.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">{t('ad.targetCountriesLabel')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {countries.map((code) => {
                      const country = getCountryByCode(code);
                      return (
                        <div key={code} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#790e61]/8 border border-[#790e61]/15 text-sm font-medium text-neutral-700">
                          <span className="text-base">{country?.flag || '🏳️'}</span>
                          <span>{country?.name || code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div className="glass-card rounded-2xl p-5">
                <ShareButtons url={pageUrl} title={ad.title} />
              </div>
            </motion.div>

            {/* RIGHT — Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight mb-3">{ad.title}</h1>
                {isLive && ad.expiryDate && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
                    style={{ background: 'rgba(121,14,97,0.06)', borderColor: 'rgba(121,14,97,0.2)', color: '#790e61' }}>
                    <Clock className="w-4 h-4" />
                    <CountdownTimer expiryDate={ad.expiryDate} />
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-3">
                  <Stars rating={averageRating} />
                  <span className="text-sm font-semibold text-neutral-700">{averageRating.toFixed(1)}</span>
                  <span className="text-sm text-neutral-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}

              <div className="glass-card rounded-2xl p-5">
                <p className="text-neutral-600 leading-relaxed text-base">{ad.description}</p>
              </div>

              {(ad.ownerName || ad.companyName || ad.location) && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}>
                    <User className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-bold text-white">{t('ad.ownerInformation')}</h3>
                  </div>
                  <div className="p-4 space-y-1">
                    {ad.ownerName && (
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#790e61]/5 transition-colors">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(121,14,97,0.1)' }}>
                          <User className="w-4 h-4" style={{ color: '#790e61' }} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{t('ad.ownerNameLabel')}</p>
                          <p className="text-sm font-semibold text-neutral-800">{ad.ownerName}</p>
                        </div>
                      </div>
                    )}
                    {ad.companyName && (
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#790e61]/5 transition-colors">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(121,14,97,0.1)' }}>
                          <Building2 className="w-4 h-4" style={{ color: '#790e61' }} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{t('ad.companyNameLabel')}</p>
                          <p className="text-sm font-semibold text-neutral-800">{ad.companyName}</p>
                        </div>
                      </div>
                    )}
                    {ad.location && (
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#790e61]/5 transition-colors">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(121,14,97,0.1)' }}>
                          <MapPin className="w-4 h-4" style={{ color: '#790e61' }} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{t('ad.locationLabel')}</p>
                          <p className="text-sm font-semibold text-neutral-800">{ad.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ad.webLink && (
                <a href={ad.webLink} target="_blank" rel="noopener noreferrer" onClick={handleWebsiteClick}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)', boxShadow: '0 8px 24px rgba(121,14,97,0.35)' }}>
                  <Globe className="w-5 h-5" />
                  {t('ad.visitWebsite')}
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
              )}

              <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors self-start">
                <ArrowLeft className="w-4 h-4" /> Back to listings
              </button>
            </motion.div>
          </div>

          {/* Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-black text-neutral-800 mb-5">
                {t('ad.reviews')}
                {reviews.length > 0 && <span className="ml-2 text-sm font-semibold text-neutral-400">({reviews.length})</span>}
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}>
                            {(review.userName || 'A')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-neutral-800">{review.userName || t('ad.anonymous')}</span>
                        </div>
                        <span className="text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Stars rating={review.rating} size={4} />
                      {review.comment && <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{review.comment}</p>}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-10 text-center text-neutral-400">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No reviews yet. Be the first!</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-neutral-800 mb-5">{t('ad.writeReview')}</h2>
              {!session ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <User className="w-10 h-10 mx-auto mb-3 opacity-20 text-neutral-400" />
                  <p className="text-sm text-neutral-500 mb-5">{t('ad.signInToReview')}</p>
                  <Link href="/login">
                    <button className="px-6 py-2.5 rounded-full text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}>
                      {t('nav.login')}
                    </button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="glass-card rounded-2xl p-6 space-y-5">
                  {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">{t('ad.rating')}</label>
                    <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">{t('ad.yourName')}</label>
                    <input type="text" value={reviewForm.userName} onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                      placeholder="Optional" className="w-full px-4 py-2.5 bg-white/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-[#790e61]/40 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">{t('ad.comment')}</label>
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-[#790e61]/40 transition-colors resize-none"
                      rows={4} maxLength={500} placeholder={t('ad.commentPlaceholder')} />
                  </div>
                  <button type="submit" disabled={isSubmittingReview}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}>
                    {isSubmittingReview
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />}
                    {t('ad.submitReview')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
