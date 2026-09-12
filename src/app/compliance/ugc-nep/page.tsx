'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Award, ShieldCheck, Plus, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function UgcNepCompliancePage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [complianceItems, setComplianceItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCompliance();
  }, [selectedCategory]);

  const fetchCompliance = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      let url = '/api/compliance';
      if (selectedCategory) url += `?category=${selectedCategory}`;

      const cRes = await fetch(url);
      if (cRes.ok) {
        const cData = await cRes.json();
        setComplianceItems(cData.complianceItems || []);
        setSummary(cData.summary || {});
      }
    } catch (err) {
      console.error('Failed to load compliance tracker', err);
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
              UGC / NEP 2020 / NAAC / NIRF Compliance Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Regulatory compliance tracker for statutory mandates, public disclosures, and accreditation parameters
            </p>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Mandates Monitored</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.total || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Compliant</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summary.compliant || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Partially Compliant</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{summary.partiallyCompliant || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Not Compliant</div>
              <div className="text-2xl font-black text-rose-600 mt-1">{summary.notCompliant || 0}</div>
            </div>
          </div>

          {/* Compliance Items Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800">Statutory Regulatory Directives</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="">All Categories</option>
                <option value="UGC">UGC Mandates</option>
                <option value="NEP">NEP 2020 Initiatives</option>
                <option value="NAAC">NAAC Quality Benchmarks</option>
                <option value="NIRF">NIRF Parameters</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Regulatory Requirement</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Authority / Directive</th>
                    <th className="p-4">Responsible Officer</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {complianceItems.length > 0 ? (
                    complianceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{item.requirementName}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{item.sourceAuthority || 'Statutory Notice'}</td>
                        <td className="p-4 text-slate-800 font-semibold">{item.responsiblePerson || 'IQAC'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.status === 'Compliant'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'Partially Compliant'
                                ? 'bg-amber-100 text-amber-700'
                                : item.status === 'Under Review'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{item.remarks || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No regulatory compliance items found.
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
