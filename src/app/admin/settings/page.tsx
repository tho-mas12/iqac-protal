'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Settings,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Layers,
  Database,
  Info,
  Server,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<{
    developmentMode: boolean;
    activeYear: string;
    academicYears: string[];
    updatedAt?: string;
    updatedBy?: string;
  }>({
    developmentMode: false,
    activeYear: '2026 - 2027',
    academicYears: ['2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028'],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/settings'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData);
      } else {
        setToast({ type: 'error', message: 'Failed to fetch system settings' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleDevMode = async () => {
    const nextMode = !settings.developmentMode;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developmentMode: nextMode }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setToast({
          type: 'success',
          message: nextMode
            ? 'Development Mode enabled. Non-admin logins are now paused.'
            : 'Development Mode disabled. Normal user logins restored.',
        });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to toggle Development Mode' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Network error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetActiveYear = async (year: string) => {
    if (year === settings.activeYear) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeYear: year }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setToast({
          type: 'success',
          message: `Active Academic Year switched to "${year}". Historical data preserved.`,
        });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to switch academic year' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Network error updating active year' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newYearInput.trim();
    if (!formatted) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-year', year: formatted }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setNewYearInput('');
        setToast({ type: 'success', message: data.message });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to add academic year' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Network error adding year' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteYear = async (year: string) => {
    if (year === settings.activeYear) {
      setToast({
        type: 'error',
        message: `Cannot delete the currently active academic year (${year}). Switch to another year first.`,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${year}" from the available academic years list?`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-year', year }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setToast({ type: 'success', message: data.message });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to delete academic year' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Network error deleting year' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header
          title="System Settings & Governance"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-2xl p-5 border border-[#4F8FC0]/25 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-[#26648E] font-crest">
                    IQAC System Configuration
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Global platform maintenance modes and multi-year academic data segmentation
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchSettings}
              disabled={loading || saving}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/30 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ========================================================== */}
            {/* 1. DEVELOPMENT / MAINTENANCE MODE MODULE                   */}
            {/* ========================================================== */}
            <div className="bg-white rounded-3xl p-6 border border-[#4F8FC0]/25 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Development Mode (Maintenance)
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        Restrict portal access during system maintenance
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      settings.developmentMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {settings.developmentMode ? 'DEVELOPMENT MODE ON' : 'PRODUCTION LIVE'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  When Development Mode is turned <strong>ON</strong>, general faculty, staff, and department members cannot log in. Anyone attempting to log in will receive an alert notice. College Administrators retain full console access to make updates.
                </p>

                {/* State Banner */}
                {settings.developmentMode ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs font-medium space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Maintenance Lock Active for Non-Admins</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      Non-admin login attempts show: <em>&ldquo;The site is currently in development work. Please wait for the admin to enable access.&rdquo;</em>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 text-xs font-medium space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Platform Fully Accessible</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      Faculty, HODs, Directors, and Staff can authenticate and submit records normally.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Toggle Platform Maintenance:
                </span>
                <button
                  type="button"
                  onClick={handleToggleDevMode}
                  disabled={saving}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs ${
                    settings.developmentMode
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {settings.developmentMode ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span>Switch to Production Live</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span>Enable Development Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================== */}
            {/* 2. ACTIVE ACADEMIC YEAR GOVERNANCE                         */}
            {/* ========================================================== */}
            <div className="bg-white rounded-3xl p-6 border border-[#4F8FC0]/25 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-[#26648E] border border-blue-200">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Academic Year Governance
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        Global operational year for Course Plans, AAA, and Invitations
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FFE3B3] text-[#26648E] border border-[#fedba0]">
                    Active: {settings.activeYear}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#26648E] to-[#4F8FC0] text-white shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                      Current Active Academic Session
                    </span>
                    <span className="text-2xl font-black font-crest tracking-tight">
                      {settings.activeYear}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                </div>

                {/* Add Academic Year Form */}
                <form onSubmit={handleAddYear} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    placeholder="e.g. 2027 - 2028"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E]"
                  />
                  <button
                    type="submit"
                    disabled={saving || !newYearInput.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Year</span>
                  </button>
                </form>

                {/* Year List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Available Academic Sessions:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {settings.academicYears.map((yr) => {
                      const isActive = yr === settings.activeYear;
                      return (
                        <div
                          key={yr}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                            isActive
                              ? 'bg-blue-50/80 border-[#26648E] shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-800 block truncate">
                              {yr}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                isActive ? 'text-[#26648E]' : 'text-slate-400'
                              }`}
                            >
                              {isActive ? 'Current Active Year' : 'Historical Data'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleSetActiveYear(yr)}
                                disabled={saving}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#26648E] text-[#26648E] hover:text-white border border-[#4F8FC0]/30 text-[10px] font-bold transition cursor-pointer shadow-2xs"
                                title={`Set ${yr} as active year`}
                              >
                                Set Active
                              </button>
                            )}
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleDeleteYear(yr)}
                                disabled={saving}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title={`Delete ${yr}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Multi-Year Data Integrity Note */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 font-medium">
                <Info className="w-4 h-4 text-[#4F8FC0] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Data Loss Guarantee:</strong> Submissions are tagged by academic year in the database. Changing the active year resets new submission forms to empty, while switching back instantly restores all historical data and audit history.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
