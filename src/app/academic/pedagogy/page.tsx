'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Sparkles, Plus, BookOpen, User } from 'lucide-react';

export default function PedagogyPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchPedagogy();
  }, [activeAcademicYear]);

  const fetchPedagogy = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const pRes = await fetch(`/api/pedagogy?academicYearId=${activeAcademicYear}`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setRecords(pData.records || []);
      }
    } catch (err) {
      console.error('Failed to load pedagogy records', err);
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
              <Sparkles className="w-5 h-5 text-purple-600" />
              Pedagogical Approaches & E-Content Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Innovative teaching methodologies, assessment practices, and developed LMS e-content modules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.length > 0 ? (
              records.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                      {r.courseName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{r.department?.name}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{r.pedagogicalApproach}</h3>
                  <div className="text-xs text-slate-600">Faculty: {r.facultyName}</div>
                  {r.assessmentPractice && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                      <strong>Assessment:</strong> {r.assessmentPractice}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No pedagogical approach records logged for AY {activeAcademicYear}.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
