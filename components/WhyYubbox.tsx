'use client';

import { motion } from 'framer-motion';
import { Globe, BarChart3, DollarSign, Zap, Target, Star } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function WhyYubbox() {
  const { t } = useI18n();

  const FEATURES = [
    { icon: Globe,     titleKey: 'why.f1Title', descKey: 'why.f1Desc', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',   border: 'rgba(14,165,233,0.15)' },
    { icon: BarChart3, titleKey: 'why.f2Title', descKey: 'why.f2Desc', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.15)' },
    { icon: DollarSign,titleKey: 'why.f3Title', descKey: 'why.f3Desc', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.20)' },
    { icon: Zap,       titleKey: 'why.f4Title', descKey: 'why.f4Desc', color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.15)' },
    { icon: Target,    titleKey: 'why.f5Title', descKey: 'why.f5Desc', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.15)' },
    { icon: Star,      titleKey: 'why.f6Title', descKey: 'why.f6Desc', color: '#790e61', bg: 'rgba(121,14,97,0.08)',    border: 'rgba(121,14,97,0.15)' },
  ] as const;

  const PROOF = ['why.proof1', 'why.proof2', 'why.proof3', 'why.proof4', 'why.proof5'] as const;

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
          {t('why.badge')}
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-3xl md:text-4xl font-black text-neutral-900 mb-3 leading-tight">
          {t('why.title1')}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg, #790e61, #c41e8a)' }}>
            {' '}{t('why.title2')}
          </span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-neutral-500 max-w-xl mx-auto text-base leading-relaxed">
          {t('why.subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, titleKey, descKey, color, bg, border }, i) => (
          <motion.div key={titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-4" style={{ borderColor: border }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 mb-1.5 text-[15px]">{t(titleKey)}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{t(descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {PROOF.map((key) => (
          <span key={key} className="text-sm font-medium text-neutral-400">{t(key)}</span>
        ))}
      </motion.div>
    </section>
  );
}
