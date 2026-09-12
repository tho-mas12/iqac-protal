'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ShieldCheck, Search, Clock, User, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const lRes = await fetch('/api/audit-logs');
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
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
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              System Audit Trail & Security Event Logs
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable log recorder tracking all login, submission, approval, upload, import, and export operations
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User & Role</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Module</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 font-mono text-[11px]">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 font-sans">{log.userName}</div>
                          <div className="text-[10px] text-indigo-600 font-bold">{log.role}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              log.action === 'LOGIN'
                                ? 'bg-indigo-50 text-indigo-700'
                                : log.action === 'APPROVE' || log.action === 'SUBMIT'
                                ? 'bg-emerald-50 text-emerald-700'
                                : log.action === 'CORRECTION'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{log.module}</td>
                        <td className="p-4 text-slate-500 max-w-sm truncate">{log.detailsJson || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
