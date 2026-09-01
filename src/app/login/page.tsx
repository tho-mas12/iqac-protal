'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, CheckCircle2, Shield, UserCheck, Briefcase } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirectUrl || '/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4 selection:bg-purple-600 selection:text-white">
      {/* Login Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.12)] border border-slate-100/80 p-8 sm:p-10 transition-all duration-300">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2a1b54] tracking-tight">
            IQAC Portal
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-semibold flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#6320ee] hover:bg-[#5215ce] active:bg-[#430fb3] text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('cs_shift1', 'sjciqac')}
              className="p-2 rounded-lg bg-purple-50/70 hover:bg-purple-100 text-purple-800 font-medium text-left border border-purple-100/80 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Dept (CS S1)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('director', 'director123')}
              className="p-2 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-medium text-left border border-indigo-100/80 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Director</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff', 'staff123')}
              className="p-2 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-medium text-left border border-emerald-100/80 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-left border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="truncate">Admin</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Default Department Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-700 font-mono font-semibold">sjciqac</code>
          </p>
        </div>
      </div>
    </div>
  );
}
