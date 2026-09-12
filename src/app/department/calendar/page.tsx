'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import EventCalendar from '@/components/EventCalendar';
import Toast, { ToastMessage } from '@/components/Toast';
import { RotateCw, Calendar } from 'lucide-react';

export default function DepartmentCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, eRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations?calendar=true'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      if (eRes.ok) {
        const eData = await eRes.json();
        setEvents(eData.invitations || []);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load college calendar events' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role="DEPARTMENT"
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="College Event Calendar"
          userName={user?.name}
          userRole="Department"
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-semibold text-sm">Loading college events & schedules...</p>
            </div>
          ) : (
            <EventCalendar
              events={events}
              userDepartmentId={user?.departmentId}
              userRole="DEPARTMENT"
            />
          )}
        </main>
      </div>
    </div>
  );
}
