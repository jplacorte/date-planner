import type { NextRequest } from 'next/server';

import { isAuthenticated } from '@/lib/auth/guard';
import { getClientKey, rateLimit } from '@/lib/auth/rate-limit';
import { getDriveContext } from '@/lib/google-drive/client';
import { listPhotos } from '@/lib/google-drive/photos';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';

const LIST_LIMIT = 60;
const LIST_WINDOW_MS = 60 * 1000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to browse your photos.');
    }

    const limit = rateLimit(
      `photos:${getClientKey(request)}`,
      LIST_LIMIT,
      LIST_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    const context = getDriveContext();
    if (!context) {
      return apiError('not_configured', 'Google Drive is not configured.');
    }

    const photos = await listPhotos();

    // The folder ID backs the "Open folder" link. It is only exposed to an
    // authenticated caller, who already owns the folder.
    return apiSuccess({ photos: photos ?? [], folderId: context.folderId });
  } catch (cause) {
    return apiInternalError('api/drive/photos', cause);
  }
}
