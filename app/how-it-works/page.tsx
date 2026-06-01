import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PenLine, CreditCard, Globe, BarChart3, TrendingUp, Play, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'How It Works — Yubbox',
  description: 'Learn how to create, publish, and track your Yubbox listing in under 2 minutes.',
};

const ADVERTISER_STEPS = [
  {
    n: '01', icon: PenLine, color: '#790e61',
    title: 'Create your Yubbox',
    desc: 'Fill in your product or service name, description (up to 500 characters), upload an image, add your website link, and choose your target countries. You can target any combination of 150+ countries with no extra charge.',
  },
  {
    n: '02', icon: TrendingUp, color: '#a0186c',
    title: 'Choose your placement',
    desc: 'A standard listing is $1. Optionally boost with Top Lens (+$5) to pin your ad to the top of its category and the Featured section, or add Yubbox Stories (+$3) to appear in the animated Stories widget on the homepage.',
  },
  {
    n: '03', icon: CreditCard, color: '#c41e8a',
    title: 'Pay once — go live',
    desc: 'Pay securely via Stripe. Your listing activates immediately after payment. No waiting. No approval queue. Your Yubbox is live within seconds, visible to users in every country you selected.',
  },
  {
    n: '04', icon: Globe, color: '#790e61',
    title: 'Reach your audience',
    desc: 'Your listing appears in the global feed, category feeds, country-filtered views, and — if boosted — the Featured section and/or Stories widget. Users can visit your website directly from your listing.',
  },
  {
    n: '05', icon: BarChart3, color: '#a0186c',
    title: 'Track performance',
    desc: 'Your dashboard shows real-time views, clicks, click-through rate, country breakdown, and engagement timeline. The Yubbox Intelligence panel surfaces AI-generated insights about your listing\'s performance.',
  },
  {
    n: '06', icon: Play, color: '#c41e8a',
    title: 'Relist when it expires',
    desc: 'Listings are active for 14 days. When yours expires, relist with one click for another $1. Improve your image or description between runs based on your analytics data.',
  },
];

const BROWSER_STEPS = [
  {
    n: '01', title: 'Browse the global feed', desc: 'The homepage shows all active Yubboxes from around the world. Filter by product or service type, select a category, or narrow by country using the header country picker.',
  },
  {
    n: '02', title: 'Explore categories & trending', desc: 'Use the FilterBar to drill into specific product or service categories. The Trending tab surfaces the most-voted Yubboxes right now.',
  },
  {
    n: '03', title: 'Visit listings', desc: 'Click any Yubbox card to see the full listing — description, seller details, reviews, and a direct link to the advertiser\'s website.',
  },
  {
    n: '04', title: 'Vote & review', desc: 'Sign in to vote for listings you like (Yubbox count) and leave reviews. Your votes directly influence which listings appear in the Trending feed.',
  },
];

const FAQS = [
  { q: 'How long does a listing stay live?', a: '14 days from the moment payment clears. You can relist at any time for another $1.' },
  { q: 'Can I edit my listing after it goes live?', a: 'Yes — you can update your title, description, image, and web link from your dashboard at any time during the active period.' },
  { q: 'What is Top Lens?', a: 'Top Lens pins your Yubbox to the very top of its category feed and in the Featured section for the full 14 days — for an extra $5.' },
  { q: 'What are Yubbox Stories?', a: 'Stories places your product in the animated Stories widget at the top of the homepage, seen by every visitor before they scroll — for an extra $3.' },
  { q: 'Do I need an account to browse?', a: 'No. Anyone can browse, search, and filter listings. An account is only required to create a listing, vote, or leave a review.' },
  { q: 'What countries can I target?', a: 'All 150+ countries in our database. Select as many as you like with no extra charge.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#790e61' }}>How It Works</p>
          <h1 className="text-5xl font-black text-neutral-900 leading-tight mb-5">
            Live in under <span style={{ color: '#790e61' }}>2 minutes</span>
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed">
            From sign-up to global visibility — here&apos;s exactly how Yubbox works for advertisers and browsers.
          </p>
        </section>

        {/* Advertiser steps */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
              For Advertisers
            </span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <div className="space-y-4">
            {ADVERTISER_STEPS.map(({ n, icon: Icon, color, title, desc }) => (
              <div key={n} className="bg-white rounded-2xl border border-neutral-100 p-6 flex gap-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}12`, border: `1.5px solid ${color}25` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-[10px] font-black text-neutral-300">{n}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-black text-neutral-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/ads/create">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                Create your first Yubbox <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* Browser steps */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
              For Browsers
            </span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BROWSER_STEPS.map(({ n, title, desc }) => (
              <div key={n} className="bg-white rounded-2xl border border-neutral-100 p-6"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <span className="text-3xl font-black mb-3 block" style={{ color: 'rgba(121,14,97,0.15)' }}>{n}</span>
                <h3 className="font-black text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-neutral-900">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-neutral-100 px-6 py-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <p className="font-bold text-neutral-900 mb-1.5">{q}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom nav */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 border-t border-neutral-100 flex items-center gap-4 text-sm">
          <Link href="/pricing" className="font-bold hover:underline" style={{ color: '#790e61' }}>View Pricing →</Link>
          <Link href="/support" className="text-neutral-400 hover:text-neutral-700 transition-colors">Help & Support</Link>
          <Link href="/" className="text-neutral-400 hover:text-neutral-700 transition-colors">Back to Home</Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
