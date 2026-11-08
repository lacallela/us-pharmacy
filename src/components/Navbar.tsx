'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Pill, Sparkles, BarChart3, Search, Tag, PhoneCall, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  settings?: Record<string, string>;
}

export function Navbar({ settings }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const siteName = settings?.['site_name'] || 'RxMatch US';
  const announcement = settings?.['announcement_text'] || 'Save up to 90% on FDA-approved prescriptions at 65,000+ US pharmacies';
  const phone = settings?.['support_phone'] || '1-800-555-RXUSA';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/drugs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="sticky top-0 z-50 shadow-sm">
      
      {/* Top Announcement Bar */}
      {announcement && (
        <div className="bg-slate-900 text-slate-200 text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-between">
          <div className="hidden sm:block text-slate-400 font-mono text-[11px]">
            BIN: {settings?.['coupon_bin'] || '015995'} • PCN: {settings?.['coupon_pcn'] || 'GDC'}
          </div>
          <div className="mx-auto flex items-center gap-1.5 text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{announcement}</span>
          </div>
          {phone && (
            <div className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white font-bold text-[11px]">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  {siteName.includes(' ') ? (
                    <>
                      {siteName.split(' ')[0]} <span className="text-blue-600">{siteName.split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    siteName
                  )}
                  <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                    US
                  </span>
                </div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Prescription Savings
                </div>
              </div>
            </Link>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medications (e.g. Lipitor, Ozempic, Zoloft)..."
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm rounded-full pl-10 pr-4 py-2 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            </form>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/drugs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Tag className="w-4 h-4" />
                <span>Drug Catalog</span>
              </Link>

              <Link
                href="/compare/lipitor-vs-atorvastatin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Scale className="w-4 h-4" />
                <span>Compare</span>
              </Link>

              <Link
                href="/quiz"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Savings Screener</span>
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </nav>

          </div>
        </div>
      </header>

    </div>
  );
}
