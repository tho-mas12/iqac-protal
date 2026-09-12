'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { FileText, Download, Printer, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'IQAC_ANNUAL', name: '1. IQAC Annual Quality Report', desc: 'Comprehensive annual summary of institutional compliance and milestones.' },
  { id: 'DEPARTMENT_ACTIVITY', name: '2. Department Activity Report', desc: 'Detailed register of seminars, FDPs, workshops, and proof checklists.' },
  { id: 'ACADEMIC_AUDIT', name: '3. Academic Audit Report', desc: 'Department AAA evaluations and quality scores.' },
  { id: 'UGC_NEP_NAAC', name: '4. UGC / NEP / NAAC Compliance Report', desc: 'Statutory compliance status across regulatory directives.' },
  { id: 'FACULTY_TRAINING', name: '5. Faculty Training Report', desc: 'MMTTC, orientation, refresher and FDP completion statistics.' },
  { id: 'STUDENT_STRENGTH', name: '6. Student Strength & Demographics', desc: 'UG/PG student strength, gender ratios, and progression.' },
  { id: 'FSR_REPORT', name: '7. Faculty-Student Ratio (FSR) Report', desc: 'Department and institutional FSR ratio calculations.' },
  { id: 'EVIDENCE_COMPLETION', name: '8. Evidence Completion Audit Report', desc: 'Repository audit of uploaded proof documents and verification status.' },
  { id: 'MEETING_ATR', name: '9. Meeting Action Taken Report (ATR)', desc: 'Resolutions, responsible officers, deadlines and ATR status.' },
  { id: 'REQUIREMENT_STATUS', name: '10. Requirement Status Report', desc: 'NAAC criteria progress, overdue tasks, and completion metrics.' },
];

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [selectedReport, setSelectedReport] = useState('IQAC_ANNUAL');

  const handleExportExcel = () => {
    window.location.href = `/api/excel/export?module=${selectedReport}&format=xlsx`;
  };

  const handleExportCSV = () => {
    window.location.href = `/api/excel/export?module=${selectedReport}&format=csv`;
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
                <FileText className="w-5 h-5 text-indigo-600" />
                IQAC Quality Reporting & Export Centre
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate and export production-ready quality reports, compliance audits, and NIRF/NAAC summaries
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Selector List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Select Report Type
              </div>
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedReport(rt.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedReport === rt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <div>{rt.name}</div>
                  <div className={`text-[10px] mt-0.5 line-clamp-1 ${selectedReport === rt.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {rt.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Report Preview & Export Panel */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {REPORT_TYPES.find((r) => r.id === selectedReport)?.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic Year {activeAcademicYear} • Generated from live database records
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export XLSX
                  </button>
                </div>
              </div>

              {/* Sample Data Preview Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Report Ready for Instant Export</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click 'Export XLSX' or 'Export CSV' to download the complete report dataset for AY {activeAcademicYear}.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
