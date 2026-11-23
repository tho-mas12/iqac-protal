'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  FileText,
  BarChart3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  Building2,
  ExternalLink,
  GraduationCap,
  ClipboardCheck,
  Upload,
  MessageSquare,
  ChevronRight,
  Layers,
  Award,
  AlertTriangle,
  Megaphone,
  Clock,
  Calendar,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import sjcLogo from '../../../public/sjc-logo.png';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: 'URGENT' | 'NOTICE' | 'QUALITY' | 'INFO' | 'GENERAL';
  target: string;
  date: string;
  isActive: boolean;
  author?: string;
}

export default function StaffCommonDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMqcMember, setIsMqcMember] = useState(false);
  const [isHod, setIsHod] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeAnnIndex, setActiveAnnIndex] = useState(0);

  // Invitations & Remarks analysis state
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invStats, setInvStats] = useState({
    total: 0,
    pending: 0,
    remarks: 0,
    approved: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, mqcRes, annRes, invRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/mqc-members'),
        fetch('/api/announcements'),
        fetch('/api/invitations'),
      ]);

      if (!meRes.ok) {
        // Fallback to local SSO session if cookie sync had transient network latency
        if (typeof window !== 'undefined') {
          const ssoRaw = localStorage.getItem('IQAC_SSO_USER');
          if (ssoRaw) {
            try {
              const sso = JSON.parse(ssoRaw);
              const ssoRole = (sso.role || '').toUpperCase();
              if (ssoRole === 'ADMIN') {
                router.replace('/admin');
                return;
              }
              if (ssoRole === 'DIRECTOR') {
                router.replace('/director/dashboard');
                return;
              }
              if (ssoRole === 'ADMINISTRATOR') {
                router.replace('/staff/dashboard');
                return;
              }

              setUser(sso);
              setIsMqcMember(Boolean(sso.isMqc));
              setIsHod(Boolean(sso.isHod));
              setLoading(false);
              return;
            } catch (e) {}
          }
        }
        router.push('/login');
        return;
      }

      const meData = await meRes.json();
      const currentUserRole = (meData.user?.role || '').toUpperCase();
      if (currentUserRole === 'ADMIN') {
        router.replace('/admin');
        return;
      }
      if (currentUserRole === 'DIRECTOR') {
        router.replace('/director/dashboard');
        return;
      }
      if (currentUserRole === 'ADMINISTRATOR') {
        router.replace('/staff/dashboard');
        return;
      }

      setUser(meData.user);

      if (mqcRes.ok) {
        const mqcData = await mqcRes.json();
        setIsMqcMember(Boolean(mqcData.isCurrentMqc));
        setIsHod(Boolean(mqcData.isCurrentHod));
      }

      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }

      if (invRes.ok) {
        const iData = await invRes.json();
        setInvitations(iData.invitations || []);
        setInvStats(iData.stats || { total: 0, pending: 0, remarks: 0, approved: 0 });
      }
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const remarksInvitations = invitations.filter(
    (inv) => inv.status === 'REMARKS' || (inv.remarks && inv.remarks.trim())
  );

  const currentAnnouncement = announcements.length > 0 ? announcements[activeAnnIndex] : null;

  const canAccessAaa = user?.role === 'ADMIN' || isMqcMember;

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      {/* Arctic Frost Aura Background Layers */}
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      {/* 1. LEFT SIDEBAR (Contains Invitation, Course Plan, Performance Appraisal, AAA Platform with Dropdowns) */}
      <Sidebar
        role={user?.role || 'STAFF'}
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <Header
          title="Staff & Faculty Quality Dashboard"
          userName={user?.name}
          userRole={user?.role || 'Staff'}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* ========================================================== */}
          {/* 1. TOP ANNOUNCEMENT BANNER FROM ADMIN (REQUESTED AT TOP)   */}
          {/* ========================================================== */}
          {currentAnnouncement && (
            <div className="rounded-2xl overflow-hidden shadow-md border border-[#4F8FC0]/30 transition-all">
              <div
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  currentAnnouncement.type === 'URGENT'
                    ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white'
                    : currentAnnouncement.type === 'NOTICE'
                    ? 'bg-gradient-to-r from-[#163850] via-[#26648E] to-[#1f5072] text-white'
                    : currentAnnouncement.type === 'QUALITY'
                    ? 'bg-gradient-to-r from-emerald-900 via-[#125e64] to-teal-900 text-white'
                    : 'bg-gradient-to-r from-[#1f5072] via-[#26648E] to-[#4F8FC0] text-white'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        currentAnnouncement.type === 'URGENT'
                          ? 'bg-rose-500/30 text-rose-100 border border-rose-400/40'
                          : 'bg-[#FFE3B3] text-[#26648E] font-black'
                      }`}
                    >
                      <Megaphone className="w-3 h-3" />
                      <span>
                        {currentAnnouncement.type === 'GENERAL'
                          ? 'GENERAL INSTRUCTION'
                          : `${currentAnnouncement.type} ANNOUNCEMENT`}
                      </span>
                    </span>

                    <span className="text-[11px] font-bold text-slate-200">
                      Target: <strong>{currentAnnouncement.target}</strong>
                    </span>

                    <span className="text-[10px] text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FFE3B3]" />
                      <span>{currentAnnouncement.date}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black font-crest tracking-tight leading-snug text-white">
                    {currentAnnouncement.title}
                  </h3>

                  <p className="text-xs text-slate-100/90 font-medium leading-relaxed max-w-4xl">
                    {currentAnnouncement.content}
                  </p>
                </div>

                {/* Multiple Announcements Navigation Pills */}
                {announcements.length > 1 && (
                  <div className="flex md:flex-col items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/20">
                    <div className="flex items-center gap-1">
                      {announcements.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveAnnIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                            idx === activeAnnIndex
                              ? 'bg-[#FFE3B3] w-6'
                              : 'bg-white/40 hover:bg-white/70'
                          }`}
                          title={`View announcement ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">
                      {activeAnnIndex + 1} of {announcements.length} Notices
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. GREETING & INSTITUTIONAL CONTEXT BANNER                 */}
          {/* ========================================================== */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#4F8FC0]/25 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f5f9] text-[#26648E] text-[10px] font-black uppercase tracking-wider border border-[#4F8FC0]/20">
                <Sparkles className="w-3 h-3 text-[#26648E]" />
                <span>Academic Year 2026 – 2027 • Faculty Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#26648E] font-crest tracking-tight">
                Welcome, {user?.name || 'Faculty Member'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Department:{' '}
                <strong className="text-slate-800">
                  {user?.department?.name || 'Academic Department'}
                </strong>{' '}
                {user?.department?.shift ? `• ${user?.department.shift}` : ''}
                {isHod ? ' • Head of Department (HOD)' : ''}
                {isMqcMember ? ' • Designated MQC Member' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/department/upload"
                className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Invitation</span>
              </Link>

              <a
                href="/course-plan/index.html#my-plans"
                className="px-4 py-2 rounded-xl bg-[#f0f5f9] hover:bg-slate-200 text-[#26648E] border border-[#4F8FC0]/30 text-xs font-black flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Course Plans</span>
              </a>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 3. KEY METRICS & ANALYSIS GRID (INVITATIONS & COURSE PLAN) */}
          {/* ========================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Invitations Uploaded */}
            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Invitations Uploaded
              </span>
              <span className="text-2xl font-black text-[#26648E]">
                {invStats.total}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                Current Academic Year
              </span>
            </div>

            {/* Approved Invitations */}
            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Director Approved
              </span>
              <span className="text-2xl font-black text-emerald-700">
                {invStats.approved}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                Ready for Circulation
              </span>
            </div>

            {/* Remarks / Corrections Needed */}
            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Remarks &amp; Corrections
              </span>
              <span className="text-2xl font-black text-amber-600">
                {invStats.remarks}
              </span>
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                {invStats.remarks > 0 ? 'Action Required' : 'All Clear'}
              </span>
            </div>

            {/* Pending Director Sign-Off */}
            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Pending Approval
              </span>
              <span className="text-2xl font-black text-[#4F8FC0]">
                {invStats.pending}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                In Review Pipeline
              </span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 4. REMARKS ANALYSIS SECTION                                */}
          {/* ========================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#26648E]" />
                <h3 className="text-base font-black text-[#26648E] font-crest tracking-tight">
                  Remarks &amp; Feedback Analysis
                </h3>
              </div>
              <Link
                href="/department/remarks"
                className="text-xs font-bold text-[#26648E] hover:underline flex items-center gap-1"
              >
                <span>View Full Remarks History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {remarksInvitations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {remarksInvitations.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 uppercase">
                          {inv.category || 'Event'}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 mt-1">
                          {inv.programTitle}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {inv.fromDate ? new Date(inv.fromDate).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 font-semibold leading-relaxed">
                      <span className="font-bold text-amber-900 block text-[10px] uppercase mb-0.5">
                        Director Remarks:
                      </span>
                      {inv.remarks || 'Please update the circular according to the official format guidelines.'}
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        href="/department/remarks"
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition"
                      >
                        <span>Fix &amp; Re-upload</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-[#4F8FC0]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      No Pending Remarks or Corrections
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      All uploaded invitations have been reviewed or are in good standing.
                    </p>
                  </div>
                </div>
                <Link
                  href="/department/upload"
                  className="px-3 py-1.5 rounded-xl bg-[#f0f5f9] hover:bg-[#26648E] hover:text-white text-[#26648E] text-xs font-bold transition border border-[#4F8FC0]/25"
                >
                  Upload New Event
                </Link>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* 5. COURSE PLAN, APPRAISAL & AAA INTEGRATED ANALYSIS        */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* COURSE PLAN ANALYSIS CARD */}
            <div className="academic-card p-5 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#26648E]">Course Plan System</h4>
                      <span className="text-[10px] text-slate-400 font-bold">Even Semester 2026–27</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Prepare your course syllabus units, lesson plan schedule, and learning outcomes for semester compliance.
                </p>

                <div className="space-y-1.5 text-xs text-slate-700 font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">Department HOD Review:</span>
                    <span className="text-[#26648E]">{isHod ? 'HOD Authorization Active' : 'HOD Monitored'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">Single Sign-On (SSO):</span>
                    <span className="text-emerald-700">Authenticated (No Separate Login)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href="/course-plan/index.html#my-plans"
                  className="w-full py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open My Course Plans</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* PERFORMANCE APPRAISAL STATUS CARD */}
            <div className="academic-card p-5 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#26648E]">Performance Appraisal</h4>
                      <span className="text-[10px] text-slate-400 font-bold">Teacher Self-Evaluation</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-[#FFE3B3] text-[#26648E]">
                    Open to All Staff
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Complete your annual teacher performance evaluation, teaching hours, research output, and mentoring API scores.
                </p>

                <div className="space-y-1.5 text-xs text-slate-700 font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">Questionnaire Bank:</span>
                    <span className="text-[#26648E]">Appraisal Questions Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">Evaluation Mode:</span>
                    <span className="text-emerald-700">Self-Appraisal &amp; Peer Metric</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/performance-appraisal"
                  className="w-full py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Fill Teacher Appraisal Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* AAA PLATFORM STATUS CARD */}
            <div className="academic-card p-5 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/30">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#26648E]">AAA Data Platform</h4>
                      <span className="text-[10px] text-slate-400 font-bold">Audit 2026–2027</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                      canAccessAaa
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {canAccessAaa ? 'Authorized' : 'MQC Only'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Institutional academic audit platform encompassing comprehensive department quality evaluation metrics.
                </p>

                <div className="space-y-1.5 text-xs text-slate-700 font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">MQC Member Status:</span>
                    <span className={canAccessAaa ? 'text-emerald-700' : 'text-amber-800'}>
                      {canAccessAaa ? 'Designated MQC Member' : 'General Faculty'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-semibold">Audit Criteria:</span>
                    <span className="text-[#26648E]">Evaluation Metrics Ready</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {canAccessAaa ? (
                  <a
                    href="/AAA/index.html"
                    className="w-full py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Launch AAA Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Restricted to MQC Members</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ========================================================== */}
          {/* 6. OFFICIAL INSTRUCTIONS & QUALITY GUIDELINES              */}
          {/* ========================================================== */}
          <div className="p-5 rounded-2xl bg-white border border-[#4F8FC0]/20 space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#26648E]" />
              <h4 className="text-xs font-black text-[#26648E] uppercase tracking-wider">
                Official IQAC Faculty Guidelines &amp; Submission Protocols
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600 font-semibold">
              <div className="p-3 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/15 space-y-1">
                <span className="text-[#26648E] font-black block">1. Advance Notice</span>
                <p className="text-[11px] leading-snug">
                  Upload invitations at least 3-5 working days prior to the event date to ensure timely review.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/15 space-y-1">
                <span className="text-[#26648E] font-black block">2. Standard Branding</span>
                <p className="text-[11px] leading-snug">
                  Official St. Joseph's College crest and IQAC logo must appear on all brochures and circulars.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/15 space-y-1">
                <span className="text-[#26648E] font-black block">3. Course Planning</span>
                <p className="text-[11px] leading-snug">
                  Complete Even Semester units and weekly lesson plans before commencement for HOD approval.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f0f5f9] border border-[#4F8FC0]/15 space-y-1">
                <span className="text-[#26648E] font-black block">4. Hard Copy Sign-off</span>
                <p className="text-[11px] leading-snug">
                  Submit approved physical circular to the IQAC office for web archive and final dispatch.
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
