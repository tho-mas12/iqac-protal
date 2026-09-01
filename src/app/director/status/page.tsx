'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  ExternalLink,
  Calendar,
  Building2,
  RotateCw,
  Search,
  MessageSquare
} from 'lucide-react';

export default function DirectorStatusPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'REMARKS' | 'APPROVED'>('REMARKS');
  const [remarkedList, setRemarkedList] = useState<any[]>([]);
  const [approvedList, setApprovedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Editing Remarks State
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [editedRemarks, setEditedRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, remRes, appRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations?status=REMARKS'),
        fetch('/api/invitations?status=APPROVED'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (remRes.ok) {
        const rData = await remRes.json();
        setRemarkedList(rData.invitations || []);
      }
      if (appRes.ok) {
        const aData = await appRes.json();
        setApprovedList(aData.invitations || []);
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

  const handleStartEdit = (inv: any) => {
    setEditingInvId(inv.id);
    setEditedRemarks(inv.directorRemarks || '');
    setFeedback(null);
  };

  const handleSaveRemarks = async (invId: string) => {
    if (!editedRemarks.trim()) {
      setFeedback({ type: 'error', message: 'Remarks text cannot be empty.' });
      return;
    }

    setUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/invitations/${invId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_REMARKS',
          directorRemarks: editedRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update remarks');
      }

      setFeedback({ type: 'success', message: 'Remarks updated successfully!' });
      setEditingInvId(null);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating remarks' });
    } finally {
      setUpdating(false);
    }
  };

  const filteredRemarked = remarkedList.filter(
    (i) =>
      i.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      i.department?.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApproved = approvedList.filter(
    (i) =>
      i.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      i.department?.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="DIRECTOR" userName={user?.name || 'Dr. Director'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Status & History Management"
          userName={user?.name}
          userRole="Director"
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
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Top Tabs & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Division Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('REMARKS')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'REMARKS'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Remarks Invitations ({remarkedList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('APPROVED')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved Invitations ({approvedList.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search title, dept, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
              />
            </div>
          </div>

          {/* Division 1: Remarks Invitations with Edit Option */}
          {activeTab === 'REMARKS' && (
            <div className="space-y-4">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading remarked invitations...
                </div>
              ) : filteredRemarked.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  No remarked invitations found.
                </div>
              ) : (
                filteredRemarked.map((inv) => {
                  const isEditing = editingInvId === inv.id;

                  return (
                    <div
                      key={inv.id}
                      className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">{inv.programTitle}</span>
                            {inv.revisionCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                                Rev #{inv.revisionCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                            <span className="font-bold text-purple-800">{inv.department?.name} ({inv.shift})</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{inv.category}</span>
                            <span>•</span>
                            <span>Event: {new Date(inv.fromDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <a
                          href={inv.driveViewLink || inv.localFilePath || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <span>View File</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Remarks Content & Edit Box */}
                      <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            <span>Director Remarks</span>
                          </span>

                          {!isEditing ? (
                            <button
                              onClick={() => handleStartEdit(inv)}
                              className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Remarks</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingInvId(null)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveRemarks(inv.id)}
                                disabled={updating}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>{updating ? 'Saving...' : 'Update Remarks'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={editedRemarks}
                            onChange={(e) => setEditedRemarks(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-amber-400 bg-white text-xs font-medium focus:outline-none"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-slate-800 whitespace-pre-line bg-white/90 p-3 rounded-lg border border-amber-200">
                            {inv.directorRemarks}
                          </p>
                        )}

                        <div className="text-[11px] text-amber-800/80 font-medium">
                          Last Updated: {new Date(inv.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Division 2: Approved Invitations List */}
          {activeTab === 'APPROVED' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Approved Invitations Archive</h3>
                  <p className="text-xs text-slate-500 mt-0.5">All successfully verified and stamped invitations</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  {approvedList.length} Total Approved
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading approved list...
                </div>
              ) : filteredApproved.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No approved invitations found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Program Title</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4">Event Date</th>
                        <th className="px-4 py-4">Approved At</th>
                        <th className="px-4 py-4">Hard Copy Status</th>
                        <th className="px-6 py-4 text-right">View File</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredApproved.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 line-clamp-1">{inv.programTitle}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{inv.fileName}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-800 text-xs block">{inv.department?.name}</span>
                            <span className="text-[11px] text-slate-400">{inv.shift}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                              {inv.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-600">
                            {new Date(inv.fromDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {inv.approvedAt ? new Date(inv.approvedAt).toLocaleDateString() : 'Approved'}
                          </td>
                          <td className="px-4 py-4">
                            {inv.hardCopyReceived ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Received
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                Pending Hard Copy
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={inv.driveViewLink || inv.localFilePath || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
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
          )}
        </main>
      </div>
    </div>
  );
}
