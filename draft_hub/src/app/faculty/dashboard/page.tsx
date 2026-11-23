'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GuidelinesModal from '@/components/GuidelinesModal';
import AnnouncementTicker from '@/components/AnnouncementTicker';
import Toast, { ToastMessage } from '@/components/Toast';
import StatusStepper from '@/components/StatusStepper';
import StatCard from '@/components/StatCard';
import { exportToExcel, printReport, ExportColumn } from '@/lib/export-utils';
import { getWhatsAppApprovalShareUrl } from '@/lib/whatsapp-direct';
import {
  BookOpen,
  UploadCloud,
  FileCheck2,
  Clock,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Send,
  Eye,
  FileSpreadsheet,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Building2,
  GraduationCap,
  Printer,
  HelpCircle,
  FileText,
  CheckSquare,
  Check,
  X,
  Search,
  Filter,
  Users,
  AlertTriangle,
  RotateCw,
  Image as ImageIcon,
  Download,
  Share2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import sjcLogo from '../../../../public/sjc-logo.png';

export default function FacultyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [appraisal, setAppraisal] = useState<any>(null);

  // Tab state: if HOD, defaults to 'submissions'; otherwise 'courses'
  const [activeTab, setActiveTab] = useState<string>('courses');
  const [coursePlanViewMode, setCoursePlanViewMode] = useState<'app' | 'cards'>('app');

  // Filtered course plans for My Teaching & Course Plans
  const [courseFilter, setCourseFilter] = useState<'all' | 'approved' | 'pending' | 'draft'>('all');
  const [courseSearch, setCourseSearch] = useState('');
  const [inspectingMyPlan, setInspectingMyPlan] = useState<any | null>(null);
  const [isTlModalOpen, setIsTlModalOpen] = useState(false);

  // HOD Workspace State
  const [deptCoursePlans, setDeptCoursePlans] = useState<any[]>([]);
  const [deptFaculty, setDeptFaculty] = useState<any[]>([]);
  const [inspectingDeptPlan, setInspectingDeptPlan] = useState<any | null>(null);
  const [approvingPlanId, setApprovingPlanId] = useState<string | null>(null);

  // Dynamic field submission modal state
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [submittingField, setSubmittingField] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Upload invitation modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteCategory, setInviteCategory] = useState('Seminar');
  const [inviteFromDate, setInviteFromDate] = useState('');
  const [inviteToDate, setInviteToDate] = useState('');
  const [inviteFileName, setInviteFileName] = useState('');
  const [uploadingInvite, setUploadingInvite] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Invitations Department Dashboard State
  const [invitationList, setInvitationList] = useState<any[]>([]);
  const [invitationStats, setInvitationStats] = useState({ total: 0, pending: 0, remarks: 0, approved: 0 });
  const [invitationSearch, setInvitationSearch] = useState('');
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const exportColumns: ExportColumn[] = [
    { header: 'S.No', key: 'sno', format: (_val, _item, idx?: any) => '' },
    { header: 'Program Title', key: 'programTitle' },
    { header: 'Category', key: 'category' },
    { header: 'Shift', key: 'shift' },
    { header: 'From Date', key: 'fromDate', format: (val) => new Date(val).toLocaleDateString() },
    { header: 'To Date', key: 'toDate', format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
    { header: 'Status', key: 'status' },
    { header: 'Revision', key: 'revisionCount', format: (val) => val > 0 ? `Rev #${val}` : 'Original' },
    { header: 'Uploaded Date', key: 'createdAt', format: (val) => new Date(val).toLocaleDateString() },
    { header: 'Approval Date', key: 'approvedAt', format: (val) => val ? new Date(val).toLocaleDateString() : '-' },
    { header: 'Hard Copy Status', key: 'hardCopyReceived', format: (val) => val ? 'Received' : 'Pending' },
  ];

  const handleExportExcel = () => {
    const dataWithIndex = invitationList.map((inv, idx) => ({ ...inv, sno: idx + 1 }));
    exportToExcel(
      `${user?.departmentName || user?.department?.name || 'Department'}_IQAC_NAAC_Invitations_Report`,
      exportColumns,
      dataWithIndex
    );
  };

  const handlePrintPdf = () => {
    const dataWithIndex = invitationList.map((inv, idx) => ({ ...inv, sno: idx + 1 }));
    printReport(
      `${user?.departmentName || user?.department?.name || 'Department'} (${user?.department?.shift || user?.shift || 'Shift I'}) - Event Invitations Summary`,
      'Official IQAC & NAAC Criterion Documentation Report',
      exportColumns,
      dataWithIndex
    );
  };

  const handleTriggerNotify = async (invitationId: string) => {
    try {
      setNotifyingId(invitationId);
      const res = await fetch(`/api/invitations/${invitationId}/notify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger notification');
      }

      if (data.result?.automated) {
        setToast({
          type: 'success',
          message: 'Automated alert sent from 9626806328 to Director (7418671366)!',
        });
      } else {
        if (data.result?.directUrl) {
          window.open(data.result.directUrl, '_blank');
        }
        setToast({
          type: 'info',
          message: 'Opened direct WhatsApp alert to Director (7418671366).',
        });
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to send notification',
      });
    } finally {
      setNotifyingId(null);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const u = await userRes.json();
      setUser(u.user);

      // If user is HOD, set initial tab to 'submissions'
      if (u.user?.isHead) {
        setActiveTab('submissions');
        fetchDeptData(u.user.departmentName || u.user.department?.name || '');
      }

      // Fetch dynamic campaigns
      const campRes = await fetch('/api/faculty/dynamic-campaigns');
      if (campRes.ok) {
        const cData = await campRes.json();
        setCampaigns(cData.campaigns || []);
      }

      // Fetch appraisal / portfolio
      const appRes = await fetch('/api/appraisal');
      if (appRes.ok) {
        const aData = await appRes.json();
        setAppraisal(aData.appraisal || null);
      }

      // Fetch invitations and stats (for Event Invitations tab)
      const invRes = await fetch('/api/invitations');
      if (invRes.ok) {
        const iData = await invRes.json();
        setInvitationList(iData.invitations || []);
        setInvitationStats(iData.stats || { total: 0, pending: 0, remarks: 0, approved: 0 });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptData = async (deptName: string) => {
    try {
      const cpRes = await fetch(`/api/admin/course-plans?department=${encodeURIComponent(deptName)}`);
      if (cpRes.ok) {
        const data = await cpRes.json();
        setDeptCoursePlans(data.coursePlans || []);
      }

      const usersRes = await fetch(`/api/users?departmentName=${encodeURIComponent(deptName)}&limit=100`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setDeptFaculty(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching dept data:', err);
    }
  };

  const handleHodApprove = async (planId: string) => {
    setApprovingPlanId(planId);
    try {
      const res = await fetch('/api/admin/course-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: planId, hodStatus: 'Approved', status: 'Approved' }),
      });
      if (res.ok) {
        setDeptCoursePlans(prev =>
          prev.map(p => (p.id === planId ? { ...p, hodStatus: 'Approved', status: 'Approved' } : p))
        );
        if (inspectingDeptPlan && inspectingDeptPlan.id === planId) {
          setInspectingDeptPlan({ ...inspectingDeptPlan, hodStatus: 'Approved', status: 'Approved' });
        }
      }
    } catch (err) {
      console.error('Error approving course plan:', err);
    } finally {
      setApprovingPlanId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const openCampaignModal = (camp: any) => {
    setSelectedCampaign(camp);
    if (camp.mySubmissionData && Object.keys(camp.mySubmissionData).length > 0) {
      setFormResponses(camp.mySubmissionData);
    } else {
      const initial: any = {};
      (camp.fields || []).forEach((f: any) => {
        let isTbl = f.fieldType === 'TABLE';
        if (f.optionsJson) {
          try {
            const parsed = typeof f.optionsJson === 'string' ? JSON.parse(f.optionsJson) : f.optionsJson;
            if (parsed.isTable || parsed.columns?.length) isTbl = true;
          } catch (e) {}
        }
        if (isTbl) {
          initial[f.fieldName] = [{}];
        }
      });
      setFormResponses(initial);
    }
    setSubmitMessage(null);
  };

  const handleAddTableRow = (fieldName: string) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      return {
        ...prev,
        [fieldName]: [...existing, {}]
      };
    });
  };

  const handleUpdateTableCell = (fieldName: string, rowIdx: number, colName: string, val: string) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [{}];
      existing[rowIdx] = { ...(existing[rowIdx] || {}), [colName]: val };
      return {
        ...prev,
        [fieldName]: existing
      };
    });
  };

  const handleRemoveTableRow = (fieldName: string, rowIdx: number) => {
    setFormResponses((prev: any) => {
      const existing = Array.isArray(prev[fieldName]) ? [...prev[fieldName]] : [];
      const filtered = existing.filter((_: any, i: number) => i !== rowIdx);
      return {
        ...prev,
        [fieldName]: filtered.length > 0 ? filtered : [{}]
      };
    });
  };

  const handleDynamicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setSubmittingField(true);
    setSubmitMessage(null);

    try {
      const res = await fetch('/api/faculty/dynamic-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          responses: formResponses,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitMessage('Response saved successfully! Updated in your institutional record.');
      setTimeout(() => {
        setSelectedCampaign(null);
        fetchInitialData();
      }, 1500);
    } catch (err: any) {
      setSubmitMessage(`Error: ${err.message}`);
    } finally {
      setSubmittingField(false);
    }
  };

  const handleUploadInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTitle.trim() || !inviteFromDate) return;
    setUploadingInvite(true);

    try {
      const formData = new FormData();
      formData.append('programTitle', inviteTitle);
      formData.append('category', inviteCategory);
      formData.append('fromDate', inviteFromDate);
      if (inviteToDate) formData.append('toDate', inviteToDate);
      formData.append('shift', user?.department?.shift || user?.shift || 'Shift I');
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        const blob = new Blob(['IQAC Event Brochure'], { type: 'application/pdf' });
        formData.append('file', blob, inviteFileName || 'Event_Invitation.pdf');
      }

      const res = await fetch('/api/invitations', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setInviteTitle('');
        setInviteFromDate('');
        setInviteToDate('');
        setInviteFileName('');
        setSelectedFile(null);
        setToast({ type: 'success', message: 'Event invitation uploaded successfully for Director verification!' });
        fetchInitialData();
      } else {
        const d = await res.json();
        setToast({ type: 'error', message: d.error || 'Failed to upload invitation' });
      }
    } catch (e: any) {
      console.error(e);
      setToast({ type: 'error', message: e.message || 'Error uploading invitation' });
    } finally {
      setUploadingInvite(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="font-semibold text-slate-600 text-sm">Loading IQAC Academic Workspace...</span>
        </div>
      </div>
    );
  }

  const roleTitle = user?.isHead
    ? 'Head of the Department'
    : user?.isMqc
    ? 'MQC Coordinator'
    : 'Assistant / Associate Professor';

  const pendingCampaignsCount = campaigns.filter(c => !c.isSubmitted).length;
  const coursePlans = appraisal?.sections?.coursePlans || [];
  const invitations = [...(appraisal?.sections?.approvedInvitations || []), ...(appraisal?.sections?.pendingInvitations || [])];

  // HOD Department Stats
  const deptPendingCount = deptCoursePlans.filter(p => p.hodStatus === 'Pending' || p.hodStatus === 'Pending Review' || !p.hodStatus).length;
  const deptApprovedCount = deptCoursePlans.filter(p => p.hodStatus === 'Approved').length;

  // Filtered courses for Course Plan dashboard view
  const filteredCourses = coursePlans.filter((cp: any) => {
    const matchesSearch = !courseSearch ||
      (cp.courseCode && cp.courseCode.toLowerCase().includes(courseSearch.toLowerCase())) ||
      (cp.courseTitle && cp.courseTitle.toLowerCase().includes(courseSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (courseFilter === 'approved') return cp.hodStatus === 'Approved';
    if (courseFilter === 'pending') return cp.status === 'Submitted' || cp.hodStatus === 'Pending';
    if (courseFilter === 'draft') return cp.status === 'Draft' || !cp.status;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#1877F2] selection:text-white">
      {/* Top Academic Header Bar (Matching Admin UI Model) */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src={sjcLogo}
              alt="St. Joseph's College Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>IQAC</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700">St. Joseph&apos;s College (Autonomous)</span>
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#1877F2]">
              ERP Faculty &amp; Academic Console • AY 2026–2027 (Even Semester)
            </div>
          </div>
        </div>

        {/* Right Action Pills (Matching Admin UI Model) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Role Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1877F2] border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#1877F2]" />
            <span>{user?.isHead ? 'HOD HUB' : user?.isMqc ? 'MQC HUB' : 'FACULTY HUB'}</span>
          </span>

          {/* User Name Pill */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{user?.name}</span>
          </span>

          {/* User Manual Pill */}
          <a
            href="/Course Plan/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>User Manual</span>
          </a>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout with Left Sidebar (Exact Match to Admin UI Model) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200/90 py-5 px-3 flex flex-col justify-between shrink-0 shadow-xs overflow-y-auto">
          <div className="space-y-6">
            {/* Group 1: ACADEMIC & TEACHING (CORE) */}
            <div className="space-y-1">
              <span className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Academic &amp; Teaching (Core)
              </span>

              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'courses'
                    ? 'text-[#1877F2] bg-blue-50/80 font-bold border-l-4 border-[#1877F2]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>My Teaching &amp; Course Plans</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700 font-bold">
                  {coursePlans.length}
                </span>
              </button>

              {user?.isHead && (
                <>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'submissions'
                        ? 'text-[#1877F2] bg-blue-50/80 font-bold border-l-4 border-[#1877F2]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Submitted Courses &amp; Approvals</span>
                    </div>
                    {deptPendingCount > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {deptPendingCount} Due
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {deptCoursePlans.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('roster')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      activeTab === 'roster'
                        ? 'text-[#1877F2] bg-blue-50/80 font-bold border-l-4 border-[#1877F2]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>Department Faculty Roster</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700">
                      {deptFaculty.length}
                    </span>
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('invitations')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'invitations'
                    ? 'text-[#1877F2] bg-blue-50/80 font-bold border-l-4 border-[#1877F2]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  <span>Event Invitations &amp; Verification</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700">
                  {invitations.length}
                </span>
              </button>
            </div>

            {/* Group 2: PERFORMANCE & COMPLIANCE (PBAS) */}
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <span className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Performance &amp; Compliance (PBAS)
              </span>

              <button
                onClick={() => setActiveTab('summary')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'text-[#1877F2] bg-blue-50/80 font-bold border-l-4 border-[#1877F2]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Performance Appraisal (PBAS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {campaigns.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      {campaigns.length} Calls
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    {appraisal?.totalScore || 0} Pts
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar Footer Context Card */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>AY 2026–2027</span>
                <span className="text-emerald-700 font-extrabold">Even Sem</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.departmentName || 'Department'}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Staff: {user?.staffCode || user?.username} • {user?.shift || 'Shift I'}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Canvas */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {user?.isHead && activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Table Header Bar */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-600">
                  <CheckSquare className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">
                  Faculty Submissions in {user?.departmentName || 'Department'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {deptCoursePlans.length} total courses
              </span>
            </div>

            {/* Table */}
            {deptCoursePlans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">S.No</th>
                      <th className="py-3 px-4">Course Code & Title</th>
                      <th className="py-3 px-4">Programme</th>
                      <th className="py-3 px-4">Faculty Member</th>
                      <th className="py-3 px-4">Submission Status</th>
                      <th className="py-3 px-4">HOD Approval</th>
                      <th className="py-3 px-4 text-center">Review & Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptCoursePlans.map((cp: any, idx: number) => (
                      <tr key={cp.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 mr-2">
                            {cp.courseCode || '—'}
                          </span>
                          <span>{cp.courseTitle || 'Untitled Course'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {cp.programme}
                          <div className="text-[10px] text-slate-400 font-normal">
                            Semester {cp.semester || 'II'} ({cp.academicYear || '2026-2027'})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {cp.facultyName}
                          <div className="text-[10px] font-mono text-slate-400 font-normal">{cp.staffCode}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {cp.status || 'Draft'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            cp.hodStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {cp.hodStatus === 'Approved' ? 'Approved' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Orange Review & Approve button */}
                            <button
                              onClick={() => setInspectingDeptPlan(cp)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review & Approve</span>
                            </button>

                            {/* Green Direct Approve button */}
                            {cp.hodStatus !== 'Approved' && (
                              <button
                                onClick={() => handleHodApprove(cp.id)}
                                disabled={approvingPlanId === cp.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{approvingPlanId === cp.id ? 'Approving...' : 'Approve'}</span>
                              </button>
                            )}

                            {/* Printer button */}
                            <button
                              onClick={() => window.print()}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                              title="Print submission"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Faculty Submissions Yet</h4>
                <p className="text-xs text-slate-400">Faculty members in your department have not submitted course plans for Even Semester 2026–2027.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: HOD DEPARTMENT FACULTY STATUS ROSTER */}
        {user?.isHead && activeTab === 'roster' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">
                  Department Faculty Status Roster ({user?.departmentName})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {deptFaculty.length} registered faculty
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">S.No</th>
                    <th className="py-3 px-4">Faculty Name</th>
                    <th className="py-3 px-4">Staff Code</th>
                    <th className="py-3 px-4">Institutional Role</th>
                    <th className="py-3 px-4">Course Plans Submitted</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptFaculty.map((f: any, idx: number) => {
                    const facultyPlans = deptCoursePlans.filter(p => p.staffCode === f.staffCode || p.facultyName?.toLowerCase() === f.name?.toLowerCase());
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {f.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {f.staffCode || f.username}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            f.isHead
                              ? 'bg-amber-50 text-amber-900 border border-amber-300'
                              : f.isMqc
                              ? 'bg-purple-50 text-purple-900 border border-purple-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {f.isHead ? 'Head of Department' : f.isMqc ? 'MQC Coordinator' : 'Faculty Member'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {facultyPlans.length} Courses Planned
                        </td>
                        <td className="py-3.5 px-4">
                          {facultyPlans.length > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Submissions Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              Pending Submission
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MY TEACHING & COURSE PLANS (ALL FACULTY & HODS) */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fadeIn w-full max-w-7xl mx-auto">
            {/* Header: Course Plan 2026 - 2027 (Even) | IQAC - St. Joseph's College */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1877F2]">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Course Plan 2026 - 2027 (Even) | IQAC - St. Joseph&apos;s College
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Console
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Official Course Plan &amp; TLE Management Dashboard (https://sjciqac.frontierwox.in/course-plan/dashboard)
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setCoursePlanViewMode('app')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      coursePlanViewMode === 'app'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Live Course Plan View
                  </button>
                  <button
                    onClick={() => setCoursePlanViewMode('cards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      coursePlanViewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Course Cards Grid ({coursePlans.length})
                  </button>
                </div>

                <a
                  href="/course-plan/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <span>Open Full App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {coursePlanViewMode === 'app' ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <iframe
                  src="/course-plan/dashboard"
                  className="w-full h-[950px] border-0 rounded-3xl bg-white"
                  title="Course Plan 2026 - 2027 (Even) | IQAC - St. Joseph's College"
                />
              </div>
            ) : (
              <div className="space-y-6">
            {/* Faculty Dashboard Welcome Banner (Exact Match to http://localhost:3000/course-plan/dashboard) */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {user?.isHead ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-indigo-950 text-xs font-black uppercase tracking-wider shadow-sm">
                      🏛️ Head of Department (HOD)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-indigo-950 text-xs font-black uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" /> Faculty Portal
                    </span>
                  )}
                  <span className="text-indigo-200 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    {user?.departmentName || 'Department'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome, {user?.name || 'Professor'}!
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl font-medium leading-relaxed">
                  Academic Year 2026–2027 (Even Semester) • Prepare theory course plans, track review status with your Head of Department (HOD), and export official IQAC documentation.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap shrink-0">
                {user?.isHead && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('submissions')}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/25 flex items-center gap-2.5 cursor-pointer active:scale-95 border border-amber-400/40"
                    title="View department submissions, review and approve course plans as HOD"
                  >
                    <span className="w-6 h-6 rounded-full bg-white text-amber-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm leading-none">🏛️</span>
                    <span>View Department Status (HOD Dashboard)</span>
                  </button>
                )}

                <a
                  href="/Course Plan/index.html?action=new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-amber-400/20 flex items-center gap-2.5 cursor-pointer active:scale-95"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-950 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-sm leading-none">1</span>
                  <span>+ Create New Course Plan</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsTlModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 text-white border-indigo-400/40 shadow-indigo-950/40 font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-lg flex items-center gap-2.5 cursor-pointer border active:scale-95"
                >
                  <span className="w-6 h-6 rounded-full bg-white text-indigo-900 flex items-center justify-center font-black text-xs shrink-0 shadow-sm leading-none">2</span>
                  <span>TL Practices, Assessment Component</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3" /> Submitted
                  </span>
                </button>
              </div>
            </div>

            {/* 5 Quick Stats KPI Cards (Exact match to http://localhost:3000/course-plan/dashboard) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Plans</div>
                <div className="text-2xl font-black text-slate-900">{coursePlans.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Even Semester 2026-27</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">Under HOD Review</div>
                <div className="text-2xl font-black text-amber-600">{deptPendingCount}</div>
                <div className="text-[10px] text-amber-700 font-medium">Pending approval</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-emerald-600 tracking-wider">HOD Approved</div>
                <div className="text-2xl font-black text-emerald-600">{deptApprovedCount}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Published to IQAC</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Drafts</div>
                <div className="text-2xl font-black text-slate-700">
                  {coursePlans.filter((p: any) => p.status === 'Draft' || !p.status).length}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">In progress</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider flex items-center justify-between">
                  <span>Step 2: TL Status</span>
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Submitted</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium truncate">Recorded in IQAC</div>
              </div>
            </div>

            {/* 2-Step Workflow Guide Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  💡
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
                    2-Step Course Planning &amp; TLE Workflow (AY 2026–2027)
                  </h4>
                  <p className="text-xs text-blue-900 font-medium mt-0.5">
                    <strong>Step 1:</strong> Prepare and submit individual course plans for each theory course with Units 1–5, Bloom&apos;s level, and hours.
                    <br />
                    <strong>Step 2:</strong> Fill out the consolidated Teaching-Learning Practices, Assessment Components &amp; E-Content form (Button 2) to finalize your submission.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/Course Plan/manual.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold border border-blue-200 shadow-2xs transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Workflow Guide</span>
                </a>
              </div>
            </div>

            {/* Course Plans Table & Filter Header */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>My Course Plans</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    All theory course plans prepared by you for {user?.departmentName || 'Department'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search code or title..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
                    />
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'approved', 'pending', 'draft'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setCourseFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                          courseFilter === filter
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter === 'all' ? `All (${coursePlans.length})` : filter}
                      </button>
                    ))}
                  </div>

                  <a
                    href="/Course Plan/index.html?action=new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Plan</span>
                  </a>
                </div>
              </div>

              {/* Course Plans Cards */}
              {filteredCourses.length > 0 ? (
                <div className="p-5 sm:p-6 space-y-4">
                  {filteredCourses.map((cp: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {cp.courseCode || '—'}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{cp.courseTitle || 'Untitled Course'}</h3>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {cp.programme || 'Undergraduate'} • Semester {cp.semester || 'II'} ({cp.academicYear || '2026-2027'}) • {cp.credits || 4} Credits
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            cp.hodStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : cp.status === 'Submitted' || cp.hodStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {cp.hodStatus === 'Approved' ? '✓ HOD Approved' : cp.status === 'Submitted' || cp.hodStatus === 'Pending' ? '⏳ Under HOD Review' : '📝 Draft'}
                          </span>

                          <button
                            onClick={() => setInspectingMyPlan(cp)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                            title="Inspect course syllabus &amp; TLE breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          <a
                            href={`/Course Plan/index.html?print=${cp.id || cp.courseCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                            title="View and print official IQAC PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>View &amp; Print PDF</span>
                          </a>

                          <a
                            href={`/Course Plan/index.html?edit=${cp.id || cp.courseCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                            title="Edit course plan"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit Plan</span>
                          </a>
                        </div>
                      </div>

                      {/* Units 1-5 Grid */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Syllabus Units Breakdown &amp; Bloom&apos;s Taxonomy:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                          {cp.units && cp.units.length > 0 ? (
                            cp.units.map((u: any, uIdx: number) => (
                              <div key={uIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-0.5">
                                <div className="font-bold text-slate-800 truncate" title={u.title || u.unit}>
                                  {u.unit || `Unit ${uIdx + 1}`}: {u.title || `Unit ${uIdx + 1}`}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                  <span>{u.hours || 12} Hours</span>
                                  <span className="font-mono font-bold text-indigo-600">{u.bloomsLevel || 'K1-K4'}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            ['Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Unit V'].map((unitName, uIdx) => (
                              <div key={uIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-0.5">
                                <div className="font-bold text-slate-800">{unitName}</div>
                                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                  <span>12 Hours</span>
                                  <span className="font-mono font-bold text-indigo-600">K1–K4</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* TLE Practices Tags */}
                      <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-indigo-950 block">Teaching-Learning (TLE) Practices Planned:</span>
                          <div className="text-slate-600 text-[11px] flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-700">Methods:</span>
                            <span>{Array.isArray(cp.tlPractices?.innovativeMethods) ? cp.tlPractices.innovativeMethods.join(', ') : 'Chalk & Talk, Peer Instruction, Interactive Lecture'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-slate-700">ICT:</span>
                            <span>{Array.isArray(cp.tlPractices?.ictTools) ? cp.tlPractices.ictTools.join(', ') : 'Smart Board, Google Classroom, LCD Projector'}</span>
                          </div>
                        </div>
                        <div className="text-[11px] font-bold text-indigo-700 shrink-0">
                          Approved Plan = +10 Pts PBAS Domain 1
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No course plans match your criteria</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {courseSearch ? `No course plans matching "${courseSearch}".` : 'You have not submitted course plans for this semester yet.'}
                  </p>
                  <a
                    href="/Course Plan/index.html?action=new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Course Plan</span>
                  </a>
                </div>
              )}
            </div>
          </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Dynamic Scrolling IQAC Announcements Ticker */}
            <AnnouncementTicker onOpenGuidelines={() => setIsGuidelinesOpen(true)} />

            {/* Top Banner Notice if remarks are waiting */}
            {invitationStats.remarks > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Action Required: {invitationStats.remarks} Invitation(s) Need Correction
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      The Director has returned remarks on your submission. Please check and re-upload the corrected version.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Re-upload Correction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Upload CTA Header with Blinking Action Buttons */}
            <div className="bg-gradient-to-r from-[#2a1b54] via-[#3b1975] to-[#4c1d95] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-sm border border-purple-400/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>{user?.departmentName || user?.department?.name || 'Department'} Portal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Upload & Track Event Invitations
                </h2>
                <p className="text-purple-200 text-xs sm:text-sm max-w-xl">
                  Submit program invitations directly for Director verification. Follow the prescribed college format and standard guidelines.
                </p>
              </div>

              {/* Action Buttons Column with Blinking Guides */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="px-6 py-3.5 bg-white text-purple-900 hover:bg-purple-50 font-extrabold rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer"
                >
                  <UploadCloud className="w-5 h-5 text-purple-700" />
                  <span>Add New Invitation</span>
                </button>

                <div className="flex items-center gap-2.5">
                  {/* College Logo Blinking Button */}
                  <a
                    href="https://www.sjctni.edu/SJC_logo.jsp"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 animate-pulse cursor-pointer border border-emerald-300/40"
                    title="Official St. Joseph's College Logo download"
                  >
                    <ImageIcon className="w-4 h-4 shrink-0" />
                    <span>Download College Logo</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>

                  {/* Instructions & Format Blinking Button */}
                  <button
                    type="button"
                    onClick={() => setIsGuidelinesOpen(true)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 animate-pulse cursor-pointer border border-amber-300/40"
                    title="Official IQAC Invitation Format & 12 Guidelines"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Instructions & Format</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Grid (2 cols on mobile, 4 on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              <StatCard
                title="Total Uploaded"
                value={invitationStats.total}
                icon={Layers}
                variant="purple"
                subtitle="All submissions"
              />
              <StatCard
                title="Pending Verification"
                value={invitationStats.pending}
                icon={Clock}
                variant="yellow"
                subtitle="Awaiting Director review"
              />
              <StatCard
                title="Needs Correction"
                value={invitationStats.remarks}
                icon={AlertTriangle}
                variant="red"
                subtitle="Returned with remarks"
              />
              <StatCard
                title="Approved Invitations"
                value={invitationStats.approved}
                icon={CheckCircle2}
                variant="green"
                subtitle="Verified by IQAC"
              />
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Table Header with Search & NAAC Export */}
              <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Recent Invitation Submissions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Priority sorted by date and time of upload</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Box */}
                  <div className="relative flex-1 sm:w-56 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search title, category..."
                      value={invitationSearch}
                      onChange={(e) => setInvitationSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 font-medium"
                    />
                  </div>

                  {/* 1-Click NAAC/IQAC Summary Export Buttons */}
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={invitationList.length === 0}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Download Department Event List in Excel (.csv)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    disabled={invitationList.length === 0}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Print / Save PDF for NAAC Criteria Records"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-600" />
                    <span className="hidden sm:inline">PDF / Print</span>
                  </button>

                  <button
                    onClick={fetchInitialData}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="Refresh Queue"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {invitationList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  No invitations uploaded yet. Click &quot;Add New Invitation&quot; above to submit.
                </div>
              ) : (
                <>
                  {/* Desktop & Tablet Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-4">Program Title</th>
                          <th className="px-3 py-4">Category & Shift</th>
                          <th className="px-3 py-4">Event Date(s)</th>
                          <th className="px-4 py-4 text-center">4-Stage Progress Stepper</th>
                          <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {invitationList
                          .filter((inv) => {
                            if (!invitationSearch.trim()) return true;
                            const q = invitationSearch.toLowerCase();
                            return (
                              inv.programTitle?.toLowerCase().includes(q) ||
                              inv.category?.toLowerCase().includes(q) ||
                              inv.status?.toLowerCase().includes(q)
                            );
                          })
                          .map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-900 line-clamp-1">{inv.programTitle}</div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span>{inv.fileName}</span>
                                {inv.revisionCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold text-[10px]">
                                    Rev #{inv.revisionCount}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                                {inv.category}
                              </span>
                              <span className="text-xs font-medium text-slate-400 block mt-0.5">{inv.shift}</span>
                            </td>
                            <td className="px-3 py-4 text-xs text-slate-600">
                              <div>{new Date(inv.fromDate).toLocaleDateString()}</div>
                              {inv.toDate && <div className="text-slate-400 text-[11px]">to {new Date(inv.toDate).toLocaleDateString()}</div>}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <StatusStepper
                                status={inv.status}
                                createdAt={inv.createdAt}
                                approvedAt={inv.approvedAt}
                                remarkedAt={inv.remarkedAt}
                                hardCopyReceived={inv.hardCopyReceived}
                                mailSent={inv.mailSent}
                                variant="compact"
                              />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {inv.status === 'PENDING' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleTriggerNotify(inv.id)}
                                    disabled={notifyingId === inv.id}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 cursor-pointer"
                                    title="Notify Director (7418671366) from system sender (9626806328)"
                                  >
                                    {notifyingId === inv.id ? (
                                      <RotateCw className="w-4 h-4 text-emerald-600 animate-spin" />
                                    ) : (
                                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                                    )}
                                  </button>
                                ) : inv.status === 'APPROVED' ? (
                                  <a
                                    href={getWhatsAppApprovalShareUrl({
                                      departmentName: user?.departmentName || user?.department?.name || 'Department',
                                      shift: inv.shift,
                                      programTitle: inv.programTitle,
                                      category: inv.category,
                                      fromDate: inv.fromDate,
                                      toDate: inv.toDate,
                                    })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Share Approved Invitation on WhatsApp"
                                  >
                                    <Share2 className="w-4 h-4 text-emerald-600" />
                                  </a>
                                ) : null}

                                {inv.status === 'REMARKS' && (
                                  <button
                                    onClick={() => setUploadModalOpen(true)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                                  >
                                    Re-upload
                                  </button>
                                )}

                                {inv.status === 'APPROVED' && (
                                  <a
                                    href={`/api/invitations/${inv.id}/file?download=true`}
                                    download={inv.fileName || `${inv.programTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_invitation.png`}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                    title="Download Approved File"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                <a
                                  href={`/api/invitations/${inv.id}/file?rev=${inv.revisionCount || 0}&t=${inv.updatedAt ? new Date(inv.updatedAt).getTime() : Date.now()}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                  title="View Invitation File"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Responsive Cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {invitationList
                      .filter((inv) => {
                        if (!invitationSearch.trim()) return true;
                        const q = invitationSearch.toLowerCase();
                        return (
                          inv.programTitle?.toLowerCase().includes(q) ||
                          inv.category?.toLowerCase().includes(q) ||
                          inv.status?.toLowerCase().includes(q)
                        );
                      })
                      .map((inv) => (
                      <div key={inv.id} className="p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{inv.programTitle}</h4>
                            <span className="text-[11px] text-slate-400 font-medium">{inv.category} • {inv.shift}</span>
                          </div>
                          <div>
                            {inv.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Approved
                              </span>
                            )}
                            {inv.status === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Pending
                              </span>
                            )}
                            {inv.status === 'REMARKS' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Remarks
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
                          <StatusStepper
                            status={inv.status}
                            createdAt={inv.createdAt}
                            approvedAt={inv.approvedAt}
                            remarkedAt={inv.remarkedAt}
                            hardCopyReceived={inv.hardCopyReceived}
                            mailSent={inv.mailSent}
                            variant="horizontal"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>{new Date(inv.fromDate).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            {inv.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleTriggerNotify(inv.id)}
                                disabled={notifyingId === inv.id}
                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1 text-[11px] disabled:opacity-50 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Notify</span>
                              </button>
                            )}
                            <a
                              href={`/api/invitations/${inv.id}/file`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center gap-1 text-[11px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: INSTITUTIONAL DATA CALLS */}
        {activeTab === 'summary' && appraisal && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Consolidated Academic Portfolio & Performance Summary
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Academic Year 2026–2027 • Unified across Teaching-Learning, Event Invitations, Dynamic Submissions, and Institutional Governance.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Academic Portfolio</span>
              </button>
            </div>

            {/* 4 Academic Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Teaching & Pedagogical Practice */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Pillar 1: Teaching & Pedagogical Practice</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Courses Allocated & Planned:</span>
                    <strong className="text-slate-900">{appraisal.sections?.coursePlans?.length || 0} Courses</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>HOD Approval Status:</span>
                    <strong className="text-emerald-700">Verified & Synchronized</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pedagogical Methods Active:</span>
                    <strong className="text-indigo-700">
                      {appraisal.sections?.tlPractices?.innovativeMethods?.length || 0} Methods Documented
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Professional Development & Events */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <UploadCloud className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Pillar 2: Professional Development & Events</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Event Invitations Verified:</span>
                    <strong className="text-slate-900">{appraisal.sections?.approvedInvitations?.length || 0} Approved</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Institutional Feed:</span>
                    <strong className="text-indigo-700">Populates AAA Attribute I & VI</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pending Invitations:</span>
                    <strong className="text-slate-700">{appraisal.sections?.pendingInvitations?.length || 0} in review</strong>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Institutional Data Submissions */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Send className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Pillar 3: Institutional Data Compliance</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Active Calls Completed:</span>
                    <strong className="text-slate-900">{appraisal.sections?.dynamicSubmissions?.length || 0} Submissions</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Deadline Compliance:</span>
                    <strong className="text-emerald-700">Up to Date</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Consolidated Target:</span>
                    <strong className="text-indigo-700">Feeds AAA Attribute II</strong>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Institutional Leadership & Governance */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <h3 className="font-bold text-slate-900 text-sm">Pillar 4: Institutional Leadership</h3>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Designation:</span>
                    <strong className="text-slate-900">{roleTitle}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Department & Shift:</span>
                    <strong className="text-slate-700">{user?.departmentName} ({user?.shift || 'Shift I'})</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Governance Status:</span>
                    <strong className="text-emerald-700">Active Committee Member</strong>
                  </div>
                </div>
              </div>
            
            {/* SECTION: PBAS Dynamic Campaigns & Performance Questions (AY 2025–26) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      PBAS Dynamic Data Campaigns &amp; Performance Questions ({campaigns.length} Active Calls)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Official questions created by IQAC Admin from <span className="font-semibold text-slate-700">Performance Appraisal of Teaching Faculty (AY 2025–2026)</span>. Evidence and responses submitted here directly calculate your annual PBAS score.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    pendingCampaignsCount > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}>
                    {pendingCampaignsCount > 0 ? `${pendingCampaignsCount} Due Action` : '✓ All Answered'}
                  </span>
                </div>
              </div>

              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map((camp: any) => (
                    <div key={camp.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition">
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                            {camp.targetRole}
                          </span>
                          {camp.deadline && (
                            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Due {new Date(camp.deadline).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2">{camp.title}</h4>
                        {camp.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{camp.description}</p>
                        )}

                        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 block text-[11px]">Questions &amp; Verifiable Fields ({camp.fields?.length || 0}):</span>
                            <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">PBAS Credit</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {camp.fields.map((f: any) => (
                              <span key={f.id} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]">
                                {f.fieldLabel} {f.isRequired && <span className="text-red-500">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            camp.isSubmitted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {camp.isSubmitted ? '✓ Submitted' : 'Action Required'}
                          </span>
                          {camp.submittedAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Submitted: {new Date(camp.submittedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => openCampaignModal(camp)}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <span>{camp.isSubmitted ? 'Edit Response' : 'Fill Data'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Pending PBAS Dynamic Campaigns</h4>
                  <p className="text-xs text-slate-500">All institutional data calls and appraisal questionnaires published by Admin are answered.</p>
                </div>
              )}
            </div>
</div>
          </div>
        )}

      </main>
      </div>

      {/* MODAL: HOD Review & Approve Course Plan Modal */}
      {inspectingDeptPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {inspectingDeptPlan.courseCode || '—'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{inspectingDeptPlan.courseTitle}</h3>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {inspectingDeptPlan.facultyName} ({inspectingDeptPlan.staffCode}) • {inspectingDeptPlan.programme}
                </div>
              </div>
              <button
                onClick={() => setInspectingDeptPlan(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Units & Blooms */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Syllabus Units & Bloom&apos;s Level Distribution:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {inspectingDeptPlan.units?.map((u: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block">{u.unit}: {u.title}</span>
                    <span className="text-[11px] text-slate-500">{u.hours} Hours • {u.bloomsLevel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TLE Practices */}
            {inspectingDeptPlan.tlPractices && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-indigo-900">Teaching-Learning & Evaluation (TLE) Practices:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-slate-700 block">Innovative Methods:</span>
                    <span className="text-slate-600">
                      {Array.isArray(inspectingDeptPlan.tlPractices.innovativeMethods)
                        ? inspectingDeptPlan.tlPractices.innovativeMethods.join(', ')
                        : 'Standard lecture'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">ICT Tools:</span>
                    <span className="text-slate-600">
                      {Array.isArray(inspectingDeptPlan.tlPractices.ictTools)
                        ? inspectingDeptPlan.tlPractices.ictTools.join(', ')
                        : 'LCD Projector'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                inspectingDeptPlan.hodStatus === 'Approved'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                Current Status: {inspectingDeptPlan.hodStatus || 'Pending Review'}
              </span>

              <div className="flex items-center gap-2">
                {inspectingDeptPlan.hodStatus !== 'Approved' && (
                  <button
                    onClick={() => handleHodApprove(inspectingDeptPlan.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Course Plan</span>
                  </button>
                )}
                <button
                  onClick={() => setInspectingDeptPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Submit Dynamic Campaign Responses with Exact Table Format */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-6xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
                    {selectedCampaign.targetRole}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    AY {selectedCampaign.academicYear || '2025–2026'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedCampaign.title}</h3>
                {selectedCampaign.description && (
                  <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{selectedCampaign.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer self-start sm:self-auto"
              >
                ✕
              </button>
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-2xl text-xs font-semibold ${
                submitMessage.startsWith('Error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleDynamicSubmit} className="space-y-6 text-xs">
              {selectedCampaign.fields.map((f: any, fIdx: number) => {
                let isTbl = f.fieldType === 'TABLE';
                let tableCols: string[] = [];
                if (f.optionsJson) {
                  try {
                    const parsed = typeof f.optionsJson === 'string' ? JSON.parse(f.optionsJson) : f.optionsJson;
                    if (parsed.columns?.length) {
                      tableCols = parsed.columns;
                      isTbl = true;
                    }
                  } catch (e) {}
                }

                // If TABLE field format
                if (isTbl && tableCols.length > 0) {
                  const rows = Array.isArray(formResponses[f.fieldName]) ? formResponses[f.fieldName] : [{}];
                  return (
                    <div key={f.id || fIdx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {fIdx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {f.fieldLabel.split(' • Fields:')[0]}
                          </span>
                          {f.isRequired && <span className="text-red-500 font-bold">*</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                            {f.marks ?? 10} Marks
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddTableRow(f.fieldName)}
                            className="px-3 py-1 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            + Add Row
                          </button>
                        </div>
                      </div>

                      {/* Interactive Responsive Entry Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs min-w-[700px]">
                          <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3 w-12 text-center">#</th>
                              {tableCols.map((col: string, cIdx: number) => (
                                <th key={cIdx} className="py-2.5 px-3">{col}</th>
                              ))}
                              <th className="py-2.5 px-3 w-16 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rows.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                                <td className="py-2 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                                  {rIdx + 1}
                                </td>
                                {tableCols.map((col: string, cIdx: number) => (
                                  <td key={cIdx} className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={row[col] || ''}
                                      onChange={(e) => handleUpdateTableCell(f.fieldName, rIdx, col, e.target.value)}
                                      placeholder={`Enter ${col}...`}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:border-blue-500 focus:bg-blue-50/20 focus:outline-hidden transition"
                                    />
                                  </td>
                                ))}
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTableRow(f.fieldName, rIdx)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{rows.length} record(s) entered for this parameter</span>
                        <button
                          type="button"
                          onClick={() => handleAddTableRow(f.fieldName)}
                          className="text-[#1877F2] hover:underline font-bold"
                        >
                          + Add another entry row
                        </button>
                      </div>
                    </div>
                  );
                }

                // If Document Upload (FILE)
                if (f.fieldType === 'FILE') {
                  return (
                    <div key={f.id || fIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>{f.fieldLabel}</span>
                          {f.isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Attested PDF Document
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormResponses({ ...formResponses, [f.fieldName]: file.name });
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                      {formResponses[f.fieldName] && (
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Selected file: {formResponses[f.fieldName]}
                        </p>
                      )}
                    </div>
                  );
                }

                // Standard Fallback Input
                return (
                  <div key={f.id || fIdx} className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>{f.fieldLabel} {f.isRequired && <span className="text-red-500">*</span>}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {f.marks ?? 10} Marks
                      </span>
                    </label>
                    <input
                      type="text"
                      required={f.isRequired}
                      value={formResponses[f.fieldName] || ''}
                      onChange={(e) => setFormResponses({ ...formResponses, [f.fieldName]: e.target.value })}
                      placeholder={f.placeholder || 'Enter value...'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-blue-600"
                    />
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  All table rows and parameters are automatically synchronized with your PBAS Appraisal Scorecard.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingField}
                    className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingField ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Table Entries...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save &amp; Submit Table Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Upload Invitation */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Event Invitation Brochure</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUploadInvitation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Programme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Conference on Generative AI"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={inviteCategory}
                  onChange={(e) => setInviteCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white"
                >
                  <option value="Seminar">Seminar</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="FDP">Faculty Development Programme (FDP)</option>
                  <option value="Symposium">Symposium</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={inviteFromDate}
                    onChange={(e) => setInviteFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">To Date (Optional)</label>
                  <input
                    type="date"
                    value={inviteToDate}
                    onChange={(e) => setInviteToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Invitation File (PDF / Image) *</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      setInviteFileName(f.name);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brochure File Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI_Conference_Brochure_2026.pdf"
                  value={inviteFileName}
                  onChange={(e) => setInviteFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingInvite}
                  className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {uploadingInvite ? 'Uploading...' : 'Submit Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspect My Course Plan */}
      {inspectingMyPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span className="font-mono text-indigo-600">{inspectingMyPlan.courseCode}</span>
                    <span className="text-slate-400 font-normal">•</span>
                    <span>{inspectingMyPlan.courseTitle}</span>
                  </h3>
                  <div className="text-xs text-slate-500">
                    {inspectingMyPlan.programme || 'Undergraduate'} • Semester {inspectingMyPlan.semester || 'II'} ({inspectingMyPlan.academicYear || '2026-2027'})
                  </div>
                </div>
              </div>
              <button onClick={() => setInspectingMyPlan(null)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            {/* Units 1-5 Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Syllabus Units &amp; Bloom&apos;s Level Distribution</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(inspectingMyPlan.units || [
                  { unit: 'Unit I', title: 'Foundations & Concepts', hours: 12, bloomsLevel: 'K1, K2' },
                  { unit: 'Unit II', title: 'Core Principles & Framework', hours: 12, bloomsLevel: 'K2, K3' },
                  { unit: 'Unit III', title: 'Advanced Analysis & Methods', hours: 12, bloomsLevel: 'K3, K4' },
                  { unit: 'Unit IV', title: 'Applied Practice & Modeling', hours: 12, bloomsLevel: 'K4, K5' },
                  { unit: 'Unit V', title: 'Synthesis, Project & Trends', hours: 12, bloomsLevel: 'K5, K6' }
                ]).map((u: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-900 block">{u.unit}: {u.title}</span>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{u.hours} Planned Hours</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{u.bloomsLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TLE Practices */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 text-xs">
              <h4 className="font-extrabold text-indigo-950 uppercase tracking-wider text-[11px]">Teaching-Learning &amp; Assessment Practices</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Innovative Pedagogical Methods:</span>
                  <span className="text-slate-600">
                    {Array.isArray(inspectingMyPlan.tlPractices?.innovativeMethods)
                      ? inspectingMyPlan.tlPractices.innovativeMethods.join(', ')
                      : 'Interactive Lecture, Problem Solving, Case Studies'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">ICT Tools &amp; Platforms:</span>
                  <span className="text-slate-600">
                    {Array.isArray(inspectingMyPlan.tlPractices?.ictTools)
                      ? inspectingMyPlan.tlPractices.ictTools.join(', ')
                      : 'Smart Interactive Board, Google Classroom, Virtual Labs'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                inspectingMyPlan.hodStatus === 'Approved'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                Status: {inspectingMyPlan.hodStatus === 'Approved' ? 'Approved by HOD' : 'Pending HOD Review'}
              </span>
              <button
                onClick={() => setInspectingMyPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TL Practices & Assessment Components */}
      {isTlModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Step 2: TL Practices &amp; Assessment Components</h3>
                  <p className="text-xs text-slate-500">Teaching-Learning Innovations, ICT Tools &amp; Assessment Plan (AY 2026–2027)</p>
                </div>
              </div>
              <button onClick={() => setIsTlModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                <strong>Consolidated Submission Recorded:</strong> Your Teaching-Learning practices and Continuous Internal Assessment (CIA) components are actively synchronized with IQAC.
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">Documented Pedagogical Innovations</h4>
                <p className="text-slate-700 leading-relaxed">
                  {appraisal?.sections?.tlPractices?.innovativeMethods?.join(', ') || 'Flipped Classroom, Peer Learning, Problem-Based Learning, Case Analysis, Real-Time Quizzes'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">ICT Tools &amp; Digital Learning Platforms</h4>
                <p className="text-slate-700 leading-relaxed">
                  {appraisal?.sections?.tlPractices?.ictTools?.join(', ') || 'Smart Board, Google Classroom, Kahoot, SJC LMS, Virtual Labs, Overleaf / LaTeX'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">Assessment Components (CIA 1 &amp; 2)</h4>
                <p className="text-slate-700 leading-relaxed">
                  Mid-Semester Examination (30%), Assignment &amp; Seminar Presentation (10%), Quizzes &amp; Class Participation (10%), End-Semester Comprehensive (50%).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="/Course Plan/index.html?action=tl"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Edit in Course Plan App</span>
              </a>
              <button
                onClick={() => setIsTlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Modal (12 Official IQAC Guidelines & Prescribed Formats) */}
      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Toast Alert Popups */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 text-center text-xs text-slate-400 border-t border-slate-200/80 mt-12">
        <p>© 2026 Internal Quality Assurance Cell (IQAC), St. Joseph&apos;s College (Autonomous). All rights reserved.</p>
      </footer>
    </div>
  );
}
