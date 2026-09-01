'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  UploadCloud,
  Plus,
  X,
  FileImage,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { compressImageFile } from '@/lib/image-compression';

const CATEGORIES = [
  'Endowment Lecture',
  'Conference',
  'Webinar',
  'Seminar',
  'Orientation',
  'Skill Development',
  'Induction',
  'FDP',
  'Workshop',
  'Club Activity',
  'Gender Based',
  'Career Guidance',
  'Placement Lecture Series',
  'Training',
  'Other',
];

export default function UploadInvitationPage() {
  const [user, setUser] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [programTitle, setProgramTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const resetForm = () => {
    setProgramTitle('');
    setCategory(CATEGORIES[0]);
    setCustomCategory('');
    setFromDate('');
    setToDate('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle || !fromDate || !selectedFile) {
      setFeedback({ type: 'error', message: 'Please fill all required fields and choose an invitation file.' });
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the custom category name.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      // Compress image client-side to prevent Vercel 4.5MB payload limits
      const fileToUpload = await compressImageFile(selectedFile);

      const formData = new FormData();
      formData.append('programTitle', programTitle);
      formData.append('category', category);
      if (category === 'Other') {
        formData.append('customCategory', customCategory);
      }
      formData.append('shift', user?.department?.shift || 'Shift I');
      formData.append('fromDate', fromDate);
      if (toDate) formData.append('toDate', toDate);
      formData.append('file', fileToUpload);

      const res = await fetch('/api/invitations', {
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
        throw new Error(data.error || 'Failed to submit invitation');
      }

      setFeedback({ type: 'success', message: 'Invitation successfully uploaded and submitted for IQAC review!' });
      resetForm();
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
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
          title="Upload Invitation"
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
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Page Top Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Event Invitation Management</h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload your department invitations directly to the IQAC Portal database for verification.
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-5 py-3 bg-[#6320ee] hover:bg-[#5215ce] text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Invitation</span>
            </button>
          </div>

          {/* List of Added Invitations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Uploaded Invitations Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Priority sorted by date and time</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                {invitations.length} Total Submissions
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading invitations...
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <FileImage className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No invitations uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Click the &quot;Add Invitation&quot; button above to submit your first event invitation.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail / Icon */}
                      <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group relative">
                        <img
                          src={`/api/invitations/${inv.id}/file`}
                          alt={inv.programTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <a
                          href={`/api/invitations/${inv.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-purple-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{inv.programTitle}</span>
                          {inv.revisionCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                              Revision #{inv.revisionCount}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                            {inv.category}
                          </span>
                          <span>•</span>
                          <span>{inv.department?.name} ({inv.shift})</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(inv.fromDate).toLocaleDateString()}
                            {inv.toDate && ` to ${new Date(inv.toDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          Uploaded: {new Date(inv.createdAt).toLocaleString()} • File: {inv.fileName}
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {inv.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </span>
                      )}
                      {inv.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-4 h-4" /> Pending Review
                        </span>
                      )}
                      {inv.status === 'REMARKS' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-4 h-4" /> Remarks Returned
                        </span>
                      )}

                      <a
                        href={inv.driveViewLink || inv.localFilePath || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <span>View File</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Invitation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#2a1b54] to-[#4c1d95] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-lg">Add New Event Invitation</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {/* Program Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Program Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  placeholder="e.g. National Conference on Quantum Artificial Intelligence"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all font-medium"
                  required
                />
              </div>

              {/* Department Name & Shift (Defaults) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={user?.department?.name || 'Department'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Shift
                  </label>
                  <input
                    type="text"
                    value={user?.department?.shift || 'Shift I'}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Custom Category Input for 'Other' */}
              {category === 'Other' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                    Specify Custom Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 text-sm font-medium focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    To Date <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-white"
                  />
                </div>
              </div>

              {/* File Upload to Google Drive */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Upload Invitation Image / PDF <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-purple-700">Click to choose file</span>
                    <span className="text-slate-500"> or drag & drop</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    PNG, JPG, PDF up to 15MB • Uploads directly to Google Drive
                  </span>

                  {selectedFile && (
                    <div className="mt-3 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2">
                      <FileImage className="w-3.5 h-3.5" />
                      <span className="truncate max-w-xs">{selectedFile.name}</span>
                      <span className="text-purple-200 text-[10px]">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload & Submit</span>
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
