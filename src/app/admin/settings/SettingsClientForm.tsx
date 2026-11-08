'use client';

import { useState } from 'react';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Megaphone, 
  DollarSign, 
  Store,
  Lock,
  KeyRound
} from 'lucide-react';

interface Props {
  initialSettings: Record<string, string>;
  settingsList: Array<{ key: string; value: string; description: string; updated_at: string }>;
}

export function SettingsClientForm({ initialSettings, settingsList }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage({ type: 'success', text: 'Settings saved successfully! Public pages updated.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordMessage({ type: 'success', text: 'Admin password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Feedback */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-rose-600 text-white'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. BRAND & IDENTITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Brand & Support Identity</h2>
              <p className="text-xs text-slate-500">General website branding, contact numbers, and email displayed to visitors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Website Name</label>
              <input
                type="text"
                value={formData['site_name'] || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Currency Symbol</label>
              <input
                type="text"
                value={formData['currency_symbol'] || '$'}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Website Tagline</label>
              <input
                type="text"
                value={formData['site_tagline'] || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Toll-Free Support Phone</label>
              <input
                type="text"
                value={formData['support_phone'] || ''}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Customer Support Email</label>
              <input
                type="email"
                value={formData['support_email'] || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 2. DIGITAL RX COUPON PARAMETERS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Digital Rx Discount Card Parameters</h2>
              <p className="text-xs text-slate-500">
                National pharmacy network identifiers printed on digital coupons (BIN, PCN, Group)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">BIN Number</label>
              <input
                type="text"
                value={formData['coupon_bin'] || ''}
                onChange={(e) => handleChange('coupon_bin', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">PCN Code</label>
              <input
                type="text"
                value={formData['coupon_pcn'] || ''}
                onChange={(e) => handleChange('coupon_pcn', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Group Code</label>
              <input
                type="text"
                value={formData['coupon_group'] || ''}
                onChange={(e) => handleChange('coupon_group', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Default Promo Code</label>
              <input
                type="text"
                value={formData['default_coupon_code'] || ''}
                onChange={(e) => handleChange('default_coupon_code', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 3. HERO & MARKETING MESSAGING */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Marketing & Hero Messaging</h2>
              <p className="text-xs text-slate-500">Key conversion headlines shown on homepage and banners</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Top Announcement Banner</label>
              <input
                type="text"
                value={formData['announcement_text'] || ''}
                onChange={(e) => handleChange('announcement_text', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hero Main Headline</label>
              <input
                type="text"
                value={formData['hero_title'] || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hero Subtitle / Description</label>
              <textarea
                rows={3}
                value={formData['hero_subtitle'] || ''}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* 4. AFFILIATE & MONETIZATION SETTINGS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Affiliate Tracking & Revenue Metrics</h2>
              <p className="text-xs text-slate-500">Parameters used by the outbound click router (/go/[pharmacy]) and analytics estimations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Global Affiliate SubID</label>
              <input
                type="text"
                value={formData['affiliate_subid'] || ''}
                onChange={(e) => handleChange('affiliate_subid', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <span className="text-[11px] text-slate-400">Passed as subid tag in outbound links</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Average EPC ($ USD)</label>
              <input
                type="number"
                step="0.01"
                value={formData['avg_epc_usd'] || '3.85'}
                onChange={(e) => handleChange('avg_epc_usd', e.target.value)}
                className="w-full bg-slate-50 focus:bg-white text-sm font-mono rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              <span className="text-[11px] text-slate-400">Used to calculate estimated affiliate earnings</span>
            </div>
          </div>
        </div>

        {/* Save Button for Site Settings */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* 5. CHANGE ADMIN PASSWORD CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Admin Security & Password</h2>
            <p className="text-xs text-slate-500">Update the master administrative password for this console</p>
          </div>
        </div>

        {passwordMessage && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md transition-all ${
            passwordMessage.type === 'success' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-rose-600 text-white'
          }`}>
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passwordLoading ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
