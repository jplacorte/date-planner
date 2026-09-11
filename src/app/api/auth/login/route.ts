import type { NextRequest } from 'next/server';

import { getAppPasscode, getAuthSecret, env } from '@/lib/env/server';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  sessionCookieOptions,
  verifyPasscode,
} from '@/lib/auth/session';
import { getClientKey, rateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';

/** Brute-force budget: 5 attempts per IP per 15 minutes. */
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const passcode = getAppPasscode();
    const secret = getAuthSecret();

    if (!passcode || !secret) {
      return apiError(
        'not_configured',
        'This deployment has no passcode configured.'
      );
    }

    const clientKey = `login:${getClientKey(request)}`;
    const limit = rateLimit(clientKey, ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS);
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many attempts. Try again later.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    const body: unknown = await request.json().catch(() => null);
    const candidate =
      typeof body === 'object' && body !== null
        ? (body as { passcode?: unknown }).passcode
        : undefined;

    if (typeof candidate !== 'string' || candidate.length === 0) {
      return apiError('bad_request', 'Enter your passcode.');
    }

    // Cap the compared length so an oversized body cannot be used to burn CPU.
    const isValid = await verifyPasscode(candidate.slice(0, 256), passcode);
    if (!isValid) {
      return apiError('unauthorized', 'That passcode is not correct.');
    }

    resetRateLimit(clientKey);

    const response = apiSuccess({ authenticated: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      await createSessionToken(secret),
      sessionCookieOptions(env.isProduction)
    );
    return response;
  } catch (cause) {
    return apiInternalError('auth/login', cause);
  }
}
