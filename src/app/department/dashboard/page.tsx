'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import GuidelinesModal from '@/components/GuidelinesModal';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  ArrowRight,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  RotateCw,
  FileText,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function DepartmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    remarks: 0,
    approved: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, invRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations'),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        setUser(uData.user);
      }

      if (invRes.ok) {
        const iData = await invRes.json();
        setInvitations(iData.invitations || []);
        setStats(iData.stats || { total: 0, pending: 0, remarks: 0, approved: 0 });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load dashboard records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role="DEPARTMENT"
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
      />

      {/* Interactive IQAC Invitation Guidelines & Format Modal */}
      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Dynamic Top-Right Pop-up */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Department Dashboard"
          userName={user?.name}
          userRole="Department"
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Top Banner Notice if remarks are waiting */}
          {stats.remarks > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Action Required: {stats.remarks} Invitation(s) Need Correction
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    The Director has returned remarks on your submission. Please check the Remarks page and re-upload the corrected version.
                  </p>
                </div>
              </div>
              <Link
                href="/department/remarks"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <span>View Remarks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Quick Upload CTA Header with Blinking Action Buttons */}
          <div className="bg-gradient-to-r from-[#2a1b54] via-[#3b1975] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-sm border border-purple-400/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>{user?.department?.name || 'Department'} Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Upload & Track Event Invitations
              </h2>
              <p className="text-purple-200 text-xs sm:text-sm max-w-xl">
                Submit program invitations directly for Director verification. Follow the prescribed college format and standard guidelines.
              </p>
            </div>

            {/* Action Buttons Column with Blinking Guides */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto z-10 shrink-0">
              <Link
                href="/department/upload"
                className="px-6 py-3.5 bg-white text-purple-900 hover:bg-purple-50 font-extrabold rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm shrink-0"
              >
                <UploadCloud className="w-5 h-5 text-purple-700" />
                <span>Add New Invitation</span>
              </Link>

              <div className="flex items-center gap-2.5">
                {/* College Logo Blinking Button */}
                <a
                  href="https://www.sjctni.edu/SJC_logo.jsp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 animate-pulse cursor-pointer border border-emerald-300/40"
                  title="Official St. Joseph's College Logo download"
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>College Logo</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                {/* Instructions & Format Blinking Button */}
                <button
                  type="button"
                  onClick={() => setIsGuidelinesOpen(true)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 animate-pulse cursor-pointer border border-amber-300/40"
                  title="Official IQAC Invitation Format & 12 Guidelines"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Instructions & Format</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Grid (2 cols on mobile, 4 on desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <StatCard
              title="Total Uploaded"
              value={stats.total}
              icon={Layers}
              variant="purple"
              subtitle="All submissions"
            />
            <StatCard
              title="Pending Verification"
              value={stats.pending}
              icon={Clock}
              variant="yellow"
              subtitle="Awaiting Director review"
            />
            <StatCard
              title="Needs Correction"
              value={stats.remarks}
              icon={AlertTriangle}
              variant="red"
              subtitle="Returned with remarks"
            />
            <StatCard
              title="Approved Invitations"
              value={stats.approved}
              icon={CheckCircle2}
              variant="green"
              subtitle="Verified by IQAC"
            />
          </div>

          {/* Recent Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Invitation Submissions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Priority sorted by date and time of upload</p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading invitations...
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                No invitations uploaded yet. Click &quot;Add New Invitation&quot; above to submit.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Program Title</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Shift</th>
                        <th className="px-4 py-4">Event Date(s)</th>
                        <th className="px-4 py-4">Uploaded At</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 line-clamp-1">{inv.programTitle}</div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span>{inv.fileName}</span>
                              {inv.revisionCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold text-[10px]">
                                  Rev #{inv.revisionCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              {inv.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-slate-600">{inv.shift}</td>
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {new Date(inv.fromDate).toLocaleDateString()}
                            {inv.toDate && ` - ${new Date(inv.toDate).toLocaleDateString()}`}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-4">
                            {inv.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </span>
                            )}
                            {inv.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                            {inv.status === 'REMARKS' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" /> Remarks Received
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status === 'REMARKS' && (
                                <Link
                                  href="/department/remarks"
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
                                >
                                  Re-upload
                                </Link>
                              )}
                              <a
                                href={inv.driveViewLink || inv.localFilePath || `/api/invitations/${inv.id}/file`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                title="View Invitation File"
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
                  {invitations.map((inv) => (
                    <div key={inv.id} className="p-4 space-y-2.5 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{inv.programTitle}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">{inv.category} • {inv.shift}</span>
                        </div>
                        <div>
                          {inv.status === 'APPROVED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Approved
                            </span>
                          )}
                          {inv.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                          {inv.status === 'REMARKS' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Remarks
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>{new Date(inv.fromDate).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          {inv.status === 'REMARKS' && (
                            <Link
                              href="/department/remarks"
                              className="px-2.5 py-1 rounded bg-amber-500 text-white text-xs font-bold"
                            >
                              Re-upload
                            </Link>
                          )}
                          <a
                            href={inv.driveViewLink || inv.localFilePath || `/api/invitations/${inv.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-purple-600 font-semibold flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
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
    </div>
  );
}
