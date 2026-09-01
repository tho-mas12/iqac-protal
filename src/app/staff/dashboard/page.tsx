'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
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
  FileText
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // View Modal state
  const [viewingInv, setViewingInv] = useState<any | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHardCopy = async (invId: string, currentStatus: boolean) => {
    setUpdatingId(invId);
    setFeedback(null);

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

      setFeedback({
        type: 'success',
        message: !currentStatus ? 'Hard copy marked as Received!' : 'Hard copy marked as Pending.',
      });

      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating status' });
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

        <main className="p-6 md:p-8 space-y-8 flex-1">
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

          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Active Events"
              value={stats.total}
              icon={Layers}
              variant="blue"
              subtitle="All portal submissions"
            />
            <StatCard
              title="Reports Received"
              value={stats.approved}
              icon={CheckCircle2}
              variant="green"
              subtitle="Approved invitations"
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
              subtitle="Awaiting Director check"
            />
          </div>

          {/* Approved Invitations Table & Hard Copy Tracking */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Approved Invitations & Hard Copy Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify approved event details and record physical hard copies received from departments
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search approved..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Event Activities</th>
                      <th className="px-4 py-4">Department & Shift</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Event Date</th>
                      <th className="px-4 py-4">Approved Date</th>
                      <th className="px-4 py-4">Hard Copy Received?</th>
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
                        <td className="px-4 py-4 text-xs text-slate-500">
                          {inv.approvedAt ? new Date(inv.approvedAt).toLocaleDateString() : 'Approved'}
                        </td>
                        {/* Interactive Hard Copy Status Switch */}
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
                            <span>{inv.hardCopyReceived ? 'Hard Copy Received ✓' : 'Mark as Received'}</span>
                          </button>
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
                              href={inv.driveViewLink || inv.localFilePath || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors"
                              title="Open Image Link"
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
                className="text-purple-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[300px]">
                {viewingInv.localFilePath || viewingInv.driveViewLink ? (
                  <img
                    src={viewingInv.localFilePath || viewingInv.driveViewLink}
                    alt={viewingInv.programTitle}
                    className="max-h-[400px] w-auto object-contain rounded-lg"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-slate-500" />
                )}
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
                href={viewingInv.driveViewLink || viewingInv.localFilePath || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>View Full Image / File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setViewingInv(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
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
