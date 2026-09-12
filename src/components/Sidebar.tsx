'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileCheck,
  FolderOpen,
  GraduationCap,
  Users,
  Award,
  FileText,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Calendar,
  Building2,
  ListTodo,
  Sparkles,
  Search,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  role?: string;
  userName?: string;
}

export default function Sidebar({ userRole, role }: SidebarProps) {
  const effectiveRole = userRole || role;
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    workspace: true,
    academic: true,
    institutional: true,
    compliance: true,
    reports: true,
    admin: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 min-h-screen text-xs shrink-0 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-500/20">
          SJC
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 tracking-wide">IQAC Portal</h1>
          <p className="text-[10px] text-indigo-400 font-medium tracking-tight">Quality & Compliance System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Master Dashboard */}
        <div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-all ${
              isActive('/dashboard')
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-300" />
            <span>Master Dashboard</span>
          </Link>
        </div>

        {/* SECTION 1: IQAC WORKSPACE */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('workspace')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
              IQAC Workspace
            </span>
            {openSections.workspace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.workspace && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
              <Link
                href="/workspace/requirements"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/workspace/requirements') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Requirements</span>
              </Link>
              <Link
                href="/workspace/data-requests"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/workspace/data-requests') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Data Requests</span>
              </Link>
              <Link
                href="/workspace/submissions"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/workspace/submissions') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Submissions</span>
              </Link>
              <Link
                href="/workspace/verification"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/workspace/verification') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verification Queue</span>
              </Link>
              <Link
                href="/workspace/evidence"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/workspace/evidence') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Evidence Repository</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 2: ACADEMIC QUALITY */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('academic')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              Academic Quality
            </span>
            {openSections.academic ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.academic && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
              <Link
                href="/academic/audit"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/academic/audit') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Academic Audit (AAA)</span>
              </Link>
              <Link
                href="/academic/activities"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/academic/activities') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Department Activities</span>
              </Link>
              <Link
                href="/academic/pedagogy"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/academic/pedagogy') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Pedagogy & E-Content</span>
              </Link>
              <Link
                href="/academic/meetings"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/academic/meetings') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Meetings & ATR</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 3: INSTITUTIONAL DATA */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('institutional')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Institutional Data
            </span>
            {openSections.institutional ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.institutional && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
              <Link
                href="/institutional/faculty"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/institutional/faculty') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Faculty & FSR</span>
              </Link>
              <Link
                href="/institutional/students"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/institutional/students') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Data</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 4: COMPLIANCE TRACKER */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('compliance')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              Compliance Tracker
            </span>
            {openSections.compliance ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.compliance && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
              <Link
                href="/compliance/ugc-nep"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/compliance/ugc-nep') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>UGC / NEP / NAAC / NIRF</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 5: REPORTS & AUDIT LOGS */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('reports')}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              Reports & Centre
            </span>
            {openSections.reports ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {openSections.reports && (
            <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
              <Link
                href="/reports"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/reports') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Report Generator</span>
              </Link>
              <Link
                href="/audit-logs"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                  isActive('/audit-logs') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>System Audit Log</span>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION 6: ADMINISTRATION */}
        {(userRole === 'SUPER_ADMIN' || userRole === 'IQAC_ADMIN') && (
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('admin')}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Administration
              </span>
              {openSections.admin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.admin && (
              <div className="pl-3 space-y-0.5 border-l border-slate-800 ml-3">
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                    isActive('/admin/users') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users & Roles</span>
                </Link>
                <Link
                  href="/admin/master-data"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                    isActive('/admin/master-data') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Master Data Settings</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        <span>SJCIQAC Digital Quality System v2.0</span>
      </div>
    </aside>
  );
}
