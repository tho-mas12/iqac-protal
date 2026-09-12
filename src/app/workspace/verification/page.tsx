'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { FileCheck, CheckCircle2, XCircle, AlertTriangle, Eye, Clock, MessageSquare } from 'lucide-react';

export default function VerificationPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'APPROVE' | 'REJECT' | 'CORRECTION' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [resubmissionDeadline, setResubmissionDeadline] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [activeAcademicYear]);

  const fetchSubmissions = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const sRes = await fetch('/api/submissions');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubmissions(sData.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load verification queue', err);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !actionModal) return;

    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal,
          remarks,
          resubmissionDeadline,
        }),
      });

      if (res.ok) {
        setActionModal(null);
        setSelectedSub(null);
        setRemarks('');
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar userRole={user?.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          activeAcademicYear={activeAcademicYear}
          onAcademicYearChange={(y) => setActiveAcademicYear(y)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              IQAC Verification Queue
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review submitted data, evaluate attached evidence, approve or issue correction remarks
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Submission / Request</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4">IQAC Remarks</th>
                    <th className="p-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{sub.dataRequest?.title}</div>
                          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                            {sub.dataRequest?.reqNumber} (v{sub.revisionCount + 1})
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{sub.department?.name}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : sub.status === 'CORRECTION_REQUIRED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {sub.verificationRemarks || 'No remarks recorded.'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              setActionModal('APPROVE');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSub(sub);
                              setActionModal('CORRECTION');
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition-colors"
                          >
                            Request Correction
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No submissions currently pending verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Action Modal */}
      {actionModal && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              {actionModal === 'APPROVE' ? 'Approve Submission' : 'Request Department Correction'}
            </h2>
            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">IQAC Verification Remarks</label>
                <textarea
                  rows={3}
                  required={actionModal === 'CORRECTION'}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder={
                    actionModal === 'CORRECTION'
                      ? 'Specify missing data fields or required document updates...'
                      : 'Verification comments (optional)...'
                  }
                />
              </div>

              {actionModal === 'CORRECTION' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resubmission Deadline</label>
                  <input
                    type="date"
                    value={resubmissionDeadline}
                    onChange={(e) => setResubmissionDeadline(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-bold rounded-xl ${
                    actionModal === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
