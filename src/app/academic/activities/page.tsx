'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Award, Plus, Calendar, CheckCircle2, XCircle, FileText, Check } from 'lucide-react';

export default function ActivitiesPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [activeAcademicYear]);

  const fetchActivities = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const aRes = await fetch(`/api/activities?academicYearId=${activeAcademicYear}`);
      if (aRes.ok) {
        const aData = await aRes.json();
        setActivities(aData.activities || []);
      }
    } catch (err) {
      console.error('Failed to load activities', err);
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
              <Award className="w-5 h-5 text-indigo-600" />
              Department Activities & Automatic Evidence Checklist
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track department seminars, conferences, FDPs with automatic proof verification checklist
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono">
                      {act.activityNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        act.evidenceStatus === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {act.evidenceStatus === 'Complete' ? 'Evidence Complete ✓' : 'Evidence Incomplete ✗'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{act.title}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {act.department?.name} • Coordinator: {act.coordinatorName || 'Dept HOD'}
                    </div>
                  </div>

                  {/* Evidence Checklist Grid (Requirement #14) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Evidence Checklist
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.invitation ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.invitation ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Invitation
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.report ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.report ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Event Report
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.attendance ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.attendance ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Attendance
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.photographs ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.photographs ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Photographs
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.feedback ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.feedback ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Feedback Form
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {act.checklist?.certificates ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={act.checklist?.certificates ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                          Certificates
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No department activities recorded for AY {activeAcademicYear}.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
