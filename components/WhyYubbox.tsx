'use client';

import { motion } from 'framer-motion';
import { Globe, BarChart3, DollarSign, Zap, Target, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: 'Global Distribution',
    description:
      'Your Yubbox reaches potential customers across 150+ countries simultaneously — no geographic limits, no extra cost.',
    color: '#0ea5e9',
    bg: 'rgba(14, 165, 233, 0.08)',
    border: 'rgba(14, 165, 233, 0.15)',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track views, clicks, engagement, and reach with live dashboards. Know exactly how every ad performs, in real time.',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: DollarSign,
    title: 'Starting from $1',
    description:
      'The most affordable per-reach pricing on the market. Go global without breaking the bank — no hidden fees.',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.20)',
  },
  {
    icon: Zap,
    title: 'Instant Publishing',
    description:
      'Create your listing and go live globally in under 5 minutes. No complex setup, no waiting, no technical skills needed.',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.15)',
  },
  {
    icon: Target,
    title: 'Smart Targeting',
    description:
      'Filter audiences by country, product type, or service category to put your ad in front of exactly the right people.',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.15)',
  },
  {
    icon: Star,
    title: 'Premium Placements',
    description:
      'Boost your Yubbox with Top Lens and Stories — premium slots above the feed for maximum exposure and engagement.',
    color: '#790e61',
    bg: 'rgba(121, 14, 97, 0.08)',
    border: 'rgba(121, 14, 97, 0.15)',
  },
];

export default function WhyYubbox() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
      {/* Section header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(121, 14, 97, 0.08)', color: '#790e61' }}
        >
          Why Yubbox
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-3xl md:text-4xl font-black text-neutral-900 mb-3 leading-tight"
        >
          Why businesses
          <br className="hidden sm:block" />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg, #790e61, #c41e8a)' }}
          >
            {' '}choose Yubbox
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-neutral-500 max-w-xl mx-auto text-base leading-relaxed"
        >
          Purpose-built for businesses that want to Yubbox their products and services
          to the world — at a fraction of the cost of traditional platforms.
        </motion.p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, description, color, bg, border }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-4"
            style={{ borderColor: border }}
          >
            {/* Icon badge */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>

            <div>
              <h3 className="font-black text-neutral-900 mb-1.5 text-[15px]">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom proof row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
      >
        {[
          '🌍 150+ Countries Reached',
          '📊 Real-Time Yubbox Analytics',
          '💰 No Hidden Fees',
          '⚡ Yubbox Live in Minutes',
          '🔒 Secure Payments',
        ].map((item) => (
          <span key={item} className="text-sm font-medium text-neutral-400">
            {item}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
