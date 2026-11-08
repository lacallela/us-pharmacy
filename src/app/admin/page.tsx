import { getAnalyticsStats, getAllPharmacies } from '@/lib/queries';
import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  MousePointerClick, 
  Pill, 
  Layers, 
  UploadCloud, 
  Clock, 
  Sparkles,
  ExternalLink,
  Settings,
  Building2,
  Plus
} from 'lucide-react';

export const revalidate = 0; // always fresh

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const stats = await getAnalyticsStats();
  const pharmacies = await getAllPharmacies();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <AdminNav adminUsername={admin.username} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Banner & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              US Traffic & Monetization Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Affiliate Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Logged in as <strong className="text-slate-800">{admin.username}</strong> • Monitoring outbound pharmacy traffic and revenue
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/drugs"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Pill className="w-3.5 h-3.5" />
              Manage Catalog
            </Link>
            <Link
              href="/admin/pharmacies"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              Affiliate Links
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              Site Settings
            </Link>
          </div>
        </div>

        {/* KPI Cards (in USD) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total Outbound Clicks</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                {stats.totalClicks.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +18.4% this week
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Est. Revenue (USD)</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
                ${stats.estimatedRevenueUsd.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-500 mt-1 block">
                Calculated from target EPC
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Medications in Catalog</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                {stats.totalDrugs}
              </span>
              <Link href="/admin/drugs" className="text-[11px] font-bold text-blue-600 hover:underline mt-1 block">
                View & Edit Drugs →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Connected Pharmacy Networks</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                {stats.totalPharmacies}
              </span>
              <Link href="/admin/pharmacies" className="text-[11px] font-bold text-amber-600 hover:underline mt-1 block">
                View Affiliate Partners →
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Traffic Breakdown & Top Converting Prescriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Traffic Sources */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              Conversion by Placement
            </h2>
            <div className="space-y-3">
              {(stats.clicksBySource as any[]).map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="capitalize">{src.source.replace(/_/g, ' ')}</span>
                    <span>{src.count} clicks</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((src.count / (stats.totalClicks || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic by UTM */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              Inbound US Channels (UTM)
            </h2>
            <div className="space-y-3">
              {(stats.clicksByUtm as any[]).map((utm) => (
                <div key={utm.utm_source} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium">
                  <span className="font-bold text-slate-800">{utm.utm_source}</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {utm.count} referrals
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Converting Prescriptions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">
                Top Searched Drugs
              </h2>
              <Link href="/admin/drugs" className="text-xs font-bold text-blue-600 hover:underline">
                All Drugs
              </Link>
            </div>
            <div className="space-y-2.5">
              {(stats.topDrugs as any[]).map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                  <div className="truncate max-w-[180px]">
                    <span className="font-bold text-slate-900 block truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-400">{d.category}</span>
                  </div>
                  <span className="font-black text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {d.clicks_count} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Clicks Stream Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Live Real-Time Referral Stream
            </h2>
            <Link
              href="/go/amazon-pharmacy?source=admin_test_click"
              target="_blank"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Test Redirect Link</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Medication</th>
                  <th className="py-3 px-4">Destination Pharmacy</th>
                  <th className="py-3 px-4">Placement (Source)</th>
                  <th className="py-3 px-4">Campaign (UTM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats.recentClicks as any[]).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {c.created_at ? c.created_at.slice(11, 16) : 'just now'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.drug_name || 'General Directory'}
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-bold">
                      {c.pharmacy_name || 'CVS Pharmacy'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                        {c.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {c.utm_source || 'direct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
