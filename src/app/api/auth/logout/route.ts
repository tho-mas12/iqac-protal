import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { removeSession } from '@/lib/session-lock';

export async function POST() {
  try {
    const session = await getCurrentUser();
    if (session?.username) {
      removeSession(session.username);
    }
  } catch {}

  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}
