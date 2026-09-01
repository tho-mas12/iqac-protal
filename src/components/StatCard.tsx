import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const variantStyles = {
  blue: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-100',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100/70',
  },
  green: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100/70',
  },
  yellow: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-100',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100/70',
  },
  purple: {
    bg: 'bg-purple-50/80',
    border: 'border-purple-100',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100/70',
  },
  red: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-100',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100/70',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'blue' }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</span>
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {subtitle && <span className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</span>}
      </div>

      <div className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center ${styles.iconBg} ${styles.iconColor} border ${styles.border} shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
