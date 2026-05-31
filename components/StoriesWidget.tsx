'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { getImageUrlSync } from '@/lib/storage/clientImageUrl';
import { MOCK_ADS } from '@/lib/mockData';

interface StoryAd {
  id: string;
  title: string;
  companyName: string;
  ownerName: string;
  imageUrl: string;
  webLink: string;
  storiesExpiry: string;
}

const STORY_DURATION = 5000; // ms per story

// Derive mock stories from MOCK_ADS so their IDs resolve on the detail page
const MOCK_STORIES: StoryAd[] = MOCK_ADS.map((ad) => ({
  id: ad.id ?? '',
  title: ad.title ?? '',
  companyName: ad.companyName ?? '',
  ownerName: ad.ownerName ?? '',
  imageUrl: ad.imageUrl ?? '',
  webLink: ad.webLink ?? '#',
  storiesExpiry: new Date(Date.now() + 30 * 86400000).toISOString(),
}));

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getImageSrc(imageUrl: string) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }
  return getImageUrlSync(imageUrl, { width: 600, height: 800, quality: 85, format: 'webp' });
}

function getThumbSrc(imageUrl: string) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
    return imageUrl;
  }
  return getImageUrlSync(imageUrl, { width: 120, height: 120, quality: 75, format: 'webp' });
}

export default function StoriesWidget() {
  const [stories, setStories] = useState<StoryAd[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/ads/stories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          setStories(d.data);
        } else {
          setStories(MOCK_STORIES);
        }
      })
      .catch(() => { setStories(MOCK_STORIES); });
  }, []);

  const closeStory = useCallback(() => {
    setActiveIndex(null);
    setProgress(0);
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      if (prev >= stories.length - 1) { closeStory(); return null; }
      return prev + 1;
    });
    setProgress(0);
  }, [stories.length, closeStory]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null || prev === 0) return prev;
      return prev - 1;
    });
    setProgress(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (activeIndex === null) return;

    setProgress(0);
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    const tick = 50;
    const steps = STORY_DURATION / tick;
    let step = 0;

    progressRef.current = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) {
        if (progressRef.current) clearInterval(progressRef.current);
      }
    }, tick);

    intervalRef.current = setTimeout(() => {
      goNext();
    }, STORY_DURATION);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeIndex, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') closeStory();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex, closeStory, goNext, goPrev]);

  if (stories.length === 0) return null;

  const activeStory = activeIndex !== null ? stories[activeIndex] : null;

  return (
    <>
      {/* Stories Strip */}
      <div className="w-full py-4 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Label */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#790e61' }} />
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">Yubbox Stories</span>
          </div>

          {/* Scrollable strip */}
          <div
            ref={stripRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stories.map((story, i) => {
              const thumbSrc = getThumbSrc(story.imageUrl);
              const isViewed = activeIndex !== null && i < activeIndex;
              return (
                <button
                  key={story.id}
                  onClick={() => { setActiveIndex(i); setProgress(0); }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  {/* Ring + avatar */}
                  <div
                    className="p-[2px] rounded-full transition-transform group-hover:scale-105"
                    style={{
                      background: isViewed
                        ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                        : 'linear-gradient(135deg, #790e61, #c41e8a)',
                    }}
                  >
                    <div className="w-14 h-14 rounded-full bg-white p-[2px]">
                      {thumbSrc ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={thumbSrc}
                            alt={story.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized={thumbSrc.startsWith('/api/')}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-black"
                          style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}
                        >
                          {getInitials(story.companyName || story.ownerName)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] font-semibold text-neutral-500 max-w-[64px] truncate text-center leading-tight">
                    {story.companyName || story.ownerName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-screen Story Viewer */}
      <AnimatePresence>
        {activeStory && activeIndex !== null && (
          <motion.div
            key="story-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={closeStory}
          >
            {/* Story card */}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
              style={{ aspectRatio: '9/16', maxHeight: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background image */}
              {getImageSrc(activeStory.imageUrl) ? (
                <Image
                  src={getImageSrc(activeStory.imageUrl)}
                  alt={activeStory.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                  unoptimized={getImageSrc(activeStory.imageUrl).startsWith('/api/')}
                  priority
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-4xl font-black"
                  style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}
                >
                  {getInitials(activeStory.companyName || activeStory.ownerName)}
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%)' }} />

              {/* Progress bars */}
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-none"
                      style={{
                        width:
                          i < activeIndex
                            ? '100%'
                            : i === activeIndex
                            ? `${progress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header: brand + close */}
              <div className="absolute top-7 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)' }}
                  >
                    {getInitials(activeStory.companyName || activeStory.ownerName)}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">
                      {activeStory.companyName || activeStory.ownerName}
                    </p>
                    <p className="text-white/60 text-[10px]">Sponsored</p>
                  </div>
                </div>
                <button
                  onClick={closeStory}
                  className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">{activeStory.title}</h3>
                </div>
                <a
                  href={`/ads/${activeStory.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #790e61, #c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.4)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Ad
                </a>
              </div>

              {/* Tap zones for navigation */}
              <button
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous story"
              />
              <button
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next story"
              />
            </motion.div>

            {/* Desktop arrow controls */}
            {activeIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeIndex < stories.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
