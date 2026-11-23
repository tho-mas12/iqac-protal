'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Clock, Menu, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName?: string;
  userRole?: string;
}

export default function Header({ title, userName, userRole }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [timeString, setTimeString] = useState<string>('');

  const normalizedRole = (userRole || '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN' || pathname.startsWith('/admin');
  const isDirector = normalizedRole === 'DIRECTOR' || pathname.startsWith('/director');
  const isAdministrator = normalizedRole === 'ADMINISTRATOR' || pathname === '/staff/dashboard';

  let homeLink = '/hub';
  let homeLabel = 'Common Dashboard';
  let showBackButton = false;

  if (isAdmin) {
    homeLink = '/admin';
    homeLabel = 'Admin Console';
    showBackButton = pathname !== '/admin';
  } else if (isDirector) {
    homeLink = '/director/dashboard';
    homeLabel = 'Director Dashboard';
    showBackButton = pathname !== '/director/dashboard';
  } else if (isAdministrator) {
    homeLink = '/staff/dashboard';
    homeLabel = 'Administrator Dashboard';
    showBackButton = pathname !== '/staff/dashboard';
  } else {
    // Staff / Faculty
    homeLink = '/hub';
    homeLabel = 'Common Dashboard';
    showBackButton = pathname !== '/hub';
  }

  const getDisplayRole = (role?: string) => {
    if (!role) return '';
    const r = role.toUpperCase();
    if (r === 'STAFF' || r === 'DEPARTMENT') return 'Staff';
    if (r === 'ADMINISTRATOR') return 'Administrator';
    if (r === 'DIRECTOR') return 'Director';
    if (r === 'ADMIN') return 'Admin';
    return role;
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dayDate = now.getDate();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;

      setTimeString(`${dayName}, ${monthName} ${dayDate} • ${hours}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-iqac-sidebar'));
  };

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
    <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-[#4F8FC0]/25 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left side: Hamburger (Mobile) + Title + Role Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={handleOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition-colors shrink-0 cursor-pointer border border-[#4F8FC0]/30"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-[#26648E]" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#26648E] font-crest tracking-tight truncate">
            {title}
          </h1>

          {userRole && (
            <span className="hidden xs:inline-block text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FFE3B3] text-[#26648E] border border-[#fedba0] uppercase tracking-wider shrink-0 shadow-2xs">
              {getDisplayRole(userRole)}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Back to Hub, Clock, User Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Context-aware Return Button */}
        {showBackButton && (
          <Link
            href={homeLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black shadow-xs transition active:scale-95"
            title={`Return to ${homeLabel}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{homeLabel}</span>
          </Link>
        )}

        {/* Real-time Clock (Visible on sm and above) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#26648E] bg-[#f0f5f9] px-3 py-1.5 rounded-xl border border-[#4F8FC0]/25 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#4F8FC0] animate-pulse" />
          <span>{timeString || 'Loading time...'}</span>
        </div>

        {/* User profile initial (Desktop) */}
        {userName && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-[#26648E] bg-white border border-[#4F8FC0]/25 px-2.5 py-1.5 rounded-xl shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#26648E] text-white flex items-center justify-center text-xs font-black">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[130px]">{userName}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
