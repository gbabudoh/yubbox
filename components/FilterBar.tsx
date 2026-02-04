'use client';

import React from 'react';
import { Filter, ShoppingBag, Wrench, ChevronDown, Check, ArrowRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountryFilter from './CountryFilter';
import { useI18n } from '@/lib/i18n-context';

// Define the Category interface based on usage
interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'product' | 'service';
}

interface FilterBarProps {
  selectedType: 'product' | 'service' | 'trending' | null;
  selectedCategory: string | null;
  selectedCountry: string | null;
  categories: Category[];
  onTypeChange: (type: 'product' | 'service' | 'trending' | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onCountryChange: (countryCode: string | null) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedType,
  selectedCategory,
  selectedCountry,
  categories,
  onTypeChange,
  onCategoryChange,
  onCountryChange,
  className,
}) => {
  const { t } = useI18n();
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [tempType, setTempType] = React.useState(selectedType);
  const [tempCategory, setTempCategory] = React.useState(selectedCategory);
  const [tempCountry, setTempCountry] = React.useState(selectedCountry);

  // Sync props to state if they change externally (optional, but good for reset)
  React.useEffect(() => {
    setTempType(selectedType);
    setTempCategory(selectedCategory);
    setTempCountry(selectedCountry);
  }, [selectedType, selectedCategory, selectedCountry]);

  // Filter categories based on selected type
  const filteredCategories = React.useMemo(() => {
    if (!tempType || tempType === 'trending') return categories;
    return categories.filter((cat) => cat.type === tempType);
  }, [categories, tempType]);

  const handleGoClick = () => {
    onTypeChange(tempType);
    onCategoryChange(tempCategory);
    onCountryChange(tempCountry);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCategory = categories.find((c) => c._id === tempCategory);

  return (
    <div className={cn("glass-morphism rounded-2xl p-2 sticky top-24 z-30 shadow-lg", className)}>
      <div className="flex flex-col md:flex-row items-center gap-2">
        
        {/* Type Toggles */}
        <div className="flex items-center bg-white/50 rounded-xl p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setTempType(null);
              onTypeChange(null);
              // Also reset category when switching to 'All'
              setTempCategory(null);
              onCategoryChange(null);
            }}
            className={cn(
              "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              !tempType 
                ? "bg-[#790e61] shadow-md text-white" 
                : "text-gray-500 hover:bg-white/30"
            )}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => {
              setTempType('trending');
              onTypeChange('trending');
              // Clear category if switching type
              if (tempType !== 'trending') {
                setTempCategory(null);
                onCategoryChange(null);
              }
            }}
            className={cn(
              "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              tempType === 'trending'
                ? "bg-[#790e61] shadow-md text-white" 
                : "text-gray-500 hover:bg-white/30"
            )}
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">{t('home.trending')}</span>
          </button>
          <button
            onClick={() => {
              setTempType('product');
              onTypeChange('product');
              // Clear category if switching type
              if (tempType !== 'product') {
                setTempCategory(null);
                onCategoryChange(null);
              }
            }}
            className={cn(
              "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              tempType === 'product'
                ? "bg-[#790e61] shadow-md text-white" 
                : "text-gray-500 hover:bg-white/30"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.products')}</span>
          </button>
          <button
            onClick={() => {
              setTempType('service');
              onTypeChange('service');
              // Clear category if switching type
              if (tempType !== 'service') {
                setTempCategory(null);
                onCategoryChange(null);
              }
            }}
            className={cn(
              "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
              tempType === 'service'
                ? "bg-[#790e61] shadow-md text-white" 
                : "text-gray-500 hover:bg-white/30"
            )}
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.services')}</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-gray-300 hidden md:block mx-1" />

        {/* Categories Dropdown */}
        <div className="relative category-dropdown w-full md:w-64">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full flex items-center justify-between bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 transition-all text-sm font-medium"
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {currentCategory 
                  ? currentCategory.name 
                  : tempType === 'product' 
                    ? t('home.productOptionSelector')
                    : tempType === 'service' 
                      ? t('home.serviceOptionSelector')
                      : tempType === 'trending'
                        ? t('home.trendingCategories')
                        : t('ad.selectCategory')}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", isCategoryOpen && "rotate-180")} />
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto p-1 z-50">
              <button
                onClick={() => {
                  setTempCategory(null);
                  setIsCategoryOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                  !tempCategory ? "bg-[#790e61]/5 text-[#790e61] font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span>{t('home.allCategories')}</span>
                {!tempCategory && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredCategories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setTempCategory(cat._id);
                    setIsCategoryOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                    tempCategory === cat._id ? "bg-[#790e61]/5 text-[#790e61] font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {cat.type === 'product' ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                    <span>{cat.name}</span>
                  </div>
                  {tempCategory === cat._id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              {filteredCategories.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">
                  {t('home.noCategoriesFound')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Country Filter */}
        <div className="w-full md:w-auto md:min-w-[200px]">
           <CountryFilter 
             selectedCountry={tempCountry}
             onCountryChange={setTempCountry}
             className="w-full"
           />
        </div>

        {/* GO Button */}
        <button
          onClick={handleGoClick}
          className="bg-[#790e61] hover:bg-[#9d1b7f] text-white px-4 py-1.5 rounded-full transition-all shadow-md hover:shadow-[#790e61]/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 group"
          title="Apply Filters"
        >
          <span className="font-bold text-[10px] tracking-wider">{t('common.go')}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
