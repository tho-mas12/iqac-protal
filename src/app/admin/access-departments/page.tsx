'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Building2,
  X,
  Lock
} from 'lucide-react';

export default function AccessDepartmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, dRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/departments'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDepartments(dData.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetPassword = async (deptId: string, deptName: string) => {
    if (!confirm(`Reset password to default "sjciqac" for "${deptName}"?`)) {
      return;
    }

    setResettingId(deptId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setFeedback({
        type: 'success',
        message: `Password for "${deptName}" successfully reset to default: sjciqac`,
      });

      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error resetting password' });
    } finally {
      setResettingId(null);
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.users && d.users[0]?.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={user?.name || 'Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Access Department Credentials"
          userName={user?.name}
          userRole="Admin"
        />

        <main className="p-6 md:p-8 space-y-6 flex-1">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Banner Notice */}
          <div className="bg-purple-50 border border-purple-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600 text-white rounded-2xl shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-base">
                  Standard Initial Password: <code className="font-mono bg-purple-200/80 px-2 py-0.5 rounded text-purple-950 font-extrabold text-sm">sjciqac</code>
                </h3>
                <p className="text-xs text-purple-700 mt-1 max-w-2xl">
                  Every registered department receives the default password <code className="font-bold">sjciqac</code> for their initial login. Upon logging in, departments can change their password from the Info page. You can reset any department&apos;s password back to <code className="font-bold">sjciqac</code> at any time below.
                </p>
              </div>
            </div>
          </div>

          {/* Department Access Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Department Accounts & Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage department passwords and login accounts</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading department accounts...
              </div>
            ) : filteredDepts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No matching department accounts found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Department & Shift</th>
                      <th className="px-4 py-4">Assigned Username</th>
                      <th className="px-4 py-4">Password Status</th>
                      <th className="px-4 py-4">Default Password</th>
                      <th className="px-6 py-4 text-right">Reset Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredDepts.map((dept) => {
                      const userAccount = dept.users && dept.users[0];
                      const isResetting = resettingId === dept.id;

                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{dept.name}</div>
                            <div className="text-xs text-purple-700 font-semibold">{dept.shift}</div>
                          </td>
                          <td className="px-4 py-4">
                            {userAccount ? (
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                {userAccount.username}
                              </span>
                            ) : (
                              <span className="text-xs text-rose-500 font-medium">No account created</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {userAccount?.isPasswordChanged ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Custom Password Set
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <Lock className="w-3 h-3" /> Using Default (sjciqac)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <code className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                              sjciqac
                            </code>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleResetPassword(dept.id, dept.name)}
                              disabled={isResetting}
                              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                              <span>{isResetting ? 'Resetting...' : 'Reset to sjciqac'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
