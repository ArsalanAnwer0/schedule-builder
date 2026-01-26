// In-memory rate limiter for production
// Simple and reliable - no external dependencies

const rateLimitMap = new Map();

/**
 * Rate limiter to prevent abuse
 * Uses in-memory storage with sliding window
 * @param {string} identifier - Unique identifier (IP, email, etc.)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{allowed: boolean, headers: object}>} - Rate limit result with headers
 */
export async function rateLimit(identifier, limit = 10, windowMs = 60000) {
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
  const allowed = rateLimitEntry.count < limit;
  const remaining = Math.max(0, limit - rateLimitEntry.count);

  // Generate rate limit headers
  const headers = {
    'RateLimit-Limit': limit.toString(),
    'RateLimit-Remaining': remaining.toString(),
    'RateLimit-Reset': Math.ceil(rateLimitEntry.resetTime / 1000).toString(),
  };

  if (!allowed) {
    headers['Retry-After'] = Math.ceil((rateLimitEntry.resetTime - now) / 1000).toString();
  } else {
    // Increment count only if allowed
    rateLimitEntry.count++;
  }

  return { allowed, headers };
}

/**
 * Get rate limit info for an identifier
 * @param {string} identifier - Unique identifier
 * @param {number} limit - Max requests allowed
 * @returns {Promise<object>} - Rate limit info
 */
export async function getRateLimitInfo(identifier, limit = 10) {
  const rateLimitEntry = rateLimitMap.get(identifier);

  if (!rateLimitEntry) {
    return { remaining: limit, resetTime: null };
  }

  const now = Date.now();
  if (now > rateLimitEntry.resetTime) {
    return { remaining: limit, resetTime: null };
  }

  return {
    remaining: Math.max(0, limit - rateLimitEntry.count),
    resetTime: rateLimitEntry.resetTime,
  };
}

/**
 * Clean up old entries to prevent memory leaks
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
