import crypto from 'crypto';
import dbConnect from '../db/connect.js';
import MagicLink from '../db/models/MagicLink.js';
import User from '../db/models/User.js';

/**
 * Generate a secure random token for magic link
 */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a magic link for an email address
 * @param {string} email - User's email address
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export async function createMagicLink(email) {
  await dbConnect();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing unused magic links for this email
  await MagicLink.deleteMany({ email: email.toLowerCase(), used: false });

  // Create new magic link
  const magicLink = await MagicLink.create({
    email: email.toLowerCase(),
    token,
    expiresAt,
    used: false,
  });

  return {
    token: magicLink.token,
    expiresAt: magicLink.expiresAt,
  };
}

/**
 * Verify a magic link token and return the user
 * @param {string} token - Magic link token
 * @returns {Promise<User|null>}
 */
export async function verifyMagicLink(token) {
  await dbConnect();

  // Find the magic link
  const magicLink = await MagicLink.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!magicLink) {
    return null;
  }

  // Mark as used
  magicLink.used = true;
  await magicLink.save();

  // Find or create user
  let user = await User.findOne({ email: magicLink.email });

  if (!user) {
    // Create new user if doesn't exist (shouldn't happen in production)
    // In production, users should be created by admin first
    return null;
  }

  return user;
}
