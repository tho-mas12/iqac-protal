'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, ArrowRight, Eye, EyeOff, BookOpen, FileCheck2, Award, ExternalLink } from 'lucide-react';
import frontierLogo from '../../../public/frontierwox-logo.jpg';
import collegeBg from '../../../public/college-bg.jpg';
import sjcLogo from '../../../public/sjc-logo.png';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both Staff Code / Username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid Staff Code, username, or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-3 sm:p-6 lg:p-8 relative selection:bg-indigo-600 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pointer-events-none" />

      {/* Top Application Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 flex items-center justify-center shrink-0">
            <Image src={sjcLogo} alt="St. Joseph's College Logo" className="h-full w-auto object-contain drop-shadow" priority />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-amber-300 uppercase">
              Internal Quality Assurance Cell (IQAC)
            </div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white">
              St. Joseph’s College (Autonomous) • Tiruchirappalli
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/course-plan/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-white/15 transition-all"
          >
            <span>User Manual</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Container: 2-Panel Split View */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-4 sm:py-6 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-2xl shadow-black/40 border border-slate-200/90 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
          
          {/* Left Panel: Historic Campus Image (5 cols) */}
          <div className="md:col-span-5 relative overflow-hidden min-h-[260px] md:min-h-full bg-slate-950 flex flex-col justify-end">
            <Image
              src={collegeBg}
              alt="St. Joseph's College Historic Campus Building"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center filter saturate-105"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />

            {/* Bottom Caption on Image */}
            <div className="relative z-10 p-6 sm:p-8 text-white space-y-2 pointer-events-none">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/25 text-[10px] font-black uppercase tracking-widest text-amber-300">
                Estd. 1844
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                St. Joseph’s College
              </h2>
              <p className="text-xs font-semibold text-slate-200 drop-shadow">
                Autonomous • Tiruchirappalli – 620 002
              </p>
              <div className="pt-2 border-t border-white/20 flex flex-wrap gap-2 text-[10.5px] text-slate-300 font-medium">
                <span>Special Heritage Status (UGC)</span>
                <span>•</span>
                <span>NAAC A++ Grade</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Unified Sign In Form (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
            <div className="space-y-6">
              
              {/* Form Title & Subtitle */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black uppercase tracking-wider mb-2">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Unified Digital Ecosystem</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Sign In to Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Enter your Staff Code or administrative credentials to access your course plans, invitations, and audit metrics.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-shake">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Staff Code / Username */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Staff Code or Username <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">e.g. 24CAI51</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      id="login-username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Staff Code (e.g. 24CAI51) or Username"
                      className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">ERP password</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-indigo-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    id="login-submit-btn"
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 hover:from-indigo-800 hover:to-blue-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Unified Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Integrated Pillars Summary */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Single Sign-On (SSO) Integrated Modules
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 mx-auto" />
                    <div className="text-[10px] font-extrabold text-slate-800">Course Plan</div>
                    <div className="text-[9px] text-slate-400">Even Sem 2026–27</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600 mx-auto" />
                    <div className="text-[10px] font-extrabold text-slate-800">Invitations</div>
                    <div className="text-[9px] text-slate-400">Event Compliance</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
                    <div className="text-[10px] font-extrabold text-slate-800">AAA Audit</div>
                    <div className="text-[9px] text-slate-400">MQC & Department</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance and Manual Links */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>St. Joseph’s College (Autonomous), Tiruchirappalli</span>
              <a
                href="/course-plan/manual.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1"
              >
                <span>Comprehensive Manual</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
        <div className="text-[11px] text-slate-400">
          © 2026 Internal Quality Assurance Cell (IQAC), St. Joseph’s College. All rights reserved.
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Powered by</span>
          <div className="w-24 h-auto relative flex items-center">
            <Image src={frontierLogo} alt="FrontierWox" className="w-full h-auto object-contain brightness-95" priority />
          </div>
        </div>
      </footer>
    </div>
  );
}
