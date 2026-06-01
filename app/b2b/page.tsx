import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';
import { IAd } from '@/types/models';
import { Globe, Package, TrendingUp, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'B2B & Wholesale Sourcing — Yubbox',
  description: 'Find verified wholesale suppliers, B2B service providers, and procurement partners across 150+ countries on Yubbox. Source globally from $1.',
  keywords: 'B2B suppliers, wholesale sourcing, global procurement, international suppliers, business services',
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type':    'WebPage',
  name:       'B2B & Wholesale Sourcing — Yubbox',
  description:'Global B2B supplier and wholesale product directory on Yubbox.',
  url:        `${BASE_URL}/b2b`,
};

const SECTORS = [
  { icon: Package,    label: 'Manufacturing',     q: 'manufacturer'  },
  { icon: Globe,      label: 'Import / Export',   q: 'import export' },
  { icon: TrendingUp, label: 'Wholesale Trade',   q: 'wholesale'     },
];

export default async function B2BPage() {
  const now = new Date();

  const ads = await prisma.ad.findMany({
    where: {
      listingType: { in: ['wholesale', 'b2b'] },
      isActive:    true,
      isPaid:      true,
      expiryDate:  { gte: now },
    },
    include: {
      user:     { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true, type: true } },
      industry: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { visibilityScore: 'desc' },
    take:    48,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen">
        <Header />

        <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">

          {/* Hero */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(121,14,97,0.08)', color: '#790e61' }}>
              B2B &amp; Wholesale
            </div>
            <h1 className="text-5xl font-black text-neutral-900 leading-tight mb-5">
              Source globally.<br />
              <span style={{ color: '#790e61' }}>From any country. From $1.</span>
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Connect with verified wholesale suppliers, manufacturers, and B2B service providers
              across 150+ countries. Every listing is live, paid, and contactable.
            </p>
          </section>

          {/* Sector quick-links */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
            <div className="grid grid-cols-3 gap-4">
              {SECTORS.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-2xl border border-neutral-100 p-5 text-center cursor-default"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(121,14,97,0.08)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#790e61' }} />
                  </div>
                  <p className="font-bold text-neutral-800 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Listings */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-neutral-800">B2B &amp; Wholesale Listings</h2>
                <p className="text-sm text-neutral-400 mt-0.5">{ads.length} active listings</p>
              </div>
              <Link href="/ads/create">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
                  List your business <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {ads.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-neutral-100">
                <Globe className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-700 mb-2">No B2B listings yet</h3>
                <p className="text-neutral-400 text-sm mb-6">Be the first to list your wholesale business on Yubbox.</p>
                <Link href="/ads/create">
                  <button className="px-6 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
                    Create B2B Listing
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ads.map((ad) => <AdCard key={ad.id} ad={ad as unknown as IAd} />)}
              </div>
            )}
          </section>

          {/* SEO copy */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-neutral-100 p-8"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h2 className="text-xl font-black text-neutral-900 mb-4">Why source on Yubbox?</h2>
              <div className="space-y-3 text-sm text-neutral-600 leading-relaxed">
                <p>Every B2B listing on Yubbox is paid and active — meaning the seller is a real business actively seeking buyers. No ghost listings, no expired contacts.</p>
                <p>Filter by country to find suppliers in specific regions — whether you need manufacturers in China, textile producers in Bangladesh, or tech service firms in India.</p>
                <p>Contact any supplier directly through their website link. No middlemen, no platform fees on transactions — just direct business relationships.</p>
                <p>List your own wholesale business for just $1 and reach procurement managers and importers across 150+ countries for 14 days.</p>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}
