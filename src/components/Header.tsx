'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  UserCheck,
  LogOut,
  Calendar,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  user: any;
  activeAcademicYear: string;
  onAcademicYearChange: (year: string) => void;
}

const ROLES_DEMO = [
  { label: 'Super Admin', role: 'SUPER_ADMIN' },
  { label: 'IQAC Admin', role: 'IQAC_ADMIN' },
  { label: 'IQAC Member', role: 'IQAC_MEMBER' },
  { label: 'Principal', role: 'PRINCIPAL' },
  { label: 'Dean', role: 'SCHOOL_DEAN' },
  { label: 'HOD', role: 'HOD' },
  { label: 'Coordinator', role: 'DEPT_COORDINATOR' },
  { label: 'Faculty', role: 'FACULTY' },
  { label: 'Auditor', role: 'VIEWER' },
];

export default function Header({ user, activeAcademicYear, onAcademicYearChange }: HeaderProps) {
  const router = useRouter();
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
    fetchNotifications();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch('/api/academic-years');
      if (res.ok) {
        const data = await res.json();
        setAcademicYears(data.years || []);
      }
    } catch (err) {
      console.error('Failed to load academic years', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDemoSwitchRole = async (targetRole: string) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        setShowRoleSelector(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search & Academic Year Switcher */}
      <div className="flex items-center gap-4">
        {/* Academic Year Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-500">AY:</span>
          <select
            value={activeAcademicYear}
            onChange={(e) => onAcademicYearChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            {academicYears.length > 0 ? (
              academicYears.map((ay) => (
                <option key={ay.id} value={ay.year}>
                  {ay.year} {ay.isCurrent ? '(Current)' : ''}
                </option>
              ))
            ) : (
              <option value="2025-26">2025-26 (Current)</option>
            )}
          </select>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search faculty, activities, requirements, evidence..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher (Demo Access) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Role: {user?.role || 'IQAC_ADMIN'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Switch Demo Role
              </div>
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {ROLES_DEMO.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleDemoSwitchRole(r.role)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      user?.role === r.role ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] opacity-70 font-mono">[{r.role}]</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Drawer */}
          {showNotifDrawer && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <h3 className="text-xs font-bold text-slate-800">Notifications</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">No notifications yet</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{user?.name || 'Dr. IQAC Admin'}</div>
            <div className="text-[10px] text-slate-500 font-medium">{user?.username || 'iqac_admin'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
