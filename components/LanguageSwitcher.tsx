'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/lib/i18n-context';
import { locales, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useI18n();
  const [isOpen,   setIsOpen]   = useState(false);
  const [pos,      setPos]      = useState({ top: 0, right: 0 });
  const [mounted,  setMounted]  = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  // Wait for client mount before using portals
  useEffect(() => { setMounted(true); }, []);

  const open = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top:   rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.yb-lang-dropdown, .yb-lang-btn')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on scroll / resize so position doesn't go stale
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll',  close, { passive: true });
    window.addEventListener('resize',  close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const dropdown = isOpen && mounted ? createPortal(
    <div
      className="yb-lang-dropdown fixed z-9999 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="overflow-y-auto max-h-72 py-1">
        {locales.map((loc) => (
          <button
            key={loc.code}
            type="button"
            onClick={() => { setLocale(loc.code as Locale); setIsOpen(false); }}
            className={cn(
              'w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors text-sm',
              locale === loc.code && 'bg-[#790e61]/5'
            )}
          >
            <span className="text-lg leading-none">{loc.flag}</span>
            <span className="flex-1 font-medium text-neutral-700">{loc.name}</span>
            {locale === loc.code && (
              <svg className="w-4 h-4 shrink-0" style={{ color: '#790e61' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className={cn('relative language-switcher', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : open()}
        className="yb-lang-btn flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 focus:outline-none transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-lg leading-none">{currentLocale.flag}</span>
        <span className="text-sm font-medium hidden sm:inline text-neutral-700">{currentLocale.name}</span>
        <svg
          className={cn('w-4 h-4 text-neutral-400 transition-transform', isOpen && 'rotate-180')}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdown}
    </div>
  );
};

export default LanguageSwitcher;
