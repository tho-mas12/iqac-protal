'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, FileSearch, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QualityPulseProps {
  data?: {
    overdueSubmissions: number;
    pendingEvidence: number;
    correctionsNeeded: number;
    completedRequirements: number;
  };
}

export default function QualityPulseBanner({ data }: QualityPulseProps) {
  const pulse = data || {
    overdueSubmissions: 2,
    pendingEvidence: 12,
    correctionsNeeded: 3,
    completedRequirements: 28,
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-bold tracking-wide uppercase text-indigo-300">Quality Pulse</h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">What needs IQAC attention today?</p>
        </div>
        <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-medium">
          Live Operational Status
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Overdue */}
        <Link
          href="/workspace/requirements?status=Overdue"
          className="group bg-slate-900/80 hover:bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-rose-400">{pulse.overdueSubmissions}</div>
              <div className="text-[11px] text-slate-300 font-medium">Overdue Submissions</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Pending Evidence */}
        <Link
          href="/workspace/evidence?status=PENDING"
          className="group bg-slate-900/80 hover:bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">{pulse.pendingEvidence}</div>
              <div className="text-[11px] text-slate-300 font-medium">Pending Evidence Files</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Corrections Needed */}
        <Link
          href="/workspace/verification?status=CORRECTION_REQUIRED"
          className="group bg-slate-900/80 hover:bg-yellow-950/40 border border-yellow-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{pulse.correctionsNeeded}</div>
              <div className="text-[11px] text-slate-300 font-medium">Corrections Required</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Completed */}
        <Link
          href="/workspace/requirements?status=Approved"
          className="group bg-slate-900/80 hover:bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">{pulse.completedRequirements}</div>
              <div className="text-[11px] text-slate-300 font-medium">Requirements Approved</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
