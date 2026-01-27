import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Allowed origins for CORS (forum subdomain)
const allowedOrigins = [
  'http://localhost:5174',  // Local forum dev
  'https://forum.schedule-builder.xyz',  // Production forum
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const isApiRoute = pathname.startsWith('/api/');
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle OPTIONS preflight requests for CORS
  if (isApiRoute && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return response;
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/api/auth/request-link', '/api/auth/verify', '/api/auth/verify-code', '/api/auth/register'];

  // Create response
  let response;

  // API routes should always proceed (auth is handled per-route)
  if (isApiRoute) {
    response = NextResponse.next();
  } else if (publicRoutes.some(route => pathname.startsWith(route))) {
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

  // Add CORS headers for API routes from allowed origins
  if (isApiRoute && isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
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
