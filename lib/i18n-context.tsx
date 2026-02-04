'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, getLocale } from './i18n';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = Record<string, TranslationValue>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Load locale from localStorage or use default
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      const validLocale = getLocale(savedLocale);
      setLocaleState(validLocale);
    }
  }, []);

  useEffect(() => {
    // Load translations for current locale
    const loadTranslations = async () => {
      try {
        let translations;
        switch (locale) {
          case 'es':
            translations = (await import('@/messages/es.json')).default;
            break;
          case 'fr':
            translations = (await import('@/messages/fr.json')).default;
            break;
          case 'de':
            translations = (await import('@/messages/de.json')).default;
            break;
          case 'zh':
            translations = (await import('@/messages/zh.json')).default;
            break;
          case 'ja':
            translations = (await import('@/messages/ja.json')).default;
            break;
          case 'ar':
            translations = (await import('@/messages/ar.json')).default;
            break;
          case 'pt':
            translations = (await import('@/messages/pt.json')).default;
            break;
          default:
            translations = (await import('@/messages/en.json')).default;
        }
        setTranslations(translations);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English if translation file doesn't exist
        const fallback = (await import('@/messages/en.json')).default;
        setTranslations(fallback);
      }
    };
    loadTranslations();
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: TranslationValue | undefined = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as { [key: string]: TranslationValue })[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in translation string
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

