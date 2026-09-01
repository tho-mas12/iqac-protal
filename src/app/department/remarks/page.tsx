'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Layers,
  MessageSquare,
  FileCheck2,
  RotateCw,
  Clock,
  ArrowRight,
  X,
  FileImage,
} from 'lucide-react';
import { compressImageFile } from '@/lib/image-compression';

export default function RemarksPage() {
  const [user, setUser] = useState<any>(null);
  const [remarkedInvitations, setRemarkedInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected file and notes for specific card
  const [uploadFiles, setUploadFiles] = useState<{ [key: string]: File }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, iRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/invitations?status=REMARKS'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (iRes.ok) {
        const i = await iRes.json();
        setRemarkedInvitations(i.invitations || []);
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

  const handleFileSelect = (invitationId: string, file: File) => {
    setUploadFiles((prev) => ({ ...prev, [invitationId]: file }));
  };

  const handleReuploadSubmit = async (invitationId: string) => {
    const rawFile = uploadFiles[invitationId];
    if (!rawFile) {
      setFeedback({ type: 'error', message: 'Please select a corrected invitation file to re-upload.' });
      return;
    }

    setSubmittingId(invitationId);
    setFeedback(null);

    try {
      // Compress large image client-side to prevent Vercel 4.5MB payload limits
      const fileToUpload = await compressImageFile(rawFile);

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('notes', notes[invitationId] || 'Corrected invitation after Director remarks');

      const res = await fetch(`/api/invitations/${invitationId}/reupload`, {
        method: 'POST',
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Upload failed (Server HTTP ${res.status}). Please try a smaller image file.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to re-upload corrected invitation');
      }

      setFeedback({
        type: 'success',
        message: data.message || 'Corrected invitation uploaded and re-sent to Director for review!',
      });

      // Clear card input
      setUploadFiles((prev) => {
        const copy = { ...prev };
        delete copy[invitationId];
        return copy;
      });

      setNotes((prev) => {
        const copy = { ...prev };
        delete copy[invitationId];
        return copy;
      });

      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error submitting re-upload' });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role="DEPARTMENT"
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Remarks & Corrections"
          userName={user?.name}
          userRole="Department"
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

          {/* Header Info Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invitations Requiring Corrections</h2>
              <p className="text-xs text-slate-500 mt-1">
                Review the Director remarks and verification criteria below. Once corrected, upload the new version directly in the card.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading remarks queue...
            </div>
          ) : remarkedInvitations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No invitations currently need corrections!</p>
              <p className="text-xs text-slate-400 mt-1">All your uploaded invitations are either approved or pending initial review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {remarkedInvitations.map((inv) => {
                const isSubmitting = submittingId === inv.id;
                const currentFile = uploadFiles[inv.id];

                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-6 lg:p-8 space-y-6 transition-all hover:shadow-lg"
                  >
                    {/* Top Bar: Title & Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 text-lg">{inv.programTitle}</span>
                          {inv.revisionCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                              Revision #{inv.revisionCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{inv.category}</span>
                          <span>•</span>
                          <span>Dates: {new Date(inv.fromDate).toLocaleDateString()} {inv.toDate && `to ${new Date(inv.toDate).toLocaleDateString()}`}</span>
                          <span>•</span>
                          <span>Original: {inv.fileName}</span>
                        </div>
                      </div>

                      <a
                        href={`/api/invitations/${inv.id}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-slate-50 hover:bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <span>View Current File</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Middle Section: Director Remarks & Flagged Criteria */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Director Remarks Box */}
                      <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/90 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                          <span>Director Specific Remarks</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 whitespace-pre-line bg-white/90 p-3.5 rounded-xl border border-amber-200">
                          {inv.directorRemarks || 'Please review the highlighted criteria and re-submit.'}
                        </p>
                        {inv.remarkedAt && (
                          <span className="block text-[11px] text-amber-700 mt-2 font-medium">
                            Remarks sent on: {new Date(inv.remarkedAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Right: Flagged Criteria Items */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          <FileCheck2 className="w-4 h-4 text-purple-600" />
                          <span>Criteria Reviewed by Director</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${inv.checkLogo ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${inv.checkLogo ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <span>Logo / Crest</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${inv.checkTitle ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${inv.checkTitle ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <span>Title / Theme</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${inv.checkHeaders ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${inv.checkHeaders ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <span>Headers & Dignitaries</span>
                          </div>
                          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${inv.checkOthers ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${inv.checkOthers ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <span>Other Criteria</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Re-upload Corrected Invitation Form */}
                    <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-purple-700" />
                          <span>Upload Corrected Version</span>
                        </h4>
                        <span className="text-xs text-purple-700 font-semibold">
                          Next Revision: #{inv.revisionCount + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* File Selector */}
                        <div>
                          <input
                            type="file"
                            id={`file-input-${inv.id}`}
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileSelect(inv.id, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor={`file-input-${inv.id}`}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-purple-300 hover:border-purple-600 rounded-xl cursor-pointer text-xs font-semibold text-purple-800 transition-all hover:bg-purple-50"
                          >
                            <FileImage className="w-4 h-4 text-purple-600" />
                            <span className="truncate">
                              {currentFile ? currentFile.name : 'Choose Corrected Image / PDF'}
                            </span>
                          </label>
                        </div>

                        {/* Optional Notes */}
                        <div>
                          <input
                            type="text"
                            placeholder="Optional note on what was corrected..."
                            value={notes[inv.id] || ''}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [inv.id]: e.target.value }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-purple-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReuploadSubmit(inv.id)}
                          disabled={isSubmitting || !currentFile}
                          className="px-6 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Uploading Revision...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Revision #{inv.revisionCount + 1} to Director</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
