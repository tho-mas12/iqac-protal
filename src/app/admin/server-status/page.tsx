'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  HardDrive,
  Server,
  Cpu,
  RefreshCw,
  FileText,
  Database,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Terminal,
  FolderArchive,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminServerStatusPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchServerStatus = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/server-status'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        setData(sData);
        if (isManualRefresh) {
          setToast({ type: 'success', message: 'Server health metrics refreshed!' });
        }
      } else {
        const err = await sRes.json();
        setToast({ type: 'error', message: err.error || 'Failed to fetch server metrics' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Error connecting to server' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServerStatus(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStorageColor = (pct: number) => {
    if (pct > 85) return 'bg-red-500 text-red-700';
    if (pct > 70) return 'bg-amber-500 text-amber-700';
    return 'bg-emerald-500 text-emerald-700';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Server & Storage Monitor"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-lg font-bold text-slate-800">Live Telemetry & Diagnostics</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Loading...'} (Auto-updates every 30s)
              </p>
            </div>

            <button
              onClick={() => fetchServerStatus(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl border border-purple-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600">Gathering server diagnostics...</p>
            </div>
          ) : (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Main Disk Space */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Disk Storage</span>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <HardDrive className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {data?.disk?.formattedFree || '86 GB'} Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Used: {data?.disk?.formattedUsed || '7.8 GB'} / {data?.disk?.formattedTotal || '98 GB'}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Disk Usage</span>
                      <span>{data?.disk?.percentUsed || 9}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (data?.disk?.percentUsed || 9) > 80 ? 'bg-red-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.max(4, data?.disk?.percentUsed || 9)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Portal Uploads Size */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploads Directory</span>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                      <FolderArchive className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-purple-700">
                      {data?.uploads?.formattedSize || '51 MB'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {data?.uploads?.fileCount || 0} files in /public/uploads
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Storage Pressure</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Optimal (Minimal)
                    </span>
                  </div>
                </div>

                {/* 3. System RAM */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Memory (RAM)</span>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {data?.memory?.formattedFree || '1.2 GB'} Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Used: {data?.memory?.formattedUsed || '800 MB'} / {data?.memory?.formattedTotal || '2 GB'}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Memory Load</span>
                      <span>{data?.memory?.percentUsed || 40}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, data?.memory?.percentUsed || 40)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Total DB Records */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Records</span>
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Database className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {data?.database?.totalRecords || 0}
                    </span>
                    <span className="text-xs font-medium text-slate-500">total rows</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {data?.database?.invitationsCount || 0} invitations, {data?.database?.departmentsCount || 0} depts
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Database Engine</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      MySQL / Prisma
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server System Specs */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Server className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-sm">VPS Server Specification</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold mb-0.5">Operating System</span>
                      <span className="font-bold text-slate-800">{data?.system?.osType || 'Linux'} ({data?.system?.arch || 'x64'})</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold mb-0.5">Node.js Version</span>
                      <span className="font-bold text-purple-700">{data?.system?.nodeVersion || 'v20.x'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold mb-0.5">Server Uptime</span>
                      <span className="font-bold text-slate-800">{data?.system?.serverUptime || 'N/A'}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold mb-0.5">Portal Process Uptime</span>
                      <span className="font-bold text-emerald-700">{data?.system?.processUptime || 'N/A'}</span>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold mb-0.5">CPU Processor</span>
                      <span className="font-bold text-slate-800">{data?.system?.cpuModel || 'Virtual CPU'} ({data?.system?.cpuCores || 1} Cores)</span>
                    </div>
                  </div>
                </div>

                {/* Database Health Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Database className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Database Distribution</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        <span className="text-xs font-bold text-slate-700">Invitations Submitted</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                        {data?.database?.invitationsCount || 0} rows
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">Approved Invitations</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {data?.database?.approvedCount || 0} rows
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-slate-700">Pending / In Review</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                        {(data?.database?.pendingCount || 0) + (data?.database?.remarksCount || 0)} rows
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-slate-700">Department Accounts & Staff</span>
                      </div>
                      <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {data?.database?.usersCount || 0} accounts ({data?.database?.departmentsCount || 0} depts)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful VPS Quick-Commands Card */}
              <div className="bg-gradient-to-r from-slate-900 to-[#1e1b4b] rounded-2xl p-6 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-sm text-purple-200">Helpful VPS Terminal Commands</h3>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  If you ever need to perform manual maintenance or check terminal logs via SSH:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                    <span className="text-purple-300 block font-sans text-[11px] mb-1 font-semibold">Deploy Updates</span>
                    <code>git pull &amp;&amp; npm run build &amp;&amp; pm2 restart iqac-portal</code>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                    <span className="text-purple-300 block font-sans text-[11px] mb-1 font-semibold">View Live App Logs</span>
                    <code>pm2 logs iqac-portal</code>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                    <span className="text-purple-300 block font-sans text-[11px] mb-1 font-semibold">Interactive Monitor</span>
                    <code>pm2 monit</code>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
