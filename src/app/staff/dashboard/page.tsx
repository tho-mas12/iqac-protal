'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import MailComposerModal from '@/components/MailComposerModal';
import StatusStepper from '@/components/StatusStepper';
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
  CheckCheck,
  LayoutDashboard,
  Info,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import AnnouncementEditorModal from '@/components/AnnouncementEditorModal';
import { exportToExcel, printReport, ExportColumn } from '@/lib/export-utils';

type StaffTab = 'overview' | 'pending_action' | 'pending_director' | 'completed';

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<StaffTab>('overview');
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

  // View, Mail, Detail & Announcement Modal states
  const [viewingInv, setViewingInv] = useState<any | null>(null);
  const [detailInv, setDetailInv] = useState<any | null>(null);
  const [mailingInv, setMailingInv] = useState<any | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  // Read URL search params on mount or popstate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as StaffTab;
      if (tab && ['overview', 'pending_action', 'pending_director', 'completed'].includes(tab)) {
        setCurrentTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tab: StaffTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const url = tab === 'overview' ? '/staff/dashboard' : `/staff/dashboard?tab=${tab}`;
      window.history.pushState(null, '', url);
    }
  };

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
      header: 'Director Status',
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
    exportToExcel(`IQAC_Administrator_${currentTab}_Report`, exportColumns, dataWithIndex);
  };

  const handlePrintPdf = () => {
    const dataWithIndex = filteredInvitations.map((inv, idx) => ({ ...inv, sno: idx + 1 }));
    const titleMap: Record<StaffTab, string> = {
      overview: 'Administrator Dashboard & History Report',
      pending_action: 'Pending ERP Mail Dispatch & Hard Copy Queue',
      pending_director: 'Under Director Review Queue',
      completed: 'Completed & Dispatched Archive',
    };
    printReport(
      titleMap[currentTab] || 'IQAC Administrator Report',
      'St. Joseph\'s College (Autonomous) • Central IQAC Office Operations',
      exportColumns,
      dataWithIndex
    );
  };

  const fetchData = useCallback(async (tabToFetch = currentTab) => {
    try {
      setLoading(true);
      const filterParam = tabToFetch === 'overview' ? '' : `staffFilter=${tabToFetch}`;
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/invitations${filterParam ? `?${filterParam}` : ''}`),
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

  // Combined Action: Mark Hard Copy Received
  const handleToggleHardCopy = async (inv: any) => {
    setUpdatingId(inv.id);
    try {
      const isCurrentlyReceived = Boolean(inv.hardCopyReceived);
      const res = await fetch(`/api/invitations/${inv.id}/hard-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: !isCurrentlyReceived }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update hard copy status');
      }

      if (!isCurrentlyReceived) {
        setToast({
          type: 'success',
          message: 'Hard copy marked as Received! Click "Send Mail to ERP" to dispatch.',
        });
      } else {
        setToast({
          type: 'info',
          message: 'Hard copy status reset to pending.',
        });
      }

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
      <Sidebar role="ADMINISTRATOR" userName={user?.name || 'IQAC Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Administrator Dashboard" userName={user?.name} userRole="Administrator" />

        {/* Dynamic Pop-up Toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Send Mail to ERP Modal */}
        <MailComposerModal
          isOpen={Boolean(mailingInv)}
          onClose={() => setMailingInv(null)}
          invitation={mailingInv}
          onMailSentSuccess={() => {
            fetchData(currentTab);
            setToast({
              type: 'success',
              message: 'Official circular mail recorded as dispatched to ERP!',
            });
          }}
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <StatCard
              title="Mail Dispatch Queue"
              value={stats.staffPendingActions}
              icon={Inbox}
              variant="yellow"
              subtitle="Director Approved • Awaiting ERP"
            />
            <StatCard
              title="Under Director Review"
              value={stats.pending}
              icon={Hourglass}
              variant="purple"
              subtitle="Pending Director Decision"
            />
            <StatCard
              title="Dispatched & Completed"
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
                {/* 1. Dashboard & Actions */}
                <button
                  type="button"
                  onClick={() => handleTabChange('overview')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'overview'
                      ? 'bg-[#26648E] text-white shadow-md shadow-[#26648E]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard & Actions</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      currentTab === 'overview'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {stats.total}
                  </span>
                </button>

                {/* 2. Mail Dispatch (Send Mail to ERP) */}
                <button
                  type="button"
                  onClick={() => handleTabChange('pending_action')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'pending_action'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mail Dispatch (ERP)</span>
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

                {/* 3. Under Director Review */}
                <button
                  type="button"
                  onClick={() => handleTabChange('pending_director')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    currentTab === 'pending_director'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  <span>Under Director Review</span>
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

                {/* 4. Completed Archive */}
                <button
                  type="button"
                  onClick={() => handleTabChange('completed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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

            {/* Contextual Tab Banner */}
            {currentTab === 'pending_action' && (
              <div className="px-6 py-3.5 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-b border-amber-200/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-900 font-medium">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-black shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold">Official ERP Mail Dispatch Desk:</span> All circulars approved by the Director appear here. Verify hard copy receipt and click <strong className="text-blue-700 font-black">"Send Mail to ERP"</strong> to transmit publication notification to ERP (<code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-mono">sjcerp@mail.sjctni.edu</code>).
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'overview' && (
              <div className="px-6 py-3.5 bg-gradient-to-r from-[#26648E]/5 via-white to-[#4F8FC0]/5 border-b border-slate-200/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-[#26648E]/10 flex items-center justify-center text-[#26648E] font-black shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#26648E]">History & Recent Activity:</span> Track recent submissions across all 4 stages: <span className="font-bold">1. Dept Submission</span> → <span className="font-bold">2. Director Approval</span> → <span className="font-bold">3. Hard Copy Receipt</span> → <span className="font-bold">4. ERP Mail Dispatch</span>.
                  </div>
                </div>
              </div>
            )}

            {/* Search Input Filter */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by title, department, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#26648E]/20 focus:border-[#26648E] transition"
                />
              </div>
            </div>

            {/* Content Body */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
                <RotateCw className="w-6 h-6 animate-spin text-[#26648E]" />
                <span className="text-xs">Loading invitation records...</span>
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-700 text-sm">No records found</h3>
                <p className="text-slate-400 text-xs mt-1">
                  {currentTab === 'pending_action'
                    ? 'No approved circulars are pending Administrator hard-copy marking or ERP dispatch.'
                    : currentTab === 'pending_director'
                    ? 'All submitted department invitations have been reviewed by the Director.'
                    : currentTab === 'completed'
                    ? 'Dispatched and completed event records will appear here.'
                    : 'No invitation submissions found in the portal.'}
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
                        <th className="py-3.5 px-4">Director Status</th>
                        {currentTab === 'overview' ? (
                          <>
                            <th className="py-3.5 px-4">Workflow Stages</th>
                            <th className="py-3.5 px-4 text-center">Recent Activity</th>
                          </>
                        ) : (
                          <>
                            <th className="py-3.5 px-4 text-center">Hard Copy Receipt</th>
                            <th className="py-3.5 px-4 text-center">ERP Publication Mail</th>
                          </>
                        )}
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
                            ) : inv.status === 'REMARKS' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Revision Requested
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Clock className="w-3 h-3 text-purple-600" />
                                Awaiting Director Review
                              </span>
                            )}
                          </td>

                          {/* OVERVIEW TAB: Workflow Stages & Recent Details */}
                          {currentTab === 'overview' ? (
                            <>
                              <td className="py-3.5 px-4">
                                <StatusStepper
                                  status={inv.status}
                                  createdAt={inv.createdAt}
                                  approvedAt={inv.approvedAt}
                                  remarkedAt={inv.remarkedAt}
                                  hardCopyReceived={Boolean(inv.hardCopyReceived)}
                                  hardCopyReceivedAt={inv.hardCopyReceivedAt}
                                  mailSent={Boolean(inv.mailSent)}
                                  mailSentAt={inv.mailSentAt}
                                  variant="compact"
                                />
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {inv.mailSent ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                    Dispatched to ERP ({new Date(inv.mailSentAt || inv.updatedAt).toLocaleDateString()})
                                  </span>
                                ) : inv.hardCopyReceived ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                    Hard copy in office • Pending ERP
                                  </span>
                                ) : inv.status === 'APPROVED' ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                                    Ready for ERP Dispatch
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">
                                    Submitted {new Date(inv.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Hard Copy Status & Toggle */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {inv.status === 'APPROVED' ? (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHardCopy(inv)}
                                      disabled={updatingId === inv.id}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                                        inv.hardCopyReceived
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                          : 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm'
                                      }`}
                                      title={
                                        inv.hardCopyReceived
                                          ? `Marked by ${inv.hardCopyStaffName || 'Staff'}. Click to reset to Pending`
                                          : 'Click to mark physical hard copy as received in IQAC office'
                                      }
                                    >
                                      {updatingId === inv.id ? (
                                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : inv.hardCopyReceived ? (
                                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                                      ) : (
                                        <Inbox className="w-3.5 h-3.5" />
                                      )}
                                      <span>{inv.hardCopyReceived ? 'Received ✓' : 'Mark Hard Copy Received'}</span>
                                    </button>
                                    {inv.hardCopyStaffName && (
                                      <div className="text-[9px] text-slate-400 mt-0.5">By {inv.hardCopyStaffName}</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Pending Approval</span>
                                )}
                              </td>

                              {/* ERP Mail Status & Explicit Dispatch Action */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {inv.status === 'APPROVED' ? (
                                  <div className="flex flex-col items-center gap-1">
                                    {inv.mailSent ? (
                                      <>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                                          Sent to ERP ✓
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setMailingInv(inv)}
                                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <Mail className="w-3 h-3" />
                                          <span>Resend / View Mail</span>
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setMailingInv(inv)}
                                          className="px-3.5 py-1.5 rounded-xl font-black text-xs bg-[#26648E] hover:bg-[#1f5072] text-white flex items-center gap-1.5 shadow-md shadow-[#26648E]/25 transition-all transform hover:scale-105 cursor-pointer animate-pulse"
                                          title="Open ERP Mail Composer and dispatch official circular"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                          <span>Send Mail to ERP</span>
                                        </button>
                                        <span className="text-[9.5px] text-amber-700 font-bold">Pending Dispatch</span>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Pending Approval</span>
                                )}
                              </td>
                            </>
                          )}

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Send Mail to ERP if on overview and approved and not sent */}
                              {currentTab === 'overview' && inv.status === 'APPROVED' && !inv.mailSent && (
                                <button
                                  type="button"
                                  onClick={() => setMailingInv(inv)}
                                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
                                  title="Dispatch Circular to ERP"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send to ERP</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setDetailInv(inv)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer text-[11px]"
                                title="View detailed history and audit stages"
                              >
                                <Info className="w-3 h-3 text-[#26648E]" />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewingInv(inv)}
                                className="px-3 py-1.5 bg-[#26648E] hover:bg-[#1f5072] text-white font-bold rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer text-xs"
                                title="View Poster Preview"
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
                                <ExternalLink className="w-3.5 h-3.5" />
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
                    <div key={inv.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{inv.programTitle}</h4>
                          <p className="text-xs text-purple-700 font-semibold mt-0.5">
                            {inv.department?.name || 'Department'} ({inv.shift})
                          </p>
                          <span className="inline-block mt-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">
                            {inv.category}
                          </span>
                        </div>
                        {inv.status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            In Review
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(inv.fromDate).toLocaleDateString()}
                          {inv.toDate && ` - ${new Date(inv.toDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      {/* Stages / Action */}
                      {inv.status === 'APPROVED' && (
                        <div className="pt-2 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleHardCopy(inv)}
                            disabled={updatingId === inv.id}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                              inv.hardCopyReceived
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-400 text-slate-950 font-black'
                            }`}
                          >
                            {updatingId === inv.id ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{inv.hardCopyReceived ? 'Hard Copy Received ✓' : 'Mark Hard Copy Received'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setMailingInv(inv)}
                            className="w-full py-2 px-3 rounded-xl text-xs font-black bg-[#26648E] text-white flex items-center justify-center gap-1.5 shadow"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{inv.mailSent ? 'Resend Mail to ERP' : 'Send Mail to ERP'}</span>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        <button
                          onClick={() => setDetailInv(inv)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
                        >
                          <Info className="w-3 h-3 text-[#26648E]" />
                          <span>Details</span>
                        </button>

                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => setViewingInv(inv)}
                            className="px-3.5 py-1.5 bg-[#26648E] text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            View Poster
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

      {/* Detail & History Modal */}
      {detailInv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            <div className="px-6 py-4 bg-[#26648E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">{detailInv.programTitle}</h3>
                <p className="text-xs text-blue-100">
                  {detailInv.department?.name} ({detailInv.shift}) • {detailInv.category}
                </p>
              </div>
              <button
                onClick={() => setDetailInv(null)}
                className="text-blue-100 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Full 4-Stage Workflow Progress */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#26648E]" />
                  <span>Workflow Progress Stages</span>
                </h4>
                <StatusStepper
                  status={detailInv.status}
                  createdAt={detailInv.createdAt}
                  approvedAt={detailInv.approvedAt}
                  remarkedAt={detailInv.remarkedAt}
                  hardCopyReceived={Boolean(detailInv.hardCopyReceived)}
                  hardCopyReceivedAt={detailInv.hardCopyReceivedAt}
                  mailSent={Boolean(detailInv.mailSent)}
                  mailSentAt={detailInv.mailSentAt}
                  variant="horizontal"
                />
              </div>

              {/* Event Metadata Breakdown */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Event Dates</span>
                  <span className="font-bold text-slate-900">
                    {new Date(detailInv.fromDate).toLocaleDateString()}{' '}
                    {detailInv.toDate && `to ${new Date(detailInv.toDate).toLocaleDateString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Submitted Date</span>
                  <span className="font-bold text-slate-900">
                    {new Date(detailInv.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Hard Copy Status</span>
                  <span className={detailInv.hardCopyReceived ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {detailInv.hardCopyReceived ? `Received by ${detailInv.hardCopyStaffName || 'Office'}` : 'Pending Hard Copy Delivery'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">ERP Publication Mail</span>
                  <span className={detailInv.mailSent ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {detailInv.mailSent ? `Dispatched (${new Date(detailInv.mailSentAt || detailInv.updatedAt).toLocaleDateString()})` : 'Pending Dispatch'}
                  </span>
                </div>
              </div>

              {/* Quick Actions inside detail modal */}
              {detailInv.status === 'APPROVED' && !detailInv.mailSent && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-amber-900 text-xs">Ready for ERP Dispatch</h5>
                    <p className="text-[11px] text-amber-700">Director has approved this event. You can transmit circular to ERP right now.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailInv(null);
                      setMailingInv(detailInv);
                    }}
                    className="px-4 py-2 bg-[#26648E] hover:bg-[#1f5072] text-white font-black rounded-xl text-xs shadow flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Mail to ERP</span>
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingInv(detailInv);
                  setDetailInv(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Poster</span>
              </button>
              <button
                onClick={() => setDetailInv(null)}
                className="px-4 py-2 bg-[#26648E] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff View Modal */}
      {viewingInv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            <div className="px-6 py-4 bg-[#26648E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{viewingInv.programTitle}</h3>
                <p className="text-xs text-blue-100">
                  {viewingInv.department?.name} ({viewingInv.shift}) • {viewingInv.category}
                </p>
              </div>
              <button
                onClick={() => setViewingInv(null)}
                className="text-blue-100 hover:text-white p-1 rounded-lg cursor-pointer"
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
                className="px-4 py-2 bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
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
