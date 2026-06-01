'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Gift, Users, Star } from 'lucide-react';
import PushSubscribeButton from '@/components/PushSubscribeButton';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

export default function ReferralPage() {
  const [data,    setData]    = useState<{ code: string; usages: number; credits: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const referralUrl = data ? `${BASE_URL}/join?ref=${data.code}` : '';

  const copy = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join me on Yubbox — the $1 global advertising platform! Use my link to get started: ${referralUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Programme</h1>
        <p className="text-gray-500 mt-1 text-sm">Invite advertisers and earn free listing credits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Referrals made', value: loading ? '…' : String(data?.usages ?? 0) },
          { icon: Star,  label: 'Credits earned',  value: loading ? '…' : String(data?.credits ?? 0) },
          { icon: Gift,  label: 'Credit value',     value: loading ? '…' : `${data?.credits ?? 0} free relists` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 p-5 text-center"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(121,14,97,0.08)' }}>
              <Icon className="w-4 h-4" style={{ color: '#790e61' }} />
            </div>
            <p className="text-2xl font-black text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 className="font-black text-neutral-900 mb-1">Your referral link</h2>
        <p className="text-sm text-neutral-500 mb-4">
          When someone signs up through your link and creates their first paid listing, you earn 1 free relist credit.
        </p>

        {loading ? (
          <div className="h-12 bg-neutral-100 rounded-xl animate-pulse" />
        ) : (
          <div className="flex gap-2">
            <input readOnly value={referralUrl}
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 bg-gray-50 text-sm text-neutral-700 outline-none font-mono" />
            <button onClick={copy}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all"
            style={{ background: '#25D366' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.546 4.07 1.503 5.778L.057 23.428l5.793-1.518A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.951 0-3.776-.525-5.344-1.441l-.383-.228-3.44.902.917-3.35-.25-.398A9.934 9.934 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Push notifications */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 className="font-black text-neutral-900 mb-1">New listing notifications</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Get browser push notifications when new Yubboxes matching your saved searches go live.
        </p>
        <PushSubscribeButton />
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 className="font-black text-neutral-900 mb-4">How it works</h2>
        <ol className="space-y-3">
          {[
            'Share your referral link with other businesses or advertisers.',
            'When they sign up and create their first paid listing, you earn 1 credit.',
            'Use credits to relist your own Yubbox for free — no $1 charge.',
            'There is no limit on how many credits you can earn.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
