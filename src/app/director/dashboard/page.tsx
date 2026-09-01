'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Eye,
  Building2,
  Calendar,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RotateCw,
  X,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DirectorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    remarks: 0,
    approved: 0,
    last24hPending: 0,
  });

  // Review Modal State
  const [selectedInv, setSelectedInv] = useState<any | null>(null);
  const [showRemarksBox, setShowRemarksBox] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REMARKS' | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [checkLogo, setCheckLogo] = useState(false);
  const [checkTitle, setCheckTitle] = useState(false);
  const [checkHeaders, setCheckHeaders] = useState(false);
  const [checkOthers, setCheckOthers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (iRes.ok) {
        const i = await iRes.json();
        setInvitations(i.invitations || []);
        setStats(i.stats || { total: 0, pending: 0, remarks: 0, approved: 0, last24hPending: 0 });
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

  const openReviewModal = (inv: any) => {
    setSelectedInv(inv);
    setShowRemarksBox(false);
    setCheckLogo(inv.checkLogo || false);
    setCheckTitle(inv.checkTitle || false);
    setCheckHeaders(inv.checkHeaders || false);
    setCheckOthers(inv.checkOthers || false);
    setRemarksText(inv.directorRemarks || '');
    setReviewAction(null);
    setReviewMessage(null);
  };

  const handleReviewSubmit = async (action: 'APPROVE' | 'REMARKS') => {
    if (!selectedInv) return;
    if (action === 'REMARKS' && !remarksText.trim()) {
      setReviewMessage({ type: 'error', text: 'Please enter remarks for the department.' });
      return;
    }

    setSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/invitations/${selectedInv.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          checkLogo,
          checkTitle,
          checkHeaders,
          checkOthers,
          directorRemarks: remarksText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewMessage({
        type: 'success',
        text: action === 'APPROVE' ? 'Invitation Approved!' : 'Remarks sent to department for corrections.',
      });

      fetchData();
      setTimeout(() => {
        setSelectedInv(null);
      }, 1200);
    } catch (err: any) {
      setReviewMessage({ type: 'error', text: err.message || 'Error processing review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="DIRECTOR" userName={user?.name || 'Dr. Director'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Director Review Dashboard"
          userName={user?.name}
          userRole="Director"
        />

        <main className="p-6 md:p-8 space-y-8 flex-1">
          {/* Top 4 Stat Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Invitations"
              value={stats.total}
              icon={Layers}
              variant="purple"
              subtitle="All submissions"
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon={CheckCircle2}
              variant="green"
              subtitle="Verified & stamped"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending}
              icon={Clock}
              variant="yellow"
              subtitle="Awaiting verification"
            />
            <StatCard
              title="Last 24h Submissions"
              value={stats.last24hPending}
              icon={Flame}
              variant="red"
              subtitle="Recent pending queue"
            />
          </div>

          {/* Verification Queue Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Director Verification Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Priority-ordered submissions awaiting portal verification, remarks, or approval
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading submissions...
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
                <p className="font-semibold text-slate-700">All caught up! No submissions in queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className={`p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/80 ${
                      inv.status === 'PENDING' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Left: Department, Title, Meta */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Document / Image Thumbnail */}
                      <div className="w-16 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {inv.localFilePath || inv.driveViewLink ? (
                          <img
                            src={inv.localFilePath || inv.driveViewLink}
                            alt={inv.programTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Layers className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{inv.programTitle}</h4>

                          {/* Re-upload Badge */}
                          {inv.revisionCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold border border-purple-200 animate-pulse">
                              Re-uploaded: After {inv.revisionCount === 1 ? '1st' : `${inv.revisionCount}th`} correction
                            </span>
                          )}

                          {/* Status Badge */}
                          {inv.status === 'APPROVED' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                              Approved
                            </span>
                          )}
                          {inv.status === 'REMARKS' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                              Remarks Sent
                            </span>
                          )}
                          {inv.status === 'PENDING' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {/* Dept & Event Details */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                          <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {inv.department?.name}
                          </span>
                          <span className="font-semibold text-slate-500">Shift: {inv.shift}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{inv.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(inv.fromDate).toLocaleDateString()}
                            {inv.toDate && ` - ${new Date(inv.toDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          Submitted on: {new Date(inv.createdAt).toLocaleString()} • File: {inv.fileName}
                        </div>

                        {/* If existing remarks */}
                        {inv.directorRemarks && (
                          <div className="mt-2 text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-amber-900">
                            <span className="font-bold">Latest Remarks: </span>
                            <span>{inv.directorRemarks}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: View / Review Action Button */}
                    <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => openReviewModal(inv)}
                        className="px-5 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View & Review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Full Screen Review Modal with Split View */}
      {selectedInv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg truncate max-w-md sm:max-w-xl">
                    {selectedInv.programTitle}
                  </h3>
                  <p className="text-xs text-purple-200">
                    {selectedInv.department?.name} ({selectedInv.shift}) • {selectedInv.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedInv.revisionCount > 0 && (
                  <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-extrabold shadow">
                    Re-uploaded: After {selectedInv.revisionCount === 1 ? '1st' : `${selectedInv.revisionCount}th`} correction
                  </span>
                )}
                <button
                  onClick={() => setSelectedInv(null)}
                  className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split View (Left: High-Res Viewer, Right: Checklist & Actions) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Column: Full Document Preview */}
              <div className="lg:col-span-7 p-6 bg-slate-900/95 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
                {selectedInv.localFilePath || selectedInv.driveViewLink ? (
                  <div className="relative max-h-[550px] overflow-auto rounded-xl border border-slate-700 shadow-2xl p-2 bg-slate-950/40">
                    <img
                      src={selectedInv.localFilePath || selectedInv.driveViewLink}
                      alt={selectedInv.programTitle}
                      className="max-h-[500px] w-auto object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="text-slate-400 text-center">
                    <Layers className="w-16 h-16 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm">Document stored in Google Drive</p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={selectedInv.driveViewLink || selectedInv.localFilePath || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Checklist Inspection & Action Panel */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
                <div className="space-y-6">
                  {/* Revision Alert Header if re-uploaded */}
                  {selectedInv.revisionCount > 0 && (
                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Notice: Re-uploaded after {selectedInv.revisionCount === 1 ? '1st' : `${selectedInv.revisionCount}th`} correction cycle.</span>
                    </div>
                  )}

                  {/* Verification Criteria Checkboxes */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                      <span>IQAC Portal Verification Criteria</span>
                    </h4>

                    <div className="space-y-2.5">
                      <label
                        onClick={() => setCheckLogo(!checkLogo)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          checkLogo ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">1. College & IQAC Logo / Crest Correct</span>
                        {checkLogo ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </label>

                      <label
                        onClick={() => setCheckTitle(!checkTitle)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          checkTitle ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">2. Program Title & Category Specified</span>
                        {checkTitle ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </label>

                      <label
                        onClick={() => setCheckHeaders(!checkHeaders)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          checkHeaders ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">3. Headers, Dates & Dignitaries Accurate</span>
                        {checkHeaders ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </label>

                      <label
                        onClick={() => setCheckOthers(!checkOthers)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          checkOthers ? 'bg-purple-50/70 border-purple-400 text-purple-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">4. Layout, Fonts & Formatting Verified</span>
                        {checkOthers ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </label>
                    </div>
                  </div>

                  {/* Remarks Input Box (shown ONLY when clicking of remarks) */}
                  {showRemarksBox && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                          <span>Director Remarks / Corrections</span>
                        </label>
                        <span className="text-[11px] text-amber-600 font-semibold">Enter remarks to send back</span>
                      </div>
                      <textarea
                        rows={3}
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        placeholder="Enter specific remarks or corrections for the department..."
                        className="w-full p-3 rounded-xl border-2 border-amber-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Review feedback message */}
                  {reviewMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold ${
                        reviewMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {reviewMessage.text}
                    </div>
                  )}
                </div>

                {/* Bottom Decision Action Buttons */}
                <div className="pt-4 border-t border-slate-100">
                  {!showRemarksBox ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRemarksBox(true)}
                        className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        <span>Remarks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewSubmit('APPROVE')}
                        disabled={submittingReview}
                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Invitation</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRemarksBox(false)}
                        className="col-span-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center text-xs cursor-pointer"
                      >
                        <span>Cancel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReviewSubmit('REMARKS')}
                        disabled={submittingReview}
                        className="col-span-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Send Remarks</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
