/**
 * Browser-side wrapper around the app's own API.
 *
 * Centralises the response envelope so callers never have to reach into
 * `json.success` themselves, and gives one place to notice an expired session.
 */

import type { ApiEnvelope, ApiErrorCode } from '@/lib/http/types';

export class ApiRequestError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }

  /** True when the session is missing or expired and the user must sign in. */
  get isUnauthorized(): boolean {
    return this.code === 'unauthorized';
  }

  /** True when Google Drive has not been set up, which is an expected state. */
  get isNotConfigured(): boolean {
    return this.code === 'not_configured';
  }
}

/**
 * Performs a request and unwraps the envelope, throwing {@link ApiRequestError}
 * on any failure so callers can use ordinary try/catch.
 */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    // Session cookie is HttpOnly; same-origin credentials are required.
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!payload) {
    throw new ApiRequestError(
      'The server returned an unreadable response.',
      'internal_error',
      response.status
    );
  }

  if (!payload.success) {
    throw new ApiRequestError(payload.error, payload.code, response.status);
  }

  return payload.data;
}

export function apiPostJson<T>(input: string, body: unknown): Promise<T> {
  return apiFetch<T>(input, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
