'use client';

import React, { useState, useEffect } from 'react';
import { COUNTRIES, Country } from '@/lib/countries';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';

interface CountryFilterProps {
  selectedCountry: string | null;
  onCountryChange: (countryCode: string | null) => void;
  className?: string;
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountry,
  onCountryChange,
  className,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountryObj = selectedCountry
    ? COUNTRIES.find((c) => c.code === selectedCountry)
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-filter-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative country-filter-dropdown', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedCountryObj ? (
          <>
            <span className="text-lg">{selectedCountryObj.flag}</span>
            <span className="font-medium">{selectedCountryObj.name}</span>
          </>
        ) : (
          <>
            <span className="text-lg">🌍</span>
            <span className="font-medium">{t('country.allCountries')}</span>
          </>
        )}
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder={t('country.searchCountries')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-80">
            <button
              type="button"
              onClick={() => {
                onCountryChange(null);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2',
                !selectedCountry && 'bg-blue-50'
              )}
            >
              <span className="text-lg">🌍</span>
              <span>{t('country.allCountries')}</span>
            </button>
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onCountryChange(country.code);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2',
                  selectedCountry === country.code && 'bg-blue-50'
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryFilter;

