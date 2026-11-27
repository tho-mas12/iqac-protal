import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets, Next.js build assets, and public auth endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|json)$/i.test(pathname)
  ) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    return response;
  }

  // 2. Check Authentication Token
  const token = request.cookies.get('iqac_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify Token Expiration & Payload
  const payload = decodeJwtPayload(token);
  if (!payload) {
    // Token is invalid or expired
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('iqac_token');
    return response;
  }

  // 4. Role-Based Access Control (RBAC)
  const role = String(payload.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATOR';

  // Guard /admin routes strictly for ADMIN users
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/staff/dashboard', request.url));
  }

  // 5. Attach Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
