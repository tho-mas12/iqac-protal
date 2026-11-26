'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AAAPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('/AAA/index.html');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (typeof window !== 'undefined') {
          const sso = localStorage.getItem('IQAC_SSO_USER');
          if (sso) setUser(JSON.parse(sso));
          else router.push('/login');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        setIframeSrc(`/AAA/index.html${hash}`);
      }

      const handleHashChange = () => {
        const h = window.location.hash;
        const newSrc = h ? `/AAA/index.html${h}` : '/AAA/index.html';
        setIframeSrc(newSrc);
        const iframe = document.getElementById('aaa-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.location.hash = h ? h.replace('#', '') : '';
          } catch (e) {}
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [router]);

  const canAccessAaa = user?.role === 'ADMIN' || Boolean(user?.isMqc);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role={(user?.invitationRole || user?.role || 'STAFF') as any}
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
        isHod={user?.isHod}
        isMqc={user?.isMqc}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="AAA Data Platform • 2026–2027"
          userName={user?.name}
          userRole={user?.invitationRole || user?.role || 'Staff'}
          departmentName={user?.department?.name}
          shift={user?.department?.shift}
        />
        <main className="flex-1 relative w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
          {loading ? (
            <div className="h-full flex items-center justify-center p-6 bg-[#faf8f2]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#26648E]">Verifying MQC authorization...</span>
              </div>
            </div>
          ) : !canAccessAaa ? (
            <div className="h-full flex items-center justify-center p-6 bg-[#faf8f2]">
              <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    MQC Authorization Required
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2 font-crest">
                    Access Restricted
                  </h2>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                    The <strong>Annual Academic Audit (AAA) Data Platform</strong> is restricted exclusively to designated <strong>MQC Members</strong> and <strong>College Administrators</strong>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/hub"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-bold transition shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Common Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              id="aaa-iframe"
              src={iframeSrc}
              title="AAA Data Platform"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          )}
        </main>
      </div>
    </div>
  );
}
