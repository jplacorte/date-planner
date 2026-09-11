import { compressImageFile } from '@/lib/media/image';
import { ApiRequestError, apiFetch } from '@/lib/http/api-client';

export interface UploadResponse {
  url: string;
  source: 'google_drive' | 'local_storage';
  fileId?: string;
}

/** Mirrors the server-side cap so oversized files fail before the round trip. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Uploads an image, preferring permanent Google Drive storage and falling back
 * to a locally compressed data URL.
 *
 * The fallback is deliberate: Drive may be unconfigured, and a date's photos
 * should still work offline. An expired session is re-thrown instead, so the
 * caller can prompt for the passcode rather than silently degrading.
 */
export async function uploadImageFile(file: File): Promise<UploadResponse> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is larger than 10 MB.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const result = await apiFetch<{ url: string; fileId: string }>(
      '/api/upload',
      { method: 'POST', body: formData }
    );

    return { url: result.url, source: 'google_drive', fileId: result.fileId };
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      throw error;
    }
    console.warn('Drive upload unavailable, storing locally instead:', error);
  }

  return {
    url: await compressImageFile(file, 1200, 1200, 0.85),
    source: 'local_storage',
  };
}
