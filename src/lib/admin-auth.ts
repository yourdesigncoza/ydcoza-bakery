import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Access control for the bakery's order board.
 *
 * A single shared password is enough for one small studio; the point is that
 * customer details are not readable by anyone who finds the URL. The session
 * is an HMAC-signed cookie, so it cannot be forged without the secret.
 */

const COOKIE = "bb_staff";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  // Falls back to the password so a deployment that sets only ADMIN_PASSWORD
  // still gets unforgeable sessions rather than silently accepting anything.
  const value = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not configured");
  return value;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", secret()).update(String(expiresAt)).digest("hex");
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** True when the supplied password matches the configured one. */
export function passwordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return equals(candidate, expected);
}

export async function startSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const store = await cookies();
  store.set(COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Whether the current request carries a valid, unexpired staff session. */
export async function isSignedIn(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;

  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const [expiry, provided] = raw.split(".");
  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  try {
    return equals(provided ?? "", sign(expiresAt));
  } catch {
    return false;
  }
}
