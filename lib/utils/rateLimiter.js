// Production-ready rate limiter using Upstash Redis
// Falls back to in-memory for local development

import { Redis } from '@upstash/redis';

// Initialize Redis client (only in production with credentials)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory fallback for development
const rateLimitMap = new Map();

/**
 * Rate limiter to prevent abuse
 * Uses Redis in production, in-memory for development
 * @param {string} identifier - Unique identifier (IP, email, etc.)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{allowed: boolean, headers: object}>} - Rate limit result with headers
 */
export async function rateLimit(identifier, limit = 10, windowMs = 60000) {
  // Use Redis if available (production), otherwise fall back to in-memory (development)
  if (redis) {
    return await rateLimitRedis(identifier, limit, windowMs);
  } else {
    return rateLimitInMemory(identifier, limit, windowMs);
  }
}

/**
 * Redis-based rate limiter (production)
 */
async function rateLimitRedis(identifier, limit, windowMs) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Use Redis sorted set for sliding window rate limiting
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiry on the key
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const count = results[1]; // Count from zcard command

    const remaining = Math.max(0, limit - count);
    const resetTime = now + windowMs;
    const allowed = count < limit;

    // Generate rate limit headers
    const headers = {
      'RateLimit-Limit': limit.toString(),
      'RateLimit-Remaining': remaining.toString(),
      'RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    };

    if (!allowed) {
      headers['Retry-After'] = Math.ceil(windowMs / 1000).toString();
    }

    return { allowed, headers };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fall back to allowing the request if Redis fails
    return {
      allowed: true,
      headers: {
        'RateLimit-Limit': limit.toString(),
        'RateLimit-Remaining': limit.toString(),
        'RateLimit-Reset': Math.ceil((Date.now() + windowMs) / 1000).toString(),
      }
    };
  }
}

/**
 * In-memory rate limiter (development fallback)
 */
function rateLimitInMemory(identifier, limit, windowMs) {
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
  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const count = await redis.zcard(key);
      const ttl = await redis.ttl(key);

      return {
        remaining: Math.max(0, limit - count),
        resetTime: ttl > 0 ? Date.now() + (ttl * 1000) : null,
      };
    } catch (error) {
      console.error('Redis get rate limit info error:', error);
      return { remaining: limit, resetTime: null };
    }
  } else {
    // In-memory fallback
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
}

/**
 * Clean up old entries (only for in-memory mode)
 */
export function cleanupRateLimiter() {
  if (!redis) {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime + 60000) { // 1 minute after reset
        rateLimitMap.delete(key);
      }
    }
  }
}

// Cleanup every 5 minutes (only in in-memory mode)
if (typeof setInterval !== 'undefined' && !redis) {
  setInterval(cleanupRateLimiter, 5 * 60 * 1000);
}
