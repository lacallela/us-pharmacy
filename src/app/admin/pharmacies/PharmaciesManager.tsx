'use client';

import { useState } from 'react';
import { Pharmacy } from '@/lib/db';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  X, 
  DollarSign, 
  Link as LinkIcon,
  Clock,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  initialPharmacies: Pharmacy[];
}

export function PharmaciesManager({ initialPharmacies }: Props) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentPharm, setCurrentPharm] = useState<Partial<Pharmacy>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openCreateModal = () => {
    setCurrentPharm({
      name: '',
      slug: '',
      type: 'retail',
      logo_text: '',
      pickup_time: '15-min pickup',
      perk_text: 'Digital coupon accepted at counter',
      base_url: 'https://www.example.com',
      affiliate_param: 'subid',
      epc: 3.50,
      is_active: 1
    });
    setModalMode('create');
  };

  const openEditModal = (pharm: Pharmacy) => {
    setCurrentPharm({ ...pharm });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentPharm({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/pharmacies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPharm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create pharmacy');

        setPharmacies((prev) => [...prev, data.pharmacy]);
        setFeedback({ type: 'success', text: `Created partner "${data.pharmacy.name}"` });
      } else if (modalMode === 'edit' && currentPharm.id) {
        const res = await fetch(`/api/admin/pharmacies/${currentPharm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPharm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update pharmacy');

        setPharmacies((prev) => prev.map((p) => (p.id === data.pharmacy.id ? data.pharmacy : p)));
        setFeedback({ type: 'success', text: `Updated partner "${data.pharmacy.name}"` });
      }
      closeModal();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This removes its affiliate link and price offers.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/pharmacies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete pharmacy');
      setPharmacies((prev) => prev.filter((p) => p.id !== id));
      setFeedback({ type: 'success', text: `Deleted "${name}"` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete' });
    }
  };

  const handleToggleActive = async (pharm: Pharmacy) => {
    const newStatus = pharm.is_active === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/pharmacies/${pharm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to update status');
      setPharmacies((prev) => prev.map((p) => (p.id === pharm.id ? { ...p, is_active: newStatus } : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pharmacy Partners & Affiliate Links
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage destination pharmacies (CVS, Walgreens, Walmart, Amazon, Ro Telehealth) and tracking parameters
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Affiliate Partner</span>
        </button>
      </div>

      {/* Alert / Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md ${
          feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-sm space-y-4 flex flex-col justify-between ${
              p.is_active === 1 ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${
                    p.type === 'telehealth'
                      ? 'bg-purple-100 text-purple-800'
                      : p.type === 'online'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.type} network
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {p.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    /go/{p.slug}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(p)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${
                    p.is_active === 1
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                  }`}
                  title="Click to toggle active status"
                >
                  {p.is_active === 1 ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target EPC:</span>
                  <span className="font-bold text-emerald-700">${p.epc.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pickup Speed:</span>
                  <span className="font-medium text-slate-700">{p.pickup_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Affiliate Param:</span>
                  <span className="font-mono text-slate-700">{p.affiliate_param}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  {p.perk_text}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/go/${p.slug}?source=admin_partner_test`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Test Redirect</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                  title="Edit partner"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete partner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">
                  {modalMode === 'create' ? 'Add Pharmacy Affiliate Partner' : `Edit: ${currentPharm.name}`}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Partner / Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={currentPharm.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentPharm((prev) => ({
                      ...prev,
                      name: val,
                      slug: prev.slug ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }}
                  placeholder="e.g. CVS Pharmacy"
                  className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL Slug (/go/[slug])</label>
                  <input
                    type="text"
                    required
                    value={currentPharm.slug || ''}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="cvs-pharmacy"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Partner Type</label>
                  <select
                    value={currentPharm.type || 'retail'}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="retail">Retail Pharmacy (Local)</option>
                    <option value="online">Online / Mail Order</option>
                    <option value="telehealth">Telehealth Clinic</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Destination Affiliate Base URL</label>
                <input
                  type="url"
                  required
                  value={currentPharm.base_url || ''}
                  onChange={(e) => setCurrentPharm((prev) => ({ ...prev, base_url: e.target.value }))}
                  placeholder="https://www.cvs.com"
                  className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Affiliate Tracking Param</label>
                  <input
                    type="text"
                    value={currentPharm.affiliate_param || 'subid'}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, affiliate_param: e.target.value }))}
                    placeholder="subid or aff_id"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target EPC ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentPharm.epc ?? 3.50}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, epc: Number(e.target.value) }))}
                    placeholder="3.50"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pickup Speed / Label</label>
                  <input
                    type="text"
                    value={currentPharm.pickup_time || ''}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, pickup_time: e.target.value }))}
                    placeholder="Same-day 15-min pickup"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Perk / Badge Text</label>
                  <input
                    type="text"
                    value={currentPharm.perk_text || ''}
                    onChange={(e) => setCurrentPharm((prev) => ({ ...prev, perk_text: e.target.value }))}
                    placeholder="Digital coupon accepted"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create Partner' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
