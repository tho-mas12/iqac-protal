'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

export interface StatusStepperProps {
  status: 'PENDING' | 'REMARKS' | 'APPROVED' | string;
  createdAt?: string | Date;
  approvedAt?: string | Date | null;
  remarkedAt?: string | Date | null;
  hardCopyReceived?: boolean;
  hardCopyReceivedAt?: string | Date | null;
  mailSent?: boolean;
  mailSentAt?: string | Date | null;
  variant?: 'compact' | 'horizontal' | 'detailed';
  showSubtext?: boolean;
}

export default function StatusStepper({
  status,
  createdAt,
  approvedAt,
  remarkedAt,
  hardCopyReceived = false,
  mailSent = false,
  variant = 'horizontal',
  showSubtext = true,
}: StatusStepperProps) {
  // Determine states for the 4 stages
  // Stage 1: Submitted (Always completed once created)
  const isStage1Complete = true;

  // Stage 2: Director Review
  const isStage2Pending = status === 'PENDING';
  const isStage2Remarks = status === 'REMARKS';
  const isStage2Complete = status === 'APPROVED';

  // Stage 3: Approved
  const isStage3Complete = status === 'APPROVED';
  const isStage3Active = false;

  // Stage 4: Hard Copy & ERP Dispatched
  const isStage4BothDone = status === 'APPROVED' && hardCopyReceived && mailSent;
  const isStage4Partial = status === 'APPROVED' && (hardCopyReceived || mailSent) && !isStage4BothDone;

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '';
    try {
      return new Date(dateVal).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Compact Mode (for table rows or compact lists)
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 py-1 px-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-medium">
        {/* Step 1: Submitted */}
        <span className="flex items-center gap-1 text-emerald-700 font-bold" title="Stage 1: Submitted">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px]">1</span>
          <span>Submitted</span>
        </span>

        <span className="text-slate-300">→</span>

        {/* Step 2: Review */}
        {isStage2Complete ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold" title="Stage 2: Reviewed">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px]">2</span>
            <span>Reviewed</span>
          </span>
        ) : isStage2Remarks ? (
          <span className="flex items-center gap-1 text-rose-700 font-bold animate-pulse" title="Stage 2: Remarks Returned">
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[9px]">2</span>
            <span>Remarks</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-700 font-bold" title="Stage 2: Under Director Review">
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px]">2</span>
            <span>In Review</span>
          </span>
        )}

        <span className="text-slate-300">→</span>

        {/* Step 3: Approved */}
        {isStage3Complete ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold" title="Stage 3: Approved">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px]">3</span>
            <span>Approved</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400" title="Stage 3: Awaiting Approval">
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px]">3</span>
            <span>Approved</span>
          </span>
        )}

        <span className="text-slate-300">→</span>

        {/* Step 4: Sent to ERP */}
        {isStage4BothDone ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold" title="Stage 4: Hard Copy & Sent to ERP">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">✓</span>
            <span>Sent to ERP</span>
          </span>
        ) : isStage4Partial ? (
          <span className="flex items-center gap-1 text-blue-700 font-bold" title="Stage 4: Sending to ERP">
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px]">4</span>
            <span>Sending to ERP</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400" title="Stage 4: Awaiting Hard Copy & Send to ERP">
            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px]">4</span>
            <span>Send to ERP</span>
          </span>
        )}
      </div>
    );
  }

  // Full Horizontal Stepper (Standard)
  const steps = [
    {
      id: 1,
      title: 'Submitted',
      status: 'complete',
      date: formatDate(createdAt),
      subtext: 'Upload received',
      color: 'emerald',
    },
    {
      id: 2,
      title: 'Director Review',
      status: isStage2Complete ? 'complete' : isStage2Remarks ? 'remarks' : 'active',
      date: isStage2Remarks ? formatDate(remarkedAt) : isStage2Complete ? formatDate(approvedAt) : 'Evaluating',
      subtext: isStage2Complete
        ? 'Verified by IQAC'
        : isStage2Remarks
        ? 'Remarks - Action required'
        : 'Under evaluation',
      color: isStage2Complete ? 'emerald' : isStage2Remarks ? 'rose' : 'amber',
    },
    {
      id: 3,
      title: 'Approved',
      status: isStage3Complete ? 'complete' : isStage2Remarks ? 'paused' : 'pending',
      date: isStage3Complete ? formatDate(approvedAt) : 'Pending',
      subtext: isStage3Complete ? 'Official clearance' : 'Awaiting signoff',
      color: isStage3Complete ? 'emerald' : 'slate',
    },
    {
      id: 4,
      title: 'Hard Copy & Sent to ERP',
      status: isStage4BothDone ? 'complete' : isStage4Partial ? 'partial' : 'pending',
      date: isStage4BothDone ? 'Completed' : isStage4Partial ? 'In Progress' : 'Pending',
      subtext: isStage4BothDone
        ? 'Physical copy & Sent to ERP'
        : hardCopyReceived
        ? 'Hard copy received'
        : mailSent
        ? 'Sent to ERP'
        : 'IQAC documentation & ERP',
      color: isStage4BothDone ? 'emerald' : isStage4Partial ? 'blue' : 'slate',
    },
  ];

  return (
    <div className="w-full py-3">
      {/* 4-Stage Connected Horizontal Stepper Bar */}
      <div className="grid grid-cols-4 gap-2 relative">
        {/* Background connector line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden sm:block" />

        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
              {/* Step Circle Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all shadow-sm ${
                  step.status === 'complete'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : step.status === 'active'
                    ? 'bg-amber-500 text-white shadow-amber-500/25 ring-4 ring-amber-100 animate-pulse'
                    : step.status === 'remarks'
                    ? 'bg-rose-600 text-white shadow-rose-600/25 ring-4 ring-rose-100'
                    : step.status === 'partial'
                    ? 'bg-blue-600 text-white shadow-blue-600/25 ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {step.status === 'complete' ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : step.status === 'active' ? (
                  <Clock className="w-4 h-4" />
                ) : step.status === 'remarks' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : step.status === 'partial' ? (
                  <Send className="w-3.5 h-3.5" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Title & Subtext */}
              <div className="mt-2 space-y-0.5">
                <span
                  className={`block text-xs font-bold leading-tight ${
                    step.status === 'complete'
                      ? 'text-emerald-900'
                      : step.status === 'active'
                      ? 'text-amber-900'
                      : step.status === 'remarks'
                      ? 'text-rose-900'
                      : step.status === 'partial'
                      ? 'text-blue-900'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>

                {showSubtext && (
                  <span
                    className={`block text-[10px] font-medium leading-tight ${
                      step.status === 'complete'
                        ? 'text-emerald-700'
                        : step.status === 'active'
                        ? 'text-amber-700 font-semibold'
                        : step.status === 'remarks'
                        ? 'text-rose-700 font-semibold'
                        : step.status === 'partial'
                        ? 'text-blue-700 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.date ? step.date : step.subtext}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
