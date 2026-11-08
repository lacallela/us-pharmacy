'use client';

import { useState } from 'react';
import { Drug } from '@/lib/db';
import { 
  Pill, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  initialDrugs: Drug[];
  initialCategories: string[];
}

export function DrugsManager({ initialDrugs, initialCategories }: Props) {
  const [drugs, setDrugs] = useState<Drug[]>(initialDrugs);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentDrug, setCurrentDrug] = useState<Partial<Drug>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredDrugs = drugs.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.generic_name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesType = selectedType === 'all' || d.drug_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const openCreateModal = () => {
    setCurrentDrug({
      name: '',
      slug: '',
      generic_name: '',
      drug_type: 'Rx',
      category: initialCategories[0] || 'Cardiovascular',
      dosage: '10mg, 30 tablets',
      form: 'Oral tablet',
      manufacturer: 'Generic Pharma USA',
      brand_price: 100,
      generic_cash_price: 10,
      coupon_code: 'RXSAVER80',
      description: 'Prescription medication used under physician supervision.',
      fda_indications: 'Used for the treatment of diagnosed conditions.',
      contraindications: 'Do not use if allergic to active ingredients.',
      how_to_use: 'Take daily as directed by your physician with water.',
      is_trending: 0
    });
    setModalMode('create');
  };

  const openEditModal = (drug: Drug) => {
    setCurrentDrug({ ...drug });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setCurrentDrug({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/drugs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentDrug)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create drug');

        setDrugs((prev) => [data.drug, ...prev]);
        setFeedback({ type: 'success', text: `Created medication "${data.drug.name}"` });
      } else if (modalMode === 'edit' && currentDrug.id) {
        const res = await fetch(`/api/admin/drugs/${currentDrug.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentDrug)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update drug');

        setDrugs((prev) => prev.map((d) => (d.id === data.drug.id ? data.drug : d)));
        setFeedback({ type: 'success', text: `Updated medication "${data.drug.name}"` });
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
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog? This will remove all associated price offers.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/drugs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete medication');
      setDrugs((prev) => prev.filter((d) => d.id !== id));
      setFeedback({ type: 'success', text: `Deleted "${name}"` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Prescription & Generic Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {drugs.length} medications • Manage cash prices, coupon codes, and clinical indications
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Alert / Feedback message */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md ${
          feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {feedback.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medications by brand, generic, or category..."
            className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {initialCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="Rx">Rx (Prescription)</option>
            <option value="OTC">OTC (Over the Counter)</option>
            <option value="Telehealth">Telehealth</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Medication</th>
                <th className="py-3.5 px-4">Category & Type</th>
                <th className="py-3.5 px-4">Brand Price</th>
                <th className="py-3.5 px-4">Generic Cash</th>
                <th className="py-3.5 px-4">Savings</th>
                <th className="py-3.5 px-4">Clicks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDrugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No medications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDrugs.map((d) => {
                  const savePct = d.brand_price > 0 
                    ? Math.max(0, Math.round(((d.brand_price - d.generic_cash_price) / d.brand_price) * 100))
                    : 0;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{d.name}</span>
                              {d.is_trending === 1 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Hot
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {d.generic_name} • {d.dosage}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{d.category}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          d.drug_type === 'Telehealth'
                            ? 'bg-purple-100 text-purple-800'
                            : d.drug_type === 'OTC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {d.drug_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-500 line-through">
                        ${d.brand_price.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-emerald-700 text-sm">
                          ${d.generic_cash_price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          code: {d.coupon_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-600">
                        {savePct > 0 ? `Save ${savePct}%` : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold">
                          {d.clicks_count}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/drugs/${d.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                            title="View public page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Edit medication"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id, d.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">
                  {modalMode === 'create' ? 'Add New Medication to Catalog' : `Edit: ${currentDrug.name}`}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={currentDrug.name || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentDrug((prev) => ({
                        ...prev,
                        name: val,
                        slug: prev.slug ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      }));
                    }}
                    placeholder="e.g. Lipitor"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={currentDrug.slug || ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. lipitor"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Generic Name</label>
                  <input
                    type="text"
                    required
                    value={currentDrug.generic_name || ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, generic_name: e.target.value }))}
                    placeholder="e.g. Atorvastatin Calcium"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    required
                    value={currentDrug.category || ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Cardiovascular"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Drug Type</label>
                  <select
                    value={currentDrug.drug_type || 'Rx'}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, drug_type: e.target.value }))}
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Rx">Rx (Prescription Required)</option>
                    <option value="OTC">OTC (Over the Counter)</option>
                    <option value="Telehealth">Telehealth / Compounded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dosage Specification</label>
                  <input
                    type="text"
                    value={currentDrug.dosage || ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g. 20mg, 30 tablets"
                    className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Brand Retail Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentDrug.brand_price ?? ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, brand_price: Number(e.target.value) }))}
                    placeholder="185.00"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Generic Cash / Coupon Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentDrug.generic_cash_price ?? ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, generic_cash_price: Number(e.target.value) }))}
                    placeholder="7.20"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Coupon Code</label>
                  <input
                    type="text"
                    value={currentDrug.coupon_code || ''}
                    onChange={(e) => setCurrentDrug((prev) => ({ ...prev, coupon_code: e.target.value }))}
                    placeholder="RXSAVER80"
                    className="w-full bg-slate-50 font-mono text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(currentDrug.is_trending)}
                      onChange={(e) => setCurrentDrug((prev) => ({ ...prev, is_trending: e.target.checked ? 1 : 0 }))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Highlight as Trending / Featured</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={currentDrug.description || ''}
                  onChange={(e) => setCurrentDrug((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">FDA Indications</label>
                <textarea
                  rows={2}
                  value={currentDrug.fda_indications || ''}
                  onChange={(e) => setCurrentDrug((prev) => ({ ...prev, fda_indications: e.target.value }))}
                  className="w-full bg-slate-50 text-sm rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none"
                />
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
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create Medication' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
