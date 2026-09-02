'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Lock,
  User,
  Shield,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';

export default function AccessControlPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states (Create)
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DIRECTOR' | 'STAFF' | 'ADMIN'>('STAFF');

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'DIRECTOR' | 'STAFF' | 'ADMIN'>('STAFF');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/users'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setCurrentUser(uData.user);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: 'Failed to load user accounts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password || !role) {
      setToast({ type: 'error', message: 'All fields are required.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setToast({
        type: 'success',
        message: `${role} account for "${name}" created successfully!`,
      });

      setName('');
      setUsername('');
      setPassword('');
      setRole('STAFF');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error creating user account' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditRole(u.role);
    setEditPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editUsername.trim()) {
      setToast({ type: 'error', message: 'Name and Username are required' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          role: editRole,
          password: editPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setToast({ type: 'success', message: `User "${editUsername}" updated successfully!` });
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: any) => {
    const nextStatus = u.isActive === false ? true : false;
    const actionName = nextStatus ? 'enable' : 'disable';

    if (currentUser?.userId === u.id) {
      setToast({ type: 'error', message: 'Cannot disable your own active account.' });
      return;
    }

    if (!confirm(`Are you sure you want to ${actionName} account "${u.username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user status');

      setToast({ type: nextStatus ? 'success' : 'warning', message: data.message });
      fetchData();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to toggle status' });
    }
  };

  const handleDeleteUser = async (id: string, uname: string) => {
    if (currentUser?.userId === id) {
      setToast({ type: 'error', message: 'Cannot delete your own active account.' });
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${uname}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: `User "${uname}" removed.` });
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete user' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={currentUser?.name || 'Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Access Control & User Management"
          userName={currentUser?.name}
          userRole="Admin"
        />

        {/* Dynamic Top-Right Pop-up Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {/* Top Bar with Add User Button */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6320ee]" />
                <h2 className="text-xl font-bold text-slate-900">Administrative & Staff Role Accounts</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Provision, edit, and control permissions for Director, IQAC Staff, and Admin users.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Account</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
              />
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 hidden sm:inline-block">
              {filteredUsers.length} of {users.length} Users
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Privileged Accounts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Role-based permission access list</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 sm:hidden">
                {filteredUsers.length} Total
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading accounts...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                No matching user accounts found.
              </div>
            ) : (
              <>
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-4 py-4">Username</th>
                        <th className="px-4 py-4">Assigned Role</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Created Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredUsers.map((u) => {
                        const isDisabled = u.isActive === false;

                        return (
                          <tr
                            key={u.id}
                            className={`transition-colors ${
                              isDisabled ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                  {u.name.charAt(0)}
                                </div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-mono text-xs text-slate-700 font-semibold">
                              {u.username}
                            </td>
                            <td className="px-4 py-4">
                              {u.role === 'DIRECTOR' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                                  <Shield className="w-3 h-3" /> Director
                                </span>
                              )}
                              {u.role === 'STAFF' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                  <UserCheck className="w-3 h-3" /> Staff
                                </span>
                              )}
                              {u.role === 'ADMIN' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                                  <ShieldCheck className="w-3 h-3" /> Administrator
                                </span>
                              )}
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
                            <td className="px-4 py-4 text-xs text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                                  title="Edit User"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Toggle Active/Disabled */}
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                    isDisabled
                                      ? 'text-amber-600 hover:bg-amber-100 bg-amber-50'
                                      : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={isDisabled ? 'Enable User' : 'Disable User'}
                                >
                                  {isDisabled ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                  title="Delete User"
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
                  {filteredUsers.map((u) => {
                    const isDisabled = u.isActive === false;

                    return (
                      <div key={u.id} className="p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                              <span className="font-mono text-xs text-slate-500">{u.username}</span>
                            </div>
                          </div>
                          <div>
                            {isDisabled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                <EyeOff className="w-3 h-3" /> Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[11px]">
                              {u.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-2 text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-2 rounded-lg cursor-pointer ${isDisabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                              title={isDisabled ? 'Enable' : 'Disable'}
                            >
                              {isDisabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
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

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Create Privileged User</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                >
                  <option value="STAFF">IQAC Staff</option>
                  <option value="DIRECTOR">IQAC Director</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Edit User Account</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-purple-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
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
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                >
                  <option value="STAFF">IQAC Staff</option>
                  <option value="DIRECTOR">IQAC Director</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
