'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';

interface SocialLink {
  id:        string;
  platform:  string;
  label:     string;
  url:       string;
  symbol:    string;
  isActive:  boolean;
  order:     number;
}

const EMPTY: Omit<SocialLink, 'id'> = {
  platform: '', label: '', url: '', symbol: '', isActive: true, order: 0,
};

const PLATFORM_PRESETS = [
  { platform: 'x',         label: 'X (Twitter)',  symbol: '𝕏' },
  { platform: 'instagram', label: 'Instagram',    symbol: 'IG' },
  { platform: 'linkedin',  label: 'LinkedIn',     symbol: 'in' },
  { platform: 'facebook',  label: 'Facebook',     symbol: 'f' },
  { platform: 'tiktok',    label: 'TikTok',       symbol: '♪' },
  { platform: 'youtube',   label: 'YouTube',      symbol: '▶' },
  { platform: 'whatsapp',  label: 'WhatsApp',     symbol: 'W' },
];

export default function SocialLinksPage() {
  const [links,    setLinks]   = useState<SocialLink[]>([]);
  const [loading,  setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing] = useState<SocialLink | null>(null);
  const [form,     setForm]    = useState<Omit<SocialLink, 'id'>>(EMPTY);
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/social-links');
      const data = await res.json();
      setLinks(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (link: SocialLink) => {
    setEditing(link);
    setForm({ platform: link.platform, label: link.label, url: link.url,
              symbol: link.symbol, isActive: link.isActive, order: link.order });
    setError(null);
    setShowForm(true);
  };

  const applyPreset = (preset: typeof PLATFORM_PRESETS[0]) => {
    setForm(f => ({ ...f, platform: preset.platform, label: preset.label, symbol: preset.symbol }));
  };

  const handleSave = async () => {
    if (!form.platform || !form.label || !form.url || !form.symbol) {
      setError('All fields except order are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url    = editing ? `/api/admin/social-links/${editing.id}` : '/api/admin/social-links';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error ?? 'Save failed'); return; }
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    await fetch(`/api/admin/social-links/${id}`, { method: 'DELETE' });
    await load();
  };

  const toggleActive = async (link: SocialLink) => {
    await fetch(`/api/admin/social-links/${link.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !link.isActive }),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage the social media links shown in the footer</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#790e61] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick presets */}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_PRESETS.map((p) => (
                  <button key={p.platform} type="button" onClick={() => applyPreset(p)}
                    className="px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-[#790e61] hover:text-[#790e61] transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Platform *</label>
                  <input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                    placeholder="e.g. instagram"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Label *</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Instagram"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">URL *</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://instagram.com/yubbox"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Symbol *</label>
                  <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                    placeholder="IG"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order</label>
                  <input type="number" value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#790e61] focus:ring-2 focus:ring-[#790e61]/10 outline-none transition-all" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#790e61]" />
                <span className="text-sm font-medium text-gray-700">Active (visible in footer)</span>
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#790e61] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading…</div>
      ) : links.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 mb-4">No social links yet.</p>
          <button onClick={openCreate}
            className="px-4 py-2 bg-[#790e61] text-white rounded-lg text-sm font-medium hover:opacity-90">
            Add your first link
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left">Platform</th>
                <th className="px-5 py-3 text-left">Label</th>
                <th className="px-5 py-3 text-left">Symbol</th>
                <th className="px-5 py-3 text-left">URL</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 font-medium">{link.order}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{link.platform}</td>
                  <td className="px-5 py-3.5 text-gray-700">{link.label}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-sm font-bold text-gray-700">
                      {link.symbol}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="text-[#790e61] hover:underline truncate block">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(link)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                      style={{ color: link.isActive ? '#16a34a' : '#9ca3af' }}>
                      {link.isActive
                        ? <ToggleRight className="w-5 h-5" />
                        : <ToggleLeft className="w-5 h-5" />}
                      {link.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(link)}
                        className="p-1.5 text-gray-400 hover:text-[#790e61] transition-colors rounded-lg hover:bg-gray-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(link.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
