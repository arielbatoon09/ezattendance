import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the view-attendance page
  if (request.nextUrl.pathname.startsWith('/view-attendance')) {
    const adminSession = request.cookies.get('admin_session');

    // If no admin session, redirect to login
    if (!adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/view-attendance/:path*',
};
