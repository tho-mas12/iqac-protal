'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Building2,
  Sparkles,
  Award,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  User,
  Filter,
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
} from 'lucide-react';

export default function AccessControlPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentNames, setDepartmentNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterMqc, setFilterMqc] = useState('ALL');
  const [filterHod, setFilterHod] = useState('ALL');
  const [filterCoursePlan, setFilterCoursePlan] = useState('ALL');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Pagination for large list
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Modals
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add User Form States
  const [newUserType, setNewUserType] = useState<'USER' | 'ADMIN'>('USER');
  const [newUserName, setNewUserName] = useState('');
  const [newUserCode, setNewUserCode] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('sjciqac');
  const [newUserDept, setNewUserDept] = useState('Computer Science');
  const [newUserShift, setNewUserShift] = useState('Shift I');
  const [newUserInvRole, setNewUserInvRole] = useState<'STAFF' | 'ADMINISTRATOR' | 'DIRECTOR'>('STAFF');
  const [newUserMqc, setNewUserMqc] = useState(false);
  const [newUserHod, setNewUserHod] = useState(false);
  const [newUserCoursePlan, setNewUserCoursePlan] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/users-roles'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      if (rRes.ok) {
        const r = await rRes.json();
        setUsers(r.users || []);
        setDepartments(r.departments || []);
        setDepartmentNames(r.departmentNames || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setToast({ type: 'error', message: 'Failed to load user directory' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDept, filterRole, filterMqc, filterHod, filterCoursePlan]);

  // 1. Toggle MQC Access
  const handleToggleMqc = async (u: any) => {
    const nextState = !u.isMqc;
    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, isMqc: nextState } : item))
    );

    try {
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_mqc',
          username: u.username,
          code: u.code,
          isMqc: nextState,
        }),
      });

      if (!res.ok) throw new Error('Failed to update MQC status');
      setToast({
        type: 'success',
        message: `${u.name}: AAA Data Platform access ${nextState ? 'GRANTED (MQC Member)' : 'RESTRICTED'}.`,
      });
    } catch (err: any) {
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, isMqc: !nextState } : item))
      );
      setToast({ type: 'error', message: err.message || 'Error updating MQC status' });
    }
  };

  // 2. Toggle HOD Status
  const handleToggleHod = async (u: any) => {
    const nextState = !u.isHod;
    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, isHod: nextState } : item))
    );

    try {
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_hod',
          username: u.username,
          code: u.code,
          isHod: nextState,
        }),
      });

      if (!res.ok) throw new Error('Failed to update HOD status');
      setToast({
        type: 'success',
        message: `${u.name} designated as ${nextState ? 'HOD (Department Status Enabled)' : 'Faculty Member'}.`,
      });
    } catch (err: any) {
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, isHod: !nextState } : item))
      );
      setToast({ type: 'error', message: err.message || 'Error updating HOD status' });
    }
  };

  // 3. Toggle Course Plan Access (Enable / Disable Course Plan module & pages for user)
  const handleToggleCoursePlan = async (u: any) => {
    const currentVal = u.coursePlanEnabled !== false;
    const nextState = !currentVal;

    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, coursePlanEnabled: nextState } : item))
    );

    try {
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_course_plan',
          username: u.username,
          code: u.code,
          coursePlanEnabled: nextState,
        }),
      });

      if (!res.ok) throw new Error('Failed to update Course Plan status');
      setToast({
        type: 'success',
        message: `${u.name}: Course Plan pages ${nextState ? 'ENABLED (Shown in Portal)' : 'DISABLED (Hidden from Portal)'}.`,
      });
    } catch (err: any) {
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, coursePlanEnabled: currentVal } : item))
      );
      setToast({ type: 'error', message: err.message || 'Error updating Course Plan access' });
    }
  };

  // 2b. Bulk Toggle Course Plan for All Users
  const handleBulkCoursePlan = async (enabled: boolean) => {
    const actionLabel = enabled ? 'ENABLE' : 'DISABLE';
    if (
      !confirm(
        `Are you sure you want to ${actionLabel} Course Plan access for ALL users in the portal?\n\nThis will ${
          enabled ? 'show' : 'hide'
        } Course Plan pages in their navigation.`
      )
    )
      return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_toggle_course_plan',
          coursePlanEnabled: enabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update Course Plan access in bulk');

      setToast({
        type: 'success',
        message: data.message || `Course Plan access ${actionLabel}D for all users!`,
      });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating access' });
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Change Invitation Access Role (Staff, Administrator, Director)
  const handleChangeInvitationRole = async (u: any, newRole: string) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === u.id ? { ...item, invitationRole: newRole, role: newRole } : item
      )
    );

    try {
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_invitation_role',
          username: u.username,
          code: u.code,
          invitationRole: newRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to update Invitation access role');
      setToast({
        type: 'success',
        message: `${u.name}: Invitation access set to ${newRole}.`,
      });
    } catch (err: any) {
      fetchData();
      setToast({ type: 'error', message: err.message || 'Error updating invitation role' });
    }
  };

  // 4. Update Faculty Credentials
  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          username: editingUser.username,
          name: editingUser.name,
          invitationRole: editingUser.invitationRole,
          password: editingUser.password,
          isMqc: editingUser.isMqc,
          isHod: editingUser.isHod,
          coursePlanEnabled: editingUser.coursePlanEnabled !== false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setToast({ type: 'success', message: 'User credentials updated successfully!' });
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating credentials' });
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newUserCode.trim().toUpperCase();

    if (newUserType === 'ADMIN') {
      if (!cleanCode || !newUserPassword.trim()) {
        setToast({ type: 'error', message: 'Admin User ID and Password are required' });
        return;
      }
    } else {
      if (!newUserName.trim() || !cleanCode) {
        setToast({ type: 'error', message: 'Full Name and User ID/ERP Code are required' });
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          userType: newUserType,
          name: newUserType === 'ADMIN' ? (newUserName.trim() || `Admin (${cleanCode})`) : newUserName.trim(),
          username: cleanCode,
          code: cleanCode,
          password: newUserPassword || (newUserType === 'ADMIN' ? 'admin123' : 'sjciqac'),
          departmentName: newUserType === 'ADMIN' ? 'Central Administration' : newUserDept,
          shift: newUserShift,
          invitationRole: newUserType === 'ADMIN' ? 'ADMIN' : newUserInvRole,
          isMqc: newUserType === 'ADMIN' ? true : newUserMqc,
          isHod: newUserType === 'ADMIN' ? false : newUserHod,
          coursePlanEnabled: newUserType === 'ADMIN' ? true : newUserCoursePlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setToast({ type: 'success', message: `${newUserType === 'ADMIN' ? 'Admin' : 'User'} "${cleanCode}" added successfully!` });
      setIsAddUserOpen(false);
      setNewUserName('');
      setNewUserCode('');
      setNewUserPassword('sjciqac');
      setNewUserType('USER');
      setNewUserCoursePlan(true);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error creating user' });
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Delete User
  const handleDeleteUser = async (u: any) => {
    if (!confirm(`Are you sure you want to remove user "${u.name}" (${u.code || u.username})?`)) return;

    try {
      const res = await fetch('/api/admin/users-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_user',
          id: u.id,
          username: u.username,
        }),
      });

      if (!res.ok) throw new Error('Failed to delete user');
      setToast({ type: 'success', message: `User "${u.name}" removed.` });
      setUsers((prev) => prev.filter((item) => item.id !== u.id && item.username !== u.username));
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error deleting user' });
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.code && u.code.toLowerCase().includes(q)) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(q));

    const matchesDept = filterDept === 'ALL' || u.departmentName === filterDept;

    const normalizedRole =
      u.invitationRole === 'DIRECTOR' || (!u.invitationRole && u.role === 'DIRECTOR')
        ? 'DIRECTOR'
        : u.invitationRole === 'ADMINISTRATOR' || (!u.invitationRole && u.role === 'STAFF')
        ? 'ADMINISTRATOR'
        : 'STAFF';

    const matchesRole = filterRole === 'ALL' || normalizedRole === filterRole;

    const matchesMqc =
      filterMqc === 'ALL' ||
      (filterMqc === 'MQC_ONLY' && u.isMqc) ||
      (filterMqc === 'NON_MQC' && !u.isMqc);

    const matchesHod =
      filterHod === 'ALL' ||
      (filterHod === 'HOD_ONLY' && u.isHod) ||
      (filterHod === 'NON_HOD' && !u.isHod);

    const matchesCoursePlan =
      filterCoursePlan === 'ALL' ||
      (filterCoursePlan === 'ENABLED' && u.coursePlanEnabled !== false) ||
      (filterCoursePlan === 'DISABLED' && u.coursePlanEnabled === false);

    return matchesSearch && matchesDept && matchesRole && matchesMqc && matchesHod && matchesCoursePlan;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalFacultyCount = users.length;
  const totalMqcCount = users.filter((u) => u.isMqc).length;
  const totalHodCount = users.filter((u) => u.isHod).length;
  const totalStaffUploadCount = users.filter((u) => (u.invitationRole || u.role) !== 'DIRECTOR' && (u.invitationRole || u.role) !== 'ADMINISTRATOR').length;

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header
          title="Access Control"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Action Bar & Summary Stats */}
          <div className="academic-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-black text-[#26648E] font-crest tracking-tight">
                    Central User Access Control &amp; Roles
                  </h2>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-semibold">
                  Manage the institutional user roster ({totalFacultyCount} members). Configure Invitation access roles (Staff, Administrator, Director), grant <strong>MQC Member status</strong> for AAA Data Platform access, and designate <strong>HODs</strong> for Course Plan departmental status sign-off.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Bulk Course Plan Access Controls */}
                <button
                  type="button"
                  onClick={() => handleBulkCoursePlan(false)}
                  disabled={submitting}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Disable Course Plan pages for all faculty in the portal"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                  <span>Disable Course Plan for All</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkCoursePlan(true)}
                  disabled={submitting}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Enable Course Plan pages for all faculty in the portal"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Enable for All</span>
                </button>

                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white border border-[#4F8FC0]/20 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Users</span>
                <div className="text-xl font-black text-[#26648E] mt-0.5">{totalFacultyCount}</div>
                <span className="text-[10px] text-slate-500 font-bold">All Departments</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#e8f8f9] border border-[#53D2DC]/40 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#125e64] tracking-wider">AAA Access (MQC)</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#125e64]" />
                </div>
                <div className="text-xl font-black text-[#125e64] mt-0.5">{totalMqcCount}</div>
                <span className="text-[10px] text-[#125e64]/80 font-bold">Authorized MQC Staff</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#fff8e7] border border-[#fedba0] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#8a5d11] tracking-wider">Course Plan HODs</span>
                  <GraduationCap className="w-3.5 h-3.5 text-[#8a5d11]" />
                </div>
                <div className="text-xl font-black text-[#8a5d11] mt-0.5">{totalHodCount}</div>
                <span className="text-[10px] text-[#8a5d11]/80 font-bold">Department Status View</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f0f5f9] border border-[#4F8FC0]/25 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider">Staff Upload Access</span>
                  <FileText className="w-3.5 h-3.5 text-[#26648E]" />
                </div>
                <div className="text-xl font-black text-[#26648E] mt-0.5">{totalStaffUploadCount}</div>
                <span className="text-[10px] text-[#4F8FC0] font-bold">Default for Faculty</span>
              </div>
            </div>
          </div>

          {/* Search & Dynamic Filters Bar */}
          <div className="academic-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4F8FC0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search faculty by name, ERP code (e.g. 24CAI51), username, or department..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition font-medium bg-white"
                />
              </div>

              {/* Department Dropdown Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-[#26648E]"
                >
                  <option value="ALL">All Departments ({departmentNames.length})</option>
                  {departmentNames.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              {/* Invitation Access Role Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">Invitation Access:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STAFF">Staff (Upload Invitations)</option>
                  <option value="ADMINISTRATOR">Administrator (Mail Sent)</option>
                  <option value="DIRECTOR">Director (Review &amp; Sign-off)</option>
                </select>
              </div>

              {/* AAA MQC Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">AAA Platform:</span>
                <select
                  value={filterMqc}
                  onChange={(e) => setFilterMqc(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Staff</option>
                  <option value="MQC_ONLY">MQC Members (AAA Enabled)</option>
                  <option value="NON_MQC">Non-MQC (AAA Disabled)</option>
                </select>
              </div>

              {/* Course Plan Access Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">Course Plan Access:</span>
                <select
                  value={filterCoursePlan}
                  onChange={(e) => setFilterCoursePlan(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All (Show &amp; Hide)</option>
                  <option value="ENABLED">Enabled (Visible in Menu)</option>
                  <option value="DISABLED">Disabled (Hidden from User)</option>
                </select>
              </div>

              {/* Course Plan HOD Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black uppercase text-slate-400">HOD Role:</span>
                <select
                  value={filterHod}
                  onChange={(e) => setFilterHod(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none"
                >
                  <option value="ALL">All Faculty</option>
                  <option value="HOD_ONLY">HODs Only (Review Hub)</option>
                  <option value="NON_HOD">Standard Faculty</option>
                </select>
              </div>

              {(searchTerm || filterDept !== 'ALL' || filterRole !== 'ALL' || filterMqc !== 'ALL' || filterHod !== 'ALL' || filterCoursePlan !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDept('ALL');
                    setFilterRole('ALL');
                    setFilterMqc('ALL');
                    setFilterHod('ALL');
                    setFilterCoursePlan('ALL');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="academic-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-[#f0f5f9]/50">
              <span>
                Showing <strong className="text-[#26648E]">{paginatedUsers.length}</strong> of{' '}
                <strong className="text-[#26648E]">{filteredUsers.length}</strong> filtered users (Page {currentPage} of {totalPages})
              </span>

              {/* Pagination controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  Prev
                </button>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-500 font-bold">Loading user access directory...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Users className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold text-slate-600">No users match your filters</p>
                  <p className="text-xs text-slate-400">Try adjusting your query or role filter</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f0f5f9] border-b border-[#4F8FC0]/20 text-[10px] font-black text-[#26648E] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Faculty Member &amp; ERP Code</th>
                      <th className="py-3.5 px-4">Department &amp; Shift</th>
                      <th className="py-3.5 px-4 text-center">Invitation Access</th>
                      <th className="py-3.5 px-4 text-center">AAA Platform (MQC)</th>
                      <th className="py-3.5 px-4 text-center">Course Plan Access &amp; HOD</th>
                      <th className="py-3.5 px-4 text-right">Credentials &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {paginatedUsers.map((u) => {
                      const currentInvRole =
                        u.invitationRole === 'DIRECTOR' || (!u.invitationRole && u.role === 'DIRECTOR')
                          ? 'DIRECTOR'
                          : u.invitationRole === 'ADMINISTRATOR' || (!u.invitationRole && u.role === 'STAFF')
                          ? 'ADMINISTRATOR'
                          : 'STAFF';

                      return (
                        <tr key={u.id} className="hover:bg-[#f0f5f9]/50 transition-colors">
                          {/* Name & ERP Code */}
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <span className="block leading-snug">{u.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#26648E] border border-slate-200">
                                {u.code || u.username}
                              </span>
                              {u.position && (
                                <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[150px]">
                                  {u.position}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <span className="font-bold text-slate-800 block text-xs">
                              {u.departmentName || 'Central Administration'}
                            </span>
                            <span className="text-[10px] text-[#4F8FC0] font-extrabold uppercase">
                              {u.shift || 'Shift I / Shift II'}
                            </span>
                          </td>

                          {/* Invitation Role Dropdown: ONLY 3 Options */}
                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={currentInvRole}
                              onChange={(e) => handleChangeInvitationRole(u, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                                currentInvRole === 'DIRECTOR'
                                  ? 'bg-[#FFE3B3] text-[#26648E] border-[#fedba0]'
                                  : currentInvRole === 'ADMINISTRATOR'
                                  ? 'bg-[#26648E] text-white border-[#26648E]'
                                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#4F8FC0]'
                              }`}
                            >
                              <option value="STAFF">Staff (Upload Invitations)</option>
                              <option value="ADMINISTRATOR">Administrator (Mail Sent &amp; Dispatches)</option>
                              <option value="DIRECTOR">Director (View Approvals &amp; Remarks)</option>
                            </select>
                          </td>

                          {/* AAA MQC Toggle Button */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleMqc(u)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                                u.isMqc
                                  ? 'bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/60 hover:bg-[#d5f4f6]'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title={u.isMqc ? 'Click to revoke AAA access' : 'Click to grant AAA access as MQC Member'}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#125e64]" />
                              <span>{u.isMqc ? 'MQC Active (AAA Enabled)' : 'Disabled (No AAA)'}</span>
                            </button>
                          </td>

                          {/* Course Plan Access & HOD Role Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {/* Enable / Disable Course Plan */}
                              <button
                                type="button"
                                onClick={() => handleToggleCoursePlan(u)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                                  u.coursePlanEnabled !== false
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                                }`}
                                title={u.coursePlanEnabled !== false ? 'Click to disable and hide Course Plan pages for this user' : 'Click to enable and show Course Plan pages for this user'}
                              >
                                <BookOpen className={`w-3.5 h-3.5 ${u.coursePlanEnabled !== false ? 'text-emerald-700' : 'text-rose-600'}`} />
                                <span>{u.coursePlanEnabled !== false ? 'Course Plan: Enabled' : 'Course Plan: Disabled'}</span>
                              </button>

                              {/* HOD Status Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleHod(u)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                                  u.isHod
                                    ? 'bg-[#fff8e7] text-[#8a5d11] border border-[#fedba0] hover:bg-[#ffefc9]'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                }`}
                                title={u.isHod ? 'Click to revoke HOD Status' : 'Click to assign HOD Status'}
                              >
                                <Award className="w-3 h-3 text-[#8a5d11]" />
                                <span>{u.isHod ? 'HOD (Review Hub)' : 'Standard Faculty'}</span>
                              </button>
                            </div>
                          </td>

                          {/* Credentials & Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 rounded-lg hover:bg-[#f0f5f9] text-[#26648E] transition cursor-pointer"
                                title="Edit User Credentials"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto pt-6 sm:pt-12">
          <div className="academic-card max-w-lg w-full shadow-2xl overflow-hidden mb-12 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#4F8FC0]/20 flex items-center justify-between bg-[#f0f5f9] shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#26648E]" />
                <h3 className="text-sm font-black text-[#26648E]">
                  {newUserType === 'ADMIN' ? 'Register Portal Admin' : 'Add New Faculty / Staff'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 overflow-y-auto">
              {/* Radio Button Selector: User vs Admin */}
              <div className="flex items-center gap-2.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl cursor-pointer text-xs font-black transition ${
                  newUserType === 'USER' ? 'bg-white text-[#26648E] shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-[#26648E]'
                }`}>
                  <input
                    type="radio"
                    name="modalUserType"
                    value="USER"
                    checked={newUserType === 'USER'}
                    onChange={() => setNewUserType('USER')}
                    className="w-3.5 h-3.5 text-[#26648E]"
                  />
                  <span>User (Faculty / Staff)</span>
                </label>

                <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl cursor-pointer text-xs font-black transition ${
                  newUserType === 'ADMIN' ? 'bg-[#26648E] text-white shadow-2xs' : 'text-slate-600 hover:text-[#26648E]'
                }`}>
                  <input
                    type="radio"
                    name="modalUserType"
                    value="ADMIN"
                    checked={newUserType === 'ADMIN'}
                    onChange={() => setNewUserType('ADMIN')}
                    className="w-3.5 h-3.5 text-white"
                  />
                  <span>Admin</span>
                </label>
              </div>

              {/* ADMIN MODE: ONLY User ID & Password */}
              {newUserType === 'ADMIN' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Admin User ID <span className="text-rose-500">* (CAPITAL LETTERS ONLY)</span>
                    </label>
                    <input
                      type="text"
                      value={newUserCode}
                      onChange={(e) => setNewUserCode(e.target.value.toUpperCase())}
                      placeholder="e.g. IQAC_ADMIN or SYSADMIN"
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-mono uppercase font-black tracking-wider text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Admin Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Enter strong admin password"
                      className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-mono font-medium"
                      required
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-semibold">
                    ℹ️ This will create a Central Administrator account with full governance privileges across all modules.
                  </div>
                </div>
              ) : (
                /* USER MODE: Full Registration Form */
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Dr. John Doe"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        User ID / Code <span className="text-[#4F8FC0] font-black uppercase text-[10px]">(Caps Only)</span>
                      </label>
                      <input
                        type="text"
                        value={newUserCode}
                        onChange={(e) => setNewUserCode(e.target.value.toUpperCase())}
                        placeholder="e.g. 24CSC01"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-mono uppercase font-bold tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="e.g. sjciqac"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Shift</label>
                      <select
                        value={newUserShift}
                        onChange={(e) => setNewUserShift(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                      >
                        <option value="Shift I">Shift I</option>
                        <option value="Shift II">Shift II</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                    >
                      {departmentNames.length > 0 ? (
                        departmentNames.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))
                      ) : (
                        <option value="Computer Science">Computer Science</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Invitation Access Role</label>
                    <select
                      value={newUserInvRole}
                      onChange={(e) => setNewUserInvRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-bold text-slate-700"
                    >
                      <option value="STAFF">Staff (Upload Invitations - Default for faculty)</option>
                      <option value="ADMINISTRATOR">Administrator (Mail Sent &amp; Dispatches)</option>
                      <option value="DIRECTOR">Director (View Approvals &amp; Remarks)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserCoursePlan}
                        onChange={(e) => setNewUserCoursePlan(e.target.checked)}
                        className="w-4 h-4 text-[#26648E] rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-800">Course Plan</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserMqc}
                        onChange={(e) => setNewUserMqc(e.target.checked)}
                        className="w-4 h-4 text-[#26648E] rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-800">MQC (AAA)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUserHod}
                        onChange={(e) => setNewUserHod(e.target.checked)}
                        className="w-4 h-4 text-[#26648E] rounded"
                      />
                      <span className="text-[11px] font-bold text-slate-800">HOD Status</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  {submitting ? 'Creating...' : newUserType === 'ADMIN' ? 'Create Admin Account' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CREDENTIALS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto pt-6 sm:pt-12">
          <div className="academic-card max-w-md w-full shadow-2xl overflow-hidden mb-12 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#4F8FC0]/20 flex items-center justify-between bg-[#f0f5f9]">
              <h3 className="text-sm font-black text-[#26648E]">Edit User Access &amp; Credentials</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateFaculty} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ERP Code / Username</label>
                <input
                  type="text"
                  value={editingUser.code || editingUser.username}
                  disabled
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Login Password / Credentials
                </label>
                <input
                  type="text"
                  value={editingUser.password || editingUser.credentials || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Enter login password"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invitation Portal Access Role
                </label>
                <select
                  value={
                    editingUser.invitationRole === 'DIRECTOR'
                      ? 'DIRECTOR'
                      : editingUser.invitationRole === 'ADMINISTRATOR'
                      ? 'ADMINISTRATOR'
                      : 'STAFF'
                  }
                  onChange={(e) => setEditingUser({ ...editingUser, invitationRole: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-bold text-slate-700"
                >
                  <option value="STAFF">Staff (Upload Invitations)</option>
                  <option value="ADMINISTRATOR">Administrator (Mail Sent &amp; Dispatches)</option>
                  <option value="DIRECTOR">Director (View Approvals &amp; Remarks)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.coursePlanEnabled !== false}
                    onChange={(e) => setEditingUser({ ...editingUser, coursePlanEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#26648E] rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-800">Course Plan</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isMqc}
                    onChange={(e) => setEditingUser({ ...editingUser, isMqc: e.target.checked })}
                    className="w-4 h-4 text-[#26648E] rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-800">MQC (AAA)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isHod}
                    onChange={(e) => setEditingUser({ ...editingUser, isHod: e.target.checked })}
                    className="w-4 h-4 text-[#26648E] rounded"
                  />
                  <span className="text-[11px] font-bold text-slate-800">HOD Status</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
