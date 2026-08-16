/**
 * Best-effort request throttling for the paid preview endpoint.
 *
 * This is per-instance rather than global — a serverless deployment may run
 * several instances, so a determined caller could get a multiple of the limit.
 * It exists to stop casual hammering; the real cost control is the preview
 * cache, which makes repeat designs free.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may try again. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    retryAfter: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Identify the caller, preferring the client IP the platform reports. */
export function callerKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "anonymous";
}

/** Drop expired windows so the map cannot grow without bound. */
export function sweep(): void {
  const now = Date.now();
  for (const [key, window] of windows) {
    if (now >= window.resetAt) windows.delete(key);
  }
}
