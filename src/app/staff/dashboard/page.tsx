'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import MailComposerModal from '@/components/MailComposerModal';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Eye,
  Calendar,
  Building2,
  RotateCw,
  Search,
  Check,
  X,
  FileText,
  Mail,
  Send,
  Sparkles,
  Megaphone,
  FileSpreadsheet,
  Printer,
  Inbox,
  Hourglass,
  Archive,
  CheckCheck
} from 'lucide-react';
import AnnouncementEditorModal from '@/components/AnnouncementEditorModal';
import { exportToExcel, printReport, ExportColumn } from '@/lib/export-utils';

type StaffTab = 'pending_action' | 'pending_director' | 'completed';

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<StaffTab>('pending_action');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    remarks: 0,
    approved: 0,
    staffPendingActions: 0,
    staffCompletedCount: 0,
  });
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // View, Mail & Announcement Modal states
  const [viewingInv, setViewingInv] = useState<any | null>(null);
  const [mailingInv, setMailingInv] = useState<any | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  const exportColumns: ExportColumn[] = [
    { header: 'S.No', key: 'sno' },
    { header: 'Program Title', key: 'programTitle' },
    {
      header: 'Department',
      key: 'department',
      format: (_val, item) => `${item.department?.name || 'Department'} (${item.shift || 'Shift I'})`,
    },
    { header: 'Category', key: 'category' },
    {
      header: 'Event Date(s)',
      key: 'fromDate',
      format: (_val, item) =>
        `${new Date(item.fromDate).toLocaleDateString()}${item.toDate ? ` to ${new Date(item.toDate).toLocaleDateString()}` : ''}`,
    },
    {
      header: 'Status',
      key: 'status',
      format: (val) => val || '-',
    },
    {
      header: 'Hard Copy Received',
      key: 'hardCopyReceived',
      format: (val) => (val ? 'Received' : 'Pending'),
    },
    { header: 'Hard Copy Marked By', key: 'hardCopyStaffName', format: (val) => val || '-' },
    { header: 'ERP Mail Status', key: 'mailSent', format: (val) => (val ? 'Sent to ERP' : 'Pending') },
    {
      header: 'ERP Mail Sent At',
      key: 'mailSentAt',
      format: (val) => (val ? new Date(val).toLocaleString() : '-'),
    },
  ];

  const handleExportExcel = () => {
    const dataWithIndex = filteredInvitations.map((inv, idx) => ({ ...inv, sno: idx + 1 }));
    exportToExcel(`IQAC_Staff_${currentTab}_Report`, exportColumns, dataWithIndex);
  };

  const handlePrintPdf = () => {
    const dataWithIndex = filteredInvitations.map((inv, idx) => ({ ...inv, sno: idx + 1 }));
    printReport(
      `IQAC Staff Report - ${currentTab === 'pending_action' ? 'Pending Actions' : currentTab === 'pending_director' ? 'Under Director Review' : 'Completed Archive'}`,
      'St. Joseph\'s College (Autonomous) • IQAC Documentation & ERP Record',
      exportColumns,
      dataWithIndex
    );
  };

  const fetchData = useCallback(async (tabToFetch = currentTab) => {
    try {
      setLoading(true);
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/invitations?staffFilter=${tabToFetch}`),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setInvitations(iData.invitations || []);
        if (iData.stats) {
          setStats(iData.stats);
        }
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load invitations' });
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  useEffect(() => {
    fetchData(currentTab);
  }, [currentTab, fetchData]);

  // Combined 1-Click Action: Mark Hard Copy Received AND Auto-Send/Mark ERP Mail
  const handleReceiveHardCopyAndSendMail = async (invId: string, currentHardCopyStatus: boolean) => {
    setUpdatingId(invId);

    try {
      const res = await fetch(`/api/invitations/${invId}/hard-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: !currentHardCopyStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update hard copy status');
      }

      setToast({
        type: 'success',
        message: !currentHardCopyStatus
          ? 'Hard copy received & publication automatically marked as Sent to ERP!'
          : 'Hard copy status reset to pending.',
      });

      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating status' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInvitations = invitations.filter(
    (i) =>
      i.programTitle?.toLowerCase().includes(search.toLowerCase()) ||
      i.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="STAFF" userName={user?.name || 'IQAC Staff'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Staff Dashboard" userName={user?.name} userRole="Staff" />

        {/* Dynamic Pop-up Toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Send Mail to ERP Modal */}
        <MailComposerModal
          isOpen={Boolean(mailingInv)}
          onClose={() => setMailingInv(null)}
          invitation={mailingInv}
          onMailSentSuccess={() => fetchData(currentTab)}
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <StatCard
              title="Pending Staff Actions"
              value={stats.staffPendingActions}
              icon={Inbox}
              variant="yellow"
              subtitle="Awaiting Hard Copy / ERP"
            />
            <StatCard
              title="Under Director Review"
              value={stats.pending}
              icon={Hourglass}
              variant="purple"
              subtitle="View only (Pending approval)"
            />
            <StatCard
              title="Completed / Dispatched"
              value={stats.staffCompletedCount}
              icon={CheckCheck}
              variant="green"
              subtitle="Hard Copy & ERP Sent"
            />
            <StatCard
              title="Total Submissions"
              value={stats.total}
              icon={Layers}
              variant="blue"
              subtitle="All portal records"
            />
          </div>

          {/* Table Container with Fast Tab Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            {/* Top Toolbar: Tabs & Announcement */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-b from-white to-slate-50/50">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 overflow-x-auto w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentTab('pending_action')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'pending_action'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Pending Staff Actions</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      currentTab === 'pending_action'
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {stats.staffPendingActions}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('pending_director')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'pending_director'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  <span>Under Director Review (View Only)</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      currentTab === 'pending_director'
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {stats.pending}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('completed')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Completed Archive</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      currentTab === 'completed'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {stats.staffCompletedCount}
                  </span>
                </button>
              </div>

              {/* Action Buttons: Refresh, Announcements & Exports */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
                  title="Edit scrolling announcement banner"
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0" />
                  <span>Edit Notice</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Export records to Excel spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Print summary PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Print PDF</span>
                </button>

                <button
                  onClick={() => fetchData(currentTab)}
                  disabled={loading}
                  className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                  title="Refresh Queue"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, department, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 transition shadow-inner"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold shrink-0">
                Showing <span className="font-bold text-slate-900">{filteredInvitations.length}</span> record{filteredInvitations.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Empty State */}
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-semibold">Loading data...</p>
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  {currentTab === 'pending_action' ? (
                    <CheckCheck className="w-8 h-8 text-emerald-500" />
                  ) : currentTab === 'pending_director' ? (
                    <Hourglass className="w-8 h-8 text-purple-400" />
                  ) : (
                    <Archive className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {currentTab === 'pending_action'
                    ? 'All Caught Up! No Pending Staff Actions'
                    : currentTab === 'pending_director'
                    ? 'No Invitations Currently Under Director Review'
                    : 'No Completed Dispatches Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {currentTab === 'pending_action'
                    ? 'All approved event invitations have hard copies received and publication emails dispatched to ERP.'
                    : currentTab === 'pending_director'
                    ? 'All submitted department invitations have been reviewed by the Director.'
                    : 'Dispatched and completed event records will appear here.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Responsive Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 w-12 text-center">#</th>
                        <th className="py-3.5 px-4">Program &amp; Department</th>
                        <th className="py-3.5 px-4">Event Date</th>
                        <th className="py-3.5 px-4">Status / Approval</th>
                        <th className="py-3.5 px-4 text-center">Hard Copy Receipt</th>
                        <th className="py-3.5 px-4 text-center">ERP Publication Mail</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvitations.map((inv, idx) => (
                        <tr
                          key={inv.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            currentTab === 'pending_action' && !inv.hardCopyReceived
                              ? 'bg-amber-50/30'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>

                          {/* Program Title & Department */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 max-w-xs truncate" title={inv.programTitle}>
                              {inv.programTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-purple-700">{inv.department?.name || 'Department'}</span>
                              <span>•</span>
                              <span className="text-slate-600">{inv.shift}</span>
                              <span>•</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-medium">
                                {inv.category}
                              </span>
                            </div>
                          </td>

                          {/* Event Dates */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {new Date(inv.fromDate).toLocaleDateString()}
                            </div>
                            {inv.toDate && (
                              <div className="text-[10px] text-slate-400">
                                to {new Date(inv.toDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>

                          {/* Status / Approval Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {inv.status === 'APPROVED' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Director Approved
                                </span>
                                {inv.approvedAt && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {new Date(inv.approvedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Clock className="w-3 h-3 text-purple-600" />
                                Awaiting Director Review
                              </span>
                            )}
                          </td>

                          {/* Hard Copy Status & Toggle */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {inv.status === 'APPROVED' ? (
                              <button
                                type="button"
                                onClick={() => handleReceiveHardCopyAndSendMail(inv.id, inv.hardCopyReceived)}
                                disabled={updatingId === inv.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
                                  inv.hardCopyReceived
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border border-amber-400 animate-pulse'
                                }`}
                                title={
                                  inv.hardCopyReceived
                                    ? `Marked by ${inv.hardCopyStaffName || 'Staff'}. Click to reset to Pending`
                                    : 'Click to mark Hard Copy as Received (automatically dispatches ERP mail)'
                                }
                              >
                                {updatingId === inv.id ? (
                                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                ) : inv.hardCopyReceived ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <Inbox className="w-3.5 h-3.5 text-slate-950" />
                                )}
                                <span>{inv.hardCopyReceived ? 'Received ✓' : 'Mark Received & Send'}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Pending Approval</span>
                            )}
                            {inv.hardCopyStaffName && (
                              <div className="text-[9px] text-slate-400 mt-0.5">By {inv.hardCopyStaffName}</div>
                            )}
                          </td>

                          {/* ERP Mail Status & Manual Composer */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {inv.status === 'APPROVED' ? (
                              <div className="flex flex-col items-center gap-1">
                                {inv.mailSent ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                                    Sent to ERP ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    Pending Dispatch
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setMailingInv(inv)}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Open Mail Composer</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Pending Approval</span>
                            )}
                          </td>

                          {/* Actions: View Poster */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingInv(inv)}
                                className="px-3 py-1.5 bg-[#6320ee] hover:bg-[#5218cc] text-white font-bold rounded-xl flex items-center gap-1 transition shadow cursor-pointer text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <a
                                href={`/api/invitations/${inv.id}/file?rev=${inv.revisionCount || 0}&t=${inv.updatedAt ? new Date(inv.updatedAt).getTime() : Date.now()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                                title="Open full poster in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredInvitations.map((inv) => (
                    <div key={inv.id} className="p-4 space-y-3 bg-white">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{inv.programTitle}</h4>
                          {inv.status === 'APPROVED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 shrink-0">
                              Under Review
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {inv.department?.name} ({inv.shift}) • {inv.category}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Date</span>
                          <span className="font-medium text-slate-700">{new Date(inv.fromDate).toLocaleDateString()}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">ERP Mail</span>
                          <span className={inv.mailSent ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            {inv.mailSent ? 'Sent to ERP ✓' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {inv.status === 'APPROVED' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleReceiveHardCopyAndSendMail(inv.id, inv.hardCopyReceived)}
                            disabled={updatingId === inv.id}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                              inv.hardCopyReceived
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow'
                            }`}
                          >
                            {updatingId === inv.id ? (
                              <RotateCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>{inv.hardCopyReceived ? 'Hard Copy Received ✓' : 'Mark Hard Copy Received & Send to ERP'}</span>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        {inv.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => setMailingInv(inv)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Composer</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => setViewingInv(inv)}
                            className="px-3.5 py-1.5 bg-[#6320ee] text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            View
                          </button>
                          <a
                            href={`/api/invitations/${inv.id}/file?rev=${inv.revisionCount || 0}&t=${inv.updatedAt ? new Date(inv.updatedAt).getTime() : Date.now()}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-100 rounded-xl text-slate-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Staff View Modal */}
      {viewingInv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            <div className="px-6 py-4 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{viewingInv.programTitle}</h3>
                <p className="text-xs text-purple-200">
                  {viewingInv.department?.name} ({viewingInv.shift}) • {viewingInv.category}
                </p>
              </div>
              <button
                onClick={() => setViewingInv(null)}
                className="text-purple-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/invitations/${viewingInv.id}/file?rev=${viewingInv.revisionCount || 0}&t=${viewingInv.updatedAt ? new Date(viewingInv.updatedAt).getTime() : Date.now()}`}
                  alt={viewingInv.programTitle}
                  className="max-h-[400px] w-auto object-contain rounded-lg"
                  onError={(e) => {
                    if (viewingInv.driveViewLink && viewingInv.driveViewLink.startsWith('http')) {
                      (e.target as HTMLImageElement).src = viewingInv.driveViewLink;
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase">Event Dates</span>
                  <span>
                    {new Date(viewingInv.fromDate).toLocaleDateString()}{' '}
                    {viewingInv.toDate && `to ${new Date(viewingInv.toDate).toLocaleDateString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Hard Copy Status</span>
                  <span className={viewingInv.hardCopyReceived ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {viewingInv.hardCopyReceived ? 'Received ✓' : 'Pending Physical Delivery'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/api/invitations/${viewingInv.id}/file?rev=${viewingInv.revisionCount || 0}&t=${viewingInv.updatedAt ? new Date(viewingInv.updatedAt).getTime() : Date.now()}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>View Full Image / File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setViewingInv(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Editor Modal */}
      <AnnouncementEditorModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />
    </div>
  );
}
