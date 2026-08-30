import { compressImageFile } from './image';

export interface UploadResponse {
  url: string;
  source: 'google_drive' | 'local_storage';
  fileId?: string;
}

/**
 * Uploads an image file:
 * 1. Sends to /api/upload to upload directly to Google Drive folder.
 * 2. If Google Drive is configured, returns the permanent Google Drive CDN photo URL.
 * 3. If credentials are not yet configured, compresses locally as fallback data URL.
 */
export async function uploadImageFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          source: 'google_drive',
          fileId: data.fileId,
        };
      }
    }
  } catch (error) {
    console.warn('Google Drive API upload failed, falling back to local storage:', error);
  }

  // Fallback to local high-quality compressed image
  const localUrl = await compressImageFile(file, 1200, 1200, 0.85);
  return {
    url: localUrl,
    source: 'local_storage',
  };
}
