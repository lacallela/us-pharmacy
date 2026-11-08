'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Pill, 
  Building2, 
  Settings, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  adminName?: string;
  adminUsername?: string;
}

export function AdminNav({ adminName = 'Administrator', adminUsername = 'admin' }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      window.location.href = '/admin/login';
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard & Traffic', icon: BarChart3, exact: true },
    { href: '/admin/drugs', label: 'Medications Catalog', icon: Pill },
    { href: '/admin/pharmacies', label: 'Pharmacies & Affiliates', icon: Building2 },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-black text-lg tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow">
                Rx
              </span>
              <span>RxMatch <span className="text-blue-400">Admin</span></span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
              <ShieldCheck className="w-3 h-3" /> Secure Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Open public website in a new tab"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition disabled:opacity-50"
              title="Sign out of the admin panel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-800 py-2 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
