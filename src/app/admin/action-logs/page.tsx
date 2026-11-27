'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  LogIn,
  LogOut,
  Clock,
  Globe,
  Database,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface ActionLogItem {
  id: string;
  timestamp: string;
  actorId?: string | null;
  username: string;
  role: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | string;
  module: 'AAA' | 'COURSE_PLAN' | 'INVITATIONS' | 'USERS' | 'SETTINGS' | 'AUTH' | 'GENERAL' | string;
  targetId?: string | null;
  targetName?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export default function ActionLogsPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<ActionLogItem[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({
    TOTAL: 0,
    CREATE: 0,
    READ: 0,
    UPDATE: 0,
    DELETE: 0,
    LOGIN: 0,
    LOGOUT: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setToast({ type, message });
  };

  const fetchLogs = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', targetPage.toString());
      params.set('limit', '50');

      if (selectedAction !== 'ALL') params.set('action', selectedAction);
      if (selectedModule !== 'ALL') params.set('module', selectedModule);
      if (search.trim()) params.set('search', search.trim());
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);

      const res = await fetch(`/api/admin/action-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch action logs');
      }

      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        setPage(data.pagination?.page || targetPage);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Unable to load activity logs.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedAction, selectedModule, search, fromDate, toDate]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});

    fetchLogs(1);
  }, [fetchLogs]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (selectedAction !== 'ALL') params.set('action', selectedAction);
    if (selectedModule !== 'ALL') params.set('module', selectedModule);
    if (search.trim()) params.set('search', search.trim());
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    params.set('export', 'csv');

    window.open(`/api/admin/action-logs?${params.toString()}`, '_blank');
    showToast('info', 'Generating CSV activity export. Download starting...');
  };

  const getActionBadge = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3.5 h-3.5" />
            CREATE
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Eye className="w-3.5 h-3.5" />
            READ
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Edit3 className="w-3.5 h-3.5" />
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-3.5 h-3.5" />
            DELETE
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <LogIn className="w-3.5 h-3.5" />
            LOGIN
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <LogOut className="w-3.5 h-3.5" />
            LOGOUT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Activity className="w-3.5 h-3.5" />
            {action}
          </span>
        );
    }
  };

  const getModuleBadge = (module: string) => {
    const m = (module || 'GENERAL').toUpperCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (m === 'AAA') bg = 'bg-blue-50 text-blue-800 border-blue-200';
    else if (m === 'COURSE_PLAN') bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    else if (m === 'INVITATIONS') bg = 'bg-purple-50 text-purple-800 border-purple-200';
    else if (m === 'USERS') bg = 'bg-amber-50 text-amber-800 border-amber-200';
    else if (m === 'SETTINGS') bg = 'bg-cyan-50 text-cyan-800 border-cyan-200';
    else if (m === 'AUTH') bg = 'bg-rose-50 text-rose-800 border-rose-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${bg}`}>
        <Layers className="w-3 h-3 opacity-60" />
        {m}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#faf8f2] text-slate-800 font-sans antialiased overflow-hidden selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Action Logs & Audit Trail"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-[#4F8FC0]/20 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26648E] to-[#4F8FC0] text-white flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#26648E] tracking-tight">
                    Portal Action Logs & Audit Trail
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Comprehensive chronological record of CRUD operations, authentication, and administrative activities.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fetchLogs(1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-xs"
                title="Refresh log entries"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#26648E]' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5275] text-white text-xs font-bold flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
                title="Export filtered logs as CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged</span>
              <span className="text-xl font-black text-[#26648E] mt-0.5 block">{stats.TOTAL || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Creates</span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block">{stats.CREATE || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-sky-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">Reads</span>
              <span className="text-xl font-black text-sky-700 mt-0.5 block">{stats.READ || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-amber-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Updates</span>
              <span className="text-xl font-black text-amber-700 mt-0.5 block">{stats.UPDATE || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-rose-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Deletes</span>
              <span className="text-xl font-black text-rose-700 mt-0.5 block">{stats.DELETE || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-purple-200/80 p-3.5 shadow-xs">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Logins</span>
              <span className="text-xl font-black text-purple-700 mt-0.5 block">{stats.LOGIN || 0}</span>
            </div>
          </div>

          {/* Filtering and Search Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Box */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
                  placeholder="Search by username, IP address, target or action details..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-slate-50/50"
                />
              </div>

              {/* Module Filter */}
              <div>
                <select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white"
                >
                  <option value="ALL">All Modules</option>
                  <option value="AAA">Academic Audit (AAA)</option>
                  <option value="COURSE_PLAN">Course Plan</option>
                  <option value="INVITATIONS">Invitations</option>
                  <option value="USERS">Access & Users</option>
                  <option value="SETTINGS">Settings</option>
                  <option value="AUTH">Authentication</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none"
                  title="From date"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none"
                  title="To date"
                />
              </div>
            </div>

            {/* Action Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Action:
              </span>
              {['ALL', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => {
                    setSelectedAction(act);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedAction === act
                      ? 'bg-[#26648E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Action Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-3 w-40 whitespace-nowrap">Timestamp</th>
                    <th className="p-3 whitespace-nowrap min-w-[140px]">Actor (User)</th>
                    <th className="p-3 w-28 whitespace-nowrap">Action</th>
                    <th className="p-3 w-32 whitespace-nowrap">Module</th>
                    <th className="p-3 min-w-[320px]">Event Details</th>
                    <th className="p-3 w-36 whitespace-nowrap">Client IP & Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#26648E]" />
                        <span className="text-xs font-medium">Loading activity audit log records...</span>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <span className="text-sm font-bold text-slate-600 block">No action logs found</span>
                        <span className="text-xs text-slate-400 mt-1 block">
                          Try adjusting search filters or selecting &apos;All Actions&apos;.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const dateObj = new Date(log.timestamp);
                      const timeStr = dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      const dateStr = dateObj.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          {/* Timestamp */}
                          <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{timeStr}</div>
                            <div className="text-[10px] text-slate-400">{dateStr}</div>
                          </td>

                          {/* Actor */}
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                                {log.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-mono font-bold text-slate-900 block leading-tight">
                                  {log.username}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                                  {log.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Action Badge */}
                          <td className="p-3 whitespace-nowrap">{getActionBadge(log.action)}</td>

                          {/* Module Badge */}
                          <td className="p-3 whitespace-nowrap">{getModuleBadge(log.module)}</td>

                          {/* Details */}
                          <td className="p-3 text-slate-800">
                            {log.targetName && (
                              <span className="font-bold text-[#26648E] mr-1.5 inline-block">
                                [{log.targetName}]
                              </span>
                            )}
                            <span className="font-normal text-slate-700 leading-relaxed">
                              {log.details || 'Activity event recorded.'}
                            </span>
                          </td>

                          {/* Network & Client Info */}
                          <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>{log.ipAddress || '127.0.0.1'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.userAgent || ''}>
                              {log.userAgent || 'Unknown'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Showing {logs.length} of {totalCount} total activities (Page {page} of {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => fetchLogs(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => fetchLogs(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
