/**
 * Shared API vocabulary.
 *
 * Deliberately free of imports so both the server handlers and the browser
 * client can use it without pulling `next/server` into the client bundle.
 */

export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'rate_limited'
  | 'not_configured'
  | 'internal_error';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
  code: ApiErrorCode;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
