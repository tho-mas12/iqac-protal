'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
  Paperclip,
  Sparkles
} from 'lucide-react';

interface MailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: any;
}

export default function MailComposerModal({
  isOpen,
  onClose,
  invitation,
}: MailComposerModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !invitation) return null;

  const fromEmail = 'sjcdoccentre@mail.sjctni.edu';
  const toEmail = 'erp@mail.sjctni.edu';
  const subject = 'To publish in college website';
  const fileUrl = invitation.driveViewLink?.startsWith('http')
    ? invitation.driveViewLink
    : (typeof window !== 'undefined' ? window.location.origin : '') + '/api/invitations/' + invitation.id + '/file';

  const dateStr = invitation.fromDate
    ? new Date(invitation.fromDate).toLocaleDateString() + (invitation.toDate ? ' to ' + new Date(invitation.toDate).toLocaleDateString() : '')
    : '';

  const bodyContent = 'Dear Sir,\n\nKindly publish it in the college website.\n\nProgram Details:\n� Title: ' + invitation.programTitle + '\n� Department: ' + (invitation.department?.name || 'Department') + ' (' + (invitation.shift || invitation.department?.shift || 'Shift I') + ')\n� Category: ' + invitation.category + '\n� Date: ' + dateStr + '\n� Attached Invitation File: ' + fileUrl + '\n\nThank you,\nIQAC Documentation Centre\nSt. Joseph\'s College (Autonomous), Tiruchirappalli';

  const mailtoUrl = 'mailto:' + toEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyContent);
  const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(toEmail) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyContent);
  const outlookUrl = 'https://outlook.office.com/mail/deeplink/compose?to=' + encodeURIComponent(toEmail) + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyContent);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLaunchDefaultMail = () => {
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 font-bold shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">Send Invitation to ERP Team</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  Approved & Verified
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

        <div className="p-6 space-y-4 text-xs sm:text-sm">
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

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Attached Invitation File</span>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Open File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-600 truncate">
              {fileUrl}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mail Body Preview</span>
              <button
                onClick={() => handleCopy(bodyContent, 'body')}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied === 'body' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'body' ? 'Copied Body' : 'Copy Content'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={bodyContent}
              rows={6}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={gmailUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Gmail Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Outlook Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={handleLaunchDefaultMail}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open Email Client</span>
          </button>
        </div>
      </div>
    </div>
  );
}
