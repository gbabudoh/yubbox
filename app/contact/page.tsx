'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SUBJECTS = [
  'General enquiry',
  'Listing / advertising help',
  'Payment issue',
  'Technical problem',
  'Partnership or press',
  'Report content',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 bg-gray-50/50 min-h-screen">

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#790e61' }}>Contact Us</p>
          <h1 className="text-5xl font-black text-neutral-900 leading-tight mb-5">
            We&apos;d love to <span style={{ color: '#790e61' }}>hear from you</span>
          </h1>
          <p className="text-neutral-500 text-lg leading-relaxed">
            Have a question, a problem, or just want to say hello? Send us a message and we&apos;ll get back to you within 24 hours.
          </p>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-neutral-100 p-6"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <Mail className="w-4 h-4" style={{ color: '#790e61' }} />
              </div>
              <p className="font-bold text-neutral-900 mb-1">Email</p>
              <a href="mailto:support@yubbox.com" className="text-sm hover:underline" style={{ color: '#790e61' }}>
                support@yubbox.com
              </a>
              <p className="text-xs text-neutral-400 mt-1">Response within 24 hours</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 p-6"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <MessageCircle className="w-4 h-4" style={{ color: '#790e61' }} />
              </div>
              <p className="font-bold text-neutral-900 mb-1">Help centre</p>
              <Link href="/support" className="text-sm hover:underline" style={{ color: '#790e61' }}>
                Browse Help & Support →
              </Link>
              <p className="text-xs text-neutral-400 mt-1">FAQs, guides, and how-tos</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-100 p-6"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <MapPin className="w-4 h-4" style={{ color: '#790e61' }} />
              </div>
              <p className="font-bold text-neutral-900 mb-1">Global platform</p>
              <p className="text-sm text-neutral-500">Serving advertisers and browsers across 150+ countries worldwide.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-neutral-100 p-10 text-center h-full flex flex-col items-center justify-center"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(121,14,97,0.08)' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#790e61' }} />
                </div>
                <h2 className="text-2xl font-black text-neutral-900 mb-2">Message sent!</h2>
                <p className="text-neutral-500 text-sm max-w-sm">
                  Thanks for reaching out. We&apos;ll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                  className="mt-6 text-sm font-bold hover:underline" style={{ color: '#790e61' }}>
                  Send another message
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-100 p-8"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                        Your name *
                      </label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                        Email address *
                      </label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jane@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] outline-none text-sm transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Subject *
                    </label>
                    <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] outline-none text-sm transition-all">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Message *
                    </label>
                    <textarea required rows={6} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] outline-none text-sm transition-all resize-none" />
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Sending…</span></>
                    ) : 'Send Message'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
