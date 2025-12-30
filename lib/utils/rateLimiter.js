// Simple in-memory rate limiter
// For production, consider using Redis or Upstash

const rateLimitMap = new Map();

/**
 * Rate limiter to prevent abuse
 * @param {string} identifier - Unique identifier (IP, email, etc.)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if allowed, false if rate limited
 */
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  // Get or create rate limit entry
  let rateLimitEntry = rateLimitMap.get(key);

  if (!rateLimitEntry) {
    rateLimitEntry = {
      count: 0,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, rateLimitEntry);
  }

  // Reset if window expired
  if (now > rateLimitEntry.resetTime) {
    rateLimitEntry.count = 0;
    rateLimitEntry.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (rateLimitEntry.count >= limit) {
    return false;
  }

  // Increment count
  rateLimitEntry.count++;
  return true;
}

/**
 * Get rate limit info for an identifier
 * @param {string} identifier - Unique identifier
 * @returns {object} - Rate limit info
 */
export function getRateLimitInfo(identifier) {
  const rateLimitEntry = rateLimitMap.get(identifier);

  if (!rateLimitEntry) {
    return { remaining: Infinity, resetTime: null };
  }

  const now = Date.now();
  if (now > rateLimitEntry.resetTime) {
    return { remaining: Infinity, resetTime: null };
  }

  return {
    remaining: Math.max(0, 10 - rateLimitEntry.count),
    resetTime: rateLimitEntry.resetTime,
  };
}

/**
 * Clean up old entries (run periodically)
 */
export function cleanupRateLimiter() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime + 60000) { // 1 minute after reset
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiter, 5 * 60 * 1000);
}
