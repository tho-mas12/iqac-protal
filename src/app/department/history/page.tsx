'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Archive,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  Calendar,
  Building2,
  RotateCw,
  FileText,
  FileSpreadsheet,
  Printer,
  X,
  Sparkles,
  Download,
  Filter,
  CheckCheck
} from 'lucide-react';
import { exportToExcel, printReport, ExportColumn } from '@/lib/export-utils';
import StatusStepper from '@/components/StatusStepper';

export default function InvitationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [academicYearFilter, setAcademicYearFilter] = useState('ALL');
  const [selectedInv, setSelectedInv] = useState<any | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const exportColumns: ExportColumn[] = [
    { header: 'S.No', key: 'sno' },
    { header: 'Department', key: 'department', format: (_val, item) => item.department?.name || 'Department' },
    { header: 'Program Title', key: 'programTitle' },
    { header: 'Category', key: 'category' },
    { header: 'Event Date', key: 'fromDate', format: (val) => new Date(val).toLocaleDateString() },
    { header: 'Status', key: 'status' },
    { header: 'Director Remarks', key: 'remarks', format: (val) => val || 'None' },
    { header: 'Submitted At', key: 'createdAt', format: (val) => new Date(val).toLocaleDateString() },
  ];

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const [uRes, invRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      } else if (typeof window !== 'undefined') {
        const ssoRaw = localStorage.getItem('IQAC_SSO_USER');
        if (ssoRaw) {
          try {
            setUser(JSON.parse(ssoRaw));
          } catch (e) {}
        }
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvitations(invData.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching invitation history:', err);
      setToast({ type: 'error', message: 'Failed to load invitation history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const academicYears = Array.from(
    new Set(
      invitations.map((inv) => {
        const yr = new Date(inv.fromDate || inv.createdAt).getFullYear();
        return `${yr}–${yr + 1}`;
      })
    )
  );

  const filteredInvitations = invitations.filter((inv) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.programTitle?.toLowerCase().includes(q) ||
      inv.category?.toLowerCase().includes(q) ||
      inv.venue?.toLowerCase().includes(q) ||
      inv.department?.name?.toLowerCase().includes(q) ||
      inv.resourcePersons?.some((r: any) => r.name?.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' ||
      inv.status === statusFilter ||
      (statusFilter === 'COMPLETED' && (inv.staffPendingActions === false || inv.status === 'APPROVED'));

    const invYear = (() => {
      const yr = new Date(inv.fromDate || inv.createdAt).getFullYear();
      return `${yr}–${yr + 1}`;
    })();

    const matchesYear = academicYearFilter === 'ALL' || invYear === academicYearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const totalCount = invitations.length;
  const approvedCount = invitations.filter((i) => i.status === 'APPROVED').length;
  const pendingCount = invitations.filter((i) => i.status === 'PENDING').length;
  const remarksCount = invitations.filter((i) => i.status === 'REMARKS').length;

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      <Sidebar
        role={user?.role || 'STAFF'}
        userName={user?.name}
        departmentName={user?.department?.name}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header
          title="History of Invitations"
          userName={user?.name}
          userRole={user?.role || 'Staff'}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="academic-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                    <Archive className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-black text-[#26648E] font-crest tracking-tight">
                    Archived &amp; Historical Invitation Registry
                  </h2>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-semibold">
                  Comprehensive audit trail of all event invitations, approval decisions, Director remarks, and dispatch milestones recorded across all academic terms.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    exportToExcel(
                      `IQAC_Invitations_History_${new Date().toISOString().split('T')[0]}`,
                      exportColumns,
                      filteredInvitations
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#4F8FC0]/25 hover:border-[#26648E] text-[#26648E] font-black text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() =>
                    printReport(
                      'IQAC Invitations Historical Audit Registry',
                      `Generated on ${new Date().toLocaleDateString()}`,
                      exportColumns,
                      filteredInvitations
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#4F8FC0]/25 hover:border-[#26648E] text-[#26648E] font-black text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#26648E]" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white border border-[#4F8FC0]/20 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Recorded</span>
                <div className="text-xl font-black text-[#26648E] mt-0.5">{totalCount}</div>
                <span className="text-[10px] text-slate-500 font-bold">All Submissions</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#e8f8f9] border border-[#53D2DC]/40 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-[#125e64] tracking-wider">Approved &amp; Cleared</span>
                <div className="text-xl font-black text-[#125e64] mt-0.5">{approvedCount}</div>
                <span className="text-[10px] text-[#125e64]/80 font-bold">Director Approved</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#fff8e7] border border-[#fedba0] shadow-2xs">
                <span className="text-[10px] font-black uppercase text-[#8a5d11] tracking-wider">Returned for Remarks</span>
                <div className="text-xl font-black text-[#8a5d11] mt-0.5">{remarksCount}</div>
                <span className="text-[10px] text-[#8a5d11]/80 font-bold">Correction Cycles</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f0f5f9] border border-[#4F8FC0]/25 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider">Under Active Review</span>
                <div className="text-xl font-black text-[#26648E] mt-0.5">{pendingCount}</div>
                <span className="text-[10px] text-[#4F8FC0] font-bold">In Director Queue</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="academic-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4F8FC0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search historical invitations by title, category, venue, or department..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition font-medium bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-[#26648E]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="REMARKS">Returned with Remarks</option>
                </select>
              </div>

              {/* Academic Year Filter */}
              {academicYears.length > 0 && (
                <div className="w-full sm:w-44">
                  <select
                    value={academicYearFilter}
                    onChange={(e) => setAcademicYearFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-[#26648E]"
                  >
                    <option value="ALL">All Academic Years</option>
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Invitation Table */}
          <div className="academic-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-[#f0f5f9]/50">
              <span>
                Showing <strong className="text-[#26648E]">{filteredInvitations.length}</strong> of{' '}
                <strong className="text-[#26648E]">{totalCount}</strong> archived records
              </span>
              <button
                onClick={fetchInvitations}
                className="flex items-center gap-1.5 text-xs text-[#26648E] hover:underline font-bold"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-500 font-bold">Loading invitation history...</p>
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Archive className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold text-slate-600">No historical invitations found</p>
                  <p className="text-xs text-slate-400">Try adjusting your search criteria or status filter</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] border-b border-[#4F8FC0]/20 text-[10px] font-black text-[#26648E] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Program Title &amp; Category</th>
                      <th className="py-3.5 px-4">Department / Shift</th>
                      <th className="py-3.5 px-4">Event Date &amp; Venue</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#f0f5f9]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block leading-snug">
                            {inv.programTitle}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#4F8FC0] uppercase">
                              {inv.category || 'Academic Event'}
                            </span>
                            {inv.revisionCount > 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-black">
                                Rev #{inv.revisionCount}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="font-bold text-slate-800 block text-xs">
                            {inv.department?.name || 'Department'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {inv.shift || 'Shift I / Shift II'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="block font-bold text-slate-800">
                            {new Date(inv.fromDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">
                            {inv.venue || 'College Campus'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                              inv.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : inv.status === 'REMARKS'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {inv.status === 'APPROVED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : inv.status === 'REMARKS' ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-blue-600" />
                            )}
                            <span>{inv.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedInv(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#4F8FC0]/30 hover:border-[#26648E] text-[#26648E] text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#4F8FC0]" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL MODAL */}
      {selectedInv && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto">
          <div className="academic-card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-[#4F8FC0]/20 flex items-center justify-between bg-[#f0f5f9] sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-[#26648E]" />
                <h3 className="text-sm font-black text-[#26648E] font-crest">
                  Invitation Audit Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedInv(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Program Title</span>
                <h4 className="text-base font-black text-[#26648E] mt-0.5">{selectedInv.programTitle}</h4>
                <p className="text-slate-500 font-semibold">{selectedInv.department?.name} • {selectedInv.category}</p>
              </div>

              {/* Status Stepper */}
              <div className="p-4 rounded-2xl bg-[#f0f5f9]/70 border border-[#4F8FC0]/20">
                <span className="text-[10px] font-black uppercase text-[#26648E] block mb-2">Workflow Lifecycle Status</span>
                <StatusStepper
                  status={selectedInv.status}
                  createdAt={selectedInv.createdAt}
                  approvedAt={selectedInv.approvedAt}
                  remarkedAt={selectedInv.remarkedAt}
                  mailSent={selectedInv.mailSent}
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dates &amp; Time</span>
                  <div className="font-black text-slate-800">
                    {new Date(selectedInv.fromDate).toLocaleDateString()}
                    {selectedInv.toDate && ` – ${new Date(selectedInv.toDate).toLocaleDateString()}`}
                  </div>
                  <div className="text-slate-500 text-[11px] font-semibold">{selectedInv.venue}</div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Audience &amp; Participants</span>
                  <div className="font-black text-slate-800">{selectedInv.natureOfAudience || 'Faculty & Students'}</div>
                  <div className="text-slate-500 text-[11px] font-semibold">Expected: {selectedInv.expectedCount || 'N/A'}</div>
                </div>
              </div>

              {/* Remarks if any */}
              {selectedInv.remarks && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Director Observations / Return Remarks</span>
                  </span>
                  <p className="font-semibold text-xs leading-relaxed">{selectedInv.remarks}</p>
                </div>
              )}

              {/* File Attachment preview if available */}
              {selectedInv.fileUrl && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#26648E]" />
                    <span className="font-bold text-slate-800">Attached Invitation Brochure / File</span>
                  </div>
                  <a
                    href={selectedInv.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#26648E] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-[#1f5072] transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open File</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedInv(null)}
                className="px-4 py-2 rounded-xl bg-[#26648E] text-white text-xs font-bold hover:bg-[#1f5072] transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
