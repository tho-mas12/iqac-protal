'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles, AlertTriangle, LogOut, Eye, EyeOff } from 'lucide-react';
import sjcLogo from '../../../public/sjc-logo.png';
import collegeBg from '../../../public/college-bg.jpg';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server communication error. Please try again.' };
      }

      if (data.sessionConflict) {
        setConflictMessage(data.message || 'This account is currently active on another device or browser.');
        setSessionConflictModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid username or password');
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

      {/* Login Card Container with AAA Academic Theme - NO TOP REDIRECT LINKS */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(38,100,142,0.12)] border border-[#4F8FC0]/30 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(38,100,142,0.18)] animate-fadeIn">
        {/* Institutional Crest and Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2 transform hover:scale-105 transition-transform duration-200">
            <Image
              src={sjcLogo}
              alt="St. Joseph's College Crest"
              className="h-24 w-auto object-contain drop-shadow-md"
              priority
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#26648E] font-crest tracking-tight">
            ST. JOSEPH&apos;S COLLEGE
          </h1>
          <p className="text-xs font-bold text-slate-700 mt-1">
            (Autonomous)
          </p>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            Tiruchirappalli - 620 002
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-semibold flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
              Faculty ID ( ERP )
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#4F8FC0]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition-all bg-white font-mono uppercase font-bold tracking-wider"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition-all bg-white font-medium"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-[#26648E] focus:outline-none cursor-pointer transition-colors"
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                <span>Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
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
