'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdCard from '@/components/AdCard';
import Button from '@/components/ui/Button';
import CountryFilter from '@/components/CountryFilter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import BannerAdDisplay from '@/components/BannerAdDisplay';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';

interface FilterOption {
  _id: string;
  name: string;
  slug: string;
}

export default function Home() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [ads, setAds] = useState<IAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter options
  const [productCategories, setProductCategories] = useState<FilterOption[]>([]);
  const [serviceCategories, setServiceCategories] = useState<FilterOption[]>([]);
  const [industries, setIndustries] = useState<FilterOption[]>([]);
  
  // Category lookup map
  const [categoryMap, setCategoryMap] = useState<Map<string, any>>(new Map());
  
  // Selected filters
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [catRes, indRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/industries'),
        ]);
        
        const [catData, indData] = await Promise.all([
          catRes.json(),
          indRes.json(),
        ]);
        
        if (catData.success) {
          const allCategories = catData.data;
          setProductCategories(allCategories.filter((cat: any) => cat.type === 'product'));
          setServiceCategories(allCategories.filter((cat: any) => cat.type === 'service'));
          
          // Create category lookup map
          const map = new Map<string, any>();
          allCategories.forEach((cat: any) => {
            map.set(cat._id, cat);
          });
          setCategoryMap(map);
        }
        if (indData.success) setIndustries(indData.data);
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const allAds = await adService.getAllAds(selectedCountry || undefined);
      // Filter only active and non-expired ads for public feed
      // TODO: Re-enable isPaid filter after testing
      const now = new Date();
      let activeAds = allAds.filter(
        (ad) =>
          ad.isActive &&
          // ad.isPaid && // TEMPORARILY BYPASSED FOR TESTING
          ad.expiryDate &&
          new Date(ad.expiryDate) >= now
      );
      setAds(activeAds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load ads'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3">
            {/* Top row - Logo and Auth buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Logo height={80} width={80} />
                <p className="text-xs text-gray-600 font-medium hidden md:block">
                  Yubbox your product to gain global reach and exposure
                </p>
              </div>
              <nav className="flex items-center gap-3">
                <LanguageSwitcher />
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" className="text-sm px-3 py-1.5">{t('nav.dashboard')}</Button>
                    </Link>
                    <Link href="/ads/create">
                      <Button variant="logo" className="text-sm px-3 py-1.5">{t('nav.createAd')}</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="text-sm px-3 py-1.5">{t('nav.login')}</Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="logo" className="text-sm px-3 py-1.5">{t('nav.register')}</Button>
                    </Link>
                  </>
                )}
              </nav>
            </div>
            
            {/* Bottom row - Search and Country filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <input
                  type="text"
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <CountryFilter
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
            </div>
            
            {/* Filter row - Type, Product Categories, Service Categories, Industry */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  // Clear category selections when type changes
                  setSelectedProductCategory('');
                  setSelectedServiceCategory('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px]"
              >
                <option value="">Type</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
              
              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px]"
                disabled={selectedType === 'service'}
              >
                <option value="">Product Categories</option>
                {productCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              
              <select
                value={selectedServiceCategory}
                onChange={(e) => setSelectedServiceCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px]"
                disabled={selectedType === 'product'}
              >
                <option value="">Service Categories</option>
                {serviceCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px]"
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind._id} value={ind._id}>{ind.name}</option>
                ))}
              </select>
              
              {(selectedProductCategory || selectedServiceCategory || selectedIndustry) && (
                <button
                  onClick={() => {
                    setSelectedProductCategory('');
                    setSelectedServiceCategory('');
                    setSelectedIndustry('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner Ad Display */}
      <BannerAdDisplay />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('home.title')}
          </h2>
          <p className="text-gray-600">
            {t('home.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('home.loadingAds')}</p>
            </div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">{t('home.noAds')}</p>
            {session && (
              <Link href="/ads/create">
                <Button>{t('home.createFirstAd')}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads
              .filter((ad) => {
                // Search filter
                if (searchQuery) {
                  const matchesSearch = 
                    ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ad.description?.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchesSearch) return false;
                }
                // Type filter
                if (selectedType) {
                  const categoryId = String(ad.categoryId?._id || ad.categoryId);
                  const category = categoryMap.get(categoryId);
                  if (!category || category.type !== selectedType) {
                    return false;
                  }
                }
                // Product Category filter
                if (selectedProductCategory && String(ad.categoryId?._id || ad.categoryId) !== selectedProductCategory) {
                  return false;
                }
                // Service Category filter
                if (selectedServiceCategory && String(ad.categoryId?._id || ad.categoryId) !== selectedServiceCategory) {
                  return false;
                }
                // Industry filter
                if (selectedIndustry && String(ad.industryId?._id || ad.industryId) !== selectedIndustry) {
                  return false;
                }
                return true;
              })
              .map((ad) => (
                <AdCard key={String(ad._id)} ad={ad} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
