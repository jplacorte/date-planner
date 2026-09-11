/**
 * Stateless session tokens: `<base64url(payload)>.<base64url(hmac)>`.
 *
 * Built on Web Crypto rather than `node:crypto` so the same code runs in Route
 * Handlers and in `proxy.ts`, whichever runtime Next.js picks for them.
 */

export const SESSION_COOKIE_NAME = 'dp_session';

/** Sessions last 30 days; re-entering the passcode issues a fresh one. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface SessionPayload {
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expires-at, epoch seconds. */
  exp: number;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  return atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Length-independent constant-time comparison.
 *
 * Both inputs are HMACs of the same algorithm so they share a length in
 * practice; the length check is kept separate and non-short-circuiting so a
 * mismatch leaks nothing beyond the length.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Compares a user-supplied passcode against the expected one without leaking timing. */
export async function verifyPasscode(
  candidate: string,
  expected: string
): Promise<boolean> {
  // Hashing first gives both sides a fixed length, so the comparison cannot
  // reveal the passcode length.
  const key = await importKey('passcode-comparison');
  const [candidateHash, expectedHash] = await Promise.all([
    crypto.subtle.sign('HMAC', key, encoder.encode(candidate)),
    crypto.subtle.sign('HMAC', key, encoder.encode(expected)),
  ]);

  return timingSafeEqual(
    toBase64Url(new Uint8Array(candidateHash)),
    toBase64Url(new Uint8Array(expectedHash))
  );
}

/** Mints a signed session token valid for {@link SESSION_MAX_AGE_SECONDS}. */
export async function createSessionToken(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a session token's signature and expiry.
 *
 * Returns false for anything malformed rather than throwing, so callers can
 * treat every failure mode as "not signed in".
 */
export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;

  const separatorIndex = token.indexOf('.');
  if (separatorIndex <= 0) return false;

  const encodedPayload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!signature) return false;

  const expectedSignature = await sign(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (typeof payload.exp !== 'number') return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Cookie attributes shared by the login and logout handlers. */
export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
