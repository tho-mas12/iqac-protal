'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast, { ToastMessage } from '@/components/Toast';
import {
  MessageSquare,
  Phone,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Smartphone,
  ShieldCheck,
  RotateCw
} from 'lucide-react';

export default function AdminNotificationSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [senderNumber, setSenderNumber] = useState('9626806328');
  const [receiverNumber, setReceiverNumber] = useState('7418671366');
  const [enabled, setEnabled] = useState(true);

  // Dynamic sample preview state
  const [sampleDept, setSampleDept] = useState('Computer Science');
  const [sampleShift, setSampleShift] = useState('Shift I');
  const [sampleProgram, setSampleProgram] = useState('National Seminar on Deep Learning');
  const [sampleDate, setSampleDate] = useState('15/09/2026');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/settings/notifications'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }

      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.settings) {
          setSenderNumber(sData.settings.whatsappSenderNumber || '9626806328');
          setReceiverNumber(sData.settings.whatsappReceiverNumber || '7418671366');
          setEnabled(sData.settings.whatsappEnabled !== false);
        }
      }
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: 'Failed to load notification settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const cleanSender = senderNumber.replace(/\D/g, '');
      const cleanReceiver = receiverNumber.replace(/\D/g, '');

      if (!cleanReceiver || cleanReceiver.length < 10) {
        setToast({ type: 'error', message: 'Please enter a valid 10-digit receiver phone number' });
        return;
      }

      const res = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsappSenderNumber: cleanSender,
          whatsappReceiverNumber: cleanReceiver,
          whatsappEnabled: enabled,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'WhatsApp notification numbers updated successfully!' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to save settings' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // Preview Message Content
  const previewMessage = `🏛️ IQAC Portal Alert — St. Joseph's College\nNew Invitation Submitted\nDepartment: ${sampleDept} (${sampleShift})\nProgram: ${sampleProgram}\nEvent Date: ${sampleDate}\nStatus: Pending Review`;

  const cleanReceiverNumber = receiverNumber.replace(/\D/g, '');
  const internationalReceiver = cleanReceiverNumber.startsWith('91') && cleanReceiverNumber.length === 12
    ? cleanReceiverNumber
    : (cleanReceiverNumber.length === 10 ? `91${cleanReceiverNumber}` : cleanReceiverNumber);

  const testWhatsAppUrl = `https://api.whatsapp.com/send?phone=${internationalReceiver}&text=${encodeURIComponent(previewMessage)}`;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={user?.name || 'Administrator'} />

      {/* Top Right Pop-up Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="WhatsApp Notification Settings"
          userName={user?.name}
          userRole="Administrator"
        />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-6xl mx-auto w-full">
          {/* Top Banner Notice */}
          <div className="bg-gradient-to-r from-[#075e54] via-[#128c7e] to-[#25d366] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Department Upload Alerts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                WhatsApp Dispatch Configuration
              </h2>
              <p className="text-white/90 text-xs sm:text-sm max-w-xl">
                Automatically notify the Director & IQAC whenever a department registers or submits an event invitation on the portal.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white text-[#075e54] hover:bg-emerald-50 font-extrabold rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#25d366]" />
                <span>Send Test Alert</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Phone Numbers Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Alert Phone Numbers</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure sender and receiving phone numbers</p>
                </div>
                <button
                  onClick={fetchSettings}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Refresh Settings"
                >
                  <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Active Status Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                      Enable Automated WhatsApp Alerts
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Send alerts automatically on department submission
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enabled ? 'bg-[#25d366] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                  </button>
                </div>

                {/* Sender Number Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>Sender Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 bg-white"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Default: 96268 06328 (Dispatch identifier / gateway number)
                  </span>
                </div>

                {/* Receiver Number Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#25d366]" />
                    <span>Receiver Phone Number (Director / IQAC)</span>
                  </label>
                  <input
                    type="text"
                    value={receiverNumber}
                    onChange={(e) => setReceiverNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Default: 74186 71366 (The phone number that receives all new event invitation alerts)
                  </span>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-[#6320ee] hover:bg-[#5215ce] active:bg-[#430fb5] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Notification Settings'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live WhatsApp Chat Simulation Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#0b141a] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800 text-slate-100 flex flex-col justify-between h-full min-h-[420px]">
                {/* Simulated Chat Header */}
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#128c7e] text-white flex items-center justify-center font-bold text-sm shadow-md">
                        SJC
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>IQAC Portal Alerts</span>
                          <span className="w-2 h-2 rounded-full bg-[#25d366]" />
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          To: +91 {receiverNumber}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium px-2 py-1 rounded bg-slate-800/80">
                      Live Preview
                    </span>
                  </div>

                  {/* Simulated Chat Bubble */}
                  <div className="pt-6 pb-4">
                    <div className="max-w-[90%] bg-[#005c4b] text-white rounded-2xl rounded-tl-none p-4 shadow-md space-y-1 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans border border-emerald-700/40">
                      {previewMessage}
                      <div className="text-[10px] text-emerald-200/70 text-right pt-1 flex items-center justify-end gap-1 font-mono">
                        <span>Just now</span>
                        <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Test Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Click to test send via WhatsApp Web / App
                  </span>
                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
