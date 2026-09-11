import { compressImageFile } from '@/lib/media/image';
import { ApiRequestError, apiFetch } from '@/lib/http/api-client';

export interface UploadResponse {
  url: string;
  source: 'google_drive' | 'cloudinary' | 'local_storage';
  fileId?: string;
}

export interface UploadOptions {
  folder?: string;
  dateTitle?: string;
}

/** Mirrors the server-side cap so oversized files fail before the round trip. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Uploads an image, preferring Cloudinary / Google Drive and falling back
 * to a locally compressed data URL.
 */
export async function uploadImageFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResponse> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is larger than 10 MB.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.dateTitle) {
      formData.append('dateTitle', options.dateTitle);
    }

    const result = await apiFetch<{ url: string; fileId: string }>(
      '/api/upload',
      { method: 'POST', body: formData }
    );

    const isCloudinary = result.url.includes('cloudinary.com');

    return {
      url: result.url,
      source: isCloudinary ? 'cloudinary' : 'google_drive',
      fileId: result.fileId,
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) {
      throw error;
    }
    console.warn('Cloud storage upload unavailable, storing locally instead:', error);
  }

  return {
    url: await compressImageFile(file, 1200, 1200, 0.85),
    source: 'local_storage',
  };
}

/**
 * Explicitly creates or verifies a folder in Cloudinary for an individual date.
 */
export async function createCloudinaryDateFolder(
  folderName: string,
  dateTitle?: string
): Promise<{ success: boolean; folder: string }> {
  return apiFetch<{ success: boolean; folder: string }>(
    '/api/cloudinary/folder',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName, dateTitle }),
    }
  );
}
