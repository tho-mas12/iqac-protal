'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  Building2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  RotateCw,
  Search,
  KeyRound,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [deptName, setDeptName] = useState('');
  const [deptShift, setDeptShift] = useState('Shift I');
  const [customUsername, setCustomUsername] = useState('');

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
      setFeedback({ type: 'error', message: 'Please enter department name.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

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

      setFeedback({
        type: 'success',
        message: `Department "${deptName} (${deptShift})" registered successfully! Dedicated Google Drive folder created with default password 'sjciqac'.`,
      });

      setDeptName('');
      setDeptShift('Shift I');
      setCustomUsername('');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error registering department' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all associated user accounts and invitations.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Department "${name}" removed.` });
        fetchData();
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Failed to delete department' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={user?.name || 'Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Departments Management"
          userName={user?.name}
          userRole="Admin"
        />

        <main className="p-6 md:p-8 space-y-6 flex-1">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Bar with Add Department Button */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Academic & Administrative Departments</h2>
              <p className="text-xs text-slate-500 mt-1">
                Register departments to provision their isolated Google Drive folders and access credentials.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-[#6320ee] hover:bg-[#5215ce] text-white font-bold rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 text-sm shrink-0 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          {/* Departments Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registered Departments List</h3>
                <p className="text-xs text-slate-500 mt-0.5">Default login password is set to sjciqac</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                {departments.length} Active Departments
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                No departments registered yet. Click &quot;Add Department&quot; above to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Department Name</th>
                      <th className="px-4 py-4">Shift</th>
                      <th className="px-4 py-4">Login Username</th>
                      <th className="px-4 py-4">Google Drive Folder</th>
                      <th className="px-4 py-4">Total Submissions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {departments.map((dept) => {
                      const userAccount = dept.users && dept.users[0];

                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{dept.name}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">Code: {dept.code}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              {dept.shift}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {userAccount ? (
                              <div>
                                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  {userAccount.username}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {userAccount.isPasswordChanged ? 'Password Changed' : 'Default (sjciqac)'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No user assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit">
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span className="font-mono truncate max-w-[140px]">{dept.driveFolderId || 'Provisioned'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-800 text-sm">
                              {dept._count?.invitations || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            <div className="px-6 py-5 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Register New Department</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg"
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
                  placeholder="e.g. Data Science & Analytics"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shift <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={deptShift}
                  onChange={(e) => setDeptShift(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                >
                  <option value="Shift I">Shift I (Day)</option>
                  <option value="Shift II">Shift II (Evening)</option>
                  <option value="Both">Both Shifts</option>
                  <option value="General">General / Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Custom Login Username <span className="text-slate-400 font-normal">(Auto-generated if empty)</span>
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. datascience_shift1"
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
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
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
                      <span>Creating Drive Folder...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Register & Create Drive Folder</span>
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
