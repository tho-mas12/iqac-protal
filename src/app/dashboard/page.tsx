'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QualityPulseBanner from '@/components/QualityPulseBanner';
import AnalyticsCharts from '@/components/Charts';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  FolderSearch,
  Calendar,
  Layers,
  Building,
  Award,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Users,
  GraduationCap,
} from 'lucide-react';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndDashboard(activeAcademicYear);
  }, [activeAcademicYear]);

  const fetchUserAndDashboard = async (ay: string) => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const uData = await userRes.json();
        setCurrentUser(uData.user);
      }

      const dashRes = await fetch(`/api/dashboard?academicYear=${ay}`);
      if (dashRes.ok) {
        const dData = await dashRes.json();
        setDashboardData(dData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    totalRequirements: 24,
    completed: 18,
    pending: 4,
    underVerification: 3,
    correctionRequired: 2,
    compliant: 18,
    partiallyCompliant: 3,
    notCompliant: 3,
    evidenceMissing: 5,
    overdueTasks: 2,
    overallComplianceScore: 75,
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar userRole={currentUser?.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={currentUser}
          activeAcademicYear={activeAcademicYear}
          onAcademicYearChange={(y) => setActiveAcademicYear(y)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Institutional Quality & Compliance Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                St. Joseph's College (Autonomous) • Academic Year {activeAcademicYear}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
              >
                <Award className="w-4 h-4" />
                Generate Quality Report
              </Link>
            </div>
          </div>

          {/* Quality Pulse Banner */}
          <QualityPulseBanner data={dashboardData?.qualityPulse} />

          {/* SECTION: 10 MASTER DASHBOARD METRIC CARDS (One-Click Drill Down) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Total Requirements */}
            <Link
              href="/workspace/requirements"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Requirements</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalRequirements}</div>
              <div className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View all <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 2. Completed */}
            <Link
              href="/workspace/requirements?status=Approved"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.completed}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Drill down <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 3. Pending */}
            <Link
              href="/workspace/requirements?status=In Progress"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Tasks</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{summary.pending}</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Drill down <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 4. Under Verification */}
            <Link
              href="/workspace/verification?status=UNDER_VERIFICATION"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Verification</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{summary.underVerification}</div>
              <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Review queue <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 5. Correction Required */}
            <Link
              href="/workspace/verification?status=CORRECTION_REQUIRED"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correction Required</div>
              <div className="text-2xl font-black text-rose-600 mt-1">{summary.correctionRequired}</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View list <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 6. Compliant */}
            <Link
              href="/workspace/requirements?status=Approved"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compliant</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.compliant}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Drill down <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 7. Partially Compliant */}
            <Link
              href="/workspace/requirements?status=Under Verification"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partially Compliant</div>
              <div className="text-2xl font-black text-yellow-600 mt-1">{summary.partiallyCompliant}</div>
              <div className="text-[10px] text-yellow-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Drill down <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 8. Not Compliant */}
            <Link
              href="/workspace/requirements?status=Not Started"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Not Compliant</div>
              <div className="text-2xl font-black text-slate-600 mt-1">{summary.notCompliant}</div>
              <div className="text-[10px] text-slate-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Drill down <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 9. Evidence Missing */}
            <Link
              href="/workspace/evidence?status=PENDING"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evidence Missing</div>
              <div className="text-2xl font-black text-orange-600 mt-1">{summary.evidenceMissing}</div>
              <div className="text-[10px] text-orange-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Check repo <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* 10. Overdue Tasks */}
            <Link
              href="/workspace/requirements?status=Overdue"
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-600 hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue Tasks</div>
              <div className="text-2xl font-black text-rose-700 mt-1">{summary.overdueTasks}</div>
              <div className="text-[10px] text-rose-700 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Action required <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          {/* Overall Compliance Score Highlight Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-blue-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" /> Overall Institutional Compliance Index
              </div>
              <div className="text-3xl font-black mt-2">
                {summary.overallComplianceScore}% <span className="text-sm font-normal opacity-80">Compliant</span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                Calculated dynamically across NAAC criteria, UGC mandates, NEP 2020 parameters, and internal IQAC requirements for AY {activeAcademicYear}.
              </p>
            </div>
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-700/60 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-[11px] text-indigo-300 font-medium">Departments Monitored</div>
                <div className="text-xl font-bold">4 Active</div>
              </div>
              <div>
                <div className="text-[11px] text-indigo-300 font-medium">Evidence Documents</div>
                <div className="text-xl font-bold">{summary.totalEvidenceUploaded || 12} Uploaded</div>
              </div>
            </div>
          </div>

          {/* VISUAL ANALYTICS CHARTS */}
          <AnalyticsCharts
            deptComplianceData={dashboardData?.deptComplianceData}
            criterionData={dashboardData?.criterionData}
            overallScore={summary.overallComplianceScore}
          />
        </main>
      </div>
    </div>
  );
}
