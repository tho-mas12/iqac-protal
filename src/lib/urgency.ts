export interface UrgencyInfo {
  level: 'critical' | 'urgent' | 'priority' | 'normal';
  label: string;
  badgeClass: string;
  isUrgent: boolean;
  diffDays: number;
}

export function getUrgencyStatus(fromDate: string | Date | null | undefined): UrgencyInfo | null {
  if (!fromDate) return null;
  const eventDate = new Date(fromDate);
  if (isNaN(eventDate.getTime())) return null;

  const now = new Date();

  // Normalize both dates to midnight for consistent day-based calculation
  const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = eventMidnight - todayMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      level: 'critical',
      label: diffDays === 0 ? '🔥 EVENT TODAY' : '⚠️ EVENT DATE PASSED',
      badgeClass: 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-sm',
      isUrgent: true,
      diffDays,
    };
  } else if (diffDays <= 2) {
    // Within 48 hours
    return {
      level: 'urgent',
      label: diffDays === 1 ? '🔥 EVENT TOMORROW (< 24h)' : '🔥 EVENT IN 2 DAYS (< 48h)',
      badgeClass: 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-700 animate-pulse shadow-md shadow-rose-600/30',
      isUrgent: true,
      diffDays,
    };
  } else if (diffDays === 3) {
    // Within 72 hours
    return {
      level: 'priority',
      label: '⚡ EVENT IN 3 DAYS (< 72h)',
      badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-amber-600 shadow-sm',
      isUrgent: true,
      diffDays,
    };
  }

  return {
    level: 'normal',
    label: `${diffDays} days away`,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    isUrgent: false,
    diffDays,
  };
}
