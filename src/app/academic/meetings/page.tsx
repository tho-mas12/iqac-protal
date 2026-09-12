'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Calendar, Plus, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function MeetingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    fetchMeetings();
  }, [activeAcademicYear]);

  const fetchMeetings = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const mRes = await fetch('/api/meetings');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMeetings(mData.meetings || []);
      }
    } catch (err) {
      console.error('Failed to load meetings', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar userRole={user?.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          activeAcademicYear={activeAcademicYear}
          onAcademicYearChange={(y) => setActiveAcademicYear(y)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              IQAC Meetings & Action Taken Report (ATR) Generator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record meeting agendas, minutes, resolutions, and automatically generate Action Taken Reports
            </p>
          </div>

          <div className="space-y-4">
            {meetings.length > 0 ? (
              meetings.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono">
                        {m.meetingNumber}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">{m.title}</h3>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Date: {new Date(m.date).toLocaleDateString()} • Venue: {m.venue || 'Conference Room'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Action Taken Items (ATR)
                    </h4>
                    <div className="space-y-2">
                      {m.actionItems?.map((item: any) => (
                        <div key={item.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{item.resolution}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Action: {item.actionRequired}</div>
                            {item.actionTaken && (
                              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                                ATR Status: {item.actionTaken}
                              </div>
                            )}
                          </div>
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No IQAC meetings logged yet.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
