'use client';

import React, { useState, useEffect } from 'react';
import { COUNTRIES, Country } from '@/lib/countries';
import { cn } from '@/lib/utils';

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
  maxSelections?: number;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountries,
  onChange,
  maxSelections,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onChange(selectedCountries.filter((code) => code !== countryCode));
    } else {
      if (maxSelections && selectedCountries.length >= maxSelections) {
        return;
      }
      onChange([...selectedCountries, countryCode]);
    }
  };

  const removeCountry = (countryCode: string) => {
    onChange(selectedCountries.filter((code) => code !== countryCode));
  };

  const selectedCountryObjects = selectedCountries
    .map((code) => COUNTRIES.find((c) => c.code === code))
    .filter((c): c is Country => c !== undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-selector-dropdown')) {
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
    <div className={cn('relative country-selector-dropdown', className)}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Target Countries
      </label>

      {/* Selected Countries Display */}
      {selectedCountryObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCountryObjects.map((country) => (
            <span
              key={country.code}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <button
                type="button"
                onClick={() => removeCountry(country.code)}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = selectedCountries.includes(country.code);
                const isDisabled = Boolean(
                  maxSelections &&
                  !isSelected &&
                  selectedCountries.length >= maxSelections
                );

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.code)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2',
                      isSelected && 'bg-blue-50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {maxSelections && (
        <p className="mt-1 text-xs text-gray-500">
          {selectedCountries.length} / {maxSelections} countries selected
        </p>
      )}
    </div>
  );
};

export default CountrySelector;

