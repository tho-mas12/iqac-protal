'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.duration || 4500;
    const intervalTime = 50;
    const decrement = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [toast, onClose]);

  if (!toast) return null;

  const config = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      barBg: 'bg-emerald-500',
      icon: CheckCircle2,
      title: 'Success',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50',
      iconBg: 'bg-amber-500/20 text-amber-400',
      barBg: 'bg-amber-500',
      icon: AlertTriangle,
      title: 'Attention',
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/50',
      iconBg: 'bg-rose-500/20 text-rose-400',
      barBg: 'bg-rose-500',
      icon: XCircle,
      title: 'Notice',
    },
    info: {
      bg: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-100 shadow-indigo-950/50',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      barBg: 'bg-indigo-500',
      icon: Info,
      title: 'Information',
    },
  }[toast.type] || {
    bg: 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/50',
    iconBg: 'bg-slate-800 text-slate-300',
    barBg: 'bg-purple-500',
    icon: Info,
    title: 'Notification',
  };

  const Icon = config.icon;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] animate-in slide-in-from-top-4 sm:slide-in-from-right-4 fade-in duration-300">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl p-4 flex items-start gap-3.5 ${config.bg}`}
      >
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">
            {config.title}
          </p>
          <p className="text-sm font-medium leading-snug break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
          title="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div
            className={`h-full ${config.barBg} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
