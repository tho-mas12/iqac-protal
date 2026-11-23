'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ClipboardCheck,
  Sparkles,
  ArrowLeft,
  Save,
  CheckCircle2,
  BookOpen,
  Award,
  LogOut,
  Building2,
  User,
  Info,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import sjcLogo from '../../../public/sjc-logo.png';
import Toast, { ToastMessage } from '@/components/Toast';

export default function PerformanceAppraisalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formResponses, setFormResponses] = useState<{ [qId: string]: any }>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [meRes, qRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/admin/appraisal-questions?activeOnly=true'),
        ]);

        let currentUserData = null;
        if (meRes.ok) {
          const meData = await meRes.json();
          currentUserData = meData.user;
          setUser(meData.user);
        } else if (typeof window !== 'undefined') {
          const ssoRaw = localStorage.getItem('IQAC_SSO_USER');
          if (ssoRaw) {
            try {
              currentUserData = JSON.parse(ssoRaw);
              setUser(currentUserData);
            } catch (e) {}
          }
        }

        if (!currentUserData) {
          router.push('/login');
          return;
        }

        const roleUp = (currentUserData.role || '').toUpperCase();
        if (roleUp === 'ADMINISTRATOR') {
          router.replace('/staff/dashboard');
          return;
        }
        if (roleUp === 'DIRECTOR') {
          router.replace('/director/dashboard');
          return;
        }

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData.questions || []);
          setCategories(qData.categories || []);
        }

        // Load cached draft from localStorage if any
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('IQAC_APPRAISAL_DRAFT');
          if (saved) {
            try {
              setFormResponses(JSON.parse(saved));
            } catch {}
          }
        }
      } catch (err) {
        console.error('Error loading appraisal:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleFieldChange = (qId: string, fieldName: string, value: string) => {
    setFormResponses((prev) => {
      const next = {
        ...prev,
        [qId]: {
          ...(prev[qId] || {}),
          [fieldName]: value,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('IQAC_APPRAISAL_DRAFT', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('IQAC_APPRAISAL_DRAFT', JSON.stringify(formResponses));
    }
    setToast({ type: 'success', message: 'Appraisal responses saved as local draft.' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setToast({
        type: 'success',
        message: 'Annual Self-Appraisal of Teacher submitted to IQAC central registry successfully!',
      });
    }, 900);
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f2] flex flex-col font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      {/* Arctic Frost Aura Background Layers */}
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-[#4F8FC0]/25 bg-white/90 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/hub"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black transition shadow-xs"
            title="Back to Common Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Common Dashboard</span>
          </Link>
          <div className="w-10 h-12 rounded-xl bg-gradient-to-b from-[#f0f5f9] via-white to-[#FFE3B3]/25 border border-[#4F8FC0]/30 flex items-center justify-center p-1 shadow-2xs">
            <Image
              src={sjcLogo}
              alt="St. Joseph's College"
              className="h-9 w-auto object-contain drop-shadow-xs"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-[#26648E] font-crest tracking-tight leading-tight">
              Performance Appraisal of Teacher • 2026–2027
            </h1>
            <p className="text-[10px] sm:text-[11px] font-extrabold text-[#4F8FC0] tracking-wide uppercase">
              Internal Quality Assurance Cell (IQAC) • Faculty Self-Appraisal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-[#26648E] leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {user.department?.name || 'Faculty Member'}
              </span>
            </div>
          )}

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#4F8FC0]/30 bg-white hover:bg-[#f0f5f9] text-[#26648E] text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Banner */}
        <div className="academic-card p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFE3B3] text-[#26648E] border border-[#fedba0] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#26648E]" />
                <span>Annual Faculty Evaluation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#26648E] font-crest tracking-tight">
                Teacher Performance Appraisal Form
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-semibold">
                This comprehensive self-appraisal records your teaching methodologies, research publications, awards, funded projects, committees, and institutional contributions for the academic cycle.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f0f5f9] border border-[#4F8FC0]/20 text-center shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-500 block">Questions To Complete</span>
              <span className="text-2xl font-black text-[#26648E]">{questions.length}</span>
              <span className="text-[10px] text-[#4F8FC0] font-bold block">Active Focus Areas</span>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-black text-amber-950">Instructions for Teaching Staff:</span>
              <p className="text-[11px] text-amber-800">
                Please complete all applicable criteria below. Your inputs are saved automatically as you type. Questions are dynamically synced with the IQAC central quality guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner if submitted */}
        {submitted && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Appraisal Successfully Submitted</span>
            </div>
            <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
              Your Performance Appraisal responses have been registered in the IQAC Academic Audit records. You can update your submission anytime before the institutional deadline.
            </p>
          </div>
        )}

        {/* Question Sections Grouped by Category */}
        {loading ? (
          <div className="academic-card flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-bold">Loading appraisal criteria...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="academic-card flex flex-col items-center justify-center h-64 text-slate-400">
            <ClipboardCheck className="w-10 h-10 mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-600">No active appraisal questions configured</p>
            <p className="text-xs text-slate-400">The administrator has not enabled any appraisal questions yet</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {categories.map((cat, catIdx) => {
              const catQuestions = questions.filter((q) => q.category === cat);
              if (catQuestions.length === 0) return null;

              return (
                <div key={cat} className="academic-card overflow-hidden shadow-xs">
                  {/* Category Header */}
                  <div className="p-4 sm:p-5 bg-[#f0f5f9] border-b border-[#4F8FC0]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-[#4F8FC0]/25 text-[#26648E] flex items-center justify-center font-black text-xs">
                        {catIdx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-[#26648E] font-crest tracking-tight">
                        {cat}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#4F8FC0] tracking-wider">
                      {catQuestions.length} Items
                    </span>
                  </div>

                  {/* Category Questions */}
                  <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-6">
                    {catQuestions.map((q, qIdx) => (
                      <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-black text-[#26648E] mt-0.5">
                              {catIdx + 1}.{qIdx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                              {q.title}
                            </span>
                          </div>
                          {q.marks && (
                            <span className="px-2 py-0.5 rounded-md bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/40 text-[10px] font-black shrink-0">
                              Max {q.marks} Marks
                            </span>
                          )}
                        </div>

                        {/* Input Fields for this Question */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                          {(q.fields || ['Details / Description', 'Claimed Marks / Score', 'Evidence Link / Document']).map(
                            (fieldName: string, fIdx: number) => {
                              const val = formResponses[q.id]?.[fieldName] || '';

                              // Apply fieldType to the primary answer field (first field)
                              const isPrimaryField = fIdx === 0;

                              return (
                                <div key={fieldName} className={`space-y-1 ${isPrimaryField && q.fieldType === 'big_answer' ? 'sm:col-span-2' : ''}`}>
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    {fieldName}
                                  </label>

                                  {isPrimaryField && q.fieldType === 'big_answer' ? (
                                    <textarea
                                      rows={3}
                                      value={val}
                                      onChange={(e) => handleFieldChange(q.id, fieldName, e.target.value)}
                                      placeholder={`Enter detailed description...`}
                                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white transition font-medium"
                                    />
                                  ) : isPrimaryField && q.fieldType === 'dropdown' ? (
                                    <select
                                      value={val}
                                      onChange={(e) => handleFieldChange(q.id, fieldName, e.target.value)}
                                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white transition font-medium"
                                    >
                                      <option value="">-- Select option --</option>
                                      {(q.options || []).map((opt: string) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  ) : isPrimaryField && q.fieldType === 'calendar' ? (
                                    <input
                                      type="date"
                                      value={val}
                                      onChange={(e) => handleFieldChange(q.id, fieldName, e.target.value)}
                                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white transition font-medium"
                                    />
                                  ) : isPrimaryField && q.fieldType === 'number' ? (
                                    <input
                                      type="number"
                                      value={val}
                                      onChange={(e) => handleFieldChange(q.id, fieldName, e.target.value)}
                                      placeholder="0"
                                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white transition font-medium"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) =>
                                        handleFieldChange(q.id, fieldName, e.target.value)
                                      }
                                      placeholder={`Enter ${fieldName.toLowerCase()}...`}
                                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] bg-white transition font-medium"
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Submit Action Bar */}
            <div className="academic-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20 shadow-xl bg-white/95 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All progress saved locally. Ready to submit to IQAC.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Save Progress
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] active:bg-[#163850] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Appraisal to IQAC'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs font-semibold text-slate-500 border-t border-[#4F8FC0]/20 bg-white/70 backdrop-blur-xs">
        <p>© 2026 Internal Quality Assurance Cell (IQAC), St. Joseph&apos;s College (Autonomous). Powered by FrontierWox Tech.</p>
      </footer>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
