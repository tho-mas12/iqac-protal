'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidelinesModal({ isOpen, onClose }: GuidelinesModalProps) {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'format1' | 'format2'>('guidelines');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <BookOpen className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">IQAC Invitation Format & Guidelines</h3>
              <p className="text-xs text-purple-200">Internal Quality Assurance Cell • St. Joseph's College (Autonomous)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'guidelines'
                ? 'bg-white text-purple-700 border-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>12 Guidelines (Page 1)</span>
          </button>
          <button
            onClick={() => setActiveTab('format1')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'format1'
                ? 'bg-white text-purple-700 border-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Standard Events Format (Page 2)</span>
          </button>
          <button
            onClick={() => setActiveTab('format2')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'format2'
                ? 'bg-white text-purple-700 border-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Workshop / Seminar / Conference (Page 3)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm flex-1">
          {/* TAB 1: 12 Guidelines */}
          {activeTab === 'guidelines' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed">
                  <strong>Mandatory Instruction:</strong> All departments must strictly adhere to the standardized college invitation layout before submitting files for IQAC Director verification.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { num: '1', title: 'Official College Logo', desc: 'Use the official College Logo and Department Logo appropriately.' },
                  { num: '2', title: 'Spelling & Grammar', desc: 'Ensure proper British English spelling, punctuation, and grammar without errors.' },
                  { num: '3', title: 'Content Sequence', desc: 'Maintain the exact sequence: Department Name → Title of Event → Date & Time → Venue → Felicitation → Resource Person.' },
                  { num: '4', title: 'Resource Person Details', desc: 'Ensure accuracy in Name with Salutation, Designation, and Name of the Institution/Organization.' },
                  { num: '5', title: 'Date & Time Formatting', desc: 'Specify the exact date (e.g. 15th October 2026), timing, and campus venue clearly.' },
                  { num: '6', title: 'Event Categories', desc: 'State the precise category: Association Meeting / IKS / Mental Wellbeing / Endowment Lecture / Capacity Development / Skill Development / Hands-on Training / Seminar / Conference.' },
                  { num: '7', title: 'Single-Page Layout', desc: 'Invitation should be designed concisely on a single page layout (front & back if two pages).' },
                  { num: '8', title: 'No Watermarks / Distortions', desc: 'Do not use dark background watermarks that diminish readability of text.' },
                  { num: '9', title: 'Patron & Convener Signatures', desc: 'Include designations: Head of Department (Convener) and Faculty Coordinator.' },
                  { num: '10', title: 'Timely Submission', desc: 'Submit invitation via the IQAC Portal at least 5 working days before the scheduled event.' },
                  { num: '11', title: 'Submission of 6 Hard Copies', desc: 'After online approval, 6 physical hard copies must be submitted to IQAC 3 days prior to the event.' },
                  { num: '12', title: 'Website Publication', desc: 'Approved invitations are forwarded to ERP (erp@mail.sjctni.edu) by IQAC staff for publishing on the official college website.' },
                ].map((item) => (
                  <div key={item.num} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {item.num}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Standard Events Format */}
          {activeTab === 'format1' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 font-serif text-center max-w-2xl mx-auto shadow-inner animate-in fade-in">
              <div className="border-b border-slate-200 pb-4">
                <p className="font-sans text-[11px] font-bold text-purple-700 tracking-wider uppercase">
                  Format for Association Meeting / IKS / Mental Wellbeing / Endowment Lecture / Capacity & Skill Development
                </p>
                <h3 className="font-serif font-extrabold text-xl text-slate-900 mt-1 uppercase tracking-wide">
                  ST. JOSEPH'S COLLEGE (AUTONOMOUS)
                </h3>
                <p className="text-xs font-sans text-slate-500">Tiruchirappalli - 620 002</p>
              </div>

              <div className="py-2">
                <p className="font-sans font-bold text-sm uppercase text-purple-900">DEPARTMENT OF [DEPARTMENT NAME]</p>
                <p className="text-xs italic text-slate-600">(Shift I / Shift II / Units)</p>
              </div>

              <div className="italic text-sm text-slate-700 font-semibold">cordially invites you to the</div>

              <div>
                <p className="text-xs italic text-slate-500 mb-1">[Association Meeting / Endowment Lecture / Training Programme]</p>
                <div className="italic text-xs text-slate-600">on</div>
                <h4 className="text-base font-bold text-slate-900 mt-2 uppercase font-sans">TITLE OF THE EVENT / TOPIC</h4>
              </div>

              <div className="flex justify-around text-xs font-semibold border-y border-slate-200 py-3 text-slate-800 font-sans">
                <div><span className="font-bold">Date:</span> [Date]</div>
                <div><span className="font-bold">Time:</span> [Time]</div>
                <div><span className="font-bold">Venue:</span> [Hall / Room Name]</div>
              </div>

              <div className="space-y-4 text-xs font-sans text-center">
                <div>
                  <p className="font-bold uppercase text-slate-900">Resource Person</p>
                  <p className="text-slate-800 font-bold">Dr. / Prof. / Mr. / Ms. [Name of Speaker]</p>
                  <p className="text-slate-600 italic">[Designation & Department]</p>
                  <p className="text-slate-600">[Institution / Organization, City]</p>
                </div>
              </div>

              <p className="text-xs font-bold italic text-slate-800 pt-2 font-serif">All are cordially invited.</p>

              <div className="flex justify-between pt-6 text-[11px] font-sans text-left border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Head of the Department</p>
                  <p className="text-slate-600">Convener</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Faculty Coordinator(s)</p>
                  <p className="text-slate-600">Organizing Team</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Conference / Seminar Format */}
          {activeTab === 'format2' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 font-serif text-center max-w-2xl mx-auto shadow-inner animate-in fade-in">
              <div className="border-b border-slate-200 pb-3">
                <p className="font-sans text-[11px] font-bold text-purple-700 tracking-wider uppercase">
                  Format for Workshop / Seminar / Conference
                </p>
                <h3 className="font-serif font-extrabold text-xl text-slate-900 mt-1 uppercase tracking-wide">
                  ST. JOSEPH'S COLLEGE (AUTONOMOUS)
                </h3>
                <p className="text-[11px] font-sans text-slate-600 leading-tight">
                  Special Heritage Status Awarded by UGC • Accredited at A++ Grade (Cycle IV) by NAAC<br />
                  College with Potential for Excellence by UGC • DBT-STAR & DST-FIST Sponsored College<br />
                  <strong>NIRF 2025: Ranked 25th</strong> • Tiruchirappalli - 620 002
                </p>
              </div>

              <div className="py-2">
                <p className="font-sans font-bold text-sm uppercase text-purple-900">DEPARTMENT OF [DEPARTMENT NAME]</p>
              </div>

              <div className="italic text-sm text-slate-700 font-semibold">organises</div>

              <div>
                <p className="text-xs italic text-slate-500 mb-1">(National / International Conference / Seminar)</p>
                <div className="italic text-xs text-slate-600">on</div>
                <h4 className="text-base font-bold text-slate-900 mt-2 uppercase font-sans">TITLE OF THE PROGRAMME</h4>
              </div>

              <div className="flex justify-around text-xs font-semibold border-y border-slate-200 py-3 text-slate-800 font-sans">
                <div><span className="font-bold">Date:</span> [Date]</div>
                <div><span className="font-bold">Time:</span> [Time]</div>
                <div><span className="font-bold">Venue:</span> [Venue]</div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <p className="font-bold uppercase text-slate-900">Felicitation</p>
                  <p className="text-slate-800 font-bold">[Name with Salutation]</p>
                  <p className="text-slate-500 italic">[Designation, Name of the Institution / Organization]</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-slate-900">Keynote / Resource Person</p>
                  <p className="text-slate-800 font-bold">[Name with Salutation]</p>
                  <p className="text-slate-500 italic">[Designation, Institution / Organization]</p>
                </div>
              </div>

              <p className="text-xs font-bold italic text-slate-800 pt-2 font-serif">All are cordially invited.</p>

              <div className="flex justify-between pt-6 text-[11px] font-sans text-left border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Convener</p>
                  <p className="text-slate-600">Head, Department of ______</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">Programme Coordinator</p>
                  <p className="text-slate-600">Name of Faculty Coordinator</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <a
            href="https://www.sjctni.edu/SJC_logo.jsp"
            target="_blank"
            rel="noreferrer"
            className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res College Logo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-colors cursor-pointer"
          >
            Close Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}
