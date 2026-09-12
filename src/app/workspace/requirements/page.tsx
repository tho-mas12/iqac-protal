'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function RequirementsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [requirements, setRequirements] = useState<any[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [frameworkId, setFrameworkId] = useState('');
  const [criterion, setCriterion] = useState('Criterion 1: Curricular Aspects');
  const [responsibleDeptId, setResponsibleDeptId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [activeAcademicYear, selectedStatus, search]);

  const fetchInitialData = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const mRes = await fetch('/api/master-data');
      if (mRes.ok) {
        const mData = await mRes.json();
        setFrameworks(mData.frameworks || []);
        setDepartments(mData.departments || []);
        if (mData.frameworks?.length > 0) setFrameworkId(mData.frameworks[0].id);
      }

      let url = `/api/requirements?academicYearId=${activeAcademicYear}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const rRes = await fetch(url);
      if (rRes.ok) {
        const rData = await rRes.json();
        setRequirements(rData.requirements || []);
      }
    } catch (err) {
      console.error('Failed to load requirements', err);
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          frameworkId,
          criterion,
          responsibleDeptId: responsibleDeptId || null,
          priority,
          dueDate,
          description,
          academicYearId: activeAcademicYear,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        fetchInitialData();
      }
    } catch (err) {
      console.error('Failed to create requirement', err);
    }
  };

  const handleExportExcel = () => {
    window.location.href = `/api/excel/export?module=REQUIREMENTS&format=xlsx`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar userRole={user?.role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          activeAcademicYear={activeAcademicYear}
          onAcademicYearChange={(y) => setActiveAcademicYear(y)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600" />
                Requirement & Compliance Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define, assign, and track NAAC, UGC, NIRF & institutional requirements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export Excel
              </button>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'IQAC_ADMIN' || user?.role === 'IQAC_MEMBER') && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Requirement
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, ID, criterion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Correction Required">Correction Required</option>
                <option value="Approved">Approved</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Requirements Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Req ID & Title</th>
                    <th className="p-4">Framework / Category</th>
                    <th className="p-4">Criterion</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {requirements.length > 0 ? (
                    requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{req.title}</div>
                          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{req.reqId}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            {req.framework?.code || 'IQAC'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{req.category}</div>
                        </td>
                        <td className="p-4 text-slate-600">{req.criterion}</td>
                        <td className="p-4">
                          {req.department ? (
                            <span className="font-semibold text-slate-800">{req.department.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">All Departments</span>
                          )}
                        </td>
                        <td className="p-4">
                          {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'Approved' || req.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : req.status === 'Correction Required'
                                ? 'bg-rose-100 text-rose-700'
                                : req.status === 'Under Verification'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => alert(`Requirement Details:\n${req.description || 'No detailed description'}`)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No requirements found matching active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Requirement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Create Quality Requirement
            </h2>
            <form onSubmit={handleCreateRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. BoS Curriculum Revision & PO Outcome Mapping"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Framework *</label>
                  <select
                    value={frameworkId}
                    onChange={(e) => setFrameworkId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    {frameworks.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsible Dept</label>
                  <select
                    value={responsibleDeptId}
                    onChange={(e) => setResponsibleDeptId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Criterion</label>
                  <input
                    type="text"
                    value={criterion}
                    onChange={(e) => setCriterion(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Guidelines</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Enter detailed guidelines for department..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
