'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Clock, User as UserIcon } from 'lucide-react';
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
      // Format: "Sat, Aug 29, 12:40:16 PM"
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
      hours = hours ? hours : 12; // 0 becomes 12
      
      setTimeString(`${dayName}, ${monthName} ${dayDate}, ${hours}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {userRole && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
            {userRole}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Real-time Clock */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-inner">
          <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
          <span>{timeString || 'Loading time...'}</span>
        </div>

        {/* User profile dropdown or info */}
        {userName && (
          <div className="hidden md:flex items-center gap-2.5 text-sm font-semibold text-slate-700">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span>{userName}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 px-3.5 py-2 rounded-xl transition-all duration-150 cursor-pointer shadow-sm"
          title="Sign out of your account"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
}
