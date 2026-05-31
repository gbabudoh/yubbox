'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenLine, Globe, BarChart3, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: PenLine,
    title: 'Create Your Listing',
    description:
      'Fill in your product or service details, upload images, set your price, and describe what makes your offer unique. Your Yubbox is ready in minutes.',
    accent: '#790e61',
  },
  {
    icon: Globe,
    title: 'Choose Your Reach',
    description:
      'Select target countries, pick your category, and optionally boost with Top Lens or Stories for premium above-the-feed placement.',
    accent: '#a0186c',
  },
  {
    icon: BarChart3,
    title: 'Track & Grow',
    description:
      'Your Yubbox goes live globally in seconds. Monitor real-time views, clicks, and yubbox counts from your dashboard — then scale what works.',
    accent: '#c41e8a',
  },
];

export default function HowItWorks() {
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
          How It Works
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-3xl md:text-4xl font-black text-neutral-900 mb-3"
        >
          Yubbox in 3 Simple Steps
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-neutral-500 max-w-xl mx-auto text-base leading-relaxed"
        >
          From idea to worldwide Yubbox in minutes. No technical knowledge required.
        </motion.p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Connector line visible on desktop */}
        <div
          className="hidden md:block absolute top-12 h-px pointer-events-none"
          style={{
            left: 'calc(16.67% + 2.5rem)',
            right: 'calc(16.67% + 2.5rem)',
            background: 'linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent)',
          }}
        />

        {STEPS.map(({ icon: Icon, title, description, accent }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.14 }}
            className="relative flex flex-col items-center text-center gap-5 p-6"
          >
            {/* Numbered icon badge */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${accent}10`,
                  border: `1.5px solid ${accent}25`,
                  boxShadow: `0 8px 24px ${accent}15`,
                }}
              >
                <Icon className="w-8 h-8" style={{ color: accent }} />
              </div>
              {/* Step number pill */}
              <div
                className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md"
                style={{ background: `linear-gradient(135deg, ${accent}, #c41e8a)` }}
              >
                {i + 1}
              </div>
            </div>

            <div>
              <h3 className="font-black text-neutral-900 text-lg mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link href="/ads/create">
          <button
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #790e61, #c41e8a)',
              boxShadow: '0 8px 24px rgba(121,14,97,0.35)',
            }}
          >
            Create Your First Yubbox
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
        <p className="text-xs text-neutral-400 font-medium">
          Free to browse · Yubbox your business from $1
        </p>
      </motion.div>
    </section>
  );
}
