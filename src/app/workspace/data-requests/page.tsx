'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { FileText, Plus, Calendar, Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function DataRequestsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState('2025-26');
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [dynamicForms, setDynamicForms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  // Data request form
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');

  // Dynamic form builder state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState<any[]>([
    { id: 'f1', label: 'Activity Name', type: 'text', required: true },
    { id: 'f2', label: 'Event Date', type: 'date', required: true },
    { id: 'f3', label: 'Number of Participants', type: 'number', required: true },
  ]);

  useEffect(() => {
    fetchData();
  }, [activeAcademicYear]);

  const fetchData = async () => {
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      const drRes = await fetch(`/api/data-requests?academicYearId=${activeAcademicYear}`);
      if (drRes.ok) {
        const drData = await drRes.json();
        setDataRequests(drData.dataRequests || []);
      }

      const fRes = await fetch('/api/dynamic-forms');
      if (fRes.ok) {
        const fData = await fRes.json();
        setDynamicForms(fData.forms || []);
        if (fData.forms?.length > 0) setSelectedFormId(fData.forms[0].id);
      }

      const mRes = await fetch('/api/master-data');
      if (mRes.ok) {
        const mData = await mRes.json();
        setDepartments(mData.departments || []);
      }
    } catch (err) {
      console.error('Failed to load data requests', err);
    }
  };

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      { id: `f_${Date.now()}`, label: 'New Field', type: 'text', required: false },
    ]);
  };

  const handleSaveDynamicForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/dynamic-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, description: formDesc, fields }),
      });

      if (res.ok) {
        setShowFormBuilder(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to save dynamic form', err);
    }
  };

  const handleCreateDataRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          instructions,
          deadline,
          formId: selectedFormId,
          academicYearId: activeAcademicYear,
          targetDepartments: 'ALL',
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        setInstructions('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create data request', err);
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
                <FileText className="w-5 h-5 text-indigo-600" />
                Department Data Request & Form Builder
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue dynamic data collection tasks to departments without code modifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'IQAC_ADMIN' || user?.role === 'IQAC_MEMBER') && (
                <>
                  <button
                    onClick={() => setShowFormBuilder(true)}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Build Dynamic Form
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Issue Data Request
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active Data Requests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataRequests.length > 0 ? (
              dataRequests.map((dr) => (
                <div key={dr.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono">
                      {dr.reqNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      {dr.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{dr.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{dr.instructions || 'No special instructions provided.'}</p>
                  
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {dr.deadline ? new Date(dr.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                    <span className="font-semibold text-indigo-600">{dr.submissions?.length || 0} Submissions</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No active data collection requests found for AY {activeAcademicYear}.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dynamic Form Builder Modal */}
      {showFormBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Dynamic Form Builder (13 Field Types Supported)
            </h2>
            <form onSubmit={handleSaveDynamicForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Form Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="e.g. MMTTC Faculty Training Data Form"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Form purpose and guidelines"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Form Schema Fields</span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[11px]"
                  >
                    + Add Field
                  </button>
                </div>

                {fields.map((f, idx) => (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[idx].label = e.target.value;
                          setFields(updated);
                        }}
                        className="p-1.5 border border-slate-200 rounded-lg text-xs"
                        placeholder="Field Label"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[idx].type = e.target.value;
                          setFields(updated);
                        }}
                        className="p-1.5 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="yesno">Yes/No</option>
                        <option value="percentage">Percentage</option>
                        <option value="fileUpload">File Upload</option>
                        <option value="email">Email</option>
                        <option value="url">URL</option>
                      </select>
                      <label className="flex items-center gap-2 font-semibold text-slate-700 text-xs">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => {
                            const updated = [...fields];
                            updated[idx].required = e.target.checked;
                            setFields(updated);
                          }}
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormBuilder(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Form Schema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Data Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Issue Department Data Request
            </h2>
            <form onSubmit={handleCreateDataRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="e.g. Submit Quarterly FDP and Activity Evidence"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Form Template</label>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {dynamicForms.map((df) => (
                    <option key={df.id} value={df.id}>
                      {df.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions for HOD</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Issue Task to Departments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
