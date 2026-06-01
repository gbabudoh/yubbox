import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageCircle, Mail, BookOpen, CreditCard, BarChart3, ShieldCheck, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Help & Support — Yubbox',
  description: 'Get help with your Yubbox account, listings, payments, and more.',
};

const TOPICS = [
  {
    icon: BookOpen,
    title: 'Getting started',
    links: [
      { label: 'How to create your first Yubbox',  href: '/how-it-works' },
      { label: 'Choosing your target countries',    href: '/how-it-works' },
      { label: 'How pricing works',                 href: '/pricing' },
      { label: 'What is Top Lens?',                 href: '/pricing' },
      { label: 'What are Yubbox Stories?',          href: '/pricing' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments & billing',
    links: [
      { label: 'Accepted payment methods',          href: '/pricing' },
      { label: 'Refund policy',                     href: '/terms' },
      { label: 'How to relist an expired ad',       href: '/how-it-works' },
      { label: 'Understanding your invoice',        href: '/dashboard' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & performance',
    links: [
      { label: 'How views are counted',             href: '/how-it-works' },
      { label: 'Click-through rate explained',      href: '/how-it-works' },
      { label: 'Yubbox Intelligence insights',      href: '/dashboard' },
      { label: 'Improving your listing performance',href: '/how-it-works' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Account & security',
    links: [
      { label: 'Reset your password',              href: '/forgot-password' },
      { label: 'Update account details',           href: '/dashboard' },
      { label: 'Privacy policy',                   href: '/privacy' },
      { label: 'Terms of service',                 href: '/terms' },
    ],
  },
];

const FAQS = [
  {
    q: 'My listing isn\'t showing up — what do I do?',
    a: 'Make sure your listing is paid and active in your dashboard. If payment was completed but the listing shows as inactive, contact support with your transaction ID.',
  },
  {
    q: 'Can I change my listing after it\'s live?',
    a: 'Yes. Go to your dashboard, find the listing, and click Edit. You can update the title, description, image, and web link at any time during the active period.',
  },
  {
    q: 'How do I cancel my listing?',
    a: 'You can deactivate a listing from your dashboard. Note that payments are non-refundable once a listing has been activated.',
  },
  {
    q: 'I was charged but my listing isn\'t active.',
    a: 'This sometimes happens if there was a network issue during activation. Contact us at support@yubbox.com with your email address and the last 4 digits of your card — we\'ll resolve it within 24 hours.',
  },
  {
    q: 'How do I report inappropriate content?',
    a: 'Use the Report button on the listing page, or email us at support@yubbox.com with the listing link. We review all reports within 24 hours.',
  },
  {
    q: 'Can I have multiple listings at the same time?',
    a: 'Yes. There is no limit on active listings per account. Each listing is billed independently at $1.',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#790e61' }}>Help & Support</p>
          <h1 className="text-5xl font-black text-neutral-900 leading-tight mb-5">
            How can we <span style={{ color: '#790e61' }}>help you?</span>
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed">
            Browse the topics below or reach out directly — we typically respond within a few hours.
          </p>
        </section>

        {/* Contact cards */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/contact">
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 hover:border-[#790e61]/30 hover:shadow-md transition-all cursor-pointer"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(121,14,97,0.08)' }}>
                  <MessageCircle className="w-5 h-5" style={{ color: '#790e61' }} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 mb-0.5">Send us a message</p>
                  <p className="text-sm text-neutral-500">Use the contact form for general questions, feedback, or partnership enquiries.</p>
                </div>
              </div>
            </Link>

            <a href="mailto:support@yubbox.com">
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-start gap-4 hover:border-[#790e61]/30 hover:shadow-md transition-all cursor-pointer"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(121,14,97,0.08)' }}>
                  <Mail className="w-5 h-5" style={{ color: '#790e61' }} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 mb-0.5">Email support</p>
                  <p className="text-sm text-neutral-500">support@yubbox.com — we aim to respond within 24 hours on business days.</p>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Help topics */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-neutral-900">Browse by topic</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TOPICS.map(({ icon: Icon, title, links }) => (
              <div key={title} className="bg-white rounded-2xl border border-neutral-100 p-6"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(121,14,97,0.08)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#790e61' }} />
                  </div>
                  <h3 className="font-black text-neutral-900">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-neutral-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-neutral-100 px-6 py-5"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#790e61' }} />
                  <div>
                    <p className="font-bold text-neutral-900 mb-1.5">{q}</p>
                    <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom nav */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 border-t border-neutral-100 flex items-center gap-4 text-sm">
          <Link href="/contact" className="font-bold hover:underline" style={{ color: '#790e61' }}>Contact Us →</Link>
          <Link href="/how-it-works" className="text-neutral-400 hover:text-neutral-700 transition-colors">How It Works</Link>
          <Link href="/" className="text-neutral-400 hover:text-neutral-700 transition-colors">Back to Home</Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
