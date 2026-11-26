'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Layers,
  FileText,
  BarChart3,
  BookOpen,
  Users,
  HardDrive,
  Database,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Settings,
  RefreshCw,
  ClipboardCheck,
  Award,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  X,
  AlertTriangle,
  Megaphone,
  Clock,
  Calendar,
  Bell,
  Check,
  Info,
  ListChecks,
} from 'lucide-react';

export default function CommonAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [rolesData, setRolesData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAddAnnModalOpen, setIsAddAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<any | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('NOTICE');
  const [annTarget, setAnnTarget] = useState('All Staff');
  const [annIsActive, setAnnIsActive] = useState(true);

  // Departments Shift-wise states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<'ALL' | 'Shift I' | 'Shift II' | 'Units'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states (Add Department)
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptShift, setNewDeptShift] = useState('Shift I');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newCustomUsername, setNewCustomUsername] = useState('');

  // Form states (Edit Department)
  const [editName, setEditName] = useState('');
  const [editShift, setEditShift] = useState('Shift I');
  const [editCode, setEditCode] = useState('');

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [userRes, statusRes, rolesRes, deptRes, annRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/server-status'),
        fetch('/api/admin/users-roles'),
        fetch('/api/departments'),
        fetch('/api/announcements?all=true'),
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);
      }

      if (statusRes.ok) {
        const s = await statusRes.json();
        setMetrics(s);
      }

      if (rolesRes.ok) {
        const r = await rolesRes.json();
        setRolesData(r);
      }

      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.departments || []);
      }

      if (annRes.ok) {
        const a = await annRes.json();
        setAnnouncements(a.announcements || []);
      }
    } catch (err) {
      console.error('Error loading common admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================= Announcements Handlers =================
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      setToast({ type: 'error', message: 'Title and content are required' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle.trim(),
          content: annContent.trim(),
          type: annType,
          target: annTarget.trim() || 'All Staff',
          isActive: annIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish announcement');

      setToast({ type: 'success', message: 'Announcement published successfully!' });
      setAnnTitle('');
      setAnnContent('');
      setAnnType('NOTICE');
      setAnnTarget('All Staff');
      setIsAddAnnModalOpen(false);
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error saving announcement' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !annTitle.trim() || !annContent.trim()) {
      setToast({ type: 'error', message: 'Title and content are required' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAnn.id,
          title: annTitle.trim(),
          content: annContent.trim(),
          type: annType,
          target: annTarget.trim(),
          isActive: annIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update announcement');

      setToast({ type: 'success', message: 'Announcement updated successfully!' });
      setEditingAnn(null);
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating announcement' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');

      setToast({ type: 'success', message: 'Announcement deleted.' });
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error deleting announcement' });
    }
  };

  const handleToggleAnnActive = async (ann: any) => {
    const nextActive = !ann.isActive;
    try {
      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ann.id, isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');

      setToast({
        type: nextActive ? 'success' : 'info',
        message: `Announcement ${nextActive ? 'activated' : 'deactivated'}.`,
      });
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating status' });
    }
  };

  // ================= Department Handlers =================
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setToast({ type: 'error', message: 'Please enter department name.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          shift: newDeptShift,
          code: newDeptCode.trim() || undefined,
          customUsername: newCustomUsername.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create department');

      setToast({
        type: 'success',
        message: `Department "${newDeptName} (${newDeptShift})" added successfully! Default password: sjciqac`,
      });

      setNewDeptName('');
      setNewDeptShift('Shift I');
      setNewDeptCode('');
      setNewCustomUsername('');
      setIsAddModalOpen(false);
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error registering department' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editName.trim()) {
      setToast({ type: 'error', message: 'Department name is required' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/departments/${editingDept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          shift: editShift,
          code: editCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update department');

      setToast({ type: 'success', message: `Department "${editName}" updated successfully!` });
      setEditingDept(null);
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating department' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This action removes associated records.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', message: `Department "${name}" deleted.` });
        fetchDashboardData(true);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete department');
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Failed to delete department' });
    }
  };

  const handleToggleStatus = async (dept: any) => {
    const nextStatus = dept.isActive === false;
    const actionLabel = nextStatus ? 'enable' : 'disable';

    if (!confirm(`Are you sure you want to ${actionLabel} "${dept.name}"?`)) return;

    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setToast({
        type: nextStatus ? 'success' : 'warning',
        message: data.message || `Department ${actionLabel}d.`,
      });
      fetchDashboardData(true);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating status' });
    }
  };

  // Filter departments by Shift & Search Term
  const shift1Depts = departments.filter((d) => (d.shift === 'Shift I' || !d.shift) && matchesSearch(d));
  const shift2Depts = departments.filter((d) => d.shift === 'Shift II' && matchesSearch(d));
  const unitDepts = departments.filter((d) => d.shift === 'Units' && matchesSearch(d));

  function matchesSearch(d: any) {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      (d.users && d.users.some((u: any) => u.username?.toLowerCase().includes(q)))
    );
  }

  const displayedDepts =
    selectedShift === 'Shift I'
      ? shift1Depts
      : selectedShift === 'Shift II'
      ? shift2Depts
      : selectedShift === 'Units'
      ? unitDepts
      : [...shift1Depts, ...shift2Depts, ...unitDepts];

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      {/* Arctic Frost Aura Background Layers */}
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      {/* Dynamic Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 transition-all duration-300 ease-in-out">
        <Header
          title="Central Administration"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7">
          
          {/* Top Banner (AAA Deep Classic Ocean Theme - Launchpad Hub removed) */}
          <div className="bg-gradient-to-r from-[#163850] via-[#26648E] to-[#1f5072] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#4F8FC0]/30">
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE3B3] text-[#26648E] text-[10px] font-black tracking-wider uppercase border border-[#fedba0] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#26648E]" />
                <span>Executive Command Console</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Internal Quality Assurance Cell (IQAC)
              </h2>
              <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed font-semibold">
                Unified administrator oversight across the <strong>Invitation Portal</strong>, <strong>AAA Data Platform</strong>, <strong>Course Plan System</strong>, and <strong>Performance Appraisal of Teacher</strong>.
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 relative z-10">
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-extrabold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Total Staff Roster
              </span>
              <span className="text-2xl font-black text-[#26648E]">
                {rolesData?.totalUsers || 397}
              </span>
              <span className="text-[10px] text-[#4F8FC0] font-bold block mt-0.5">
                Across {departments.length || 34} Departments
              </span>
            </div>

            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                MQC Members (AAA Access)
              </span>
              <span className="text-2xl font-black text-[#125e64]">
                {rolesData?.totalMqc || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                Authorized for AAA Data
              </span>
            </div>

            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Designated HODs
              </span>
              <span className="text-2xl font-black text-[#8a5d11]">
                {rolesData?.totalHods || 0}
              </span>
              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                Course Plan Department Sign-Off
              </span>
            </div>

            <div className="academic-card p-4 sm:p-5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Active Announcements
              </span>
              <span className="text-2xl font-black text-[#26648E]">
                {announcements.filter((a) => a.isActive !== false).length}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                Displaying on Staff Dashboards
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* GENERAL INSTRUCTIONS & ANNOUNCEMENTS (REQUESTED BY USER)       */}
          {/* ============================================================== */}
          <div className="academic-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#26648E] font-crest tracking-tight">
                    General Instructions &amp; Announcements
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Create and manage general instructions, quality guidelines, and deadlines displayed on the Staff Common Dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAnnTitle('');
                  setAnnContent('');
                  setAnnType('GENERAL');
                  setAnnTarget('All Staff & Faculty');
                  setAnnIsActive(true);
                  setIsAddAnnModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add General Instruction</span>
              </button>
            </div>

            {/* General Instructions List */}
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <ListChecks className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No general instructions published yet. Click &quot;Add General Instruction&quot; to create one.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      ann.isActive === false
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : 'bg-white border-[#4F8FC0]/25 shadow-2xs hover:border-[#26648E]'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ann.type === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : ann.type === 'NOTICE'
                              ? 'bg-[#FFE3B3] text-[#26648E] border border-[#fedba0]'
                              : ann.type === 'QUALITY'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/30'
                          }`}
                        >
                          {ann.type || 'GENERAL'}
                        </span>

                        <span className="text-xs font-bold text-slate-800">
                          {ann.title}
                        </span>

                        <span className="text-[10px] text-slate-400 font-semibold">
                          Target: {ann.target || 'All Staff & Faculty'} • {ann.date}
                        </span>

                        {ann.isActive === false && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-bold uppercase">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {ann.content}
                      </p>
                    </div>

                    {/* Actions: Toggle, Edit, Delete with Icons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnActive(ann)}
                        title={ann.isActive ? 'Deactivate instruction' : 'Activate instruction'}
                        className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                          ann.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {ann.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{ann.isActive ? 'Active' : 'Hidden'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnn(ann);
                          setAnnTitle(ann.title);
                          setAnnContent(ann.content);
                          setAnnType(ann.type || 'GENERAL');
                          setAnnTarget(ann.target || 'All Staff & Faculty');
                          setAnnIsActive(ann.isActive !== false);
                        }}
                        title="Edit Instruction"
                        className="p-1.5 px-2.5 rounded-xl border border-slate-200 text-[#26648E] hover:bg-[#f0f5f9] hover:border-[#4F8FC0]/40 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        title="Delete Instruction"
                        className="p-1.5 px-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SHIFT-WISE DEPARTMENTS DIRECTORY & MANAGEMENT (POINT 3)        */}
          {/* ============================================================== */}
          <div className="academic-card p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#26648E] font-crest tracking-tight">
                    Shift-Wise Department Directory
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Manage Shift I (Aided), Shift II (Self-Financed), and Unit departments with Add, Edit, and Delete controls.
                </p>
              </div>

              {/* Action Buttons: Add Department */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Department</span>
                </button>
              </div>
            </div>

            {/* Shift Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Shift Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedShift('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    selectedShift === 'ALL'
                      ? 'bg-[#26648E] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All ({departments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('Shift I')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    selectedShift === 'Shift I'
                      ? 'bg-[#26648E] text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Shift I - Aided ({shift1Depts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('Shift II')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    selectedShift === 'Shift II'
                      ? 'bg-[#26648E] text-white shadow-xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Shift II - Self-Financed ({shift2Depts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedShift('Units')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    selectedShift === 'Units'
                      ? 'bg-[#26648E] text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Units &amp; Centers ({unitDepts.length})</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search department name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>
            </div>

            {/* Department Table / Cards */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f5f9] text-[#26648E] uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Department Name</th>
                    <th className="px-3 py-3">Shift</th>
                    <th className="px-3 py-3">Department Code</th>
                    <th className="px-3 py-3">Login Username</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                  {displayedDepts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No departments found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedDepts.map((dept) => {
                      const userAccount = dept.users && dept.users[0];
                      const isDisabled = dept.isActive === false;
                      const isShift1 = dept.shift === 'Shift I' || !dept.shift;
                      const isShift2 = dept.shift === 'Shift II';

                      return (
                        <tr
                          key={dept.id}
                          className={`transition hover:bg-slate-50/80 ${
                            isDisabled ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{dept.name}</span>
                              {isDisabled && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  Blocked
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                                isShift1
                                  ? 'bg-amber-100/80 text-amber-900 border border-amber-200'
                                  : isShift2
                                  ? 'bg-indigo-100/80 text-indigo-900 border border-indigo-200'
                                  : 'bg-emerald-100/80 text-emerald-900 border border-emerald-200'
                              }`}
                            >
                              {isShift1 ? (
                                <Sun className="w-3 h-3 text-amber-600" />
                              ) : isShift2 ? (
                                <Moon className="w-3 h-3 text-indigo-600" />
                              ) : (
                                <Award className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{dept.shift || 'Shift I'}</span>
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {dept.code || '-'}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            {userAccount ? (
                              <span className="font-mono text-[11px] font-bold text-[#26648E] bg-[#f0f5f9] px-2 py-0.5 rounded border border-[#4F8FC0]/30">
                                {userAccount.username}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No login created</span>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(dept)}
                              title={isDisabled ? 'Click to Enable Department' : 'Click to Block Department'}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                                isDisabled
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {isDisabled ? (
                                <>
                                  <EyeOff className="w-3 h-3 text-amber-700" />
                                  <span>Blocked</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>Active</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDept(dept);
                                  setEditName(dept.name);
                                  setEditShift(dept.shift || 'Shift I');
                                  setEditCode(dept.code || '');
                                }}
                                title="Edit Department Details"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#26648E] hover:bg-[#f0f5f9] transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                title="Delete Department"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TRI-PORTAL CONSOLIDATED SECTION (POINTS 4 & 5)                 */}
          {/* ============================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#4F8FC0]/20 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#26648E] font-crest tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#26648E]" />
                  <span>Consolidated Academic Quality Platforms</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Direct navigation to official admin subpages and controls for each platform
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. INVITATION PORTAL GOVERNANCE (POINT 4: Cleaned Subpages) */}
              <div className="academic-card p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#26648E]">Invitation Portal</h4>
                        <span className="text-[10px] font-extrabold text-[#4F8FC0]">Security &amp; Records</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE3B3] text-[#26648E] border border-[#fedba0]">
                      3 Pages
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Admin Subpages:
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/admin/users-roles')}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Access Control &amp; Roles</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/admin/database')}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Database Explorer (Records)</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/admin/server-status')}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Server &amp; Storage Status</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/users-roles')}
                    className="w-full py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <span>Manage Access Control</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. AAA DATA PLATFORM GOVERNANCE */}
              <div className="academic-card p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/30">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#26648E]">AAA Data Platform</h4>
                        <span className="text-[10px] font-extrabold text-[#4F8FC0]">Audit 2026–2027</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/40">
                      4 Pages
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Admin Subpages:
                    </span>
                    <a
                      href="/AAA/index.html#admin"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Admin Hub</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                    <a
                      href="/AAA/index.html#dept-data"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Department Data</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                    <a
                      href="/AAA/index.html#form"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>All Attributes (Forms 1–10)</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                    <a
                      href="/AAA/index.html#filter"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Data Filters &amp; Explorer</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <a
                    href="/AAA/index.html#admin"
                    className="w-full py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <span>Launch AAA Admin Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 3. COURSE PLAN GOVERNANCE */}
              <div className="academic-card p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#26648E]">Course Plan System</h4>
                        <span className="text-[10px] font-extrabold text-[#4F8FC0]">Teaching Learning Plans</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE3B3] text-[#26648E] border border-[#fedba0]">
                      3 Pages
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Admin Subpages:
                    </span>
                    <Link
                      href="/course-plan#admin"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Central Admin Audit</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      href="/course-plan#hod"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>HOD Course Plan Review Hub</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      href="/course-plan"
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#f0f5f9] hover:text-[#26648E] transition"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#26648E]" />
                        <span>Course Plan Portal</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <Link
                    href="/course-plan#admin"
                    className="w-full py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <span>Launch Course Plan Central Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Staff & Leadership Management Card */}
          <div className="academic-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/30 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#26648E]">
                  Staff, HOD &amp; MQC Designations Directory
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 font-semibold">
                  Manage all 397 faculty ERP profiles, grant or revoke AAA Data Platform MQC Member access, and designate Department HOD leadership.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/admin/users-roles')}
              className="px-5 py-3 rounded-2xl bg-[#26648E] hover:bg-[#1f5072] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm shrink-0 transition cursor-pointer"
            >
              <span>Manage Staff Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* ADD GENERAL INSTRUCTION MODAL                                  */}
      {/* ============================================================== */}
      {isAddAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#4F8FC0]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                  <Plus className="w-5 h-5 text-[#26648E]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#26648E] font-crest">Add General Instruction</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Publish guidelines or circulars for the Staff Common Dashboard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAnnModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instruction Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Invitation Submission Timelines & Review Guidelines"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instruction Category *
                  </label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="GENERAL">GENERAL (General Instruction)</option>
                    <option value="NOTICE">NOTICE (Official Circular)</option>
                    <option value="URGENT">URGENT (High Priority Notice)</option>
                    <option value="QUALITY">QUALITY (Quality & Compliance Directive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role / Audience *
                  </label>
                  <select
                    value={annTarget}
                    onChange={(e) => setAnnTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="All Staff & Faculty">All Staff & Faculty</option>
                    <option value="Staff (Upload Invitations)">Staff (Upload Invitations)</option>
                    <option value="Administrator (Mail Dispatches)">Administrator (Mail Dispatches)</option>
                    <option value="Director (Approvals & Remarks)">Director (Approvals & Remarks)</option>
                    <option value="MQC Members (AAA Platform)">MQC Members (AAA Platform)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instruction Content &amp; Guidelines *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the detailed instruction, instructions steps, or announcement message..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann-active-check"
                  checked={annIsActive}
                  onChange={(e) => setAnnIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#26648E] focus:ring-[#4F8FC0]/20 cursor-pointer"
                />
                <label htmlFor="ann-active-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display Immediately on Staff Common Dashboard (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? 'Adding...' : 'Add Instruction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT GENERAL INSTRUCTION MODAL                                 */}
      {/* ============================================================== */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#4F8FC0]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                  <Edit3 className="w-5 h-5 text-[#26648E]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#26648E] font-crest">Edit General Instruction</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Update instruction details, target role, or visibility</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instruction Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instruction Category *
                  </label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="GENERAL">GENERAL (General Instruction)</option>
                    <option value="NOTICE">NOTICE (Official Circular)</option>
                    <option value="URGENT">URGENT (High Priority Notice)</option>
                    <option value="QUALITY">QUALITY (Quality & Compliance Directive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role / Audience *
                  </label>
                  <select
                    value={annTarget}
                    onChange={(e) => setAnnTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="All Staff & Faculty">All Staff & Faculty</option>
                    <option value="Staff (Upload Invitations)">Staff (Upload Invitations)</option>
                    <option value="Administrator (Mail Dispatches)">Administrator (Mail Dispatches)</option>
                    <option value="Director (Approvals & Remarks)">Director (Approvals & Remarks)</option>
                    <option value="MQC Members (AAA Platform)">MQC Members (AAA Platform)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instruction Content &amp; Guidelines *
                </label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-ann-active-check"
                  checked={annIsActive}
                  onChange={(e) => setAnnIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#26648E] focus:ring-[#4F8FC0]/20 cursor-pointer"
                />
                <label htmlFor="edit-ann-active-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display on Staff Common Dashboard (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Instruction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD DEPARTMENT MODAL                                           */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#4F8FC0]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#26648E] font-crest">Add New Department</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PG & Research Department of Mathematics"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Shift *
                  </label>
                  <select
                    value={newDeptShift}
                    onChange={(e) => setNewDeptShift(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="Shift I">Shift I (Aided)</option>
                    <option value="Shift II">Shift II (Self-Financed)</option>
                    <option value="Units">Units &amp; Centers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MATH_S1"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank"
                  value={newCustomUsername}
                  onChange={(e) => setNewCustomUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Default login password for new department account will be <code>sjciqac</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT DEPARTMENT MODAL                                          */}
      {/* ============================================================== */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-[#4F8FC0]/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#26648E] font-crest">Edit Department</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Shift *
                  </label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E] bg-white cursor-pointer"
                  >
                    <option value="Shift I">Shift I (Aided)</option>
                    <option value="Shift II">Shift II (Self-Financed)</option>
                    <option value="Units">Units &amp; Centers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/20 focus:border-[#26648E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-extrabold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
