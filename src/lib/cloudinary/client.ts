import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

import { getCloudinaryCredentials } from '@/lib/env/server';

export interface UploadedMedia {
  url: string;
  fileId: string;
}

let isConfigured = false;

function configureCloudinary() {
  const creds = getCloudinaryCredentials();
  if (!creds) return null;

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });
    isConfigured = true;
  }

  return cloudinary;
}

/** Returns true when valid Cloudinary credentials are present in the environment. */
export function isCloudinaryConfigured(): boolean {
  return getCloudinaryCredentials() !== null;
}

/**
 * Uploads an image buffer to Cloudinary and returns its secure CDN URL and public ID.
 * Automatically applies auto-format (WebP/AVIF) and quality optimization.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder = 'date-checklist'
): Promise<UploadedMedia> {
  const client = configureCloudinary();
  if (!client) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${Date.now()}_${baseName}`;

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload returned no result.'));
          return;
        }

        resolve({
          url: result.secure_url,
          fileId: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
}
