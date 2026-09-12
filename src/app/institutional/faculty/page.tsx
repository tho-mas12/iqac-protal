'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Users, Award, Calculator, Search, Plus, Download } from 'lucide-react';

export default function FacultyPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [faculty, setFaculty] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [fsrData, setFsrData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'FSR'>('DIRECTORY');

  useEffect(() => {
    fetchFacultyData();
    fetchFsrData();
  }, [activeAcademicYear]);

  const fetchFacultyData = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const fRes = await fetch('/api/faculty');
      if (fRes.ok) {
        const fData = await fRes.json();
        setFaculty(fData.faculty || []);
        setSummary(fData.summary || {});
      }
    } catch (err) {
      console.error('Failed to load faculty data', err);
    }
  };

  const fetchFsrData = async () => {
    try {
      const fsrRes = await fetch(`/api/fsr?academicYear=${activeAcademicYear}`);
      if (fsrRes.ok) {
        const data = await fsrRes.json();
        setFsrData(data);
      }
    } catch (err) {
      console.error('Failed to load FSR data', err);
    }
  };

  const handleExportFaculty = () => {
    window.location.href = `/api/excel/export?module=FACULTY&format=xlsx`;
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Faculty Profile Directory & Faculty-Student Ratio (FSR)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage faculty qualifications, MMTTC training records, and automatic FSR calculations
              </p>
            </div>

            <div className="flex items-center gap-2 border bg-white border-slate-200 p-1 rounded-xl shadow-sm text-xs font-bold">
              <button
                onClick={() => setActiveTab('DIRECTORY')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'DIRECTORY' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Faculty Directory
              </button>
              <button
                onClick={() => setActiveTab('FSR')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'FSR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                FSR Calculator
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Sanctioned Faculty</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalFaculty || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">MMTTC / FDP Trained</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{summary.trainedFacultyCount || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Training Percentage</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.trainingPercentage || 0}%</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Institution FSR</div>
              <div className="text-2xl font-black text-purple-600 mt-1">
                {fsrData?.institutionFSR?.ratioFormatted || '1:20'}
              </div>
            </div>
          </div>

          {/* TAB 1: DIRECTORY */}
          {activeTab === 'DIRECTORY' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-800">Faculty Roster</h3>
                <button
                  onClick={handleExportFaculty}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Faculty ID & Name</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Designation</th>
                      <th className="p-4">Qualification</th>
                      <th className="p-4">MMTTC / FDP Training</th>
                      <th className="p-4 text-right">Joining Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {faculty.length > 0 ? (
                      faculty.map((fac) => (
                        <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{fac.name}</div>
                            <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{fac.facultyIdNumber}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-800">{fac.department?.name}</td>
                          <td className="p-4">{fac.designation}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {fac.qualification || 'M.Com'}
                            </span>
                          </td>
                          <td className="p-4">
                            {fac.trainings?.length > 0 ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                ✓ {fac.trainings.length} Training(s)
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">Pending Training</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {fac.dateOfJoining ? new Date(fac.dateOfJoining).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No faculty records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FSR CALCULATOR */}
          {activeTab === 'FSR' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-800">Department-wise Faculty-Student Ratio (FSR)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula used: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-indigo-600">students / fullTimeFaculty</code>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fsrData?.departments?.map((d: any) => (
                  <div key={d.departmentId} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="font-bold text-sm text-slate-900">{d.departmentName}</div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Faculty Count:</span>
                      <span className="font-bold text-slate-800">{d.facultyCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Student Strength:</span>
                      <span className="font-bold text-slate-800">{d.studentCount}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span>FSR Ratio:</span>
                      <span className="text-sm font-black">{d.ratioFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
