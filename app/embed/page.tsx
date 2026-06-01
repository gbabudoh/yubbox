'use client';

import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

export default function EmbedGeneratorPage() {
  const [category, setCategory] = useState('');
  const [country,  setCountry]  = useState('');
  const [limit,    setLimit]    = useState(6);
  const [height,   setHeight]   = useState(480);
  const [copied,   setCopied]   = useState(false);

  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (country)  params.set('country',  country);
  params.set('limit', String(limit));

  const src     = `${BASE_URL}/api/embed/listings?${params.toString()}`;
  const snippet = `<iframe src="${src}" width="100%" height="${height}" frameborder="0" scrolling="no" style="border:none;border-radius:12px;overflow:hidden"></iframe>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#790e61' }}>Developer</p>
            <h1 className="text-4xl font-black text-neutral-900 mb-2">Embed Yubbox on your site</h1>
            <p className="text-neutral-500">Drop a live Yubbox listings feed into any website with one line of HTML.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Controls */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h2 className="font-black text-neutral-900">Configure</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Category slug (optional)</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. electronics"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-[#790e61] transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Country code (optional)</label>
                <input value={country} onChange={e => setCountry(e.target.value.toUpperCase())} placeholder="e.g. NG, US, GB"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-[#790e61] transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Number of listings (1–12)</label>
                <input type="number" min={1} max={12} value={limit} onChange={e => setLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-[#790e61] transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">iFrame height (px)</label>
                <input type="number" min={200} max={1200} value={height} onChange={e => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-[#790e61] transition-all" />
              </div>

              {/* Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" /> Embed code
                  </label>
                  <button onClick={copy}
                    className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: '#790e61' }}>
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <textarea readOnly value={snippet} rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-gray-50 text-xs font-mono text-neutral-700 outline-none resize-none" />
              </div>
            </div>

            {/* Live preview */}
            <div>
              <h2 className="font-black text-neutral-900 mb-3">Live preview</h2>
              <div className="rounded-2xl overflow-hidden border border-neutral-200">
                <iframe src={src} width="100%" height={height} style={{ border: 'none', display: 'block' }} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
