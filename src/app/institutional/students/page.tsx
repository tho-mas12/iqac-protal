'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { GraduationCap, Users } from 'lucide-react';

export default function StudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    fetchStudents();
  }, [activeAcademicYear]);

  const fetchStudents = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const sRes = await fetch(`/api/students?academicYearId=${activeAcademicYear}`);
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudentRecords(sData.studentRecords || []);
        setSummary(sData.summary || {});
      }
    } catch (err) {
      console.error('Failed to load student data', err);
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
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Student Data & Demographics Module
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Institutional student strength, gender diversity breakdown, and progression statistics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Enrolled Students</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.total || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Male / Female Ratio</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {summary.male || 0} M / {summary.female || 0} F
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Passed Out Graduated</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.passedOut || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Progression to Higher Ed</div>
              <div className="text-2xl font-black text-purple-600 mt-1">{summary.progression || 0}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Department</th>
                    <th className="p-4">Programme</th>
                    <th className="p-4">Shift</th>
                    <th className="p-4">Total Students</th>
                    <th className="p-4">Male / Female</th>
                    <th className="p-4">Passed Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {studentRecords.length > 0 ? (
                    studentRecords.map((sr) => (
                      <tr key={sr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{sr.department?.name}</td>
                        <td className="p-4 font-semibold text-indigo-600">{sr.programme?.name || 'UG General'}</td>
                        <td className="p-4">{sr.shift}</td>
                        <td className="p-4 font-black font-mono text-slate-900">{sr.totalStudents}</td>
                        <td className="p-4 text-slate-600">
                          {sr.maleStudents} M / {sr.femaleStudents} F
                        </td>
                        <td className="p-4 font-bold text-emerald-600">{sr.passedOutCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No student enrollment records logged for AY {activeAcademicYear}.
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
