'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  FolderOpen,
  Upload,
  Search,
  FileText,
  Download,
  Eye,
  Tag,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function EvidencePage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [evidences, setEvidences] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Report');

  useEffect(() => {
    fetchEvidences();
  }, [activeAcademicYear, search, selectedCategory]);

  const fetchEvidences = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      let url = `/api/evidence?academicYearId=${activeAcademicYear}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const eRes = await fetch(url);
      if (eRes.ok) {
        const eData = await eRes.json();
        setEvidences(eData.evidences || []);
      }
    } catch (err) {
      console.error('Failed to load evidence repository', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      formData.append('academicYearId', activeAcademicYear);

      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setShowUploadModal(false);
        setFile(null);
        setTitle('');
        fetchEvidences();
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                Central Evidence Repository
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized institutional repository for proof documents, reports, and certificates
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Evidence File
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search file name, tag, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Invitation">Invitation</option>
              <option value="Report">Report</option>
              <option value="Attendance">Attendance</option>
              <option value="Photographs">Photographs</option>
              <option value="Feedback">Feedback</option>
              <option value="Certificates">Certificates</option>
            </select>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidences.length > 0 ? (
              evidences.map((evi) => (
                <div key={evi.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold font-mono">
                      {evi.evidenceNumber} (v{evi.version})
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                      {evi.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{evi.title}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evi.fileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({(evi.fileSize ? evi.fileSize / (1024 * 1024) : 0).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">By {evi.uploadedBy?.name || 'User'}</span>
                    <a
                      href={evi.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No evidence files found in repository matching search parameters.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Upload Evidence File
            </h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidence Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="e.g. BoS Minutes of Meeting 2025"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="Invitation">Invitation</option>
                  <option value="Report">Report</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Photographs">Photographs</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File (PDF, DOCX, XLSX, JPG, PNG)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
