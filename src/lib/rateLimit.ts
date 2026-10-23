interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (Edge and Node.js compatible)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Allow Node.js process to exit cleanly without waiting for this interval
  if (typeof (cleanup as any).unref === "function") {
    (cleanup as any).unref();
  }
}

/**
 * Validates request rate against specified threshold.
 * 
 * @param identifier Unique key (e.g., "login:ip:email")
 * @param limit Maximum allowed attempts within window
 * @param windowMs Time window in milliseconds (default: 15 minutes)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Resets rate limit counter for a specific identifier upon successful authentication.
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}
