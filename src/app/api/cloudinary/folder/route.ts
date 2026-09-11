import type { NextRequest } from 'next/server';

import { isAuthenticated } from '@/lib/auth/guard';
import { getClientKey, rateLimit } from '@/lib/auth/rate-limit';
import {
  createCloudinaryFolder,
  isCloudinaryConfigured,
  resolveDateCloudinaryFolder,
} from '@/lib/cloudinary/client';
import { apiError, apiInternalError, apiSuccess } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FOLDER_LIMIT = 20;
const FOLDER_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return apiError('unauthorized', 'Sign in to create folders.');
    }

    const limit = rateLimit(
      `cloudinary-folder:${getClientKey(request)}`,
      FOLDER_LIMIT,
      FOLDER_WINDOW_MS
    );
    if (!limit.allowed) {
      return apiError('rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(limit.retryAfter),
      });
    }

    if (!isCloudinaryConfigured()) {
      return apiError(
        'not_configured',
        'Cloudinary is not configured in environment variables.'
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      folderName?: string;
      dateTitle?: string;
    };

    const target = body.folderName?.trim() || body.dateTitle?.trim();
    if (!target) {
      return apiError('bad_request', 'A folder name or date title is required.');
    }

    const resolvedFolder = resolveDateCloudinaryFolder(target);
    const result = await createCloudinaryFolder(resolvedFolder);

    return apiSuccess({
      success: true,
      folder: result.path,
    });
  } catch (cause) {
    return apiInternalError('api/cloudinary/folder', cause);
  }
}
