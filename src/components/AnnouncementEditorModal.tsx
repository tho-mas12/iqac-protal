'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, Save, CheckCircle2, RotateCw, Sparkles, MessageSquare } from 'lucide-react';
import Toast, { ToastMessage } from '@/components/Toast';

interface AnnouncementEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newText: string) => void;
}

export default function AnnouncementEditorModal({
  isOpen,
  onClose,
  onSaved,
}: AnnouncementEditorModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCurrent = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/settings/notifications');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.announcementText) {
            setText(data.settings.announcementText);
            return;
          }
        }
        setText(
          "🏛️ Welcome to IQAC Portal — St. Joseph's College (Autonomous) | 🔔 Kindly submit all event invitations at least 3-5 working days prior to the event date | 📄 Ensure official College crest and IQAC logo follow the approved format | ✉️ Submit hard copy to IQAC office immediately upon Director approval for website publishing | 🚀 Portal active for 2026 Academic Events."
        );
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementText: text.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'Scrolling announcement feed updated live!' });
        if (onSaved) onSaved(text.trim());
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to update announcement' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to update announcement' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2a1b54] to-[#6320ee] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Megaphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Publish IQAC Announcement Feed</h3>
              <p className="text-xs text-purple-200">Updates the scrolling notice board for all department users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Announcement Feed Text</span>
              <span className="text-[11px] text-slate-400 font-normal">Use | to separate items</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              disabled={loading || saving}
              placeholder="e.g. 📢 NOTICE: All Symposium invitations must be submitted by Friday | 📄 Follow IQAC crest guidelines..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 bg-slate-50 focus:bg-white leading-relaxed"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-start gap-2.5 text-xs text-purple-900">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              Once saved, this message will <strong>instantly scroll</strong> across every department dashboard in real time.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-5 py-2.5 bg-[#6320ee] hover:bg-[#5215ce] active:bg-[#430fb5] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
