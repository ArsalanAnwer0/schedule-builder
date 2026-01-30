import { NextResponse } from 'next/server';
import { createSession } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';

async function exchangeCodeForTokens(code, redirectUri) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google');
  }

  return response.json();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');

    // User denied access or error occurred
    if (error) {
      return NextResponse.redirect(new URL('/login?error=oauth_denied', request.url));
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    // Verify CSRF state
    const stateCookie = request.cookies.get('google_oauth_state')?.value;
    let mode = 'login';

    try {
      const stateData = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
      mode = stateData.mode || 'login';

      if (!stateCookie || stateCookie !== stateData.token) {
        return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    // Exchange code for tokens
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(new URL(`/${mode === 'register' ? 'register' : 'login'}?error=no_email`, request.url));
    }

    // Validate @gmail.com
    if (!googleUser.email.toLowerCase().endsWith('@gmail.com')) {
      const redirectPath = mode === 'register' ? '/register' : '/login';
      return NextResponse.redirect(new URL(`${redirectPath}?error=gmail_only`, request.url));
    }

    await dbConnect();

    if (mode === 'register') {
      // REGISTER MODE: Check if user already exists
      const existingUser = await User.findOne({ email: googleUser.email.toLowerCase() });
      if (existingUser) {
        return NextResponse.redirect(new URL('/login?error=already_exists', request.url));
      }

      // Redirect to register page with Google data to collect org name
      const googleData = Buffer.from(JSON.stringify({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
      })).toString('base64url');

      const response = NextResponse.redirect(new URL(`/register?step=org&data=${googleData}`, request.url));
      // Clear the state cookie
      response.cookies.delete('google_oauth_state');
      return response;

    } else {
      // LOGIN MODE: Find existing user
      const user = await User.findOne({
        $or: [
          { email: googleUser.email.toLowerCase() },
          { secondaryEmail: googleUser.email.toLowerCase() },
        ],
      });

      if (!user) {
        const response = NextResponse.redirect(new URL('/login?error=no_account', request.url));
        response.cookies.delete('google_oauth_state');
        return response;
      }

      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleUser.id;
        await user.save();
      }

      // Mark email as verified (they verified through Google)
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }

      // Create session
      const session = await createSession(user._id.toString());

      // Redirect based on role
      const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));

      // Set session cookie directly on the redirect response
      response.cookies.set('session_token', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: session.expiresAt,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined,
      });
      response.cookies.delete('google_oauth_state');
      return response;
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}
