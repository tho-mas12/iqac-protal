'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  KeyRound,
  ExternalLink,
  RotateCw,
  Copy,
  Check,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DriveSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [driveStatus, setDriveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [uRes, dRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/drive/status'),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }
      if (dRes.ok) {
        const d = await dRes.json();
        setDriveStatus(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopyEnv = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="ADMIN" userName={user?.name || 'Administrator'} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Google Drive API Integration"
          userName={user?.name}
          userRole="Admin"
        />

        <main className="p-6 md:p-8 space-y-8 flex-1 max-w-5xl">
          {/* Live Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Google Drive Storage Service</h3>
                  <p className="text-xs text-slate-500">Auto-folder provisioning & image streaming engine</p>
                </div>
              </div>

              <button
                onClick={fetchStatus}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-semibold self-start sm:self-center"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Diagnosing Google Drive connection...
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border flex items-start gap-4 ${
                    driveStatus?.connected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      driveStatus?.connected ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {driveStatus?.connected ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">
                      {driveStatus?.connected
                        ? 'Google Drive API Connected & Active'
                        : 'Local Fallback Storage Active (Ready for Drive Credentials)'}
                    </h4>
                    <p className="text-xs mt-1">
                      {driveStatus?.message ||
                        'System is currently running in local storage preview mode and fully operational. Connect your Google Cloud Service Account to enable cloud streaming.'}
                    </p>
                  </div>
                </div>

                {driveStatus?.email && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Connected Service Account:</span>
                    <code className="font-mono font-bold text-purple-700">{driveStatus.email}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step-by-Step Google Drive Setup Guide */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">
                How to Connect Your Google Account & Drive API
              </h3>
              <p className="text-xs text-slate-500">
                Follow these 4 simple steps to enable automatic department folder creation in your own Google Drive:
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Enable Google Drive API in Google Cloud Console</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Visit the{' '}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 underline font-semibold inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                  , create a project (e.g. &quot;IQAC Portal&quot;), go to <strong>APIs &amp; Services &gt; Library</strong>, search for <strong>Google Drive API</strong>, and click <strong>Enable</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Create a Service Account &amp; Download Key</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  In <strong>APIs &amp; Services &gt; Credentials</strong>, click <strong>Create Credentials &gt; Service Account</strong>. Once created, click on the Service Account &gt; <strong>Keys</strong> tab &gt; <strong>Add Key &gt; Create new key (JSON)</strong>. Download this JSON file.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Create Root Folder &amp; Share with Service Account</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Open your Google Drive, create a new folder (e.g., <code>IQAC_Portal_Root</code>), click <strong>Share</strong>, and add the Service Account email address (found in the JSON file) as <strong>Editor</strong>. Copy the folder ID from your browser URL (the string after <code>folders/...</code>).
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Set Environment Variables in your <code className="bg-slate-200 px-1 py-0.5 rounded text-purple-900">.env</code> file</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Add the downloaded credentials to your <code>.env</code> file:
                </p>

                <div className="relative pl-8">
                  <pre className="bg-[#0f172a] text-purple-300 p-4 rounded-xl text-xs overflow-x-auto font-mono">
{`GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID="1a2b3c4d5e6f7g8h9i0..."`}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopyEnv(
                        `GOOGLE_SERVICE_ACCOUNT_EMAIL=""\nGOOGLE_PRIVATE_KEY=""\nGOOGLE_DRIVE_PARENT_FOLDER_ID=""`
                      )
                    }
                    className="absolute right-3 top-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
