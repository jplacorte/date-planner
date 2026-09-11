import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

import { getCloudinaryCredentials } from '@/lib/env/server';

export interface UploadedMedia {
  url: string;
  fileId: string;
}

export const ROOT_CLOUDINARY_FOLDER = 'Date-planner';

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
 * Sanitizes a date title or user input to be a safe Cloudinary folder name.
 */
export function sanitizeCloudinaryFolderName(name: string): string {
  if (!name || typeof name !== 'string') return 'General';
  const cleaned = name
    .trim()
    .replace(/[/\\?%*:|"<>#&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned ? cleaned.slice(0, 100) : 'General';
}

/**
 * Resolves a date's Cloudinary folder path, always rooted under `Date-planner`.
 * E.g. 'Candlelight Dinner' -> 'Date-planner/Candlelight Dinner'
 */
export function resolveDateCloudinaryFolder(
  dateTitleOrFolder?: string,
  customFolder?: string
): string {
  const target = customFolder?.trim() || dateTitleOrFolder?.trim();
  if (!target) return ROOT_CLOUDINARY_FOLDER;

  // Strip leading 'Date-planner/' or slashes if passed
  const stripped = target
    .replace(new RegExp(`^${ROOT_CLOUDINARY_FOLDER}\\/?`, 'i'), '')
    .replace(/^\/+/, '');

  if (!stripped) return ROOT_CLOUDINARY_FOLDER;

  const sanitized = sanitizeCloudinaryFolderName(stripped);
  return `${ROOT_CLOUDINARY_FOLDER}/${sanitized}`;
}

/**
 * Creates a folder in Cloudinary (e.g. 'Date-planner/Sunset Picnic').
 * If the folder already exists, Cloudinary considers it successful.
 */
export async function createCloudinaryFolder(
  folderPath: string
): Promise<{ success: boolean; path: string }> {
  const client = configureCloudinary();
  if (!client) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const normalizedPath = folderPath.startsWith(ROOT_CLOUDINARY_FOLDER)
    ? folderPath
    : resolveDateCloudinaryFolder(folderPath);

  try {
    const result = await client.api.create_folder(normalizedPath);
    return { success: true, path: result?.path || normalizedPath };
  } catch (error: unknown) {
    const err = error as {
      error?: { message?: string; http_code?: number };
      message?: string;
    };
    const message = err?.error?.message || err?.message || '';
    if (/already exists/i.test(message)) {
      return { success: true, path: normalizedPath };
    }
    throw new Error(message || 'Failed to create Cloudinary folder.');
  }
}

/**
 * Uploads an image buffer to Cloudinary and returns its secure CDN URL and public ID.
 * Automatically organizes under Date-planner/<folder> and applies quality optimization.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder?: string
): Promise<UploadedMedia> {
  const client = configureCloudinary();
  if (!client) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const targetFolder = folder
    ? resolveDateCloudinaryFolder(folder)
    : ROOT_CLOUDINARY_FOLDER;

  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${Date.now()}_${baseName}`;

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: targetFolder,
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

export interface CloudinaryPhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  folder?: string;
  createdAt: string;
}

/**
 * Lists images stored in Cloudinary under the Date-planner folder (or account).
 */
export async function listCloudinaryPhotos(
  folder?: string
): Promise<{ photos: CloudinaryPhoto[]; total: number; cloudName: string }> {
  const client = configureCloudinary();
  const creds = getCloudinaryCredentials();
  if (!client || !creds) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const searchFolder = folder
    ? resolveDateCloudinaryFolder(folder)
    : ROOT_CLOUDINARY_FOLDER;

  try {
    // 1. Try listing with prefix for the Date-planner folder
    let res = await client.api.resources({
      type: 'upload',
      prefix: searchFolder,
      max_results: 60,
      resource_type: 'image',
    });

    // 2. Fall back to recent uploads if folder is empty or not yet populated
    if (!res.resources || res.resources.length === 0) {
      res = await client.api.resources({
        type: 'upload',
        max_results: 60,
        resource_type: 'image',
      });
    }

    const resources = res.resources || [];
    const photos: CloudinaryPhoto[] = resources.map(
      (item: {
        public_id: string;
        secure_url: string;
        asset_folder?: string;
        folder?: string;
        created_at: string;
      }) => {
        const publicId = item.public_id;
        const cleanName = publicId.split('/').pop() || publicId;
        const thumbnailUrl = client.url(publicId, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
          secure: true,
        });

        return {
          id: publicId,
          name: cleanName,
          url: item.secure_url,
          thumbnailUrl,
          folder: item.asset_folder || item.folder,
          createdAt: item.created_at,
        };
      }
    );

    return {
      photos,
      total: photos.length,
      cloudName: creds.cloudName,
    };
  } catch (error: unknown) {
    const err = error as {
      error?: { message?: string };
      message?: string;
    };
    throw new Error(
      err?.error?.message || err?.message || 'Failed to list Cloudinary photos.'
    );
  }
}

