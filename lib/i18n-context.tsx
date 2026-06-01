'use client';

import React, {
  createContext, useContext, useState, useCallback, ReactNode,
} from 'react';
import { useMessages, useLocale } from 'next-intl';
import { setLocaleCookie } from '@/app/actions';
import { Locale } from './i18n';

// ── Static imports so webpack bundles all translations upfront ────────────────
// This makes language switching truly synchronous — no async, no delay.
import enMsg from '../messages/en.json';
import esMsg from '../messages/es.json';
import frMsg from '../messages/fr.json';
import deMsg from '../messages/de.json';
import arMsg from '../messages/ar.json';
import jaMsg from '../messages/ja.json';
import zhMsg from '../messages/zh.json';
import ptMsg from '../messages/pt.json';

type MsgValue = string | Record<string, unknown>;

const ALL_MESSAGES: Record<Locale, Record<string, MsgValue>> = {
  en: enMsg as Record<string, MsgValue>,
  es: esMsg as Record<string, MsgValue>,
  fr: frMsg as Record<string, MsgValue>,
  de: deMsg as Record<string, MsgValue>,
  ar: arMsg as Record<string, MsgValue>,
  ja: jaMsg as Record<string, MsgValue>,
  zh: zhMsg as Record<string, MsgValue>,
  pt: ptMsg as Record<string, MsgValue>,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function I18nProviderInner({ children }: { children: ReactNode }) {
  const serverMessages = useMessages() as Record<string, MsgValue>;
  const serverLocale   = useLocale() as Locale;

  const [clientMessages, setClientMessages] = useState<Record<string, MsgValue> | null>(null);
  const [clientLocale,   setClientLocale]   = useState<Locale | null>(null);

  const messages = clientMessages ?? serverMessages;
  const locale   = clientLocale   ?? serverLocale;

  const setLocale = useCallback((newLocale: Locale) => {
    if (newLocale === (clientLocale ?? serverLocale)) return;

    // Synchronous state update — all useI18n() consumers re-render immediately
    setClientMessages(ALL_MESSAGES[newLocale]);
    setClientLocale(newLocale);

    // Update <html> attributes immediately
    document.documentElement.lang = newLocale;
    document.documentElement.dir  = newLocale === 'ar' ? 'rtl' : 'ltr';

    // Persist for SSR (fire-and-forget)
    setLocaleCookie(newLocale).catch(() => null);
  }, [clientLocale, serverLocale]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: MsgValue | undefined = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, MsgValue>)[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') return key;

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, p) => params[p]?.toString() ?? `{{${p}}}`);
    }

    return value;
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nProviderInner>{children}</I18nProviderInner>;
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
