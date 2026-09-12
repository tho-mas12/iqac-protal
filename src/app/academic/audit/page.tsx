'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ShieldCheck, Plus, CheckCircle2, FileText, Award } from 'lucide-react';

export default function AcademicAuditPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
    fetchAudits();
  }, [activeAcademicYear]);

  const fetchAudits = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const aRes = await fetch(`/api/audits?academicYearId=${activeAcademicYear}`);
      if (aRes.ok) {
        const aData = await aRes.json();
        setAudits(aData.audits || []);
      }
    } catch (err) {
      console.error('Failed to load academic audits', err);
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
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Academic & Administrative Audit (AAA)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual internal and external department audit evaluation across standard quality parameters
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Department</th>
                    <th className="p-4">Academic Year</th>
                    <th className="p-4">Audit Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Reviewer Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {audits.length > 0 ? (
                    audits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{a.department?.name}</td>
                        <td className="p-4">{a.academicYear?.year}</td>
                        <td className="p-4 font-black text-indigo-600 font-mono text-sm">{a.score}%</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{a.reviewerRemarks || 'Audit completed.'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No academic audit evaluations recorded for AY {activeAcademicYear}.
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
