'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function CoursePlanPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [iframeSrc, setIframeSrc] = useState('/course-plan/index.html');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('IQAC_SSO_USER', JSON.stringify(data.user));
            } catch (e) {}
          }
        } else if (typeof window !== 'undefined') {
          const sso = localStorage.getItem('IQAC_SSO_USER');
          if (sso) setUser(JSON.parse(sso));
          else router.push('/login');
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadUser();

    if (typeof window !== 'undefined') {
      const syncHash = (h: string) => {
        const cleanHash = h ? '#' + h.replace(/^#/, '') : '';
        const newSrc = cleanHash ? `/course-plan/index.html${cleanHash}` : '/course-plan/index.html';
        setIframeSrc(newSrc);
        const iframe = document.getElementById('course-plan-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.location.hash = cleanHash;
            if ((iframe.contentWindow as any).coursePlanApp) {
              (iframe.contentWindow as any).coursePlanApp.handleRoute();
            }
          } catch (e) {}
        }
      };

      const initialHash = window.location.hash;
      if (initialHash) {
        setIframeSrc(`/course-plan/index.html${initialHash}`);
      }

      const handleHashChange = () => syncHash(window.location.hash);
      const handleCustomHash = (e: any) => syncHash(e.detail || '');

      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('popstate', handleHashChange);
      window.addEventListener('portal-hash-change', handleCustomHash);

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('popstate', handleHashChange);
        window.removeEventListener('portal-hash-change', handleCustomHash);
      };
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role={(user?.invitationRole || user?.role || 'STAFF') as any}
        userName={user?.name}
        departmentName={user?.department?.name}
        shift={user?.department?.shift}
        isHod={user?.isHod}
        isMqc={user?.isMqc}
        isCoursePlanEnabled={user?.isCoursePlanEnabled !== false || user?.role === 'ADMIN'}
      />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Header
          title="Course Plan System • 2026–2027"
          userName={user?.name}
          userRole={user?.invitationRole || user?.role || 'Staff'}
          departmentName={user?.department?.name}
          shift={user?.department?.shift}
        />
        <main className="flex-1 relative w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
          {user && user.role !== 'ADMIN' && user.isCoursePlanEnabled === false ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#faf8f2]">
              <div className="max-w-md p-8 bg-white rounded-2xl border border-rose-200 shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto text-2xl font-black">
                  🔒
                </div>
                <h3 className="text-lg font-black text-slate-800">Course Plan Access Restricted</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Course Plan module access has been temporarily disabled for your account by the IQAC Administrator. Please contact the IQAC office if you require authorization.
                </p>
                <div className="pt-2">
                  <a
                    href="/hub"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#26648E] hover:bg-[#1f5072] text-white text-xs font-black transition shadow-sm"
                  >
                    <span>← Return to Common Dashboard</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              id="course-plan-iframe"
              src={iframeSrc}
              title="Course Plan System"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
              onLoad={(e) => {
                try {
                  const iframeWin = (e.target as HTMLIFrameElement).contentWindow as any;
                  if (iframeWin && iframeWin.coursePlanApp) {
                    iframeWin.coursePlanApp.checkAuth().then(() => {
                      iframeWin.coursePlanApp.render();
                    });
                  }
                } catch (err) {}
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
