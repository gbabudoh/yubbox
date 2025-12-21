'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { locales } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
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
    <div className={cn('relative language-switcher', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLocale.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentLocale.name}</span>
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
        <div className="absolute z-50 mt-2 right-0 w-56 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="overflow-y-auto max-h-96">
            {locales.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => {
                  setLocale(loc.code);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3',
                  locale === loc.code && 'bg-blue-50'
                )}
              >
                <span className="text-lg">{loc.flag}</span>
                <span className="flex-1">{loc.name}</span>
                {locale === loc.code && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

