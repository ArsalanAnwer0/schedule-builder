import { NextResponse } from 'next/server';
import { verifyMagicLink } from '../../../../lib/auth/magic-link';
import { createSession, setSessionCookie } from '../../../../lib/auth/session';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Verify magic link and get user
    const user = await verifyMagicLink(token);

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=expired_or_invalid', request.url));
    }

    // Create session
    const session = await createSession(user._id.toString());

    // Set cookie
    await setSessionCookie(session.token, session.expiresAt);

    // Redirect based on role
    if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    console.error('Verify magic link error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
