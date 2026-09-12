'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Tag,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Download,
  Share2,
  Filter,
  Search,
  Layers,
  Sparkles,
  Info,
  Flame,
  X,
  List,
  Grid
} from 'lucide-react';
import StatusStepper from './StatusStepper';
import { getWhatsAppApprovalShareUrl } from '@/lib/whatsapp-direct';

interface EventItem {
  id: string;
  programTitle: string;
  category: string;
  customCategory?: string;
  shift: string;
  fromDate: string;
  toDate?: string | null;
  status: string;
  department?: {
    name: string;
    code?: string;
    shift?: string;
  };
  departmentId?: string;
  fileName?: string;
  approvedAt?: string | null;
  createdAt?: string;
  hardCopyReceived?: boolean;
  mailSent?: boolean;
}

interface EventCalendarProps {
  events: EventItem[];
  userDepartmentId?: string;
  userRole?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; chip: string }> = {
  'Endowment Lecture': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', chip: 'bg-purple-600' },
  'Conference': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', chip: 'bg-indigo-600' },
  'Webinar': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', chip: 'bg-sky-600' },
  'Seminar': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', chip: 'bg-blue-600' },
  'Orientation': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', chip: 'bg-teal-600' },
  'Skill Development': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', chip: 'bg-emerald-600' },
  'Induction': { bg: 'bg-lime-50', text: 'text-lime-800', border: 'border-lime-200', chip: 'bg-lime-600' },
  'FDP': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', chip: 'bg-amber-600' },
  'Workshop': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', chip: 'bg-orange-600' },
  'Club Activity': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', chip: 'bg-rose-600' },
  'Gender Based': { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', chip: 'bg-pink-600' },
  'Career Guidance': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', chip: 'bg-cyan-600' },
  'Placement Lecture Series': { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200', chip: 'bg-violet-600' },
  'Training': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', chip: 'bg-amber-600' },
  'Other': { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', chip: 'bg-slate-600' },
};

export default function EventCalendar({ events, userDepartmentId, userRole }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: EventItem[] } | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Year and Month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Title
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (categoryFilter !== 'ALL' && ev.category !== categoryFilter) return false;
      if (shiftFilter !== 'ALL' && ev.shift !== shiftFilter) return false;
      if (statusFilter !== 'ALL' && ev.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.programTitle?.toLowerCase().includes(q);
        const matchDept = ev.department?.name?.toLowerCase().includes(q);
        const matchCat = ev.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDept && !matchCat) return false;
      }
      return true;
    });
  }, [events, categoryFilter, shiftFilter, statusFilter, searchQuery]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: EventItem[];
    }> = [];

    const today = new Date();
    const isSameDate = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    // Helper to check if event falls on a given date (inclusive of range)
    const getEventsForDate = (checkDate: Date) => {
      const checkMidnight = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()).getTime();

      return filteredEvents.filter((ev) => {
        if (!ev.fromDate) return false;
        const fromD = new Date(ev.fromDate);
        const fromMidnight = new Date(fromD.getFullYear(), fromD.getMonth(), fromD.getDate()).getTime();

        if (!ev.toDate) {
          return checkMidnight === fromMidnight;
        }

        const toD = new Date(ev.toDate);
        const toMidnight = new Date(toD.getFullYear(), toD.getMonth(), toD.getDate()).getTime();
        return checkMidnight >= fromMidnight && checkMidnight <= toMidnight;
      });
    };

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      days.push({
        date: d,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: isSameDate(d, today),
        events: getEventsForDate(d),
      });
    }

    // 2. Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      days.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: isSameDate(d, today),
        events: getEventsForDate(d),
      });
    }

    // 3. Next month leading days to complete the 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: isSameDate(d, today),
        events: getEventsForDate(d),
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredEvents]);

  // List of upcoming events for Agenda view
  const agendaEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* College Real-time Sync Informational Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#2a1b54] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-sm border border-purple-400/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Automatic Live College Schedule Sync</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            College Events & Clash-Prevention Calendar
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm leading-relaxed">
            Automatically populates in real-time as departments submit approved event invitations. Check other department programs to avoid date & venue clashes!
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 z-10 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Month Grid</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'agenda'
                ? 'bg-white text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Agenda List</span>
          </button>
        </div>
      </div>

      {/* Filter and Navigation Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Month Stepper Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight ml-2">
              {monthName}
            </h3>
          </div>

          {/* Quick Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 sm:w-48 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search event/department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium"
              />
            </div>

            {/* Shift Filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="ALL">All Shifts</option>
              <option value="Shift I">Shift I</option>
              <option value="Shift II">Shift II</option>
              <option value="Both">Both Shifts</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="PENDING">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'Conference', 'Seminar', 'Workshop', 'Endowment Lecture', 'FDP', 'Skill Development', 'Career Guidance', 'Webinar', 'Club Activity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: MONTH GRID CALENDAR */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-extrabold text-slate-600 uppercase tracking-wider py-3">
            <span className="text-rose-600">Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-indigo-600">Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((dayObj, idx) => {
              const hasEvents = dayObj.events.length > 0;
              const hasClash = dayObj.events.length >= 2;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDayEvents({ date: dayObj.date, events: dayObj.events });
                    }
                  }}
                  className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2.5 flex flex-col justify-between transition-colors relative ${
                    dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                  } ${dayObj.isToday ? 'ring-2 ring-purple-600 ring-inset bg-purple-50/20' : ''} ${
                    hasEvents ? 'cursor-pointer hover:bg-purple-50/30' : ''
                  }`}
                >
                  {/* Day Header with Number and Clash Badge */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        dayObj.isToday
                          ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                          : dayObj.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayObj.dayNumber}
                    </span>

                    {/* Clash warning badge for 2+ events on the same date */}
                    {hasClash && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-tight"
                        title="Multiple college events scheduled on this date (Clash Alert)"
                      >
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>{dayObj.events.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayObj.events.slice(0, 3).map((ev) => {
                      const col = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Other'];
                      const isOwnDept = userDepartmentId && ev.departmentId === userDepartmentId;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`p-1 sm:p-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold truncate border transition-all hover:scale-[1.02] shadow-xs cursor-pointer ${
                            col.bg
                          } ${col.text} ${col.border} ${
                            isOwnDept ? 'ring-1 ring-purple-400 font-bold' : ''
                          }`}
                          title={`${ev.programTitle} — ${ev.department?.name || 'Department'}`}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${col.chip} shrink-0`} />
                            <span className="truncate font-bold">{ev.programTitle}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 truncate flex items-center justify-between mt-0.5">
                            <span className="truncate">{ev.department?.name || 'Dept'}</span>
                            <span className="font-mono text-[8px] opacity-75">{ev.shift}</span>
                          </div>
                        </div>
                      );
                    })}

                    {dayObj.events.length > 3 && (
                      <div className="text-[10px] font-bold text-purple-700 text-center py-0.5 bg-purple-50 rounded">
                        +{dayObj.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              <span>Chronological Event Schedule ({agendaEvents.length} events)</span>
            </h4>
          </div>

          {agendaEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No events found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {agendaEvents.map((ev) => {
                const col = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Other'];
                const isOwnDept = userDepartmentId && ev.departmentId === userDepartmentId;

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="pt-3 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Date Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex flex-col items-center justify-center font-extrabold shrink-0 shadow-sm">
                        <span className="text-[10px] uppercase text-purple-600 leading-tight">
                          {new Date(ev.fromDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg leading-tight">
                          {new Date(ev.fromDate).getDate()}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-extrabold text-slate-900 text-sm">{ev.programTitle}</h5>
                          {isOwnDept && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                              Your Department
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className="font-semibold text-slate-700">{ev.department?.name || 'Department'}</span>
                          <span>•</span>
                          <span>{ev.shift}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${col.bg} ${col.text}`}>
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {ev.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
                        </span>
                      )}

                      <button
                        type="button"
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-800 transition-colors"
                        title="View Full Event Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SINGLE EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-md shadow-purple-700/30 shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Event Schedule Details</h4>
                  <span className="text-xs text-slate-500 font-medium">IQAC Verified College Event</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm">
              {/* Event Title */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Program Title
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {selectedEvent.programTitle}
                </h3>
              </div>

              {/* Department & Shift */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {selectedEvent.department?.name || 'Department'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Shift & Category</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {selectedEvent.shift} • {selectedEvent.category}
                  </span>
                </div>
              </div>

              {/* Event Date Range */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Scheduled Date(s)</span>
                  <span className="font-bold text-purple-950 text-sm">
                    {new Date(selectedEvent.fromDate).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {selectedEvent.toDate &&
                      ` to ${new Date(selectedEvent.toDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}`}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-bold">
                  {selectedEvent.category}
                </span>
              </div>

              {/* 4-Stage Status Stepper for this Event */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  IQAC Verification & Dispatch Progress
                </span>
                <StatusStepper
                  status={selectedEvent.status}
                  createdAt={selectedEvent.createdAt}
                  approvedAt={selectedEvent.approvedAt}
                  hardCopyReceived={selectedEvent.hardCopyReceived}
                  mailSent={selectedEvent.mailSent}
                  variant="horizontal"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* WhatsApp 1-Click Share Button */}
              <a
                href={getWhatsAppApprovalShareUrl({
                  departmentName: selectedEvent.department?.name || 'Department',
                  shift: selectedEvent.shift,
                  programTitle: selectedEvent.programTitle,
                  category: selectedEvent.category,
                  fromDate: selectedEvent.fromDate,
                  toDate: selectedEvent.toDate,
                })}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Share Event Details on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via WhatsApp</span>
              </a>

              {/* View/Download Poster */}
              <div className="flex items-center gap-2">
                <a
                  href={`/api/invitations/${selectedEvent.id}/file?download=true`}
                  download
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Poster</span>
                </a>
                <a
                  href={`/api/invitations/${selectedEvent.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-700/25 transition-all"
                >
                  <span>View Poster</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MULTI-EVENT DAY VIEW (When user clicks a day with multiple events) */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Events on {selectedDayEvents.date.toLocaleDateString('en-GB', { dateStyle: 'full' })}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedDayEvents.events.length} event(s) scheduled on this date
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDayEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedDayEvents(null);
                    setSelectedEvent(ev);
                  }}
                  className="pt-3 pb-3 flex items-center justify-between gap-3 hover:bg-purple-50/50 p-3 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm truncate">{ev.programTitle}</h5>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-purple-900">{ev.department?.name || 'Department'}</span>
                      <span>•</span>
                      <span>{ev.shift}</span>
                      <span>•</span>
                      <span className="font-semibold">{ev.category}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-bold shrink-0 hover:bg-purple-800 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
