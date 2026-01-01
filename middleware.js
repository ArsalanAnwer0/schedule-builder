import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/api/auth/request-link', '/api/auth/verify', '/api/auth/verify-code', '/api/auth/register'];

  // Create response
  let response;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    response = NextResponse.next();
  } else {
    // Check for session cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken) {
      response = NextResponse.redirect(new URL('/login', request.url));
    } else {
      response = NextResponse.next();
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'none';"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
