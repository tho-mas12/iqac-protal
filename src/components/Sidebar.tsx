'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  AlertCircle,
  Info,
  CheckCircle2,
  Building2,
  KeyRound,
  ShieldCheck,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  ClipboardList,
  MessageSquare,
  PhoneCall,
  X,
  HardDrive,
  Database,
  Users,
  Sparkles,
  ChevronDown,
  FileText,
  BarChart3,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Archive,
  Mail,
  Clock,
} from 'lucide-react';
import sjcLogo from '../../public/sjc-logo.png';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface DropdownGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

interface SidebarProps {
  role: 'DEPARTMENT' | 'DIRECTOR' | 'STAFF' | 'ADMIN' | 'ADMINISTRATOR';
  userName?: string;
  departmentName?: string;
  shift?: string;
}

export default function Sidebar({ role, userName, departmentName, shift }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDisplayRole = (r?: string) => {
    if (!r) return '';
    const up = r.toUpperCase();
    if (up === 'STAFF' || up === 'DEPARTMENT') return 'Staff';
    if (up === 'ADMINISTRATOR') return 'Administrator';
    if (up === 'DIRECTOR') return 'Director';
    if (up === 'ADMIN') return 'Admin';
    return r;
  };

  const homeHref =
    role === 'ADMIN'
      ? '/admin'
      : role === 'DIRECTOR'
      ? '/director/dashboard'
      : role === 'ADMINISTRATOR'
      ? '/staff/dashboard'
      : '/hub';

  // Dropdown groups state - closed by default, user opens when desired
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    invitation: false,
    aaa: false,
    coursePlan: false,
    appraisal: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const handleOpenMobile = () => setMobileOpen(true);
    const handleCloseMobile = () => setMobileOpen(false);

    window.addEventListener('open-iqac-sidebar', handleOpenMobile);
    window.addEventListener('close-iqac-sidebar', handleCloseMobile);

    return () => {
      window.removeEventListener('open-iqac-sidebar', handleOpenMobile);
      window.removeEventListener('close-iqac-sidebar', handleCloseMobile);
    };
  }, []);

  // Close mobile drawer whenever pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Automatically expand group only if currently visiting one of its subpages; keep strictly closed on /hub & /admin
  useEffect(() => {
    if (pathname === '/hub' || pathname === '/admin') {
      setOpenGroups({
        invitation: false,
        aaa: false,
        coursePlan: false,
        appraisal: false,
      });
      return;
    }
    if (
      pathname.startsWith('/department/') ||
      pathname.startsWith('/staff/dashboard') ||
      pathname.startsWith('/director/')
    ) {
      setOpenGroups((prev) => ({ ...prev, invitation: true }));
    } else if (pathname.startsWith('/performance-appraisal')) {
      setOpenGroups((prev) => ({ ...prev, appraisal: true }));
    } else if (pathname.startsWith('/course-plan')) {
      setOpenGroups((prev) => ({ ...prev, coursePlan: true }));
    } else if (pathname.startsWith('/AAA')) {
      setOpenGroups((prev) => ({ ...prev, aaa: true }));
    }
  }, [pathname]);

  // 1. Top Admin Primary Items
  const adminPrimaryItems: NavItem[] = [
    { label: 'Common Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Access Control', href: '/admin/users-roles', icon: ShieldCheck, badge: 'Access' },
    { label: 'Appraisal Questions', href: '/admin/appraisal-questions', icon: ClipboardList, badge: 'Appraisal' },
  ];

  // 2. Administrator (Invitation Office) Primary Items
  const administratorPrimaryItems: NavItem[] = [
    { label: 'Administrator Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
  ];

  // 3. Director Primary Items
  const directorPrimaryItems: NavItem[] = [
    { label: 'Director Dashboard', href: '/director/dashboard', icon: LayoutDashboard },
  ];

  // 4. Staff / Faculty Primary Items
  const staffPrimaryItems: NavItem[] = [
    { label: 'Common Dashboard', href: '/hub', icon: LayoutDashboard },
  ];

  // Admin Accordion Dropdown Groups (Admin only operations)
  const adminDropdownGroups: DropdownGroup[] = [
    {
      id: 'invitation',
      label: 'Invitation Portal',
      icon: FileText,
      badge: '4 pages',
      items: [
        { label: 'All Invitations & History', href: '/department/history', icon: Archive, badge: 'All Stages' },
        { label: 'Database Explorer', href: '/admin/database', icon: Database },
        { label: 'Server & Storage', href: '/admin/server-status', icon: HardDrive },
        { label: 'Notifications & Alerts', href: '/admin/notifications', icon: MessageSquare },
      ],
    },
    {
      id: 'aaa',
      label: 'AAA Data Platform',
      icon: BarChart3,
      badge: '4 pages',
      items: [
        { label: 'Admin Hub', href: '/AAA/index.html#admin', icon: BarChart3 },
        { label: 'Department Data', href: '/AAA/index.html#dept-data', icon: Building2 },
        { label: 'All Attributes (Forms 1-10)', href: '/AAA/index.html#form', icon: Layers },
        { label: 'Data Filters & Explorer', href: '/AAA/index.html#filter', icon: FileCheck2 },
      ],
    },
    {
      id: 'coursePlan',
      label: 'Course Plan 2026–27',
      icon: BookOpen,
      badge: '2 pages',
      items: [
        { label: 'Central Admin Audit', href: '/course-plan/index.html#admin', icon: BookOpen },
        { label: 'HOD Department Status', href: '/course-plan/index.html#hod', icon: CheckCircle2 },
      ],
    },
  ];

  // Administrator Dropdown Groups (ONLY Invitation related pages!)
  const administratorDropdownGroups: DropdownGroup[] = [
    {
      id: 'invitation',
      label: 'Invitation Operations',
      icon: FileText,
      badge: '3 pages',
      items: [
        { label: 'Dashboard & Actions', href: '/staff/dashboard', icon: LayoutDashboard },
        { label: 'Mail Dispatch', href: '/staff/dashboard?tab=pending_action', icon: Mail },
        { label: 'History of Invitations', href: '/department/history', icon: Archive },
      ],
    },
  ];

  // Director Dropdown Groups (ONLY Invitation related pages!)
  const directorDropdownGroups: DropdownGroup[] = [
    {
      id: 'invitation',
      label: 'Director Review & Approval',
      icon: FileText,
      badge: '4 pages',
      items: [
        { label: 'Review & Approvals', href: '/director/dashboard', icon: CheckCircle2 },
        { label: 'Live Status & Sign-off', href: '/director/status', icon: Clock },
        { label: 'Executive Summary', href: '/director/summary', icon: BarChart3 },
        { label: 'History of Invitations', href: '/department/history', icon: Archive },
      ],
    },
  ];

  // Staff / Faculty Dropdown Groups (Full academic suite: Invitation, Course Plan, Performance Appraisal, AAA)
  const staffDropdownGroups: DropdownGroup[] = [
    {
      id: 'invitation',
      label: 'Invitation Portal',
      icon: FileText,
      badge: '4 pages',
      items: [
        { label: 'Staff Dashboard', href: '/department/dashboard', icon: LayoutDashboard },
        { label: 'Upload Invitation', href: '/department/upload', icon: UploadCloud },
        { label: 'Remarks & Corrections', href: '/department/remarks', icon: AlertCircle },
        { label: 'History of Invitations', href: '/department/history', icon: Archive },
      ],
    },
    {
      id: 'coursePlan',
      label: 'Course Plan System',
      icon: BookOpen,
      badge: '3 pages',
      items: [
        { label: 'Course Plan Dashboard', href: '/course-plan/index.html', icon: LayoutDashboard },
        { label: 'HOD Department Status', href: '/course-plan/index.html#hod', icon: GraduationCap, badge: 'HOD' },
        { label: 'My Course Plans', href: '/course-plan/index.html#my-plans', icon: BookOpen },
      ],
    },
    {
      id: 'appraisal',
      label: 'Performance Appraisal',
      icon: ClipboardCheck,
      badge: '1 page',
      items: [
        { label: 'Teacher Appraisal Form', href: '/performance-appraisal', icon: ClipboardCheck },
      ],
    },
    {
      id: 'aaa',
      label: 'AAA Platform',
      icon: BarChart3,
      badge: '1 page',
      items: [
        { label: 'AAA Department Portal', href: '/AAA/index.html', icon: BarChart3 },
      ],
    },
  ];

  // Resolve active items by role: Only ADMINISTRATOR gets office dispatch items; STAFF gets full academic suite
  const activePrimaryItems: NavItem[] =
    role === 'ADMIN'
      ? adminPrimaryItems
      : role === 'DIRECTOR'
      ? directorPrimaryItems
      : role === 'ADMINISTRATOR'
      ? administratorPrimaryItems
      : staffPrimaryItems;

  const activeDropdownGroups: DropdownGroup[] =
    role === 'ADMIN'
      ? adminDropdownGroups
      : role === 'DIRECTOR'
      ? directorDropdownGroups
      : role === 'ADMINISTRATOR'
      ? administratorDropdownGroups
      : staffDropdownGroups;

  const handleLogout = async () => {
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

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (AAA Light Academic Tint Palette)     */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex sticky top-0 h-screen overflow-y-auto shrink-0 bg-[#f0f5f9]/95 backdrop-blur-md text-slate-800 flex-col justify-between border-r border-[#4F8FC0]/25 transition-all duration-300 select-none z-30 shadow-xs ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="relative p-3">
          {/* Institutional Brand Box (Matching AAA) */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#4F8FC0]/25 shadow-2xs flex flex-col items-center text-center transition hover:shadow-xs relative">
            <Link href={homeHref} className="flex flex-col items-center w-full">
              {/* Crest Logo Box */}
              <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-[#f0f5f9] via-white to-[#FFE3B3]/30 border border-[#4F8FC0]/30 flex items-center justify-center p-1.5 shadow-2xs mb-2">
                <Image
                  src={sjcLogo}
                  alt="St. Joseph's College Crest"
                  className="h-10 w-auto object-contain drop-shadow-xs"
                  priority
                />
              </div>

              {!collapsed && (
                <div className="w-full">
                  <h1 className="text-sm font-black text-[#26648E] font-crest tracking-tight leading-snug">
                    St. Joseph&apos;s College
                  </h1>
                  <p className="text-[11px] font-bold text-slate-700">
                    (Autonomous)
                  </p>
                  <p className="text-[10px] text-[#4F8FC0] font-extrabold uppercase tracking-wider mt-0.5">
                    Estd. 1844 • Tiruchirappalli
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FFE3B3] text-[#26648E] border border-[#fedba0] shadow-2xs">
                      IQAC PORTAL
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#53D2DC] shadow-2xs"></span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Floating Collapse/Expand Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-[#26648E] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#1f5072] transition-colors z-40 border-2 border-white cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Navigation Items Container */}
          <nav className="space-y-2 mt-3">
            {/* 1. Primary Top Links */}
            <div className="space-y-1.5">
              {!collapsed && (
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {role === 'ADMIN' ? 'Central Console' : (role === 'DIRECTOR' || role === 'ADMINISTRATOR' ? 'Invitation Office' : 'Staff Navigation')}
                </div>
              )}
              {activePrimaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#26648E] text-white shadow-md shadow-[#26648E]/25 border border-[#26648E]'
                        : 'bg-white/80 hover:bg-white text-slate-700 hover:text-[#26648E] border border-slate-200/90 shadow-2xs'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#53D2DC]' : 'text-[#4F8FC0] group-hover:text-[#26648E]'
                      }`}
                    />
                    {!collapsed && <span className="truncate flex-1 tracking-tight">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#FFE3B3] text-[#26648E] font-black border border-[#fedba0]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 2. Dropdown Accordion Groups (User or Admin) */}
            <div className="pt-2.5 space-y-2">
              {!collapsed && (
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {role === 'ADMIN' ? 'Integrated Platforms' : (role === 'DIRECTOR' || role === 'ADMINISTRATOR' ? 'Invitation Portals' : 'Academic Quality Portals')}
                </div>
              )}

              {activeDropdownGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openGroups[group.id];
                const isAnySubActive = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href));

                return (
                  <div
                    key={group.id}
                    className="rounded-2xl overflow-hidden bg-white/90 border border-[#4F8FC0]/25 shadow-2xs transition"
                  >
                    {/* Group Header Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (collapsed) setCollapsed(false);
                        toggleGroup(group.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-black transition-colors cursor-pointer ${
                        isAnySubActive
                          ? 'text-[#26648E] bg-[#e8f1f7]'
                          : 'text-slate-800 hover:text-[#26648E] hover:bg-[#f0f5f9]'
                      }`}
                      title={collapsed ? group.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <GroupIcon className={`w-4 h-4 shrink-0 ${isAnySubActive ? 'text-[#26648E]' : 'text-[#4F8FC0]'}`} />
                        {!collapsed && <span className="truncate">{group.label}</span>}
                      </div>
                      {!collapsed && (
                        <div className="flex items-center gap-1.5">
                          {group.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0f5f9] text-[#26648E] font-extrabold border border-[#4F8FC0]/20">
                              {group.badge}
                            </span>
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-[#26648E]' : ''
                            }`}
                          />
                        </div>
                      )}
                    </button>

                    {/* Collapsible Sub-Items Container */}
                    {isOpen && !collapsed && (
                      <div className="py-1 px-1.5 space-y-1 bg-[#f0f5f9]/70 border-t border-[#4F8FC0]/15">
                        {group.items.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = pathname === sub.href;

                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all group ${
                                isSubActive
                                  ? 'bg-[#26648E] text-white shadow-xs font-extrabold'
                                  : 'text-slate-600 hover:text-[#26648E] hover:bg-white'
                              }`}
                            >
                              <SubIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isSubActive ? 'text-[#53D2DC]' : 'text-[#4F8FC0] group-hover:text-[#26648E]'
                                }`}
                              />
                              <span className="truncate">{sub.label}</span>
                              {sub.badge && (
                                <span className="text-[9px] px-1 rounded bg-[#FFE3B3] text-[#26648E] font-bold ml-auto">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom User Info Section */}
        <div className="p-3 border-t border-[#4F8FC0]/25">
          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#4F8FC0]/25 shadow-2xs ${
              collapsed ? 'flex-col gap-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#26648E] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {(userName || role).charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-[#26648E] truncate">
                    {userName || (departmentName ? `${departmentName}` : role)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase truncate">
                    {getDisplayRole(role)} {shift ? `(${shift})` : ''}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Department Contact Support Footer */}
          {role === 'DEPARTMENT' && !collapsed && (
            <div className="mt-2.5 p-2.5 rounded-2xl bg-white border border-[#4F8FC0]/25 shadow-2xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#26648E]">
                <PhoneCall className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Helpdesk Query:</span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-900 truncate">
                Dr. A. Johnson Francis
              </div>
              <a
                href="tel:7418671366"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#26648E] hover:text-[#4F8FC0] transition-colors"
              >
                <span>📞 7418671366</span>
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY & SLIDE-OUT (For screens < md)  */}
      {/* ======================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#f0f5f9] text-slate-800 flex flex-col justify-between border-r border-[#4F8FC0]/30 shadow-2xl z-50 animate-in slide-in-from-left duration-250 overflow-y-auto">
            <div className="p-3">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#4F8FC0]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-11 rounded-lg bg-white border border-[#4F8FC0]/30 flex items-center justify-center p-1">
                    <Image src={sjcLogo} alt="SJC" className="h-8 w-auto object-contain" />
                  </div>
                  <div>
                    <span className="font-crest font-bold text-sm text-[#26648E] block leading-tight">IQAC Portal</span>
                    <span className="text-[10px] text-slate-500 font-semibold">St. Joseph&apos;s College</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation items */}
              <nav className="space-y-2">
                <div className="space-y-1.5">
                  <div className="px-2 text-[10px] font-black uppercase text-slate-400">
                    {role === 'ADMIN' ? 'Central Console' : (role === 'DIRECTOR' || role === 'ADMINISTRATOR' ? 'Invitation Office' : 'Staff Navigation')}
                  </div>
                  {activePrimaryItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-[#26648E] text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#53D2DC]' : 'text-[#4F8FC0]'}`} />
                        <span className="truncate flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="px-2 text-[10px] font-black uppercase text-slate-400">
                    {role === 'ADMIN' ? 'Integrated Platforms' : (role === 'DIRECTOR' || role === 'ADMINISTRATOR' ? 'Invitation Portals' : 'Academic Quality Portals')}
                  </div>
                  {activeDropdownGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const isOpen = openGroups[group.id];

                    return (
                      <div key={group.id} className="rounded-2xl overflow-hidden bg-white border border-[#4F8FC0]/25 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-800 hover:bg-[#f0f5f9]"
                        >
                          <div className="flex items-center gap-2">
                            <GroupIcon className="w-4 h-4 text-[#26648E]" />
                            <span>{group.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180 text-[#26648E]' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="py-1 px-1.5 space-y-1 bg-[#f0f5f9]/80 border-t border-[#4F8FC0]/15">
                            {group.items.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubActive = pathname === sub.href;

                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                                    isSubActive
                                      ? 'bg-[#26648E] text-white shadow-xs font-black'
                                      : 'text-slate-600 hover:text-[#26648E]'
                                  }`}
                                >
                                  <SubIcon className="w-3.5 h-3.5 shrink-0 text-[#4F8FC0]" />
                                  <span className="truncate">{sub.label}</span>
                                  {sub.badge && (
                                    <span className="text-[9px] px-1 rounded bg-[#FFE3B3] text-[#26648E] font-bold ml-auto">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Bottom User info in Mobile Drawer */}
            <div className="p-3 border-t border-[#4F8FC0]/20 bg-white">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/25">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-xl bg-[#26648E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(userName || role).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-[#26648E] truncate">
                      {userName || (departmentName ? `${departmentName}` : role)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase truncate">
                      {getDisplayRole(role)} {shift ? `• ${shift}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
