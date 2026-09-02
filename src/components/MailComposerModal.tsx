'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
  Download,
  Sparkles,
  FileCheck2
} from 'lucide-react';

interface MailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: any;
  onMailSentSuccess?: () => void;
}

export default function MailComposerModal({
  isOpen,
  onClose,
  invitation,
  onMailSentSuccess,
}: MailComposerModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  if (!isOpen || !invitation) return null;

  const fromEmail = 'sjcdoccentre@mail.sjctni.edu';
  const toEmail = 'erp@mail.sjctni.edu';
  const subject = 'To publish in college website';
  const fileDownloadUrl = `/api/invitations/${invitation.id}/file?rev=${invitation.revisionCount || 0}&t=${invitation.updatedAt ? new Date(invitation.updatedAt).getTime() : Date.now()}`;

  // Clean exact content requested by user:
  // "Kindly publish it on the college website." and no "Attached Invitation File:"
  const bodyContent = `Dear Sir,\n\nKindly publish it on the college website.\n\nThank you,\nIQAC Documentation Centre\nSt. Joseph's College (Autonomous), Tiruchirappalli`;

  const mailtoUrl = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(toEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSoftCopy = () => {
    const link = document.createElement('a');
    link.href = fileDownloadUrl;
    link.download = invitation.fileName || `${invitation.programTitle}_invitation`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAndMark = async (urlToOpen?: string) => {
    // 1. Download soft copy so user can immediately attach to email
    downloadSoftCopy();

    // 2. Open email client if requested
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }

    // 3. Automatically record in database that ERP mail has been dispatched
    try {
      setMarking(true);
      await fetch(`/api/invitations/${invitation.id}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sent: true }),
      });
      if (onMailSentSuccess) {
        onMailSentSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  const handleDirectMarkSent = async () => {
    try {
      setMarking(true);
      const res = await fetch(`/api/invitations/${invitation.id}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sent: !invitation.mailSent }),
      });
      if (res.ok && onMailSentSuccess) {
        onMailSentSuccess();
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 font-bold shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Send Invitation to ERP Team</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  Approved
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Publish approved invitation on official college website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Email addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">From</span>
              <span className="font-bold font-mono text-slate-800 break-all">{fromEmail}</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-600 block uppercase tracking-wider">To (ERP Team)</span>
              <span className="font-bold font-mono text-blue-900 break-all">{toEmail}</span>
            </div>
          </div>

          {/* Subject */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Subject</span>
              <span className="font-bold text-slate-900">{subject}</span>
            </div>
            <button
              onClick={() => handleCopy(subject, 'subject')}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied === 'subject' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'subject' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Download Soft Copy for Attachment Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-purple-950 text-xs block truncate">
                  Soft Copy: {invitation.fileName || 'Invitation Poster'}
                </span>
                <span className="text-[11px] text-purple-700">Downloads automatically when you send mail to attach</span>
              </div>
            </div>

            <button
              onClick={downloadSoftCopy}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>

          {/* Mail Body Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mail Content</span>
              <button
                onClick={() => handleCopy(bodyContent, 'body')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied === 'body' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'body' ? 'Copied Content' : 'Copy Content'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={bodyContent}
              rows={4}
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSendAndMark(gmailUrl)}
              className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Gmail Web</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleSendAndMark(outlookUrl)}
              className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Outlook Web</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectMarkSent}
              disabled={marking}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Toggle Mail Sent status in database"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{invitation.mailSent ? 'Mark as Unsent' : 'Mark as Sent ✓'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendAndMark(mailtoUrl)}
              disabled={marking}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Mail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
