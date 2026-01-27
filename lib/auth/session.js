import crypto from 'crypto';
import { cookies } from 'next/headers';
import dbConnect from '../db/connect.js';
import Session from '../db/models/Session.js';
import User from '../db/models/User.js';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a secure random session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 * @param {string} userId - User's ID
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export async function createSession(userId) {
  await dbConnect();

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = await Session.create({
    userId,
    token,
    expiresAt,
  });

  return {
    token: session.token,
    expiresAt: session.expiresAt,
  };
}

/**
 * Set session cookie
 * @param {string} token - Session token
 * @param {Date} expiresAt - Expiration date
 */
export async function setSessionCookie(token, expiresAt) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
    // Set domain for cross-subdomain cookie sharing (forum.schedule-builder.xyz)
    domain: process.env.NODE_ENV === 'production' ? '.schedule-builder.xyz' : undefined,
  });
}

/**
 * Get current session from cookie
 * @returns {Promise<{user: User, session: Session}|null>}
 */
export async function getSession() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  // Find valid session
  const session = await Session.findOne({
    token,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!session) {
    return null;
  }

  // Check for inactivity timeout
  const now = new Date();
  const timeSinceLastActivity = now - new Date(session.lastActivity);

  if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
    // Session expired due to inactivity
    await Session.deleteOne({ token });
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  // Update last activity time
  session.lastActivity = now;
  await session.save();

  const user = await User.findById(session.userId);

  if (!user) {
    return null;
  }

  return {
    user,
    session,
  };
}

/**
 * Delete current session (logout)
 */
export async function deleteSession() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await Session.deleteOne({ token });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

/**
 * Require authentication - throws if not authenticated
 * @returns {Promise<{user: User, session: Session}>}
 */
export async function requireAuth() {
  const sessionData = await getSession();

  if (!sessionData) {
    throw new Error('Unauthorized');
  }

  return sessionData;
}

/**
 * Require admin role - throws if not admin
 * @returns {Promise<{user: User, session: Session}>}
 */
export async function requireAdmin() {
  const sessionData = await requireAuth();

  if (sessionData.user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return sessionData;
}
