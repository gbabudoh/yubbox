'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AdCard from '@/components/AdCard';
import AiSearchWidget from '@/components/AiSearchWidget';
import Header from '@/components/Header';
import BannerAdDisplay from '@/components/BannerAdDisplay';
import Footer from '@/components/Footer';
import FilterBar from '@/components/FilterBar';
import HeroSection from '@/components/HeroSection';
import WhyYubbox from '@/components/WhyYubbox';
import HowItWorks from '@/components/HowItWorks';
import StoriesWidget from '@/components/StoriesWidget';
import FeaturedSection from '@/components/FeaturedSection';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';
import { MOCK_ADS, MOCK_CATEGORIES } from '@/lib/mockData';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'service';
}

// interface FilterOption {
//   _id: string;
//   name: string;
//   slug: string;
// }

function HomeContent() {
  const { t } = useI18n();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [ads, setAds] = useState<IAd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'product' | 'service' | 'trending' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);

  // Sync type and country from URL params
  useEffect(() => {
    const typeParam    = searchParams.get('type');
    const countryParam = searchParams.get('country');
    if (typeParam === 'product' || typeParam === 'service' || typeParam === 'trending') {
      setSelectedType(typeParam as 'product' | 'service' | 'trending');
    } else {
      setSelectedType(null);
    }
    setSelectedCountry(countryParam);
  }, [searchParams]);

  const handleCountryChange = useCallback((code: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (code) params.set('country', code);
    else params.delete('country');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);
  
  // Fetch ads
  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const allAds = await adService.getAllAds(selectedCountry || undefined);
      const now = new Date();
      const activeAds = allAds.filter(
        (ad) =>
          ad.isActive &&
          ad.expiryDate &&
          new Date(ad.expiryDate) >= now
      );
      setAds([...activeAds, ...MOCK_ADS as IAd[]]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories([...data.data, ...MOCK_CATEGORIES as Category[]]);
        } else {
          setCategories(MOCK_CATEGORIES as Category[]);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  const filteredAds = ads
    .filter((ad) => {
      // AI filter — when AI returns results, show only those IDs
      if (aiFilteredIds !== null) return aiFilteredIds.includes(ad.id);

      // Search Query
      if (searchQuery) {
        const matchesSearch = 
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Type Filter (Product vs Service vs Trending)
      if (selectedType && selectedType !== 'trending') {
        const adCategory = categories.find(c => c.id === ad.categoryId);
        if (!adCategory || adCategory.type !== selectedType) return false;
      }

      // Category Filter
      if (selectedCategory) {
        if (ad.categoryId !== selectedCategory) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // If trending is selected, sort by yubboxCount descending
      if (selectedType === 'trending') {
        return (b.yubboxCount || 0) - (a.yubboxCount || 0);
      }
      // Top Lens ads float to the top
      const now = new Date();
      const aTopLens = a.topLensExpiry && new Date(a.topLensExpiry) >= now ? 1 : 0;
      const bTopLens = b.topLensExpiry && new Date(b.topLensExpiry) >= now ? 1 : 0;
      if (bTopLens !== aTopLens) return bTopLens - aTopLens;
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={() => {}} 
      />

      <main className="pt-32 pb-28 overflow-hidden min-h-screen bg-gray-50/50">

        {/* Hero — shown when no filters or search active */}
        {!searchQuery && !selectedType && !selectedCategory && !selectedCountry && (
          <>
            <HeroSection totalAds={ads.length} />
            <WhyYubbox />
          </>
        )}

        {/* Stories Widget */}
        <StoriesWidget />

        {/* Featured / Top Lens Section */}
        <FeaturedSection />

        {/* How It Works — shown only on unfiltered homepage */}
        {!searchQuery && !selectedType && !selectedCategory && !selectedCountry && (
          <HowItWorks />
        )}

        {/* Top: Images (Banner) */}
        <div className="w-full mb-8">
          <BannerAdDisplay />
        </div>

        {/* AI Search */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mb-4">
          <AiSearchWidget onResults={(ids) => { setAiFilteredIds(ids); }} />
        </div>

        {/* Filter Bar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mb-8">
           <FilterBar
             selectedType={selectedType}
             selectedCategory={selectedCategory}
             selectedCountry={selectedCountry}
             categories={categories}
             onTypeChange={setSelectedType}
             onCategoryChange={setSelectedCategory}
             onCountryChange={handleCountryChange}
           />
        </div>

        {/* Ad Feed Section */}
        <section id="ad-feed" className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-neutral-800">
                {selectedType === 'trending'
                  ? t('feed.trendingYubboxes')
                  : selectedType === 'product'
                  ? t('feed.productYubboxes')
                  : selectedType === 'service'
                  ? t('feed.serviceYubboxes')
                  : t('feed.allYubboxes')}
              </h2>
              {!isLoading && (
                <p className="text-sm text-neutral-400 mt-0.5">
                  {filteredAds.length === 1
                    ? t('feed.found1', { count: filteredAds.length })
                    : t('feed.found',  { count: filteredAds.length })}
                </p>
              )}
            </div>
            {searchQuery && (
              <div className="text-sm font-medium text-neutral-400">
                {t('feed.searchResults', { query: searchQuery })}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-12 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="aspect-4/5 rounded-4xl bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="py-32 text-center glass-morphism rounded-[3rem]">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-neutral-200" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Yubboxes Found</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                We couldn&apos;t find any Yubboxes matching your current search or filters.
              </p>
              <Link href="/ads/create">
                <button className="text-white px-6 py-3 rounded-full font-bold transition-all hover:opacity-90 flex items-center gap-2 mx-auto" style={{ backgroundColor: 'var(--primary-btn)' }}>
                  <Plus className="w-5 h-5" />
                  Create Your First Yubbox
                </button>
              </Link>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredAds.map((ad) => (
                  <motion.div
                    key={ad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <AdCard ad={ad} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>

      {/* Floating Post Ad CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/ads/create">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white px-5 py-3.5 rounded-full font-bold text-sm shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #790e61, #c41e8a)',
              boxShadow: '0 8px 24px rgba(121, 14, 97, 0.45)',
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('header.newYubbox')}</span>
          </motion.button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
