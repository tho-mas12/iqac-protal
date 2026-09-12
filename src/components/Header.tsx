'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Menu, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  userName?: string;
  userRole?: string;
}

export default function Header({ title, userName, userRole }: HeaderProps) {
  const router = useRouter();
  const [timeString, setTimeString] = useState<string>('');

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
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      router.push('/login');
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
      {/* Left side: Hamburger (Mobile) + Title + Role Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={handleOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#6320ee] transition-colors shrink-0 cursor-pointer border border-slate-200"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>

          {userRole && (
            <span className="hidden xs:inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide shrink-0">
              {userRole}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Clock, User Profile, Logout */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Real-time Clock (Visible on sm and above) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>{timeString || 'Loading time...'}</span>
        </div>

        {/* User profile initial (Desktop) */}
        {userName && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-extrabold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[120px]">{userName}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-sm"
          title="Sign out of your account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
