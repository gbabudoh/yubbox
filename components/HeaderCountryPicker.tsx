'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';

const HeaderCountryPicker: React.FC<{ className?: string }> = ({ className }) => {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const currentCode = searchParams.get('country');
  const current     = COUNTRIES.find((c) => c.code === currentCode) ?? null;

  const [isOpen,   setIsOpen]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [pos,      setPos]      = useState({ top: 0, right: 0 });
  const [mounted,  setMounted]  = useState(false);
  const buttonRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const open = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setSearch('');
    setIsOpen(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.yb-country-dropdown, .yb-country-btn')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const select = (code: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (code) params.set('country', code);
    else params.delete('country');
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const dropdown = isOpen && mounted ? createPortal(
    <div
      className="yb-country-dropdown fixed z-[9999] w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="p-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 transition-all"
          autoFocus
        />
      </div>
      <div className="overflow-y-auto max-h-64 py-1">
        <button
          type="button"
          onClick={() => select(null)}
          className={cn(
            'w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors text-sm',
            !currentCode && 'bg-[#790e61]/5'
          )}
        >
          <span className="text-lg leading-none">🌍</span>
          <span className="flex-1 font-medium text-neutral-700">All Countries</span>
          {!currentCode && (
            <svg className="w-4 h-4 shrink-0" style={{ color: '#790e61' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        {filtered.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => select(c.code)}
            className={cn(
              'w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors text-sm',
              currentCode === c.code && 'bg-[#790e61]/5'
            )}
          >
            <span className="text-lg leading-none">{c.flag}</span>
            <span className="flex-1 font-medium text-neutral-700">{c.name}</span>
            {currentCode === c.code && (
              <svg className="w-4 h-4 shrink-0" style={{ color: '#790e61' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-3 text-xs text-neutral-400 text-center">No countries found</p>
        )}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : open()}
        className="yb-country-btn flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 focus:outline-none transition-colors"
        aria-label="Filter by country"
        aria-expanded={isOpen}
      >
        {current ? (
          <>
            <span className="text-lg leading-none">{current.flag}</span>
            <span className="text-sm font-medium hidden sm:inline text-neutral-700">{current.code}</span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium hidden sm:inline text-neutral-700">All</span>
          </>
        )}
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

export default HeaderCountryPicker;
