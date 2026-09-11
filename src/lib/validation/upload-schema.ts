/**
 * Upload constraints for `POST /api/upload`.
 *
 * The browser-supplied `file.type` and `file.name` are attacker-controlled, so
 * the real check is the magic-byte sniff below. The declared MIME type is only
 * used to reject obviously wrong requests early.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

function matchesAscii(bytes: Uint8Array, offset: number, text: string): boolean {
  if (bytes.length < offset + text.length) return false;
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * Identifies an image from its leading bytes, ignoring the declared type.
 *
 * Returns null for anything unrecognised, which includes HTML, SVG and scripts
 * that a browser might otherwise render from the Drive CDN origin.
 */
export function sniffImageMimeType(
  bytes: Uint8Array
): AllowedImageMimeType | null {
  // JPEG: FF D8 FF
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  // GIF: "GIF87a" / "GIF89a"
  if (matchesAscii(bytes, 0, 'GIF87a') || matchesAscii(bytes, 0, 'GIF89a')) {
    return 'image/gif';
  }

  // RIFF container: "RIFF" .... "WEBP"
  if (matchesAscii(bytes, 0, 'RIFF') && matchesAscii(bytes, 8, 'WEBP')) {
    return 'image/webp';
  }

  // ISO-BMFF container: "....ftyp" with an AVIF brand.
  if (matchesAscii(bytes, 4, 'ftyp')) {
    if (
      matchesAscii(bytes, 8, 'avif') ||
      matchesAscii(bytes, 8, 'avis') ||
      matchesAscii(bytes, 8, 'mif1')
    ) {
      return 'image/avif';
    }
  }

  return null;
}

/**
 * Reduces a client filename to a safe, bounded basename.
 *
 * Strips directory separators and traversal sequences so the name cannot
 * influence where the file lands, and collapses everything outside a small
 * allowlist to underscores.
 */
export function sanitizeFileName(
  rawName: string | undefined,
  mimeType: AllowedImageMimeType
): string {
  const extension = mimeType.split('/')[1] ?? 'jpg';
  const fallback = `photo.${extension}`;

  if (typeof rawName !== 'string' || rawName.trim().length === 0) {
    return fallback;
  }

  // Keep only the final path segment, then drop anything unusual.
  const baseName = rawName.split(/[\\/]/).pop() ?? '';
  const cleaned = baseName
    .replace(/\.\./g, '_')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^[._]+/, '')
    .slice(0, 100);

  if (cleaned.length === 0) return fallback;
  return /\.[A-Za-z0-9]{2,5}$/.test(cleaned)
    ? cleaned
    : `${cleaned}.${extension}`;
}
