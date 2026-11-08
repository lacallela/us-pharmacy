'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, ShieldCheck, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      
      {/* Container */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/25 mb-2">
            <Pill className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            RxMatch US Admin Portal
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage catalog, affiliate links, and monetization parameters
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100 space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Login successful! Loading dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium text-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Default Access Credentials:
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] bg-white px-2 py-1 rounded border border-slate-200">
              <span>Username: <strong className="text-slate-800">admin</strong></span>
              <span>Password: <strong className="text-slate-800">admin12345</strong></span>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">
            ← Return to Public Rx Website
          </Link>
        </div>

      </div>

    </div>
  );
}
