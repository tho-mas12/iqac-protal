'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Sparkles, ArrowRight, Building2 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { roleName: 'SUPER ADMIN', username: 'superadmin', role: 'SUPER_ADMIN', desc: 'Full System Access' },
  { roleName: 'IQAC ADMIN', username: 'iqac_admin', role: 'IQAC_ADMIN', desc: 'Verification & Quality Control' },
  { roleName: 'IQAC MEMBER', username: 'iqac_member', role: 'IQAC_MEMBER', desc: 'Requirements & Evaluation' },
  { roleName: 'PRINCIPAL', username: 'principal', role: 'PRINCIPAL', desc: 'Executive Dashboard & Audit' },
  { roleName: 'DEAN', username: 'school_dean', role: 'SCHOOL_DEAN', desc: 'School Level Performance' },
  { roleName: 'HOD COMMERCE', username: 'hod_commerce', role: 'HOD', desc: 'Department Workspace' },
  { roleName: 'DEPT COORDINATOR', username: 'dept_coord', role: 'DEPT_COORDINATOR', desc: 'Data Submission' },
  { roleName: 'FACULTY', username: 'faculty_user', role: 'FACULTY', desc: 'FDP & Pedagogy Submission' },
  { roleName: 'EXTERNAL AUDITOR', username: 'auditor', role: 'VIEWER', desc: 'Read-only Peer Review' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('iqac_admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('password123');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoUsername, password: 'password123' }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/30 mb-4">
          SJC
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">IQAC Quality Portal</h2>
        <p className="mt-1 text-xs text-indigo-400 font-medium">St. Joseph's College (Autonomous)</p>
        <p className="text-[11px] text-slate-400">Internal Quality Assurance Cell Compliance Management</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 p-8 shadow-2xl rounded-3xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your institutional username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar (All 9 Roles) */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">1-Click Demo Logins (9 Roles)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleDemoClick(acc.username)}
                  className="p-2 bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">
                    {acc.roleName}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
