'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }

    // Also clear localStorage for AAA and Course Plan
    if (typeof window !== 'undefined') {
      localStorage.removeItem('IQAC_AUTH_USER');
      localStorage.removeItem('CP_AUTH_USER');
      // Delete cookies manually on client side as extra safeguard
      document.cookie = 'iqac_token=; Max-Age=0; path=/;';
      document.cookie = 'iqac_sso_token=; Max-Age=0; path=/;';
    }

    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600/80 hover:border-rose-500 text-slate-200 hover:text-white text-xs font-bold border border-white/15 transition cursor-pointer disabled:opacity-50"
      title="Sign Out of IQAC Ecosystem"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{loading ? 'Signing out...' : 'Sign Out'}</span>
    </button>
  );
}
