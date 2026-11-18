import React from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import sjcLogo from '../../../public/sjc-logo.png';
import frontierLogo from '../../../public/frontierwox-logo.jpg';
import {
  BookOpen,
  FileCheck2,
  Award,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const role = session.role;
  const isHead = Boolean(session.isHead || role === 'HEAD');
  const isMqc = Boolean(session.isMqc || role === 'MQC');
  const isAdmin = role === 'ADMIN' || role === 'DIRECTOR';
  const staffCode = session.staffCode || session.username;
  const deptName = session.departmentName || 'St. Joseph’s College';

  // Role Badge Configuration
  let roleTitle = 'Faculty Member';
  let roleBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
  let RoleIcon = UserCheck;

  if (isAdmin) {
    roleTitle = role === 'DIRECTOR' ? 'IQAC Director' : 'IQAC Administrator';
    roleBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    RoleIcon = ShieldCheck;
  } else if (isHead) {
    roleTitle = 'Head of Department (HOD)';
    roleBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    RoleIcon = Building2;
  } else if (isMqc) {
    roleTitle = 'MQC Coordinator (Micro Quality Cell)';
    roleBadgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
    RoleIcon = Award;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Application Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Institution Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-1.5 border border-white/15 flex items-center justify-center shrink-0">
              <Image src={sjcLogo} alt="SJC Crest" className="h-full w-auto object-contain" priority />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Internal Quality Assurance Cell (IQAC)
              </div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight">
                St. Joseph’s College (Autonomous) • Tiruchirappalli
              </h1>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white tracking-tight">{session.name}</span>
              <span className="text-[10px] text-slate-300 font-mono font-medium">{staffCode} • {deptName}</span>
            </div>

            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${roleBadgeClass}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleTitle}</span>
            </div>

            <LogoutButton />
          </div>

        </div>
      </header>

      {/* Main Content Hub */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Unified Digital Ecosystem • Academic Year 2026–2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {session.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              You are signed into the Central IQAC Quality Assurance Hub. Access your Outcome-Based Education course plans, event invitation approvals, and academic audit metrics below.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-300 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-bold">
                Staff ID: <span className="text-white">{staffCode}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-bold">
                Department: <span className="text-white">{deptName}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-bold">
                Role: <span className="text-amber-300">{roleTitle}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Ecosystem Pillars Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              IQAC Quality Assurance Portals (SSO Integrated)
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Single-Click Authentication Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Pillar 1: OBE Course Plan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Even Sem 2026–27
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Course Plan System
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Outcome-Based Education (OBE) course lesson planning, LOCF syllabus mapping, Bloom's cognitive taxonomy, and HOD approvals.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>LOCF Units & Hours Allocation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bloom's Taxonomy Cognitive Levels</span>
                  </div>
                  {isHead && (
                    <div className="flex items-center gap-2 text-indigo-700 font-bold bg-indigo-50/80 px-2 py-1 rounded-lg">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>HOD Department Review Privilege</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <a
                  href="/course-plan/"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Course Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {isHead && (
                  <a
                    href="/course-plan/?action=review"
                    className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Review Department Plans (HOD)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {isAdmin && (
                  <a
                    href="/course-plan/?action=admin"
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Admin Monitoring Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Pillar 2: Event Invitations & Institutional Verification */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    Compliance
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Event Invitations & Verification
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Formal approval and institutional verification workflow for departmental conferences, seminars, guest lectures, and workshops.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Brochure & Resource Person Verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated IQAC Approval Seals</span>
                  </div>
                  {isHead && (
                    <div className="flex items-center gap-2 text-blue-700 font-bold bg-blue-50/80 px-2 py-1 rounded-lg">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Department Invitation Tracking</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  href={isHead || role === 'DEPARTMENT' ? '/department/dashboard' : '/staff/dashboard'}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Invitations Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin/departments"
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Admin Invitations Overview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Pillar 3: Annual Academic Audit (AAA) 2026–2027 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isMqc || isAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isMqc || isAdmin ? 'Authorized' : 'MQC Delegated'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Annual Academic Audit (AAA)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    10-Attribute NAAC assessment containers, quantitative faculty research KPIs, grants, patents, consultancy, and audit documentation.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Attributes I to X NAAC Compliance</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Department KPI Data Containers</span>
                  </div>

                  {isMqc ? (
                    <div className="flex items-center gap-2 text-emerald-800 font-bold bg-emerald-50/90 px-2 py-1 rounded-lg">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Assigned MQC Member for {deptName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 italic bg-slate-50 px-2 py-1 rounded-lg">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Data container entry handled by Department MQC</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 space-y-2">
                {isMqc || isAdmin ? (
                  <a
                    href="/AAA/"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open AAA Data Container</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href="/AAA/"
                    className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View AAA Portal (Overview)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Quick Links & Manuals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Need Help or Guidance?</div>
              <div className="text-[11px] text-slate-500">Access comprehensive OBE course plan documentation and guidelines.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/course-plan/manual.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition"
            >
              <span>Course Plan Manual</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-xs">
          <div>
            © 2026 Internal Quality Assurance Cell (IQAC), St. Joseph’s College (Autonomous), Tiruchirappalli.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Powered by</span>
            <div className="w-20 h-auto relative flex items-center">
              <Image src={frontierLogo} alt="FrontierWox" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
