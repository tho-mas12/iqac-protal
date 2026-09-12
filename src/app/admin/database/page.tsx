'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Database,
  Search,
  RefreshCw,
  Download,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const TABLES = [
  { id: 'invitations', label: 'Invitations', icon: FileText, desc: 'Events, submissions, files & reviews' },
  { id: 'departments', label: 'Departments', icon: Building2, desc: 'College departments & shifts' },
  { id: 'users', label: 'Users & Roles', icon: Users, desc: 'Login accounts & credentials' },
  { id: 'history', label: 'Audit History', icon: History, desc: 'Submission & review lifecycle logs' },
  { id: 'settings', label: 'System Settings', icon: Settings, desc: 'Notification & portal configurations' },
];

export default function AdminDatabasePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTable, setActiveTable] = useState('invitations');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 20 });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modals
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [deletingRecord, setDeletingRecord] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTableData = async (tbl = activeTable, pg = page, search = searchTerm, isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        table: tbl,
        page: pg.toString(),
        limit: '20',
        search: search.trim(),
      });

      const res = await fetch(`/api/admin/database?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setPagination(data.pagination || { total: 0, totalPages: 1, limit: 20 });
        if (isManual) setToast({ type: 'success', message: `${TABLES.find(t => t.id === tbl)?.label} reloaded!` });
      } else {
        const err = await res.json();
        setToast({ type: 'error', message: err.error || 'Failed to fetch table records' });
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Error connecting to database' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchTableData(activeTable, 1, searchTerm);
  }, [activeTable]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTableData(activeTable, 1, searchTerm);
  };

  const handleExportCsv = () => {
    window.open(`/api/admin/database/export?table=${activeTable}`, '_blank');
  };

  const openEditModal = (rec: any) => {
    setEditingRecord(rec);
    const initial: any = { ...rec };
    if (activeTable === 'users') {
      initial.password = ''; // Leave blank to keep existing
    }
    setEditFormData(initial);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: activeTable,
          id: editingRecord.id,
          data: editFormData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'Record updated successfully!' });
        setEditingRecord(null);
        fetchTableData(activeTable, page, searchTerm);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to update record' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating record' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/database?table=${activeTable}&id=${deletingRecord.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'Record deleted successfully!' });
        setDeletingRecord(null);
        fetchTableData(activeTable, page, searchTerm);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to delete record' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error deleting record' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Database Table Explorer"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Table Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TABLES.map((t) => {
              const Icon = t.icon;
              const isActive = activeTable === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTable(t.id);
                    setSearchTerm('');
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/25 scale-[1.02]'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <span className="font-bold text-xs">{t.label}</span>
                  </div>
                  <span className={`text-[11px] leading-tight ${isActive ? 'text-purple-100' : 'text-slate-400'}`}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Control & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search records in ${TABLES.find(t => t.id === activeTable)?.label}...`}
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    fetchTableData(activeTable, 1, '');
                  }}
                  className="absolute right-12 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Find
              </button>
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTableData(activeTable, page, searchTerm, true)}
                disabled={refreshing || loading}
                title="Reload table"
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-300" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Showing <strong className="text-slate-800">{records.length}</strong> of{' '}
                <strong className="text-slate-800">{pagination.total}</strong> records in{' '}
                <strong className="text-purple-700">{TABLES.find(t => t.id === activeTable)?.label}</strong>
              </span>
              <span>Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <RefreshCw className="w-7 h-7 text-purple-600 animate-spin mb-2" />
                  <p className="text-xs text-slate-500">Loading table records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Database className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-600">No records found</p>
                  <p className="text-xs text-slate-400">Try adjusting your search query</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {activeTable === 'invitations' && (
                        <>
                          <th className="py-3 px-4">Title &amp; Category</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Event Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Workflow Flags</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </>
                      )}
                      {activeTable === 'departments' && (
                        <>
                          <th className="py-3 px-4">Name &amp; Code</th>
                          <th className="py-3 px-4">Shift</th>
                          <th className="py-3 px-4">Active</th>
                          <th className="py-3 px-4">Counts</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </>
                      )}
                      {activeTable === 'users' && (
                        <>
                          <th className="py-3 px-4">Name &amp; Username</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </>
                      )}
                      {activeTable === 'history' && (
                        <>
                          <th className="py-3 px-4">Action &amp; Actor</th>
                          <th className="py-3 px-4">Event Title</th>
                          <th className="py-3 px-4">Notes</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </>
                      )}
                      {activeTable === 'settings' && (
                        <>
                          <th className="py-3 px-4">Setting ID</th>
                          <th className="py-3 px-4">Updated At</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        {activeTable === 'invitations' && (
                          <>
                            <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                              <span className="block truncate">{r.programTitle}</span>
                              <span className="text-[10px] font-normal text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                {r.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {r.department?.name || 'N/A'} ({r.shift})
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {r.fromDate ? new Date(r.fromDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  r.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'REMARKS'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[11px] space-x-1">
                              <span className={`px-1.5 py-0.5 rounded font-medium ${r.hardCopyReceived ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                HC: {r.hardCopyReceived ? 'YES' : 'NO'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded font-medium ${r.mailSent ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                Mail: {r.mailSent ? 'YES' : 'NO'}
                              </span>
                            </td>
                          </>
                        )}

                        {activeTable === 'departments' && (
                          <>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <span>{r.name}</span>
                              <span className="block text-[11px] font-mono text-slate-400">{r.code}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-600">{r.shift}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {r._count?.invitations || 0} invites, {r._count?.users || 0} users
                            </td>
                          </>
                        )}

                        {activeTable === 'users' && (
                          <>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <span>{r.name}</span>
                              <span className="block text-[11px] font-mono text-purple-600">@{r.username}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">
                                {r.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{r.department?.name || '—'}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {r.isActive ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </td>
                          </>
                        )}

                        {activeTable === 'history' && (
                          <>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <span className="inline-flex px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold text-[10px] mr-2">
                                {r.action}
                              </span>
                              <span>{r.actorName} ({r.actorRole})</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                              {r.invitation?.programTitle || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{r.notes || '—'}</td>
                            <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                              {r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}
                            </td>
                          </>
                        )}

                        {activeTable === 'settings' && (
                          <>
                            <td className="py-3.5 px-4 font-mono text-purple-700">{r.id}</td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}
                            </td>
                          </>
                        )}

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setViewingRecord(r)}
                              title="View Raw Details"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(r)}
                              title="Edit Record"
                              className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-700 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {activeTable !== 'settings' && (
                              <button
                                onClick={() => setDeletingRecord(r)}
                                title="Delete Record"
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  onClick={() => {
                    const p = Math.max(1, page - 1);
                    setPage(p);
                    fetchTableData(activeTable, p, searchTerm);
                  }}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="text-xs font-semibold text-slate-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => {
                    const p = Math.min(pagination.totalPages, page + 1);
                    setPage(p);
                    fetchTableData(activeTable, p, searchTerm);
                  }}
                  disabled={page >= pagination.totalPages || loading}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW RECORD MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">Record Inspection</h3>
              </div>
              <button onClick={() => setViewingRecord(null)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs bg-slate-900 text-slate-200">
              <pre className="whitespace-pre-wrap">{JSON.stringify(viewingRecord, null, 2)}</pre>
            </div>
            <div className="p-3.5 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">Edit Record ({activeTable})</h3>
              </div>
              <button onClick={() => setEditingRecord(null)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {activeTable === 'invitations' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Program Title</label>
                    <input
                      type="text"
                      value={editFormData.programTitle || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, programTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600/30"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Shift</label>
                      <select
                        value={editFormData.shift || 'Shift I'}
                        onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="Shift I">Shift I</option>
                        <option value="Shift II">Shift II</option>
                        <option value="Units">Units</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Workflow Status</label>
                      <select
                        value={editFormData.status || 'PENDING'}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="REMARKS">REMARKS</option>
                        <option value="APPROVED">APPROVED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Revision Count</label>
                      <input
                        type="number"
                        value={editFormData.revisionCount ?? 0}
                        onChange={(e) => setEditFormData({ ...editFormData, revisionCount: parseInt(e.target.value) || 0 })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Director Remarks</label>
                    <textarea
                      value={editFormData.directorRemarks || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, directorRemarks: e.target.value })}
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editFormData.hardCopyReceived)}
                        onChange={(e) => setEditFormData({ ...editFormData, hardCopyReceived: e.target.checked })}
                        className="rounded text-purple-600"
                      />
                      <span>Hard Copy Received</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editFormData.mailSent)}
                        onChange={(e) => setEditFormData({ ...editFormData, mailSent: e.target.checked })}
                        className="rounded text-purple-600"
                      />
                      <span>ERP Mail Sent</span>
                    </label>
                  </div>
                </>
              )}

              {activeTable === 'departments' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Code</label>
                      <input
                        type="text"
                        value={editFormData.code || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Shift</label>
                      <select
                        value={editFormData.shift || 'Shift I'}
                        onChange={(e) => setEditFormData({ ...editFormData, shift: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="Shift I">Shift I</option>
                        <option value="Shift II">Shift II</option>
                        <option value="Units">Units</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Google Drive Folder ID</label>
                    <input
                      type="text"
                      value={editFormData.driveFolderId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, driveFolderId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={Boolean(editFormData.isActive)}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Active Status</span>
                  </label>
                </>
              )}

              {activeTable === 'users' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editFormData.username || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Role</label>
                      <select
                        value={editFormData.role || 'DEPARTMENT'}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      >
                        <option value="DEPARTMENT">DEPARTMENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="DIRECTOR">DIRECTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      New Password <span className="text-slate-400 font-normal">(Leave empty to keep current)</span>
                    </label>
                    <input
                      type="password"
                      value={editFormData.password || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      placeholder="Enter new password to reset"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={Boolean(editFormData.isActive)}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Account Active</span>
                  </label>
                </>
              )}

              {activeTable === 'history' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Action</label>
                    <input
                      type="text"
                      value={editFormData.action || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, action: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Actor Name</label>
                      <input
                        type="text"
                        value={editFormData.actorName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, actorName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Actor Role</label>
                      <input
                        type="text"
                        value={editFormData.actorRole || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, actorRole: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={editFormData.notes || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </>
              )}

              <div className="p-4 -mx-5 -mb-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this record from{' '}
                <strong className="text-slate-800">{activeTable}</strong>?
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 text-xs text-slate-700 font-mono break-all text-left">
                ID: {deletingRecord.id}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
