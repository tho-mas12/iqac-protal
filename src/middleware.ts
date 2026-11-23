import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets, login page, static files, and public APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/AAA') ||
    pathname.startsWith('/uploads') ||
    pathname === '/login' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/AAA') ||
    pathname.startsWith('/course-plan') ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|json|pdf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('iqac_token')?.value;

  // If no token and accessing protected page, redirect to /login
  if (!token && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
