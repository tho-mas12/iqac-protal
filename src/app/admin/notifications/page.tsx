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
  RotateCw,
  Key,
  Layers,
  Zap,
  Info,
  Check
} from 'lucide-react';

export default function AdminNotificationSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingAutomated, setTestingAutomated] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form Fields
  const [senderNumber, setSenderNumber] = useState('9626806328');
  const [receiverNumber, setReceiverNumber] = useState('7418671366');
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState('ultramsg');
  const [instanceId, setInstanceId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');

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
          setProvider(sData.settings.whatsappProvider || 'ultramsg');
          setInstanceId(sData.settings.whatsappInstanceId || '');
          setApiKey(sData.settings.whatsappApiKey || '');
          setCustomWebhookUrl(sData.settings.whatsappCustomWebhookUrl || '');
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
          whatsappProvider: provider,
          whatsappInstanceId: instanceId.trim(),
          whatsappApiKey: apiKey.trim(),
          whatsappCustomWebhookUrl: customWebhookUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', message: 'WhatsApp 100% automated notification settings saved successfully!' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to save settings' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAutomatedDispatch = async () => {
    try {
      setTestingAutomated(true);
      setTestResult(null);
      const res = await fetch('/api/settings/notifications/test', {
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data);
      if (data.result?.automated) {
        setToast({ type: 'success', message: 'Live automated WhatsApp message delivered to receiver phone!' });
      } else {
        setToast({ type: 'info', message: 'Test message created. Set Instance ID & API Key to enable automated delivery.' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Error testing automated dispatch' });
    } finally {
      setTestingAutomated(false);
    }
  };

  // Live Message Preview Content
  const previewMessage = `🏛️ IQAC Portal Alert — St. Joseph's College\nNew Invitation Submitted\nDepartment: Computer Science (Shift I)\nProgram: National Seminar on Deep Learning\nEvent Date: 15/09/2026\nStatus: Pending Review`;

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
                <Zap className="w-3.5 h-3.5" />
                <span>100% Fully Automated Background Dispatch</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                WhatsApp Dispatch Configuration
              </h2>
              <p className="text-white/90 text-xs sm:text-sm max-w-xl">
                Automatically delivers WhatsApp alerts directly to the Director & IQAC whenever a department submits an invitation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
              <button
                type="button"
                onClick={handleTestAutomatedDispatch}
                disabled={testingAutomated}
                className="w-full sm:w-auto px-5 py-3 bg-white text-[#075e54] hover:bg-emerald-50 font-extrabold rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-[#25d366]" />
                <span>{testingAutomated ? 'Testing Dispatch...' : 'Test Automated Dispatch'}</span>
              </button>
            </div>
          </div>

          {/* Test Delivery Result Feedback Alert */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                testResult.result?.automated
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm">{testResult.message}</p>
                {testResult.result?.apiResponse && (
                  <pre className="p-2 rounded-xl bg-black/5 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(testResult.result.apiResponse, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Configuration Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Alert & Gateway Configuration</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure sender, receiver, and automated API gateway</p>
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
                    Default: 96268 06328 (The registered sender phone / gateway instance)
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
                    Default: 74186 71366 (The phone number that automatically receives all event alerts)
                  </span>
                </div>

                {/* Automated Gateway Details */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">Automated WhatsApp Gateway Setup</h4>
                  </div>

                  {/* Provider Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Gateway Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/30"
                    >
                      <option value="ultramsg">UltraMsg (Recommended — QR Code link in 1 min)</option>
                      <option value="greenapi">GreenAPI (WhatsApp Business Gateway)</option>
                      <option value="custom_webhook">Custom Webhook / Cloud API</option>
                    </select>
                  </div>

                  {/* Instance ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <span>Instance ID</span>
                    </label>
                    <input
                      type="text"
                      value={instanceId}
                      onChange={(e) => setInstanceId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 bg-white"
                    />
                  </div>

                  {/* API Token / Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-slate-500" />
                      <span>API Token / Secret Key</span>
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 bg-white"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-[#6320ee] hover:bg-[#5215ce] active:bg-[#430fb5] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save All Notification Settings'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Chat Simulator & 1-Minute Gateway Guide */}
            <div className="lg:col-span-5 space-y-6">
              {/* Simulated Chat Bubble */}
              <div className="bg-[#0b141a] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800 text-slate-100 flex flex-col justify-between min-h-[380px]">
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
                      Live Template
                    </span>
                  </div>

                  <div className="pt-5 pb-3">
                    <div className="max-w-[95%] bg-[#005c4b] text-white rounded-2xl rounded-tl-none p-4 shadow-md space-y-1 text-xs leading-relaxed whitespace-pre-line font-sans border border-emerald-700/40">
                      {previewMessage}
                      <div className="text-[10px] text-emerald-200/70 text-right pt-1 flex items-center justify-end gap-1 font-mono">
                        <span>Just now</span>
                        <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    1-Tap WhatsApp Web fallback
                  </span>
                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Open in Web</span>
                  </a>
                </div>
              </div>

              {/* 1-Minute Quick Guide Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>How to activate 100% Automated WhatsApp</span>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <p>Create a free instance at <strong>ultramsg.com</strong> or <strong>green-api.com</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <p>Scan the QR code with phone <strong>{senderNumber}</strong> in WhatsApp Linked Devices.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <p>Copy the <strong>Instance ID</strong> & <strong>Token</strong> into the fields on the left and click <strong>Save</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
