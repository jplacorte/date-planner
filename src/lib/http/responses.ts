import { NextResponse } from 'next/server';

import type { ApiErrorCode, ApiFailure, ApiSuccess } from '@/lib/http/types';

/**
 * Uniform API envelopes.
 *
 * Client-facing errors are always caller-supplied strings. Raw exception
 * messages stay server-side, where they can name internal paths, credential
 * state, or upstream Google errors.
 */

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  payload_too_large: 413,
  unsupported_media_type: 415,
  rate_limited: 429,
  not_configured: 503,
  internal_error: 500,
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

export function apiError(
  code: ApiErrorCode,
  error: string,
  headers?: HeadersInit
) {
  return NextResponse.json<ApiFailure>(
    { success: false, error, code },
    { status: STATUS_BY_CODE[code], headers }
  );
}

/**
 * Logs the real cause server-side and returns a generic message.
 *
 * Use this for every unexpected throw so upstream error text never reaches the
 * browser.
 */
export function apiInternalError(context: string, cause: unknown) {
  console.error(`[${context}]`, cause);
  return apiError(
    'internal_error',
    'Something went wrong. Please try again in a moment.'
  );
}
