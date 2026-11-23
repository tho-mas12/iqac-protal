'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Lock, ArrowRight, ExternalLink, Calendar, AlertTriangle, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';
import frontierLogo from '../../../public/frontierwox-logo.jpg';
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

      window.location.href = data.redirectUrl || '/department/dashboard';
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
    <div className="relative min-h-screen gradient-bg flex flex-col items-center justify-center p-4 selection:bg-purple-600 selection:text-white overflow-hidden font-sans">
      {/* College Background Image Overlay with subtle transparency */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image
          src={collegeBg}
          alt="St. Joseph's College"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover opacity-25 pointer-events-none select-none"
        />
      </div>

      {/* Dark/Gradient Vignette for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-slate-900/15 pointer-events-none" />

      {/* Top Navigation Menu: Course Plan & AAA */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
        {/* Course Plan 2026 - 2027 (Even) Direct Form */}
        <a
          href="/course-plan/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/95 hover:bg-white text-slate-800 hover:text-indigo-600 font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/80 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span>Course Plan Form</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </a>

        {/* AAA 2026 - 2027 Link */}
        <a
          href="/AAA/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/95 hover:bg-white text-slate-800 hover:text-[#6320ee] font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/80 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <span>AAA 2026 - 2027</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#6320ee] transition-colors" />
        </a>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-slate-100/90 p-8 sm:p-10 transition-all duration-300">
        
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
              Username / User ID <span className="text-purple-600 font-bold text-[10px] uppercase">(Caps Only)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                placeholder="ENTER USER ID (E.G. CS_SHIFT1, ADMIN)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white font-mono uppercase font-bold tracking-wider"
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
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white font-medium"
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
      </div>

      {/* Bottom Right FrontierWox Branding: Powered by on top, Logo below */}
      <div className="sm:fixed sm:bottom-4 sm:right-4 mt-6 sm:mt-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 transition-all hover:shadow-xl hover:scale-[1.02] z-20">
        <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 mb-1.5 leading-none">
          Powered by
        </span>
        <div className="w-36 sm:w-44 h-auto relative flex items-center justify-center py-0.5">
          <Image
            src={frontierLogo}
            alt="FrontierWox Tech Private Limited"
            className="w-full h-auto object-contain"
            priority
            quality={100}
          />
        </div>
      </div>

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