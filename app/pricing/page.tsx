'use client';

import Link from 'next/link';
import { motion, type Transition } from 'framer-motion';
import {
  Check, Globe, BarChart3, Zap, Star, TrendingUp,
  Play, ArrowRight, Plus, DollarSign,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AD_PRICE, TOP_LENS_PRICE, STORIES_PRICE, AD_DURATION_DAYS } from '@/lib/stripe-shared';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' } as Transition,
});

const STEPS = [
  {
    n: '01',
    title: 'Create your Yubbox',
    desc:  'Add your product or service title, description, image, link, and target countries. Takes under 2 minutes.',
    icon:  Plus,
  },
  {
    n: '02',
    title: 'Pay once — go live',
    desc:  `Pay $${AD_PRICE.toFixed(2)} and your listing activates immediately, visible to users in every country you selected.`,
    icon:  DollarSign,
  },
  {
    n: '03',
    title: 'Reach & track',
    desc:  `Your Yubbox stays live for ${AD_DURATION_DAYS} days. Watch views, clicks, and engagement in real time via your dashboard.`,
    icon:  BarChart3,
  },
];

const FAQS = [
  {
    q: 'How long does my listing stay live?',
    a: `Every listing is active for ${AD_DURATION_DAYS} days from the moment payment clears. You can relist at any time for another $${AD_PRICE.toFixed(2)}.`,
  },
  {
    q: 'What countries can I target?',
    a: 'You can select any combination of 150+ countries when creating your Yubbox. There is no extra charge per country.',
  },
  {
    q: 'What is Top Lens?',
    a: `Top Lens pins your Yubbox to the very top of its category feed and in the Featured section for the full 14 days — maximum visibility for an extra $${TOP_LENS_PRICE.toFixed(2)}.`,
  },
  {
    q: 'What are Yubbox Stories?',
    a: `Stories places your product in the animated Stories widget on the homepage, putting it in front of every visitor. Add it for an extra $${STORIES_PRICE.toFixed(2)}.`,
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. You pay exactly what you see. No monthly subscriptions, no per-click charges, no country surcharges.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit/debit cards via Stripe. Payment is processed securely — Yubbox never stores your card details.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50/40">
      <Header />

      <main className="pt-36 pb-24">

        {/* ── Hero ── */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-20">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
            Simple, transparent pricing
          </motion.div>
          <motion.h1 {...fadeUp(0.06)} className="text-5xl md:text-6xl font-black text-neutral-900 leading-tight mb-5">
            One price.<br />
            <span style={{ color: '#790e61' }}>Global reach.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.12)} className="text-neutral-500 text-lg leading-relaxed max-w-xl mx-auto">
            List your product or service in front of a worldwide audience for just&nbsp;
            <strong className="text-neutral-800">${AD_PRICE.toFixed(2)}</strong>.
            No subscriptions. No hidden fees. Pay once, go live.
          </motion.p>
        </section>

        {/* ── Pricing cards ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Standard */}
            <motion.div {...fadeUp(0)} className="rounded-3xl border-2 bg-white p-8 flex flex-col"
              style={{ borderColor: '#790e61', boxShadow: '0 8px 32px rgba(121,14,97,0.12)' }}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-6"
                style={{ background: '#790e61', color: '#fff' }}>
                <Star className="w-3 h-3" /> Most Popular
              </div>
              <div className="mb-1 text-neutral-400 text-xs font-bold uppercase tracking-widest">Standard Listing</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-neutral-900">${AD_PRICE.toFixed(0)}</span>
                <span className="text-neutral-400 text-sm mb-2">/ listing</span>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Active for {AD_DURATION_DAYS} days · one-time payment</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Visible in 150+ countries',
                  'Category & trending feed placement',
                  'Real-time views & click analytics',
                  `Live for ${AD_DURATION_DAYS} days`,
                  'Image, title, description & web link',
                  'No monthly fee — ever',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#790e61' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/ads/create">
                <button className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                  Create a Yubbox
                </button>
              </Link>
            </motion.div>

            {/* Top Lens */}
            <motion.div {...fadeUp(0.08)} className="rounded-3xl border border-neutral-200 bg-white p-8 flex flex-col"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#790e61' }} />
              </div>
              <div className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">Top Lens Add-on</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-neutral-400 text-sm mb-2">+</span>
                <span className="text-5xl font-black text-neutral-900">${TOP_LENS_PRICE.toFixed(0)}</span>
                <span className="text-neutral-400 text-sm mb-2">/ listing</span>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Added on top of your $1 standard listing</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Pinned to the top of your category feed',
                  'Featured section placement on homepage',
                  'Priority above all standard listings',
                  `Stays pinned for the full ${AD_DURATION_DAYS} days`,
                  '3× more category impressions on average',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#790e61' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/ads/create">
                <button className="w-full py-3 rounded-xl font-bold text-sm text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-all">
                  Add Top Lens
                </button>
              </Link>
            </motion.div>

            {/* Stories */}
            <motion.div {...fadeUp(0.16)} className="rounded-3xl border border-neutral-200 bg-white p-8 flex flex-col"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <Play className="w-5 h-5" style={{ color: '#790e61' }} />
              </div>
              <div className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">Stories Add-on</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-neutral-400 text-sm mb-2">+</span>
                <span className="text-5xl font-black text-neutral-900">${STORIES_PRICE.toFixed(0)}</span>
                <span className="text-neutral-400 text-sm mb-2">/ listing</span>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Added on top of your $1 standard listing</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Animated Stories widget on the homepage',
                  'Seen by every visitor before scrolling',
                  '3× higher engagement vs standard',
                  `Active for the full ${AD_DURATION_DAYS} days`,
                  'Auto-loops with your product image',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#790e61' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/ads/create">
                <button className="w-full py-3 rounded-xl font-bold text-sm text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-all">
                  Add Stories
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Bundle note */}
          <motion.div {...fadeUp(0.2)} className="mt-6 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ background: 'rgba(121,14,97,0.05)', border: '1px solid rgba(121,14,97,0.12)' }}>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 shrink-0" style={{ color: '#790e61' }} />
              <p className="text-sm font-semibold text-neutral-700">
                Maximum exposure bundle — Standard + Top Lens + Stories for only{' '}
                <strong style={{ color: '#790e61' }}>
                  ${(AD_PRICE + TOP_LENS_PRICE + STORIES_PRICE).toFixed(0)} total
                </strong>
              </p>
            </div>
            <Link href="/ads/create">
              <button className="flex items-center gap-1.5 text-sm font-bold shrink-0 hover:underline" style={{ color: '#790e61' }}>
                Get started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </section>

        {/* ── How it works ── */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
              Live in under 3 minutes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ n, title, desc, icon: Icon }, i) => (
              <motion.div key={n} {...fadeUp(i * 0.1)} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(121,14,97,0.08)', border: '1.5px solid rgba(121,14,97,0.15)' }}>
                    <Icon className="w-7 h-7" style={{ color: '#790e61' }} />
                  </div>
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
                    {n.slice(1)}
                  </span>
                </div>
                <h3 className="font-black text-neutral-900 text-lg">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <motion.div {...fadeUp(0)}
            className="rounded-3xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            style={{ background: 'linear-gradient(135deg,#3d0730 0%,#790e61 55%,#c41e8a 100%)' }}>
            {[
              { value: '150+', label: 'Countries' },
              { value: `$${AD_PRICE}`, label: 'Per listing' },
              { value: `${AD_DURATION_DAYS} days`, label: 'Listing duration' },
              { value: '0', label: 'Hidden fees' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-white mb-1">{value}</p>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-900">Frequently asked questions</h2>
          </motion.div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => (
              <motion.div key={q} {...fadeUp(i * 0.05)}
                className="bg-white rounded-2xl border border-neutral-100 px-6 py-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <p className="font-bold text-neutral-900 mb-2">{q}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <motion.div {...fadeUp(0)}
            className="rounded-3xl px-8 py-12"
            style={{ background: 'linear-gradient(135deg,#3d0730 0%,#790e61 55%,#c41e8a 100%)', boxShadow: '0 12px 40px rgba(121,14,97,0.35)' }}>
            <Globe className="w-10 h-10 text-white/70 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">Ready to go global?</h2>
            <p className="text-white/70 mb-8 text-sm leading-relaxed">
              Create your first Yubbox in minutes and reach customers in 150+ countries for just $1.
            </p>
            <Link href="/ads/create">
              <button className="inline-flex items-center gap-2 bg-white font-black text-sm px-8 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ color: '#790e61' }}>
                <Plus className="w-4 h-4" /> Create Your First Yubbox
              </button>
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
