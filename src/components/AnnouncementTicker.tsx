'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Bell, Sparkles, X, Calendar, Info, FileText, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

interface AnnouncementTickerProps {
  customText?: string;
  onOpenGuidelines?: () => void;
}

export default function AnnouncementTicker({ customText, onOpenGuidelines }: AnnouncementTickerProps) {
  const [announcement, setAnnouncement] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (customText) {
      setAnnouncement(customText);
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/settings/notifications');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.announcementText) {
            setAnnouncement(data.settings.announcementText);
            return;
          }
        }
      } catch (e) {
        // Use default fallback
      }

      setAnnouncement(
        "🏛️ Welcome to IQAC Portal — St. Joseph's College (Autonomous) | 🔔 Kindly submit all event invitations at least 3-5 working days prior to the event date | 📄 Ensure official College crest and IQAC logo follow the approved format | ✉️ Submit hard copy to IQAC office immediately upon Director approval for website publishing | 🚀 Portal active for 2026 Academic Events."
      );
    };

    fetchAnnouncement();
  }, [customText]);

  const defaultNotices = [
    {
      id: 1,
      tag: 'Urgent Guideline',
      title: 'Submission Timeline for Event Invitations',
      desc: 'All departments are requested to submit soft copies of event invitations at least 3 to 5 working days before the scheduled program date for timely Director review.',
      date: 'Active Circular',
      type: 'urgent',
    },
    {
      id: 2,
      tag: 'Format & Logo',
      title: 'College Crest & IQAC Logo Positioning',
      desc: 'Please ensure that the official St. Joseph’s College crest is placed on the top-left and the IQAC emblem on the top-right of your invitation layout as per guidelines.',
      date: 'Active Circular',
      type: 'standard',
    },
    {
      id: 3,
      tag: 'Workflow Step',
      title: 'Hard Copy Submission after Approval',
      desc: 'Once the Director approves your invitation in the portal, kindly submit the printed hard copy to the IQAC office to initiate ERP and college website publication.',
      date: 'Active Circular',
      type: 'success',
    },
  ];

  return (
    <>
      {/* Scrolling Announcement Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2a1b54] via-[#3b1d7d] to-[#6320ee] text-white shadow-md border border-purple-500/20 group">
        <div className="flex items-center">
          {/* Left Fixed Badge */}
          <div className="z-10 flex items-center gap-2 bg-[#1f1340] px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg shrink-0 border-r border-purple-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-[11px] sm:text-xs tracking-wider uppercase text-amber-300">
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden sm:inline">IQAC Announcements</span>
              <span className="sm:hidden">Notices</span>
            </div>
          </div>

          {/* Continuous Scrolling Marquee */}
          <div className="flex-1 overflow-hidden py-2 sm:py-2.5 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <div className="animate-marquee font-medium text-xs sm:text-sm text-purple-100/95 tracking-wide items-center">
              <span className="mx-6 inline-flex items-center gap-2">
                {announcement}
              </span>
              {/* Duplicate for seamless infinite loop */}
              <span className="mx-6 inline-flex items-center gap-2">
                {announcement}
              </span>
            </div>
          </div>

          {/* Right Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="z-10 hidden sm:flex items-center gap-1 px-3 py-1.5 mr-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-[11px] font-bold text-white transition-all shrink-0 border border-white/20 cursor-pointer"
            title="View All Announcements"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Interactive Announcements Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2a1b54] to-[#6320ee] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Megaphone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">IQAC Announcements & Circulars</h3>
                  <p className="text-xs text-purple-200">Official guidance and deadlines for event invitations</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {defaultNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        notice.type === 'urgent'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : notice.type === 'success'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {notice.tag}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{notice.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notice.desc}</p>
                </div>
              ))}

              {/* Action Box */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-purple-900 font-medium">
                  <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Need the standard invitation dimensions and layout guidelines?</span>
                </div>
                {onOpenGuidelines && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onOpenGuidelines();
                    }}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-[#6320ee] hover:bg-[#5215ce] text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <span>View Guidelines PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
