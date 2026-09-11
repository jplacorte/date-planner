import 'server-only';
import { google, type drive_v3 } from 'googleapis';

import { getDriveCredentials, getDriveFolderId } from '@/lib/env/server';

/**
 * Single place where a Drive client is constructed.
 *
 * Previously three route handlers each built their own client with subtly
 * different scopes; consolidating them keeps the granted scope consistent and
 * auditable.
 */

/**
 * Full `drive` scope is required because the app both writes photos and
 * rewrites the database file. `drive.file` would be tighter but only grants
 * access to files this app created, which breaks syncing to a pre-existing
 * folder the user shared manually.
 */
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

export interface DriveContext {
  drive: drive_v3.Drive;
  folderId: string;
}

let cachedDrive: drive_v3.Drive | null = null;

function buildDriveClient(): drive_v3.Drive | null {
  const credentials = getDriveCredentials();
  if (!credentials) return null;

  if (credentials.kind === 'oauth') {
    const oauth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret
    );
    oauth2Client.setCredentials({ refresh_token: credentials.refreshToken });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  const auth = new google.auth.JWT({
    email: credentials.clientEmail,
    key: credentials.privateKey,
    scopes: DRIVE_SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Returns a Drive client and the target folder, or null when Drive is not
 * configured. Callers surface that as a `not_configured` response rather than
 * an error, since running without Drive is a supported mode.
 */
export function getDriveContext(): DriveContext | null {
  const folderId = getDriveFolderId();
  if (!folderId) return null;

  if (!cachedDrive) {
    cachedDrive = buildDriveClient();
  }
  if (!cachedDrive) return null;

  return { drive: cachedDrive, folderId };
}

/**
 * Escapes a value for interpolation into a Drive `q` search string.
 *
 * Drive queries are a string language: an unescaped apostrophe closes the
 * literal and lets the rest of the value act as query syntax, which can widen
 * a listing beyond the intended folder. Backslash and apostrophe are the two
 * characters that matter.
 *
 * @see https://developers.google.com/drive/api/guides/search-files
 */
export function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Builds a `q` clause restricted to direct children of `folderId`. */
export function folderScopedQuery(
  folderId: string,
  ...clauses: string[]
): string {
  return [
    `'${escapeDriveQueryValue(folderId)}' in parents`,
    'trashed = false',
    ...clauses,
  ].join(' and ');
}
