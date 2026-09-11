import type { NextRequest } from 'next/server';

import { isAuthenticated } from '@/lib/auth/guard';
import { getClientKey, rateLimit } from '@/lib/auth/rate-limit';
import {
  isQuotaConfigurationError,
  readDatabase,
  writeDatabase,
} from '@/lib/google-drive/database';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';
import { LIMITS, parseSyncPayload } from '@/lib/validation/date-schema';

const SYNC_LIMIT = 60;
const SYNC_WINDOW_MS = 60 * 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to load your dates.');
    }

    const limit = rateLimit(
      `sync-read:${getClientKey(request)}`,
      SYNC_LIMIT,
      SYNC_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    const result = await readDatabase();
    if (result === null) {
      return apiError('not_configured', 'Google Drive is not configured.');
    }

    return apiSuccess(result);
  } catch (cause) {
    return apiInternalError('api/drive/sync GET', cause);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to save your dates.');
    }

    const limit = rateLimit(
      `sync-write:${getClientKey(request)}`,
      SYNC_LIMIT,
      SYNC_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (
      Number.isFinite(declaredLength) &&
      declaredLength > LIMITS.maxPayloadBytes
    ) {
      return apiError('payload_too_large', 'That is too much data to sync.');
    }

    const rawBody = await request.text();
    if (rawBody.length > LIMITS.maxPayloadBytes) {
      return apiError('payload_too_large', 'That is too much data to sync.');
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return apiError('bad_request', 'The request body was not valid JSON.');
    }

    // Everything written to Drive goes through the sanitiser first.
    const stored = await writeDatabase(parseSyncPayload(body));
    if (stored === null) {
      return apiError('not_configured', 'Google Drive is not configured.');
    }

    return apiSuccess({
      lastUpdated: stored.lastUpdated,
      dateCount: stored.dates.length,
    });
  } catch (cause) {
    if (isQuotaConfigurationError(cause)) {
      console.warn('[api/drive/sync POST] service account has no quota');
      return apiError(
        'not_configured',
        'Create a blank file named "dates_database.json" in your Drive folder, ' +
          'or connect OAuth, so this account can save your dates.'
      );
    }
    return apiInternalError('api/drive/sync POST', cause);
  }
}
