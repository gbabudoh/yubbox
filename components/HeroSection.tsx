'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { type Transition } from 'framer-motion';
import { Globe, Plus, BarChart3, TrendingUp, Eye, DollarSign, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface HeroSectionProps { totalAds: number }

function CountUp({ to, suffix = '', duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, to, duration]);
  return <span ref={ref}>{value}{suffix}</span>;
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' } as Transition,
});

export default function HeroSection({ totalAds }: HeroSectionProps) {
  const { t } = useI18n();

  const METRICS = [
    { icon: Globe,       to: 150, suffix: '+',  labelKey: 'hero.metricCountriesLabel', detailKey: 'hero.metricCountriesDetail', accent: '#0284c7', tint: '#f0f9ff' },
    { icon: Eye,         to: 50,  suffix: 'K+', labelKey: 'hero.metricViewsLabel',     detailKey: 'hero.metricViewsDetail',     accent: '#7c3aed', tint: '#faf5ff' },
    { icon: DollarSign,  staticVal: '$1',        labelKey: 'hero.metricPriceLabel',     detailKey: 'hero.metricPriceDetail',     accent: '#d97706', tint: '#fffbeb' },
    { icon: TrendingUp,  to: 15,  suffix: 'K+', labelKey: 'hero.metricYubboxesLabel',  detailKey: 'hero.metricYubboxesDetail',  accent: '#059669', tint: '#f0fdf4' },
  ] as const;

  const TRUST   = ['hero.trust1', 'hero.trust2', 'hero.trust3', 'hero.trust4'] as const;
  const STRIPS  = [
    { icon: Globe,      key: 'hero.strip1' },
    { icon: BarChart3,  key: 'hero.strip2' },
    { icon: TrendingUp, key: 'hero.strip3' },
  ] as const;

  return (
    <section className="max-w-[1400px] mx-auto px-6 sm:px-8 pt-6 pb-14 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-24 items-center">

        {/* ── Left: copy ── */}
        <div>
          <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-8">
            <span className="block w-6 h-0.5 rounded-full" style={{ background: '#790e61' }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              {t('hero.eyebrow')}
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="text-5xl md:text-6xl lg:text-[5.25rem] font-black tracking-tight leading-[1.03] text-neutral-900 mb-6">
            {t('hero.headline1')}
            <br />{t('hero.headline2')}
            <br /><span style={{ color: '#790e61' }}>{t('hero.headline3')}</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="text-neutral-500 text-[1.05rem] leading-relaxed mb-10 max-w-[480px]">
            {t('hero.body')}
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-wrap gap-3 mb-10">
            <Link href="/ads/create">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ background: '#790e61', boxShadow: '0 4px 18px rgba(121,14,97,0.28)' }}>
                <Plus className="w-4 h-4" />
                {t('hero.ctaCreate')}
              </button>
            </Link>
            <a href="#ad-feed">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all">
                {t('hero.ctaBrowse', { count: totalAds > 0 ? totalAds : 0 })}
                <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.28)} className="flex flex-wrap gap-5">
            {TRUST.map((key) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <span className="w-1 h-1 rounded-full bg-neutral-300 block" />
                {t(key)}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: metric grid ── */}
        <div className="grid grid-cols-2 gap-4">
          {METRICS.map(({ icon: Icon, labelKey, detailKey, accent, tint, ...rest }, i) => {
            const hasCount = 'to' in rest;
            return (
              <motion.div key={labelKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 + i * 0.09, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-2xl p-5 border border-neutral-100 bg-white flex flex-col gap-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tint }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <div className="text-[2.25rem] font-black leading-none mb-1.5 tabular-nums" style={{ color: accent }}>
                    {hasCount
                      ? <CountUp to={(rest as { to: number }).to} suffix={(rest as { suffix: string }).suffix} />
                      : (rest as { staticVal: string }).staticVal}
                  </div>
                  <div className="text-sm font-bold text-neutral-800 mb-0.5">{t(labelKey)}</div>
                  <div className="text-xs text-neutral-400 leading-snug">{t(detailKey)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-14 pt-8 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-8">
          {STRIPS.map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
              <Icon className="w-4 h-4 text-neutral-300" />
              {t(key)}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-300 font-medium tracking-widest uppercase">
          {t('hero.platformTagline')}
        </p>
      </motion.div>
    </section>
  );
}
