/**
 * Fixed-window in-memory rate limiter.
 *
 * Deliberately process-local: it blunts brute-force and upload-spam from a
 * single client without adding infrastructure. On a horizontally scaled
 * deployment each instance keeps its own counters, so treat the effective limit
 * as `limit x instances` and move to a shared store if that ever matters.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Caps memory use if a flood of distinct keys arrives. */
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

function sweepExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweepExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter,
  };
}

/** Clears a key's window, e.g. after a successful login. */
export function resetRateLimit(key: string): void {
  windows.delete(key);
}

/**
 * Best-effort client identity for rate limiting.
 *
 * Proxy headers are spoofable, so this is an abuse-throttling signal only and
 * must never be used for authorization.
 */
export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
