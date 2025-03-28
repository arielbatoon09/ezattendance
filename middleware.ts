import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if the request is for protected pages (but not API routes)
  if ((request.nextUrl.pathname.startsWith('/view-attendance') || 
      request.nextUrl.pathname.startsWith('/settings')) && 
      !request.nextUrl.pathname.startsWith('/api/')) {
    const adminSession = request.cookies.get('admin_session');

    // If no admin session, redirect to login
    if (!adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/view-attendance/:path*',
    '/settings/:path*'
  ],
};
