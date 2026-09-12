'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { BookOpen, Send, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function SubmissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [submissions, setSubmissions] = useState<any[]>([]);

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

      const sRes = await fetch(`/api/submissions`);
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubmissions(sData.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
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
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Department Submissions Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review submitted data collection forms, status updates, and IQAC verification feedback
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Task / Data Request</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Submitted By</th>
                    <th className="p-4">Revisions</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{sub.dataRequest?.title}</div>
                          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                            {sub.dataRequest?.reqNumber}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{sub.department?.name}</td>
                        <td className="p-4">{sub.submittedBy?.name || 'Department User'}</td>
                        <td className="p-4 font-mono font-bold text-slate-600">v{sub.revisionCount + 1}</td>
                        <td className="p-4">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Draft'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              sub.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : sub.status === 'CORRECTION_REQUIRED'
                                ? 'bg-rose-100 text-rose-700 font-black animate-pulse'
                                : sub.status === 'UNDER_VERIFICATION'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No submissions recorded for this workspace context.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
