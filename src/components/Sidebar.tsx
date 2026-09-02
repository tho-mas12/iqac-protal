'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  X
} from 'lucide-react';
import Logo from './Logo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
}

interface SidebarProps {
  role: 'DEPARTMENT' | 'DIRECTOR' | 'STAFF' | 'ADMIN';
  userName?: string;
  departmentName?: string;
  shift?: string;
}

export default function Sidebar({ role, userName, departmentName, shift }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'DEPARTMENT':
        return [
          { label: 'Dashboard', href: '/department/dashboard', icon: LayoutDashboard },
          { label: 'Upload Invitation', href: '/department/upload', icon: UploadCloud },
          { label: 'Remarks & Corrections', href: '/department/remarks', icon: AlertCircle },
          { label: 'Department Info', href: '/department/info', icon: Info },
        ];
      case 'DIRECTOR':
        return [
          { label: 'Dashboard', href: '/director/dashboard', icon: LayoutDashboard },
          { label: 'Status & History', href: '/director/status', icon: FileCheck2 },
          { label: 'Department Summary', href: '/director/summary', icon: Layers },
        ];
      case 'STAFF':
        return [
          { label: 'Staff Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
        ];
      case 'ADMIN':
        return [
          { label: 'Departments', href: '/admin/departments', icon: Building2 },
          { label: 'Access Department', href: '/admin/access-departments', icon: KeyRound },
          { label: 'Access Control', href: '/admin/access-control', icon: ShieldCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (Visible on md/lg and above)          */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex sticky top-0 h-screen overflow-y-auto shrink-0 bg-[#0d131f] text-slate-300 flex-col justify-between border-r border-[#192338] transition-all duration-300 select-none z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="relative">
          <div className="h-20 flex items-center justify-between px-4 border-b border-[#192338]">
            <Link href="#" className="flex items-center gap-3 overflow-hidden">
              <Logo size="sm" />
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-white text-base tracking-wide whitespace-nowrap">IQAC Portal</span>
                  <span className="text-[11px] text-purple-400 font-medium tracking-tight">Management System</span>
                </div>
              )}
            </Link>
          </div>

          {/* Floating Collapse/Expand Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3.5 top-7 w-7 h-7 bg-[#6d28d9] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors z-40 border-2 border-[#0d131f] cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Navigation items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/director/dashboard' &&
                  item.href !== '/department/dashboard' &&
                  item.href !== '/staff/dashboard' &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#6d28d9] text-white shadow-lg shadow-purple-950/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-[#161f30]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 tracking-tight">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info Section */}
        <div className="p-3 border-t border-[#192338]">
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl bg-[#161f30]/80 border border-[#223049]/60 ${
              collapsed ? 'flex-col gap-2' : ''
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
                {(userName || role).charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {userName || (departmentName ? `${departmentName}` : role)}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize truncate">
                    {role.toLowerCase()} {shift ? `(${shift})` : ''}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#0d131f] text-slate-300 flex flex-col justify-between border-r border-[#192338] shadow-2xl z-50 animate-in slide-in-from-left duration-250">
            <div>
              {/* Drawer Top */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#192338]">
                <div className="flex items-center gap-3">
                  <Logo size="sm" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base tracking-wide">IQAC Portal</span>
                    <span className="text-[11px] text-purple-400 font-medium">St. Joseph's College</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation items */}
              <nav className="p-3 space-y-1.5 mt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/director/dashboard' &&
                      item.href !== '/department/dashboard' &&
                      item.href !== '/staff/dashboard' &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-[#6d28d9] text-white shadow-lg shadow-purple-950/40 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-[#161f30]'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom User info in Mobile Drawer */}
            <div className="p-3 border-t border-[#192338] bg-[#090d16]">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#161f30] border border-[#223049]/60">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
                    {(userName || role).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate">
                      {userName || (departmentName ? `${departmentName}` : role)}
                    </span>
                    <span className="text-[11px] text-purple-300 font-semibold uppercase truncate">
                      {role} {shift ? `• ${shift}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
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
