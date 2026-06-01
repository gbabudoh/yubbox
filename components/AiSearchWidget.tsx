'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ChevronDown } from 'lucide-react';

interface Props {
  onResults: (adIds: string[] | null) => void;
}

const SUGGESTIONS = [
  'Graphic designer in West Africa',
  'Wholesale clothing supplier from Turkey',
  'Software development services in Asia',
  'Handmade jewellery from Nigeria',
];

export default function AiSearchWidget({ onResults }: Props) {
  const [open,     setOpen]     = useState(false);
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [answer,   setAnswer]   = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const search = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res  = await fetch('/api/ai/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        onResults(data.data.adIds);
        setAnswer(data.data.answer);
      } else {
        setError(data.error ?? 'Search failed');
        onResults(null);
      }
    } catch {
      setError('Network error');
      onResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setAnswer(null);
    setError(null);
    onResults(null);
  };

  return (
    <div className="w-full">
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'rgba(121,14,97,0.06)', borderColor: 'rgba(121,14,97,0.2)', color: '#790e61' }}
        >
          <Sparkles className="w-4 h-4" />
          Ask AI — describe what you&apos;re looking for
          <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-60" />
        </button>
      )}

      {open && (
        <div className="bg-white rounded-2xl border shadow-lg overflow-hidden"
          style={{ borderColor: 'rgba(121,14,97,0.2)', boxShadow: '0 8px 24px rgba(121,14,97,0.12)' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">AI Search</span>
              <span className="text-white/60 text-xs">Powered by Claude</span>
            </div>
            <button onClick={() => { setOpen(false); clear(); }} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Input */}
          <div className="p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') search(query); }}
                placeholder="e.g. Graphic designer in West Africa under $500"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-[#790e61] transition-all"
              />
              <button
                onClick={() => search(query)}
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Suggestions */}
            {!answer && !loading && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => { setQuery(s); search(s); }}
                    className="px-3 py-1 rounded-full border border-neutral-200 text-xs text-neutral-500 hover:border-[#790e61] hover:text-[#790e61] transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Answer */}
            {answer && !loading && (
              <div className="mt-2 flex items-start gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(121,14,97,0.05)' }}>
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#790e61' }} />
                <div className="flex-1">
                  <p className="text-xs text-neutral-700">{answer}</p>
                  <button onClick={clear} className="mt-1 text-xs font-bold hover:underline" style={{ color: '#790e61' }}>
                    Clear results
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-500 font-medium px-1">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
