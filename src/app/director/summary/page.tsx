'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  Building2,
  FolderOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Search,
  Filter,
  Eye
} from 'lucide-react';

export default function DirectorSummaryPage() {
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [deptInvitations, setDeptInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingInv, setFetchingInv] = useState(false);

  useEffect(() => {
    const fetchDepts = async () => {
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
          const depts = dData.departments || [];
          setDepartments(depts);
          if (depts.length > 0) {
            setSelectedDeptId(depts[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepts();
  }, []);

  useEffect(() => {
    if (!selectedDeptId) return;

    const fetchDeptInvs = async () => {
      try {
        setFetchingInv(true);
        const res = await fetch(`/api/invitations?departmentId=${selectedDeptId}`);
        if (res.ok) {
          const data = await res.json();
          setDeptInvitations(data.invitations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingInv(false);
      }
    };

    fetchDeptInvs();
  }, [selectedDeptId]);

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="DIRECTOR" userName={user?.name || 'Dr. Director'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Department Submission Summary"
          userName={user?.name}
          userRole="Director"
        />

        <main className="p-6 md:p-8 space-y-6 flex-1">
          {/* Department Selector Control Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Department to Inspect</h2>
                <p className="text-xs text-slate-500 mt-1">
                  View complete history, approval rates, and all event invitations for any department.
                </p>
              </div>

              {/* Department Dropdown Selector */}
              <div className="w-full sm:w-80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Departments
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-purple-600 absolute left-3.5 top-3.5" />
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.shift})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Department Overview Banner */}
            {selectedDept && (
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <span className="text-xs font-semibold text-purple-600 uppercase">Department</span>
                  <p className="text-base font-bold text-purple-950 mt-0.5">{selectedDept.name}</p>
                  <span className="text-xs text-purple-700 font-medium">Shift: {selectedDept.shift}</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-600 uppercase">Department Code</span>
                  <p className="text-base font-bold text-indigo-950 mt-0.5 font-mono truncate">
                    {selectedDept.code}
                  </p>
                  <span className="text-xs text-indigo-700 font-medium">Registered Identifier</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-600 uppercase">Total Submissions</span>
                  <p className="text-2xl font-extrabold text-emerald-950 mt-0.5">{deptInvitations.length}</p>
                </div>
              </div>
            )}
          </div>

          {/* Invitations Table for Selected Department */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  All Invitations from {selectedDept?.name || 'Department'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Priority listed chronologically</p>
              </div>
            </div>

            {fetchingInv ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading department invitations...
              </div>
            ) : deptInvitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                No invitations uploaded yet by this department.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Program Title</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Event Date</th>
                      <th className="px-4 py-4">Uploaded At</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Remarks / Notes</th>
                      <th className="px-6 py-4 text-right">File Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {deptInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{inv.programTitle}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{inv.fileName}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {inv.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600">
                          {new Date(inv.fromDate).toLocaleDateString()}
                          {inv.toDate && ` - ${new Date(inv.toDate).toLocaleDateString()}`}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500">
                          {new Date(inv.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          {inv.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {inv.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {inv.status === 'REMARKS' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> Remarks
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">
                          {inv.directorRemarks || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={inv.driveViewLink || inv.localFilePath || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
