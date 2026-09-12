'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import {
  Palette,
  Sparkles,
  Download,
  Send,
  Upload,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PosterCanvas, PosterData } from '@/components/designer/PosterCanvas';

const CATEGORIES = [
  'National Seminar',
  'International Conference',
  'State Level Workshop',
  'Faculty Development Program (FDP)',
  'Hands-on Workshop',
  'Endowment Lecture',
  'Guest Lecture',
  'Department Association Event',
  'Special Webinar',
  'Orientation Program',
  'Other',
];

const TEMPLATES = [
  {
    id: 'classic-royal',
    name: 'Classic Royal & Gold',
    desc: 'Traditional Jesuit academic heritage with deep royal blue and gold accents.',
    badge: 'Most Popular',
    colorPreview: 'from-[#081326] to-[#0e2142]',
    borderColor: 'border-[#d4af37]',
  },
  {
    id: 'maroon-heritage',
    name: 'Maroon & Ivory Prestige',
    desc: 'Centenary elegance with rich crimson burgundy and formal double-frame.',
    badge: 'Heritage',
    colorPreview: 'from-[#4a0808] to-[#6d1313]',
    borderColor: 'border-[#e6ca65]',
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech & Cyber',
    desc: 'Sleek dark indigo with glowing cyan accents, ideal for CS, AI & IT workshops.',
    badge: 'Modern',
    colorPreview: 'from-[#090d16] to-[#1e1b4b]',
    borderColor: 'border-cyan-500',
  },
  {
    id: 'clean-academic',
    name: 'Clean White & Navy',
    desc: 'High-contrast print-friendly minimal layout for clear readability and notice boards.',
    badge: 'Print-Ready',
    colorPreview: 'from-white to-slate-100',
    borderColor: 'border-[#1e3a8a]',
  },
];

export default function PosterDesignerPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'details' | 'speaker' | 'committee'>('template');
  const [scale, setScale] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Form State
  const [posterData, setPosterData] = useState<PosterData>({
    templateId: 'classic-royal',
    programTitle: 'National Seminar on Recent Trends in Advanced Computing',
    category: 'National Seminar',
    tagline: 'Bridging Academic Innovations with Sustainable Industry Practices',
    departmentName: '',
    shift: 'Shift I',
    collaboration: 'IQAC & Research Cell',
    dateStr: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeStr: '10:00 AM – 1:00 PM IST',
    venueStr: 'Sail Hall, St. Joseph\'s College',
    platformStr: '',
    speakerName: 'Dr. K. Senthil Kumar, Ph.D.',
    speakerDesignation: 'Senior Principal Scientist',
    speakerOrg: 'Centre for Advanced Computing Research, Chennai',
    speakerPhotoUrl: null,
    patronName: 'Rev. Dr. Principal SJ',
    convenerName: 'Head of the Department',
    coordinatorName: 'Faculty Coordinator',
    showSjcLogo: true,
    showIqacLogo: true,
    showNaacBadge: true,
  });

  // Fetch Current User
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user?.department) {
            setPosterData((prev) => ({
              ...prev,
              departmentName: data.user.department.name || '',
              shift: data.user.department.shift || 'Shift I',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load user info', err);
      }
    }
    loadUser();
  }, []);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({ type: 'error', message: 'Photo size should be less than 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPosterData((prev) => ({
          ...prev,
          speakerPhotoUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPosterData((prev) => ({ ...prev, speakerPhotoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render Canvas to High-Res Blob
  const generatePosterBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    
    // Temporarily reset transform scale for crisp 2x capture
    const originalTransform = canvasRef.current.style.transform;
    canvasRef.current.style.transform = 'scale(1)';
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // 2x for sharp print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    } finally {
      if (canvasRef.current) {
        canvasRef.current.style.transform = originalTransform;
      }
    }
  };

  // 1. Download PNG Action
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setFeedback(null);
      const blob = await generatePosterBlob();
      if (!blob) throw new Error('Canvas rendering failed');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanTitle = posterData.programTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      link.download = `SJC_${posterData.departmentName || 'Dept'}_${cleanTitle}_Poster.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: 'High-resolution poster downloaded successfully!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate poster download' });
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Submit to IQAC Review Directly Action
  const handleSubmitToIqac = async () => {
    if (!posterData.programTitle.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a program title before submitting.' });
      return;
    }
    if (!posterData.dateStr) {
      setFeedback({ type: 'error', message: 'Please specify the event date.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const blob = await generatePosterBlob();
      if (!blob) throw new Error('Could not render poster image for submission');

      const cleanTitle = posterData.programTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const posterFile = new File([blob], `${cleanTitle}_Poster.png`, { type: 'image/png' });

      const formData = new FormData();
      formData.append('programTitle', posterData.programTitle);
      formData.append('category', posterData.category);
      formData.append('shift', posterData.shift);
      formData.append('fromDate', posterData.dateStr);
      formData.append('file', posterFile);

      const res = await fetch('/api/invitations', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit invitation to IQAC');
      }

      setFeedback({
        type: 'success',
        message: '🎉 Poster successfully generated and submitted to Director for IQAC review!',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/department/dashboard');
      }, 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Submission failed' });
    } finally {
      setIsSubmitting(false);
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
          title="In-Portal Poster & Invitation Designer"
          userName={user?.name}
          userRole="DEPARTMENT"
        />

        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 lg:p-5 mb-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">St. Joseph&apos;s Smart Invitation Studio</h2>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                    Auto-Branded
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Design compliant, beautiful college event invitations in minutes and submit directly for IQAC review.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleDownload}
                disabled={isExporting || isSubmitting}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition shadow-sm disabled:opacity-50"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-amber-400" />}
                Download PNG
              </button>

              <button
                onClick={handleSubmitToIqac}
                disabled={isSubmitting || isExporting}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit to IQAC Review
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div className="text-sm font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Main 2-Column Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Controls & Form (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setActiveTab('template')}
                  className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'template'
                      ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  Theme
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'details'
                      ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('speaker')}
                  className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'speaker'
                      ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Speaker
                </button>
                <button
                  onClick={() => setActiveTab('committee')}
                  className={`flex-1 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'committee'
                      ? 'bg-white text-blue-900 shadow-sm border border-slate-200 font-bold'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Committee
                </button>
              </div>

              {/* Form Content Area */}
              <div className="p-5 space-y-4 max-h-[720px] overflow-y-auto">
                {/* TAB 1: TEMPLATE SELECTOR */}
                {activeTab === 'template' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Official Design Template
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {TEMPLATES.map((tmpl) => {
                          const isSelected = posterData.templateId === tmpl.id;
                          return (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => setPosterData({ ...posterData, templateId: tmpl.id as any })}
                              className={`text-left p-3.5 rounded-xl border-2 transition relative flex flex-col justify-between h-32 ${
                                isSelected
                                  ? 'border-blue-700 bg-blue-50/50 shadow-md ring-2 ring-blue-700/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    {tmpl.badge}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-blue-700 fill-blue-100" />
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 mt-2">{tmpl.name}</h4>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                                  {tmpl.desc}
                                </p>
                              </div>

                              <div className={`h-2.5 w-full rounded bg-gradient-to-r ${tmpl.colorPreview} border ${tmpl.borderColor}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Logo &amp; Accreditation Display
                      </h4>
                      <div className="space-y-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={posterData.showSjcLogo}
                            onChange={(e) => setPosterData({ ...posterData, showSjcLogo: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 font-medium">Include Official SJC Heritage Crest</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={posterData.showNaacBadge}
                            onChange={(e) => setPosterData({ ...posterData, showNaacBadge: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 font-medium">Show NAAC A++ (4th Cycle) Badge</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PROGRAM DETAILS */}
                {activeTab === 'details' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Program Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={posterData.category}
                        onChange={(e) => setPosterData({ ...posterData, category: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Program Title <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={posterData.programTitle}
                        onChange={(e) => setPosterData({ ...posterData, programTitle: e.target.value })}
                        placeholder="e.g. National Seminar on Next-Gen Generative AI"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Theme / Tagline (Optional)
                      </label>
                      <input
                        type="text"
                        value={posterData.tagline}
                        onChange={(e) => setPosterData({ ...posterData, tagline: e.target.value })}
                        placeholder="e.g. Trends, Challenges and Opportunities"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={posterData.departmentName}
                          onChange={(e) => setPosterData({ ...posterData, departmentName: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
                        <select
                          value={posterData.shift}
                          onChange={(e) => setPosterData({ ...posterData, shift: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="Shift I">Shift I</option>
                          <option value="Shift II">Shift II</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        In Collaboration / Association With
                      </label>
                      <input
                        type="text"
                        value={posterData.collaboration}
                        onChange={(e) => setPosterData({ ...posterData, collaboration: e.target.value })}
                        placeholder="e.g. IQAC & Research Cell / IEEE Student Branch"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                        <input
                          type="text"
                          value={posterData.dateStr}
                          onChange={(e) => setPosterData({ ...posterData, dateStr: e.target.value })}
                          placeholder="e.g. 25th Sept 2026"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                        <input
                          type="text"
                          value={posterData.timeStr}
                          onChange={(e) => setPosterData({ ...posterData, timeStr: e.target.value })}
                          placeholder="e.g. 10:00 AM - 1:00 PM"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
                      <input
                        type="text"
                        value={posterData.venueStr}
                        onChange={(e) => setPosterData({ ...posterData, venueStr: e.target.value })}
                        placeholder="e.g. Sail Hall / MCA Seminar Hall"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Online Link / Platform (Optional)
                      </label>
                      <input
                        type="text"
                        value={posterData.platformStr}
                        onChange={(e) => setPosterData({ ...posterData, platformStr: e.target.value })}
                        placeholder="e.g. Google Meet: meet.google.com/xyz"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: SPEAKER & CHIEF GUEST */}
                {activeTab === 'speaker' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chief Guest / Resource Person Name
                      </label>
                      <input
                        type="text"
                        value={posterData.speakerName}
                        onChange={(e) => setPosterData({ ...posterData, speakerName: e.target.value })}
                        placeholder="e.g. Dr. R. Ramesh, Ph.D."
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Designation / Position
                      </label>
                      <input
                        type="text"
                        value={posterData.speakerDesignation}
                        onChange={(e) => setPosterData({ ...posterData, speakerDesignation: e.target.value })}
                        placeholder="e.g. Senior Principal Scientist"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={posterData.speakerOrg}
                        onChange={(e) => setPosterData({ ...posterData, speakerOrg: e.target.value })}
                        placeholder="e.g. ISRO Satellite Centre, Bangalore"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Guest Photograph (Auto-Framed)
                      </label>

                      {posterData.speakerPhotoUrl ? (
                        <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={posterData.speakerPhotoUrl}
                            alt="Guest Preview"
                            className="w-14 h-14 rounded-full object-cover border-2 border-blue-600 shadow"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Photo Attached</p>
                            <p className="text-[10px] text-slate-500">Auto-fitted into template frame</p>
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold mt-1"
                            >
                              Remove Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/40"
                        >
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-700">Click to upload Speaker Photo</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB (Passport/Portrait)</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: COMMITTEE & SIGNATURES */}
                {activeTab === 'committee' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Patron / Principal Name
                      </label>
                      <input
                        type="text"
                        value={posterData.patronName}
                        onChange={(e) => setPosterData({ ...posterData, patronName: e.target.value })}
                        placeholder="Rev. Dr. Principal SJ"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Convener / Head of the Department
                      </label>
                      <input
                        type="text"
                        value={posterData.convenerName}
                        onChange={(e) => setPosterData({ ...posterData, convenerName: e.target.value })}
                        placeholder="Head of the Department"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Faculty In-Charge / Coordinator
                      </label>
                      <input
                        type="text"
                        value={posterData.coordinatorName}
                        onChange={(e) => setPosterData({ ...posterData, coordinatorName: e.target.value })}
                        placeholder="Faculty Coordinator"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Action Footer for Form */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">WYSIWYG Live Syncing</span>
                <button
                  type="button"
                  onClick={() => {
                    const tabs: Array<'template' | 'details' | 'speaker' | 'committee'> = ['template', 'details', 'speaker', 'committee'];
                    const nextIdx = (tabs.indexOf(activeTab) + 1) % tabs.length;
                    setActiveTab(tabs[nextIdx]);
                  }}
                  className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                >
                  Next Section <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Canvas Workspace (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/95 rounded-2xl p-4 lg:p-6 shadow-xl border border-slate-800 flex flex-col items-center">
              {/* Workspace Header & Zoom Controls */}
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-white">Live Canvas Preview</span>
                  <span className="text-[10px] text-slate-400 font-mono">(A4 / 300 DPI Export Ready)</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg">
                  <button
                    onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
                    className="p-1 hover:text-white rounded hover:bg-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[10px] px-1 text-slate-300">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={() => setScale((s) => Math.min(1.2, s + 0.1))}
                    className="p-1 hover:text-white rounded hover:bg-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setScale(0.85)}
                    className="p-1 hover:text-white rounded hover:bg-slate-700 ml-1"
                    title="Reset Scale"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Poster Canvas Render Area */}
              <div className="w-full flex justify-center items-start overflow-auto p-2" style={{ minHeight: '650px' }}>
                <PosterCanvas ref={canvasRef} data={posterData} scale={scale} />
              </div>

              {/* Canvas Bottom Checklist */}
              <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> College Logo Included
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NAAC A++ Header
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">St. Joseph&apos;s College Quality Standard</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
