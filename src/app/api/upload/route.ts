import type { NextRequest } from 'next/server';

import { isAuthenticated } from '@/lib/auth/guard';
import { getClientKey, rateLimit } from '@/lib/auth/rate-limit';
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
} from '@/lib/cloudinary/client';
import { uploadPhoto } from '@/lib/google-drive/photos';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  sanitizeFileName,
  sniffImageMimeType,
} from '@/lib/validation/upload-schema';

/** 30 uploads per IP per 5 minutes. */
const UPLOAD_LIMIT = 30;
const UPLOAD_WINDOW_MS = 5 * 60 * 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to upload photos.');
    }

    const limit = rateLimit(
      `upload:${getClientKey(request)}`,
      UPLOAD_LIMIT,
      UPLOAD_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many uploads. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    // Reject oversized bodies from the declared length before buffering them.
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES) {
      return apiError('payload_too_large', 'That image is larger than 10 MB.');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return apiError('bad_request', 'No image was provided.');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return apiError('payload_too_large', 'That image is larger than 10 MB.');
    }

    if (
      file.type &&
      !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
    ) {
      return apiError(
        'unsupported_media_type',
        'Only JPEG, PNG, WebP, GIF and AVIF images are supported.'
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // The declared type is attacker-controlled; the leading bytes decide.
    const sniffedType = sniffImageMimeType(buffer);
    if (!sniffedType) {
      return apiError(
        'unsupported_media_type',
        'That file is not a recognised image.'
      );
    }

    const sanitizedName = sanitizeFileName(file.name, sniffedType);

    // Prefer Cloudinary if configured; fall back to Google Drive
    if (isCloudinaryConfigured()) {
      const cloudinaryResult = await uploadToCloudinary(buffer, sanitizedName);
      return apiSuccess(cloudinaryResult);
    }

    const uploaded = await uploadPhoto(
      buffer,
      sanitizedName,
      sniffedType
    );

    if (!uploaded) {
      return apiError(
        'not_configured',
        'Cloud storage is not configured, so the photo was kept on this device.'
      );
    }

    return apiSuccess(uploaded);
  } catch (cause) {
    return apiInternalError('api/upload', cause);
  }
}
