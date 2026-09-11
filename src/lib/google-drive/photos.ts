import 'server-only';
import { Readable } from 'node:stream';

import { getDriveContext, folderScopedQuery } from '@/lib/google-drive/client';
import type { AllowedImageMimeType } from '@/lib/validation/upload-schema';

export interface DrivePhoto {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  createdTime?: string;
}

export interface UploadedPhoto {
  url: string;
  fileId: string;
}

/** Drive file IDs are opaque URL-safe tokens; anything else is not one. */
const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,128}$/;

function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

/**
 * Builds the public CDN URL for a Drive image.
 *
 * The ID is validated first so a malformed value from the API cannot be
 * concatenated into a URL that points somewhere else.
 */
function toCdnUrl(fileId: string): string | null {
  return DRIVE_FILE_ID_PATTERN.test(fileId)
    ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`
    : null;
}

function toThumbnailUrl(fileId: string): string | null {
  return DRIVE_FILE_ID_PATTERN.test(fileId)
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w400`
    : null;
}

/**
 * Uploads an already-validated image buffer and makes it link-readable.
 *
 * The caller is responsible for size and content-type validation; this
 * function trusts `mimeType` because it comes from the magic-byte sniff rather
 * than from the request.
 */
export async function uploadPhoto(
  buffer: Buffer,
  fileName: string,
  mimeType: AllowedImageMimeType
): Promise<UploadedPhoto | null> {
  const context = getDriveContext();
  if (!context) return null;

  const created = await context.drive.files.create({
    requestBody: {
      name: `date_${Date.now()}_${fileName}`,
      parents: [context.folderId],
    },
    media: { mimeType, body: bufferToStream(buffer) },
    fields: 'id',
    supportsAllDrives: true,
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error('Drive did not return a file ID for the uploaded photo.');
  }

  const url = toCdnUrl(fileId);
  if (!url) {
    throw new Error('Drive returned a file ID in an unexpected format.');
  }

  // The app renders these straight from the CDN, so the file must be readable
  // without credentials. This is intentionally public-by-link.
  try {
    await context.drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });
  } catch (cause) {
    // Shared drives may forbid link sharing. The upload itself succeeded, so
    // surface the file and let the caller decide.
    console.warn('[drive] could not make uploaded photo link-readable', cause);
  }

  return { url, fileId };
}

/** Lists images in the configured folder, newest first. */
export async function listPhotos(limit = 50): Promise<DrivePhoto[] | null> {
  const context = getDriveContext();
  if (!context) return null;

  const response = await context.drive.files.list({
    q: folderScopedQuery(context.folderId, "mimeType contains 'image/'"),
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
    pageSize: Math.min(Math.max(limit, 1), 100),
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const photos: DrivePhoto[] = [];
  for (const file of response.data.files ?? []) {
    const fileId = file.id;
    if (!fileId) continue;

    const url = toCdnUrl(fileId);
    const thumbnailUrl = toThumbnailUrl(fileId);
    if (!url || !thumbnailUrl) continue;

    photos.push({
      id: fileId,
      name: file.name ?? 'Photo',
      url,
      thumbnailUrl,
      createdTime: file.createdTime ?? undefined,
    });
  }

  return photos;
}
