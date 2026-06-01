'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushSubscribeButton() {
  const [status,  setStatus]  = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') { setStatus('denied'); return; }

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'unsubscribed');
      })
    );
  }, []);

  const subscribe = async () => {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub.toJSON()),
      });
      setStatus('subscribed');
    } catch (err) {
      console.error('Push subscribe error', err);
      if (Notification.permission === 'denied') setStatus('denied');
    } finally {
      setWorking(false);
    }
  };

  const unsubscribe = async () => {
    setWorking(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('unsubscribed');
    } finally {
      setWorking(false);
    }
  };

  if (status === 'unsupported') return null;

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-400">
        <Bell className="w-4 h-4" /> Loading…
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-400">
        <BellOff className="w-4 h-4" /> Notifications blocked in browser settings
      </div>
    );
  }

  if (status === 'subscribed') {
    return (
      <button onClick={unsubscribe} disabled={working}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all disabled:opacity-50">
        <BellOff className="w-4 h-4" />
        {working ? 'Updating…' : 'Notifications on — click to turn off'}
      </button>
    );
  }

  return (
    <button onClick={subscribe} disabled={working}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
      <Bell className="w-4 h-4" />
      {working ? 'Enabling…' : 'Enable push notifications'}
    </button>
  );
}
