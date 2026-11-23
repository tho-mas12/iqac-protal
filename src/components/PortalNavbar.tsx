'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FileText,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  LayoutDashboard,
  Upload,
  MessageSquare,
  ShieldCheck,
  Lock,
  LogOut,
  ExternalLink,
  Building2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Users,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';
import sjcLogo from '../../public/sjc-logo.png';

interface PortalNavbarProps {
  user?: any;
  isMqcMember?: boolean;
  isHod?: boolean;
  onLogout?: () => void;
}

export default function PortalNavbar({
  user,
  isMqcMember = false,
  isHod = false,
  onLogout,
}: PortalNavbarProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mqcModalOpen, setMqcModalOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('IQAC_SSO_USER');
        localStorage.removeItem('IQAC_AUTH_USER');
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getInvitationDashboardUrl = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'DIRECTOR':
        return '/director/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'DEPARTMENT':
      default:
        return '/department/dashboard';
    }
  };

  const canAccessAaa = user?.role === 'ADMIN' || isMqcMember;

  const handleAaaClick = (e: React.MouseEvent, targetUrl: string) => {
    if (!canAccessAaa) {
      e.preventDefault();
      setOpenDropdown(null);
      setMqcModalOpen(true);
      return;
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <>
      <nav
        ref={navRef}
        className="w-full bg-white/95 backdrop-blur-md border-b border-[#4F8FC0]/25 sticky top-0 z-40 shadow-xs select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 1. Left: Brand & Institutional Crest */}
            <div className="flex items-center gap-3">
              <Link href={user?.role === 'ADMIN' ? '/admin' : '/hub'} className="flex items-center gap-3 group">
                <div className="w-10 h-12 rounded-xl bg-gradient-to-b from-[#f0f5f9] via-white to-[#FFE3B3]/25 border border-[#4F8FC0]/30 flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform">
                  <Image
                    src={sjcLogo}
                    alt="St. Joseph's College"
                    className="h-9 w-auto object-contain drop-shadow-xs"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-black text-[#26648E] font-crest tracking-tight leading-tight group-hover:text-[#1f5072] transition-colors">
                      St. Joseph&apos;s College <span className="font-semibold text-slate-500">(Autonomous)</span>
                    </h1>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-extrabold text-[#4F8FC0] tracking-wide uppercase">
                    IQAC Quality Governance Portal
                  </p>
                </div>
              </Link>
            </div>

            {/* 2. Center: 4 Dropdown Menus (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              
              {/* DROPDOWN 1: INVITATION PORTAL */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('invitation')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    openDropdown === 'invitation'
                      ? 'bg-[#26648E] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#26648E] hover:bg-[#f0f5f9]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#4F8FC0]" />
                  <span>Invitation</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'invitation' ? 'rotate-180 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                {openDropdown === 'invitation' && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#4F8FC0]/25 p-2 animate-fadeIn z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#26648E] block">
                        Invitation &amp; Event Portal
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Multi-stage review and approval system
                      </span>
                    </div>

                    <Link
                      href={getInvitationDashboardUrl()}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E]">
                          Dashboard
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Overview of submitted invitations &amp; statuses
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/department/upload"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E]">
                          Upload Invitation
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Submit new event circulars &amp; brochures
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/department/remarks"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E]">
                          Remarks &amp; Corrections
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          View Director reviews and reupload drafts
                        </div>
                      </div>
                    </Link>

                    {(user?.role === 'ADMIN' || user?.role === 'DIRECTOR') && (
                      <Link
                        href="/director/status"
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group border-t border-slate-100 mt-1"
                      >
                        <div className="p-2 rounded-lg bg-[#e8f8f9] text-[#125e64] group-hover:bg-[#125e64] group-hover:text-white transition shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800 group-hover:text-[#125e64]">
                            Director Approval Console
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Checklist review, corrections &amp; sign-off
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 2: COURSE PLAN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('coursePlan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    openDropdown === 'coursePlan'
                      ? 'bg-[#26648E] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#26648E] hover:bg-[#f0f5f9]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#4F8FC0]" />
                  <span>Course Plan</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'coursePlan' ? 'rotate-180 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                {openDropdown === 'coursePlan' && (
                  <div className="absolute left-0 mt-2 w-76 bg-white rounded-2xl shadow-xl border border-[#4F8FC0]/25 p-2 animate-fadeIn z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#26648E] block">
                        Course Plan System 2026–2027
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Syllabus, units &amp; lesson plan tracking
                      </span>
                    </div>

                    <a
                      href="/course-plan/index.html"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E] flex items-center gap-1.5">
                          <span>Course Plan Dashboard</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          All teaching faculty course schedule access
                        </div>
                      </div>
                    </a>

                    <a
                      href="/course-plan/index.html#hod"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E] flex items-center gap-1.5">
                          <span>View Department Status (HOD)</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFE3B3] text-[#26648E] font-bold">
                            HOD
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Department-wide faculty syllabus progress &amp; sign-off
                        </div>
                      </div>
                    </a>

                    <a
                      href="/course-plan/index.html#my-plans"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E] flex items-center gap-1.5">
                          <span>My Course Plans</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Manage course units, objectives &amp; lesson dates
                        </div>
                      </div>
                    </a>

                    {user?.role === 'ADMIN' && (
                      <a
                        href="/course-plan/index.html#admin"
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group border-t border-slate-100 mt-1"
                      >
                        <div className="p-2 rounded-lg bg-[#FFE3B3] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E] flex items-center gap-1.5">
                            <span>Central Admin Audit</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                              Admin
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            College-wide compliance &amp; submission overview
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 3: AAA DATA PLATFORM (MQC MEMBER GATED) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('aaa')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    openDropdown === 'aaa'
                      ? 'bg-[#26648E] text-white shadow-sm'
                      : canAccessAaa
                      ? 'text-slate-700 hover:text-[#26648E] hover:bg-[#f0f5f9]'
                      : 'text-slate-500 bg-slate-100/80 hover:bg-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-[#4F8FC0]" />
                  <span>AAA Audit</span>
                  {!canAccessAaa && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-black flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      MQC
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'aaa' ? 'rotate-180 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                {openDropdown === 'aaa' && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#4F8FC0]/25 p-2 animate-fadeIn z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#26648E] block">
                          Annual Academic Audit (AAA)
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          2026–2027 Quality Evaluation
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          canAccessAaa
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {canAccessAaa ? 'Authorized' : 'MQC Only'}
                      </span>
                    </div>

                    {!canAccessAaa ? (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 my-1 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Restricted to MQC Members</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug">
                          The AAA Data Platform is restricted to designated MQC Members and IQAC Administrators.
                        </p>
                        <button
                          type="button"
                          onClick={() => setMqcModalOpen(true)}
                          className="w-full py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-extrabold text-[10px] transition"
                        >
                          View Access Information
                        </button>
                      </div>
                    ) : (
                      <>
                        <a
                          href="/AAA/index.html"
                          onClick={(e) => handleAaaClick(e, '/AAA/index.html')}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                        >
                          <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E] flex items-center gap-1.5">
                              <span>AAA Department Portal</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              Main audit workbench &amp; sheet navigation
                            </div>
                          </div>
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* DROPDOWN 4: PERFORMANCE APPRAISAL */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('appraisal')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    openDropdown === 'appraisal'
                      ? 'bg-[#26648E] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#26648E] hover:bg-[#f0f5f9]'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-[#4F8FC0]" />
                  <span>Appraisal</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'appraisal' ? 'rotate-180 text-white' : 'text-slate-400'
                    }`}
                  />
                </button>

                {openDropdown === 'appraisal' && (
                  <div className="absolute right-0 mt-2 w-76 bg-white rounded-2xl shadow-xl border border-[#4F8FC0]/25 p-2 animate-fadeIn z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#26648E] block">
                        Performance Appraisal of Teacher
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Faculty self-evaluation (All Staff Access)
                      </span>
                    </div>

                    <Link
                      href="/performance-appraisal"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f0f5f9] transition group"
                    >
                      <div className="p-2 rounded-lg bg-[#f0f5f9] text-[#26648E] group-hover:bg-[#26648E] group-hover:text-white transition shrink-0">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 group-hover:text-[#26648E]">
                          Teacher Appraisal Form
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Teaching, evaluation, research &amp; mentoring scores
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* 3. Right: User Identity & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/25 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#26648E] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-[#26648E] leading-none truncate max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[9px] font-black uppercase text-[#4F8FC0] mt-0.5">
                      {user.role}
                      {isHod ? ' • HOD' : ''}
                      {isMqcMember && user.role !== 'ADMIN' ? ' • MQC' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out of IQAC Portal"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] border border-slate-200 transition cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#4F8FC0]/20 bg-white/98 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {user && (
              <div className="p-3 bg-[#f0f5f9] rounded-xl border border-[#4F8FC0]/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#26648E] text-white flex items-center justify-center font-black">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-black text-[#26648E]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    {user.role} {isHod ? '• HOD' : ''} {isMqcMember ? '• MQC Member' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Section 1: Invitation Portal */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider block px-1">
                Invitation Portal
              </span>
              <Link
                href={getInvitationDashboardUrl()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#26648E]" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/department/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <Upload className="w-4 h-4 text-[#26648E]" />
                <span>Upload Invitation</span>
              </Link>
              <Link
                href="/department/remarks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <MessageSquare className="w-4 h-4 text-[#26648E]" />
                <span>Remarks &amp; Corrections</span>
              </Link>
            </div>

            {/* Mobile Section 2: Course Plan */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider block px-1">
                Course Plan System
              </span>
              <a
                href="/course-plan/index.html"
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#26648E]" />
                <span>Course Plan Dashboard</span>
              </a>
              <a
                href="/course-plan/index.html#hod"
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <GraduationCap className="w-4 h-4 text-[#26648E]" />
                <span>View Department Status (HOD)</span>
              </a>
              <a
                href="/course-plan/index.html#my-plans"
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <BookOpen className="w-4 h-4 text-[#26648E]" />
                <span>My Course Plans</span>
              </a>
            </div>

            {/* Mobile Section 3: AAA Audit */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider block px-1">
                Annual Academic Audit (AAA)
              </span>
              {canAccessAaa ? (
                <a
                  href="/AAA/index.html"
                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#26648E]" />
                  <span>AAA Department Portal</span>
                </a>
              ) : (
                <div
                  onClick={() => setMqcModalOpen(true)}
                  className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Restricted to MQC Members</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase">Learn More</span>
                </div>
              )}
            </div>

            {/* Mobile Section 4: Performance Appraisal */}
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider block px-1">
                Performance Appraisal of Teacher
              </span>
              <Link
                href="/performance-appraisal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9]"
              >
                <ClipboardCheck className="w-4 h-4 text-[#26648E]" />
                <span>Teacher Appraisal Form</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* MQC Access Dialog Modal */}
      {mqcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-16 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-[#4F8FC0]/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 font-crest">
                MQC Member Access Required
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Access to the <strong>Annual Academic Audit (AAA) Data Platform</strong> is restricted exclusively to designated <strong>MQC Members</strong> and <strong>IQAC Administrators</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Course Plan &amp; Appraisal are open to all Staff</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Invitation Upload is open to all Staff</span>
              </div>
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>AAA requires MQC designation in Staff Directory</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMqcModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs transition cursor-pointer"
            >
              Understand &amp; Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
