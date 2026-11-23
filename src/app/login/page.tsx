'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles, AlertTriangle, X, LogOut } from 'lucide-react';
import sjcLogo from '../../../public/sjc-logo.png';
import collegeBg from '../../../public/college-bg.jpg';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionConflictModal, setSessionConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  const executeLogin = async (forceSignout = false) => {
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
        body: JSON.stringify({
          username: username.trim().toUpperCase(),
          password,
          forceSignout,
        }),
      });

      const data = await res.json();

      if (data.sessionConflict) {
        setConflictMessage(data.message || 'This account is currently active on another device or browser.');
        setSessionConflictModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSessionConflictModal(false);

      // Store Single Sign-On (SSO) credentials in localStorage for sub-platforms (AAA and Course Plan)
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem(
          'IQAC_SSO_USER',
          JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            name: data.user.name,
            role: data.user.role,
            invitationRole: data.user.invitationRole,
            sessionId: data.user.sessionId,
            isHod: data.user.isHod,
            isMqc: data.user.isMqc,
            department: data.user.department,
            loggedInAt: new Date().toISOString(),
          })
        );
      }

      window.location.href = data.redirectUrl || '/hub';
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(false);
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f2] flex flex-col items-center justify-center p-4 selection:bg-[#4F8FC0]/20 selection:text-[#26648E] overflow-hidden font-sans">
      {/* Arctic Frost Aura Gradient Background Layers (Matching AAA styles) */}
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      {/* College Background Image with gentle overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <Image
          src={collegeBg}
          alt="St. Joseph's College"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover opacity-[0.06] select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-[#f8fafc]/80" />
      </div>

      {/* Login Card Container with AAA Academic Theme */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(38,100,142,0.12)] border border-[#4F8FC0]/30 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(38,100,142,0.18)] animate-fadeIn">
        {/* Institutional Crest and Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-20 rounded-2xl bg-gradient-to-b from-[#f0f5f9] via-white to-[#FFE3B3]/35 border border-[#4F8FC0]/35 flex items-center justify-center p-2 shadow-2xs mb-3.5 transform hover:scale-105 transition-transform duration-200">
            <Image
              src={sjcLogo}
              alt="St. Joseph's College Crest"
              className="h-14 w-auto object-contain drop-shadow-xs"
              priority
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#26648E] font-crest tracking-tight">
            St. Joseph&apos;s College
          </h1>
          <p className="text-xs font-bold text-slate-700 mt-0.5">
            (Autonomous) • Tiruchirappalli - 620 002
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE3B3] text-[#26648E] border border-[#fedba0] text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#26648E]" />
            <span>IQAC Central SSO Gateway</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
              User ID / Staff Code <span className="text-[#4F8FC0] font-black uppercase text-[10px]">(Caps Only)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#4F8FC0]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                placeholder="ENTER USER ID (E.G. ADMIN, CS_SHIFT1)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition-all bg-white font-mono uppercase font-bold tracking-wider"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#4F8FC0]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition-all bg-white font-medium"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#26648E] hover:bg-[#1f5072] active:bg-[#163850] text-white font-extrabold rounded-xl shadow-md shadow-[#26648E]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Unified Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info within Card */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1 text-[#26648E]">
            <Sparkles className="w-3.5 h-3.5 text-[#53D2DC]" />
            <span>AAA • Invitation • Course Plan</span>
          </span>
          <span className="text-slate-400">Estd. 1844</span>
        </div>
      </div>

      {/* Institutional Footer */}
      <footer className="relative z-10 mt-6 text-center text-xs font-semibold text-slate-500 max-w-md px-4">
        <p>Internal Quality Assurance Cell (IQAC)</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          St. Joseph&apos;s College (Autonomous), Tiruchirappalli - 620 002
        </p>
      </footer>
      {/* Session Lock Conflict Modal Popup */}
      {sessionConflictModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-10 sm:pt-20 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-200 text-center space-y-4 mb-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 font-crest">
                Session Active Elsewhere
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {conflictMessage || `User ID "${username.toUpperCase()}" is currently active on another device or browser. To prevent conflicts, only one login is permitted at a time.`}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] font-bold text-amber-900 text-left space-y-1">
              <div>⚠️ Logging in here will automatically sign out the previous session.</div>
              <div>🔒 All unsaved drafts on the other session will be safely closed.</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSessionConflictModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeLogin(true)}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing out...' : 'Sign Out Other & Log In'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
