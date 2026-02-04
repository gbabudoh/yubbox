'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import AdCard from '@/components/AdCard';
import Header from '@/components/Header';
import BannerAdDisplay from '@/components/BannerAdDisplay';
import Footer from '@/components/Footer';
import FilterBar from '@/components/FilterBar';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';
import { MOCK_ADS, MOCK_CATEGORIES } from '@/lib/mockData';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'product' | 'service';
}

// interface FilterOption {
//   _id: string;
//   name: string;
//   slug: string;
// }

export default function Home() {
  // const { t } = useI18n();
  const [ads, setAds] = useState<IAd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'product' | 'service' | 'trending' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  
  // Set initial type from query params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'product' || typeParam === 'service' || typeParam === 'trending') {
      setSelectedType(typeParam as 'product' | 'service' | 'trending');
    }
  }, [searchParams]);
  
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
      // Search Query
      if (searchQuery) {
        const matchesSearch = 
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description?.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Type Filter (Product vs Service vs Trending)
      if (selectedType && selectedType !== 'trending') {
        const adCategory = categories.find(c => c._id === String(ad.categoryId._id || ad.categoryId));
        if (!adCategory || adCategory.type !== selectedType) return false;
      }

      // Category Filter
      if (selectedCategory) {
        const adCatId = String(ad.categoryId._id || ad.categoryId);
        if (adCatId !== selectedCategory) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // If trending is selected, sort by yubboxCount descending
      if (selectedType === 'trending') {
        return (b.yubboxCount || 0) - (a.yubboxCount || 0);
      }
      // Otherwise use default sorting (createdAt descending)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onSearch={() => {}} 
      />

      <main className="pt-32 pb-20 overflow-hidden min-h-screen bg-gray-50/50">
        
        {/* Top: Images (Banner) */}
        <div className="w-full mb-8">
          <BannerAdDisplay />
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
             onCountryChange={setSelectedCountry}
           />
        </div>

        {/* Ad Feed Section */}
        <section id="ad-feed" className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              {/* <h2 className="text-3xl md:text-4xl font-black mb-3">Featured Listings</h2> */}
            </div>
            {searchQuery && (
              <div className="text-sm font-medium text-neutral-400">
                Showing {filteredAds.length} results for &quot;{searchQuery}&quot;
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
                <div key={i} className="aspect-[4/5] rounded-[2rem] bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="py-32 text-center glass-morphism rounded-[3rem]">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-neutral-200" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Ads Found</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                We couldn&apos;t find any ads matching your current search or filters.
              </p>
              <Link href="/ads/create">
                <button className="text-white px-6 py-3 rounded-full font-bold transition-all hover:opacity-90 flex items-center gap-2 mx-auto" style={{ backgroundColor: 'var(--primary-btn)' }}>
                  <Plus className="w-5 h-5" />
                  Create First Ad
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
                    key={String(ad._id)}
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
      
      <Footer />
    </div>
  );
}
