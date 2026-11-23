'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Eye,
  Plus,
  BookOpen,
  Award,
  Edit2,
  Trash2,
  X,
  Calendar,
  ListFilter,
  FileText,
  Hash,
} from 'lucide-react';

export default function AdminAppraisalQuestionsPage() {
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterEnabled, setFilterEnabled] = useState('ALL');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Add Question
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [newMarks, setNewMarks] = useState(10);
  const [newFieldType, setNewFieldType] = useState<'short_answer' | 'big_answer' | 'dropdown' | 'calendar' | 'number'>('short_answer');
  const [newOptionsText, setNewOptionsText] = useState('');

  // Form states for Edit Question
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMarks, setEditMarks] = useState(10);
  const [editFieldType, setEditFieldType] = useState<'short_answer' | 'big_answer' | 'dropdown' | 'calendar' | 'number'>('short_answer');
  const [editOptionsText, setEditOptionsText] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const [uRes, qRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/appraisal-questions'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      if (qRes.ok) {
        const q = await qRes.json();
        setQuestions(q.questions || []);
        const cats = q.categories || [];
        setCategories(cats);
        if (cats.length > 0 && !newCategory) {
          setNewCategory(cats[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setToast({ type: 'error', message: 'Failed to load appraisal questions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 1. Question-wise toggle
  const handleToggleQuestion = async (id: string, currentState: boolean) => {
    const nextState = !currentState;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, enabled: nextState } : q))
    );

    try {
      const res = await fetch('/api/admin/appraisal-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_question',
          id,
          enabled: nextState,
        }),
      });

      if (!res.ok) throw new Error('Failed to update question');
      setToast({
        type: 'success',
        message: `Question ${nextState ? 'ENABLED for' : 'HIDDEN from'} staff Performance Appraisal.`,
      });
    } catch (err: any) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, enabled: currentState } : q))
      );
      setToast({ type: 'error', message: err.message || 'Error updating question' });
    }
  };

  // 2. Toggle Category or Global All
  const handleToggleAll = async (cat: string | null, enableAll: boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (!cat || cat === 'ALL' || q.category === cat ? { ...q, enabled: enableAll } : q))
    );

    try {
      const res = await fetch('/api/admin/appraisal-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_all',
          category: cat === 'ALL' ? null : cat,
          enabled: enableAll,
        }),
      });

      if (!res.ok) throw new Error('Failed to update questions');
      setToast({
        type: 'success',
        message: cat && cat !== 'ALL'
          ? `All questions in "${cat}" ${enableAll ? 'ENABLED' : 'DISABLED'}.`
          : `All questions ${enableAll ? 'ENABLED' : 'DISABLED'} universally.`,
      });
    } catch (err: any) {
      fetchQuestions();
      setToast({ type: 'error', message: err.message || 'Error updating questions' });
    }
  };

  // 3. Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setToast({ type: 'error', message: 'Please enter question title' });
      return;
    }

    const catToUse = newCategory === '__NEW__' ? customCategory.trim() : newCategory;
    if (!catToUse) {
      setToast({ type: 'error', message: 'Please select or enter category' });
      return;
    }

    const optionsArray = newFieldType === 'dropdown'
      ? newOptionsText.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/appraisal-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_question',
          title: newTitle.trim(),
          category: catToUse,
          marks: Number(newMarks) || 10,
          fieldType: newFieldType,
          options: optionsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add question');

      setToast({ type: 'success', message: 'New appraisal question added successfully!' });
      setIsAddOpen(false);
      setNewTitle('');
      setNewOptionsText('');
      setCustomCategory('');
      fetchQuestions();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error adding question' });
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Open Edit Modal
  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setEditTitle(q.title || '');
    setEditCategory(q.category || '');
    setEditMarks(q.marks || 10);
    setEditFieldType(q.fieldType || 'short_answer');
    setEditOptionsText(Array.isArray(q.options) ? q.options.join(', ') : '');
  };

  // 5. Submit Edit Question
  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const optionsArray = editFieldType === 'dropdown'
      ? editOptionsText.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/appraisal-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_question',
          id: editingQuestion.id,
          title: editTitle.trim(),
          category: editCategory.trim(),
          marks: Number(editMarks) || 10,
          fieldType: editFieldType,
          options: optionsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update question');

      setToast({ type: 'success', message: 'Question updated successfully!' });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error updating question' });
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Delete Question
  const handleDeleteQuestion = async (q: any) => {
    if (!confirm(`Are you sure you want to delete question "${q.title}"?`)) return;

    try {
      const res = await fetch('/api/admin/appraisal-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_question',
          id: q.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to delete question');
      setToast({ type: 'success', message: 'Question deleted.' });
      setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error deleting question' });
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      q.title.toLowerCase().includes(query) ||
      q.category.toLowerCase().includes(query) ||
      (q.fieldType && q.fieldType.toLowerCase().includes(query)) ||
      (q.fields && q.fields.some((f: string) => f.toLowerCase().includes(query)));

    const matchesCat = selectedCategory === 'ALL' || q.category === selectedCategory;
    const matchesEnabled =
      filterEnabled === 'ALL' ||
      (filterEnabled === 'ENABLED' && q.enabled) ||
      (filterEnabled === 'DISABLED' && !q.enabled);

    return matchesSearch && matchesCat && matchesEnabled;
  });

  const totalEnabled = questions.filter((q) => q.enabled).length;

  const renderFieldTypeBadge = (fieldType: string, options?: string[]) => {
    switch (fieldType) {
      case 'big_answer':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Big Answer Box</span>
          </span>
        );
      case 'dropdown':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            <ListFilter className="w-3 h-3 text-purple-600" />
            <span>Dropdown ({options?.length || 0} options)</span>
          </span>
        );
      case 'calendar':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span>Calendar Date</span>
          </span>
        );
      case 'number':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Hash className="w-3 h-3 text-emerald-600" />
            <span>Number Input</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <span>Short Answer Box</span>
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#faf8f2] overflow-hidden font-sans selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />

      <Sidebar role="ADMIN" userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header
          title="Performance Appraisal Questions"
          userName={user?.name}
          userRole="ADMIN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Action Bar */}
          <div className="academic-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-[#f0f5f9] text-[#26648E] border border-[#4F8FC0]/25">
                    <ClipboardCheck className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-black text-[#26648E] font-crest tracking-tight">
                    Teacher Performance Appraisal Questions Manager
                  </h2>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed font-semibold">
                  Curate the faculty-specific self-appraisal form. Add custom criteria with specific field types (Short Answer, Big Answer, Dropdown, Calendar, Numbers), edit, delete, and control global or question-wise availability for staff.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>

                <button
                  onClick={() => handleToggleAll(null, true)}
                  className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition cursor-pointer"
                  title="Enable all questions across all categories"
                >
                  Enable All
                </button>

                <button
                  onClick={() => handleToggleAll(null, false)}
                  className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer"
                  title="Disable all questions across all categories"
                >
                  Disable All
                </button>

                <a
                  href="/performance-appraisal"
                  target="_blank"
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#4F8FC0]/30 hover:border-[#26648E] text-[#26648E] font-black text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Form</span>
                </a>
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white border border-[#4F8FC0]/20 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Questions</span>
                <div className="text-xl font-black text-[#26648E] mt-0.5">{questions.length}</div>
                <span className="text-[10px] text-slate-500 font-bold">In Repository</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#e8f8f9] border border-[#53D2DC]/40 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#125e64] tracking-wider">Active in Staff Form</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#125e64]" />
                </div>
                <div className="text-xl font-black text-[#125e64] mt-0.5">{totalEnabled}</div>
                <span className="text-[10px] text-[#125e64]/80 font-bold">Enabled for Teaching Staff</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#fff8e7] border border-[#fedba0] shadow-2xs">
                <span className="text-[10px] font-black uppercase text-[#8a5d11] tracking-wider">Appraisal Focus Areas</span>
                <div className="text-xl font-black text-[#8a5d11] mt-0.5">{categories.length}</div>
                <span className="text-[10px] text-[#8a5d11]/80 font-bold">Academic Domains</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f0f5f9] border border-[#4F8FC0]/25 shadow-2xs">
                <span className="text-[10px] font-black uppercase text-[#26648E] tracking-wider">Faculty Audience</span>
                <div className="text-xl font-black text-[#26648E] mt-0.5">All Staff</div>
                <span className="text-[10px] text-[#4F8FC0] font-bold">Universal Appraisal</span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="academic-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4F8FC0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions by title, focus area, or input field type..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F8FC0]/30 focus:border-[#26648E] transition font-medium bg-white"
                />
              </div>

              <div className="w-full sm:w-72">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-[#26648E]"
                >
                  <option value="ALL">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={filterEnabled}
                  onChange={(e) => setFilterEnabled(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-[#26648E]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ENABLED">Active in Form Only</option>
                  <option value="DISABLED">Hidden Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions Grouped List */}
          <div className="space-y-6">
            {loading ? (
              <div className="academic-card flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 font-bold">Loading questions repository...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="academic-card flex flex-col items-center justify-center h-64 text-slate-400">
                <ClipboardCheck className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-600">No appraisal questions match your search</p>
                <p className="text-xs text-slate-400">Try adjusting your query or category filter</p>
              </div>
            ) : (
              categories
                .filter((cat) => selectedCategory === 'ALL' || cat === selectedCategory)
                .map((cat) => {
                  const catQuestions = filteredQuestions.filter((q) => q.category === cat);
                  if (catQuestions.length === 0) return null;

                  return (
                    <div key={cat} className="academic-card overflow-hidden shadow-xs">
                      {/* Category Header */}
                      <div className="p-4 bg-[#f0f5f9] border-b border-[#4F8FC0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-white border border-[#4F8FC0]/25 text-[#26648E]">
                            <BookOpen className="w-4 h-4" />
                          </span>
                          <h3 className="text-sm font-black text-[#26648E] font-crest tracking-tight">
                            {cat}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE3B3] text-[#26648E] border border-[#fedba0]">
                            {catQuestions.length} Questions
                          </span>
                        </div>

                        {/* Category Bulk Toggles */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAll(cat, true)}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                          >
                            Enable Category
                          </button>
                          <button
                            onClick={() => handleToggleAll(cat, false)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                          >
                            Disable Category
                          </button>
                        </div>
                      </div>

                      {/* Question items */}
                      <div className="divide-y divide-slate-100">
                        {catQuestions.map((q) => (
                          <div
                            key={q.id}
                            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                              q.enabled ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-3.5 flex-1">
                              {/* Toggle Checkbox */}
                              <button
                                type="button"
                                onClick={() => handleToggleQuestion(q.id, q.enabled)}
                                className="mt-0.5 text-[#26648E] hover:scale-110 transition cursor-pointer shrink-0"
                                title={q.enabled ? 'Click to disable' : 'Click to enable'}
                              >
                                {q.enabled ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>

                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-slate-800 leading-snug">
                                    {q.title}
                                  </span>
                                  {q.marks && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#e8f8f9] text-[#125e64] border border-[#53D2DC]/40">
                                      {q.marks} Marks Max
                                    </span>
                                  )}
                                  {renderFieldTypeBadge(q.fieldType || 'short_answer', q.options)}
                                  <span
                                    className={`text-[9px] font-black px-2 py-0.2 rounded uppercase ${
                                      q.enabled
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {q.enabled ? 'Visible in Form' : 'Hidden'}
                                  </span>
                                </div>

                                {/* Dropdown options preview if any */}
                                {q.fieldType === 'dropdown' && q.options && q.options.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap pt-0.5 text-[11px] text-slate-500 font-medium">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Options:</span>
                                    {q.options.map((opt: string, i: number) => (
                                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Icons: Edit, Delete, Toggle */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditModal(q)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-[#26648E] transition cursor-pointer"
                                title="Edit Question"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleQuestion(q.id, q.enabled)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                                  q.enabled
                                    ? 'bg-[#26648E] text-white hover:bg-[#1f5072] shadow-2xs'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {q.enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </main>
      </div>

      {/* ADD QUESTION MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto">
          <div className="academic-card max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-[#4F8FC0]/20 flex items-center justify-between bg-[#f0f5f9]">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#26648E]" />
                <h3 className="text-sm font-black text-[#26648E]">Add Performance Appraisal Question</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Title / Description</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Research Papers published in Scopus / Web of Science indexed journals"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__NEW__">+ Create New Category...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  />
                </div>
              </div>

              {newCategory === '__NEW__' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Category Name</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Community Engagement & Social Initiatives"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Input Field Type</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-bold text-slate-700"
                >
                  <option value="short_answer">Short Answer Box (Single-line Text)</option>
                  <option value="big_answer">Big Answer Box (Multi-line Textarea)</option>
                  <option value="dropdown">Dropdown (Selection from Choices)</option>
                  <option value="calendar">Calendar (Date Picker)</option>
                  <option value="number">Only Number Input</option>
                </select>
              </div>

              {newFieldType === 'dropdown' && (
                <div className="space-y-1 p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                  <label className="block text-xs font-bold text-purple-900">
                    Dropdown Options (Separate by comma)
                  </label>
                  <input
                    type="text"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    placeholder="e.g. International, National, State Level, Institutional"
                    className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                    required
                  />
                  <p className="text-[10px] text-purple-700">Enter choices separated by commas. Staff will choose one from these options.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-6 sm:pt-12 overflow-y-auto">
          <div className="academic-card max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-[#4F8FC0]/20 flex items-center justify-between bg-[#f0f5f9]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#26648E]" />
                <h3 className="text-sm font-black text-[#26648E]">Edit Appraisal Question</h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditQuestion} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Title / Description</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Domain</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    value={editMarks}
                    onChange={(e) => setEditMarks(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Input Field Type</label>
                <select
                  value={editFieldType}
                  onChange={(e) => setEditFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-bold text-slate-700"
                >
                  <option value="short_answer">Short Answer Box (Single-line Text)</option>
                  <option value="big_answer">Big Answer Box (Multi-line Textarea)</option>
                  <option value="dropdown">Dropdown (Selection from Choices)</option>
                  <option value="calendar">Calendar (Date Picker)</option>
                  <option value="number">Only Number Input</option>
                </select>
              </div>

              {editFieldType === 'dropdown' && (
                <div className="space-y-1 p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                  <label className="block text-xs font-bold text-purple-900">
                    Dropdown Options (Separate by comma)
                  </label>
                  <input
                    type="text"
                    value={editOptionsText}
                    onChange={(e) => setEditOptionsText(e.target.value)}
                    placeholder="e.g. International, National, State Level, Institutional"
                    className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:outline-none focus:border-[#26648E] bg-white font-medium"
                    required
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black shadow-md shadow-[#26648E]/25 transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
