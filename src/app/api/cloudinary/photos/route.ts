import type { NextRequest } from 'next/server';

import { isAuthenticated } from '@/lib/auth/guard';
import { getClientKey, rateLimit } from '@/lib/auth/rate-limit';
import {
  isCloudinaryConfigured,
  listCloudinaryPhotos,
} from '@/lib/cloudinary/client';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHOTOS_LIMIT = 60;
const PHOTOS_WINDOW_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to access photos.');
    }

    const limit = rateLimit(
      `cloudinary-photos:${getClientKey(request)}`,
      PHOTOS_LIMIT,
      PHOTOS_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    if (!isCloudinaryConfigured()) {
      return apiError(
        'not_configured',
        'Cloudinary credentials are not configured in environment variables.'
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;

    const result = await listCloudinaryPhotos(folder);

    return apiSuccess(result);
  } catch (cause) {
    return apiInternalError('api/cloudinary/photos', cause);
  }
}
