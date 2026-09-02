'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [approvedInvitations, setApprovedInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    remarks: 0,
    approved: 0,
  });
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // View & Mail Modal states
  const [viewingInv, setViewingInv] = useState<any | null>(null);
  const [mailingInv, setMailingInv] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations?status=APPROVED'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setApprovedInvitations(iData.invitations || []);
        setStats(iData.stats || { total: 0, pending: 0, remarks: 0, approved: 0 });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load approved invitations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHardCopy = async (invId: string, currentStatus: boolean) => {
    setUpdatingId(invId);

    try {
      const res = await fetch(`/api/invitations/${invId}/hard-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update hard copy status');
      }

      setToast({
        type: 'success',
        message: !currentStatus ? 'Hard copy marked as Received!' : 'Hard copy marked as Pending.',
      });

      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating status' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInvitations = approvedInvitations.filter(
    (i) =>
      i.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      i.department?.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="STAFF" userName={user?.name || 'IQAC Staff'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Staff Dashboard"
          userName={user?.name}
          userRole="Staff"
        />

        {/* Dynamic Top-Right Pop-up */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Send Mail to ERP Modal */}
        <MailComposerModal
          isOpen={Boolean(mailingInv)}
          onClose={() => setMailingInv(null)}
          invitation={mailingInv}
          onMailSentSuccess={fetchData}
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* 4 Statistics Cards (2 cols on mobile, 4 on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <StatCard
              title="Active Events"
              value={stats.total}
              icon={Layers}
              variant="blue"
              subtitle="All portal submissions"
            />
            <StatCard
              title="Approved Reports"
              value={stats.approved}
              icon={CheckCircle2}
              variant="green"
              subtitle="Director approved"
            />
            <StatCard
              title="Needs Correction"
              value={stats.remarks}
              icon={AlertTriangle}
              variant="yellow"
              subtitle="Returned with remarks"
            />
            <StatCard
              title="Pending Submissions"
              value={stats.pending}
              icon={Clock}
              variant="purple"
              subtitle="Awaiting Director review"
            />
          </div>

          {/* Approved Invitations Table & Hard Copy Tracking */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Approved Invitations & Hard Copy Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify approved event details, track hard copies, and notify the ERP team to publish
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                  title="Refresh"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading approved list...
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <FileCheck2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                No approved invitations found.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Event Activities</th>
                        <th className="px-4 py-4">Department & Shift</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Event Date</th>
                        <th className="px-4 py-4">Hard Copy Received?</th>
                        <th className="px-4 py-4">Mail to ERP</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredInvitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{inv.programTitle}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{inv.fileName}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-800 text-xs block">{inv.department?.name}</span>
                            <span className="text-[11px] text-purple-700 font-semibold">{inv.shift}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              {inv.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {new Date(inv.fromDate).toLocaleDateString()}
                            {inv.toDate && ` - ${new Date(inv.toDate).toLocaleDateString()}`}
                          </td>
                          {/* Hard Copy Status Switch */}
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleHardCopy(inv.id, inv.hardCopyReceived)}
                              disabled={updatingId === inv.id}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                inv.hardCopyReceived
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                              }`}
                              title="Click to toggle hard copy status"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  inv.hardCopyReceived ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                              />
                              <span>{inv.hardCopyReceived ? 'Received ✓' : 'Pending'}</span>
                            </button>
                          </td>
                          {/* Send Mail to ERP Column */}
                          <td className="px-4 py-4">
                            {inv.mailSent ? (
                              <div className="flex flex-col items-start gap-1">
                                <button
                                  type="button"
                                  onClick={() => setMailingInv(inv)}
                                  className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  title="Click to view ERP email details or resend"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>Mail Sent ✓</span>
                                </button>
                                {inv.mailSentAt && (
                                  <span className="text-[10px] text-slate-500 font-medium pl-1">
                                    {new Date(inv.mailSentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setMailingInv(inv)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                title="Send publication request to erp@mail.sjctni.edu"
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span>Send Mail</span>
                              </button>
                            )}
                          </td>
                          {/* Action Buttons */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingInv(inv)}
                                className="px-3 py-1.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <a
                                href={`/api/invitations/${inv.id}/file?rev=${inv.revisionCount || 0}&t=${inv.updatedAt ? new Date(inv.updatedAt).getTime() : Date.now()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors"
                                title="Open Full File"
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
                        <h4 className="font-bold text-slate-900 text-sm">{inv.programTitle}</h4>
                        <div className="text-xs text-slate-500 mt-1">
                          {inv.department?.name} ({inv.shift}) • {inv.category}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Date</span>
                          <span className="font-medium text-slate-700">{new Date(inv.fromDate).toLocaleDateString()}</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Hard Copy</span>
                          <button
                            onClick={() => handleToggleHardCopy(inv.id, inv.hardCopyReceived)}
                            className={`text-xs font-bold mt-0.5 ${inv.hardCopyReceived ? 'text-emerald-700' : 'text-slate-500'}`}
                          >
                            {inv.hardCopyReceived ? 'Received ✓' : 'Pending'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        {inv.mailSent ? (
                          <button
                            type="button"
                            onClick={() => setMailingInv(inv)}
                            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Mail Sent ✓</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMailingInv(inv)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Send Mail</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingInv(inv)}
                            className="px-3 py-1.5 bg-[#6320ee] text-white text-xs font-bold rounded-xl cursor-pointer"
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
                  <span>{new Date(viewingInv.fromDate).toLocaleDateString()} {viewingInv.toDate && `to ${new Date(viewingInv.toDate).toLocaleDateString()}`}</span>
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
    </div>
  );
}
