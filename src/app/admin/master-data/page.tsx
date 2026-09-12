'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Settings, Building2, BookOpen, Layers } from 'lucide-react';

export default function MasterDataPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [masterData, setMasterData] = useState<any>({});

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const mRes = await fetch('/api/master-data');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMasterData(mData);
      }
    } catch (err) {
      console.error('Failed to load master data', err);
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
              <Settings className="w-5 h-5 text-indigo-600" />
              Master Data & System Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage departments, schools, frameworks, criteria, and institutional configuration parameters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Departments Registry
              </h3>
              <div className="space-y-2">
                {masterData.departments?.map((d: any) => (
                  <div key={d.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{d.name}</span>
                    <span className="font-mono text-indigo-600 font-bold">{d.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frameworks */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Accreditation Frameworks
              </h3>
              <div className="space-y-2">
                {masterData.frameworks?.map((f: any) => (
                  <div key={f.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.description}</div>
                    </div>
                    <span className="font-mono text-emerald-600 font-bold">{f.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
