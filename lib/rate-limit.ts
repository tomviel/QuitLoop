/**
 * Simple in-memory rate limiter.
 * Works per-process — good enough for a single-instance / serverless environment
 * where cold starts automatically reset state.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   const { success } = limiter.check(ip);
 */

interface RateLimiterOptions {
  windowMs: number; // milliseconds
  max: number;       // max requests per window
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  const store = new Map<string, Entry>();

  // Periodically clean up stale entries to avoid memory leaks
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      store.forEach((entry, key) => {
        if (now > entry.resetAt) store.delete(key);
      });
    }, windowMs * 2);
  }

  return {
    check(key: string): { success: boolean; remaining: number; resetAt: number } {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return { success: true, remaining: max - 1, resetAt };
      }

      if (entry.count >= max) {
        return { success: false, remaining: 0, resetAt: entry.resetAt };
      }

      entry.count++;
      return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
    },
  };
}

// Pre-built limiters for common use-cases
export const aiLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });
export const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
export const authLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });
