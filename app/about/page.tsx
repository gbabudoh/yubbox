import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Globe, DollarSign, BarChart3, Zap, Users, Target } from 'lucide-react';

export const metadata = {
  title: 'About Yubbox — Global Advertising Platform',
  description: 'Learn about Yubbox, the $1 global advertising platform that puts your product or service in front of 150+ countries.',
};

const VALUES = [
  {
    icon: Globe,
    title: 'Global by default',
    desc: 'Every listing is visible worldwide from day one. We built Yubbox so that a small business in Lagos competes on the same feed as one in London.',
  },
  {
    icon: DollarSign,
    title: 'Radically affordable',
    desc: '$1 per listing. No subscriptions, no per-click charges, no hidden fees. We believe global reach should not be a luxury.',
  },
  {
    icon: BarChart3,
    title: 'Data in your hands',
    desc: 'Every Yubbox comes with real-time analytics — views, clicks, country breakdown, engagement score. You always know what\'s working.',
  },
  {
    icon: Zap,
    title: 'Instant activation',
    desc: 'Pay once, go live immediately. Your listing is visible to users in every country you selected within seconds of payment.',
  },
  {
    icon: Users,
    title: 'Built for everyone',
    desc: 'From solo freelancers to growing brands, Yubbox is designed for anyone who has something worth sharing with the world.',
  },
  {
    icon: Target,
    title: 'Precision targeting',
    desc: 'Choose exactly which countries see your Yubbox. Combined with category and industry filters, your ad reaches the right people.',
  },
];

const STATS = [
  { value: '150+', label: 'Countries' },
  { value: '$1',   label: 'Per listing' },
  { value: '14',   label: 'Days active' },
  { value: '8',    label: 'Languages' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#790e61' }}>About Yubbox</p>
          <h1 className="text-5xl font-black text-neutral-900 leading-tight mb-6">
            The $1 platform that puts your<br />
            <span style={{ color: '#790e61' }}>business in front of the world</span>
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto">
            Yubbox was built on one idea: global advertising should be accessible to everyone.
            Whether you&apos;re selling handmade goods from home or scaling a digital service,
            you deserve the same reach as the biggest brands.
          </p>
        </section>

        {/* Stats bar */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="rounded-3xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            style={{ background: 'linear-gradient(135deg,#3d0730 0%,#790e61 55%,#c41e8a 100%)' }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 md:p-10"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#790e61' }}>Our Mission</p>
            <blockquote className="text-2xl md:text-3xl font-black text-neutral-900 leading-snug mb-6">
              &ldquo;Remove every barrier between a great product and a global audience.&rdquo;
            </blockquote>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Traditional advertising is expensive, opaque, and designed for large budgets.
              Yubbox flips that model. We charge a flat $1, give you real-time data, and let
              you choose exactly which countries see your listing. No bidding wars. No account
              managers. No minimums. Just you and your audience.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#790e61' }}>What we stand for</p>
            <h2 className="text-3xl font-black text-neutral-900">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-neutral-100 p-6"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(121,14,97,0.08)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#790e61' }} />
                </div>
                <h3 className="font-black text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-3xl border border-neutral-100 p-8"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h2 className="text-2xl font-black text-neutral-900 mb-3">Ready to go global?</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Create your first Yubbox in under 2 minutes. $1. 150+ countries. Zero complexity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/ads/create">
                <button className="px-6 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                  Create a Yubbox →
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-6 py-3 rounded-xl font-bold text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all">
                  Get in touch
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
