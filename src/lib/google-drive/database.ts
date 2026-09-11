import 'server-only';
import { Readable } from 'node:stream';

import { getDriveContext, folderScopedQuery } from '@/lib/google-drive/client';
import {
  LIMITS,
  parseSyncPayload,
  type SyncPayload,
} from '@/lib/validation/date-schema';

/**
 * Read/write access to the single JSON file that backs cross-device sync.
 */

const DATABASE_FILENAME = 'dates_database.json';

/** Bumped when the stored shape changes in a non-additive way. */
const SCHEMA_VERSION = 3;

export interface StoredDatabase extends SyncPayload {
  version: number;
  lastUpdated: string;
}

export interface DatabaseReadResult {
  exists: boolean;
  data: SyncPayload | null;
  modifiedTime?: string;
}

async function findDatabaseFileId(): Promise<string | null> {
  const context = getDriveContext();
  if (!context) return null;

  const listed = await context.drive.files.list({
    q: folderScopedQuery(context.folderId, `name = '${DATABASE_FILENAME}'`),
    fields: 'files(id, modifiedTime)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return listed.data.files?.[0]?.id ?? null;
}

/**
 * Reads and re-validates the stored database.
 *
 * The file is validated on the way out as well as on the way in: it lives in a
 * Drive folder the user can edit by hand, so its contents are not trusted just
 * because this app wrote them once.
 */
export async function readDatabase(): Promise<DatabaseReadResult | null> {
  const context = getDriveContext();
  if (!context) return null;

  const listed = await context.drive.files.list({
    q: folderScopedQuery(context.folderId, `name = '${DATABASE_FILENAME}'`),
    fields: 'files(id, modifiedTime)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const file = listed.data.files?.[0];
  if (!file?.id) return { exists: false, data: null };

  const response = await context.drive.files.get(
    { fileId: file.id, alt: 'media', supportsAllDrives: true },
    { responseType: 'text' }
  );

  const raw = response.data;
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

  if (text.length > LIMITS.maxPayloadBytes) {
    throw new Error('Stored database file exceeds the maximum supported size.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      exists: true,
      data: null,
      modifiedTime: file.modifiedTime ?? undefined,
    };
  }

  return {
    exists: true,
    data: parseSyncPayload(parsed),
    modifiedTime: file.modifiedTime ?? undefined,
  };
}

/** Creates or overwrites the database file with an already-sanitised payload. */
export async function writeDatabase(
  payload: SyncPayload
): Promise<StoredDatabase | null> {
  const context = getDriveContext();
  if (!context) return null;

  const stored: StoredDatabase = {
    version: SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    dates: payload.dates,
    coupleProfile: payload.coupleProfile,
  };

  const body = Readable.from(JSON.stringify(stored, null, 2));
  const media = { mimeType: 'application/json', body };
  const existingFileId = await findDatabaseFileId();

  if (existingFileId) {
    await context.drive.files.update({
      fileId: existingFileId,
      media,
      supportsAllDrives: true,
    });
  } else {
    await context.drive.files.create({
      requestBody: { name: DATABASE_FILENAME, parents: [context.folderId] },
      media,
      fields: 'id',
      supportsAllDrives: true,
    });
  }

  return stored;
}

/**
 * Service accounts have no storage quota of their own, so creating a file
 * fails even when the folder is shared with them. Detect that specific case to
 * give an actionable message instead of the raw Google error.
 */
export function isQuotaConfigurationError(cause: unknown): boolean {
  const message = cause instanceof Error ? cause.message : String(cause);
  return message.includes('storage quota');
}
