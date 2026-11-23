'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMqcMembersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users-roles');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#faf8f2]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-[#26648E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-600">Redirecting to Staff, HOD &amp; MQC Directory...</p>
      </div>
    </div>
  );
}
