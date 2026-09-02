'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  Building2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Search,
  KeyRound,
  Trash2,
  Sparkles,
  Edit,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('ALL');

  // Form states (Add)
  const [deptName, setDeptName] = useState('');
  const [deptShift, setDeptShift] = useState('Shift I');
  const [customUsername, setCustomUsername] = useState('');

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editShift, setEditShift] = useState('Shift I');
  const [editCode, setEditCode] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, dRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/departments'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDepartments(dData.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setToast({ type: 'error', message: 'Please enter department name.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deptName,
          shift: deptShift,
          customUsername: customUsername || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register department');
      }

      setToast({
        type: 'success',
        message: `Department "${deptName} (${deptShift})" registered successfully! Default password: sjciqac`,
      });

      setDeptName('');
      setDeptShift('Shift I');
      setCustomUsername('');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error registering department' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setEditName(dept.name);
    setEditShift(dept.shift || 'Shift I');
    setEditCode(dept.code || '');
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
          name: editName,
          shift: editShift,
          code: editCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update department');
      }

      setToast({
        type: 'success',
        message: `Department "${editName}" updated successfully!`,
      });

      setEditingDept(null);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating department' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSingleStatus = async (dept: any) => {
    const nextStatus = dept.isActive === false ? true : false;
    const actionName = nextStatus ? 'enable' : 'disable';

    if (!confirm(`Are you sure you want to ${actionName} "${dept.name}"? ${nextStatus ? 'Department will regain portal login access.' : 'Department users will be blocked from logging in.'}`)) {
      return;
    }

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
        message: data.message || `Department ${actionName}d.`,
      });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to toggle department status' });
    }
  };

  const handleBulkToggle = async (targetActive: boolean) => {
    const actionLabel = targetActive ? 'ENABLE ALL' : 'DISABLE (BLOCK) ALL';
    if (!confirm(`WARNING: Are you sure you want to ${actionLabel} department user accounts at once?`)) {
      return;
    }

    try {
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_BULK',
          isActive: targetActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk toggle failed');

      setToast({
        type: targetActive ? 'success' : 'warning',
        message: data.message,
      });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error performing bulk action' });
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all associated user accounts and invitations.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', message: `Department "${name}" removed.` });
        fetchData();
      } else {
        throw new Error('Failed to delete department');
      }
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Failed to delete department' });
    }
  };

  const filteredDepts = departments.filter((dept: any) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dept.users && dept.users.some((u: any) => u.username.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesShift = selectedShiftFilter === 'ALL' || dept.shift === selectedShiftFilter;
    return matchesSearch && matchesShift;
  });

  const allDisabled = departments.length > 0 && departments.every((d: any) => d.isActive === false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={user?.name || 'IQAC Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Departments Management"
          userName={user?.name}
          userRole="Admin"
        />

        {/* Dynamic Top-Right Pop-up Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Top Bar with Add Department & Master Bulk Actions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6320ee]" />
                <h2 className="text-xl font-bold text-slate-900">Academic & Administrative Departments</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure departments, shifts, user credentials, and portal access permissions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Master Bulk Disable / Enable Button */}
              {allDisabled ? (
                <button
                  onClick={() => handleBulkToggle(true)}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  title="Enable all department accounts"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Enable All Departments</span>
                </button>
              ) : (
                <button
                  onClick={() => handleBulkToggle(false)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  title="Block/Disable all department accounts at once"
                >
                  <EyeOff className="w-4 h-4 text-rose-600" />
                  <span>Block All Departments</span>
                </button>
              )}

              {/* Add Department Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">Shift:</span>
              {['ALL', 'Shift I', 'Shift II', 'Units'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedShiftFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    selectedShiftFilter === s
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Departments List / Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registered Departments</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage permissions, edit details, or reset credentials</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                {filteredDepts.length} of {departments.length}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading departments...
              </div>
            ) : filteredDepts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                No matching departments found.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Department Name</th>
                        <th className="px-4 py-4">Shift</th>
                        <th className="px-4 py-4">Login Username</th>
                        <th className="px-4 py-4">Department Code</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Submissions</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredDepts.map((dept) => {
                        const userAccount = dept.users && dept.users[0];
                        const isDisabled = dept.isActive === false;

                        return (
                          <tr
                            key={dept.id}
                            className={`transition-colors ${
                              isDisabled ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{dept.name}</span>
                                {isDisabled && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    Disabled
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{dept.code}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  dept.shift === 'Units'
                                    ? 'bg-blue-100 text-blue-800'
                                    : dept.shift === 'Shift II'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {dept.shift}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {userAccount ? (
                                <div>
                                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    {userAccount.username}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">No user assigned</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit font-mono">
                                {dept.code}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {isDisabled ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                  Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-slate-800 text-sm">
                                {dept._count?.invitations || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenEdit(dept)}
                                  className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                                  title="Edit Department"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Disable / Enable Toggle Button */}
                                <button
                                  onClick={() => handleToggleSingleStatus(dept)}
                                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                    isDisabled
                                      ? 'text-amber-600 hover:bg-amber-100 bg-amber-50'
                                      : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={isDisabled ? 'Enable Department Login' : 'Disable Department Login'}
                                >
                                  {isDisabled ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                  title="Delete Department"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredDepts.map((dept) => {
                    const userAccount = dept.users && dept.users[0];
                    const isDisabled = dept.isActive === false;

                    return (
                      <div key={dept.id} className="p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {dept.code}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                                {dept.shift}
                              </span>
                            </div>
                          </div>
                          <div>
                            {isDisabled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                <EyeOff className="w-3 h-3" /> Disabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">User</span>
                            <span className="font-mono font-bold text-purple-800">{userAccount?.username || 'None'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Submissions</span>
                            <span className="font-bold text-slate-800">{dept._count?.invitations || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(dept)}
                              className="p-2 text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSingleStatus(dept)}
                              className={`p-2 rounded-lg cursor-pointer ${isDisabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                              title={isDisabled ? 'Enable' : 'Disable'}
                            >
                              {isDisabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                              className="p-2 text-red-600 bg-red-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Register New Department</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shift
                </label>
                <select
                  value={deptShift}
                  onChange={(e) => setDeptShift(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                >
                  <option value="Shift I">Shift I (Day)</option>
                  <option value="Shift II">Shift II (Evening)</option>
                  <option value="Units">Units</option>
                  <option value="Both">Both Shifts</option>
                  <option value="General">General / Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Custom Login Username
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
                <p className="text-[11px] text-purple-700 mt-1.5 font-medium">
                  Initial password will be automatically assigned as: <code className="font-mono bg-purple-100 px-1 rounded font-bold">sjciqac</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Register Department</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Edit Department Details</h3>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                className="text-purple-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shift
                </label>
                <select
                  value={editShift}
                  onChange={(e) => setEditShift(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                >
                  <option value="Shift I">Shift I (Day)</option>
                  <option value="Shift II">Shift II (Evening)</option>
                  <option value="Units">Units</option>
                  <option value="Both">Both Shifts</option>
                  <option value="General">General / Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Code
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
