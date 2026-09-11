import type { CoupleProfile, DateIdea } from '@/types/date';
import { dateStore } from '@/lib/storage/date-store';
import { ApiRequestError, apiFetch, apiPostJson } from '@/lib/http/api-client';

/**
 * Client half of Google Drive sync.
 *
 * A module-level singleton rather than React state, because sync is triggered
 * from several unrelated places and must never run twice concurrently.
 */

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export type SyncListener = (
  status: SyncStatus,
  lastSynced?: Date,
  errorMessage?: string
) => void;

interface SyncReadResult {
  exists: boolean;
  data: { dates: DateIdea[]; coupleProfile: CoupleProfile | null } | null;
  modifiedTime?: string;
}

let isSyncing = false;
let listeners: SyncListener[] = [];
let currentStatus: SyncStatus = 'idle';
let lastSyncedAt: Date | undefined;
let lastError: string | undefined;

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  listeners.push(listener);
  listener(currentStatus, lastSyncedAt, lastError);
  return () => {
    listeners = listeners.filter((candidate) => candidate !== listener);
  };
}

function publish(status: SyncStatus, errorMessage?: string): void {
  currentStatus = status;
  lastError = errorMessage;
  if (status === 'synced') lastSyncedAt = new Date();
  for (const listener of listeners) {
    listener(currentStatus, lastSyncedAt, lastError);
  }
}

/**
 * Converts a thrown value into a message safe to show the user.
 *
 * Server-side detail never reaches here; `ApiRequestError` already carries a
 * curated message chosen by the route handler.
 */
function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) return error.message;
  return fallback;
}

/** Pulls dates and profile from Drive into the local store. */
export async function pullFromGoogleDrive(): Promise<boolean> {
  if (isSyncing) return false;

  isSyncing = true;
  publish('syncing');

  try {
    const result = await apiFetch<SyncReadResult>('/api/drive/sync');

    if (!result.exists || !result.data) {
      publish('idle');
      return false;
    }

    if (Array.isArray(result.data.dates)) {
      dateStore.setDates(result.data.dates);
    }
    if (result.data.coupleProfile) {
      dateStore.setProfile(result.data.coupleProfile);
    }

    publish('synced');
    return true;
  } catch (error) {
    console.error('Failed to pull from Google Drive:', error);
    publish('error', toUserMessage(error, 'Could not load from Google Drive.'));
    return false;
  } finally {
    isSyncing = false;
  }
}

/** Pushes the current local dates and profile to Drive. */
export async function pushToGoogleDrive(
  dates?: DateIdea[],
  coupleProfile?: CoupleProfile
): Promise<boolean> {
  if (isSyncing) return false;

  isSyncing = true;
  publish('syncing');

  try {
    await apiPostJson<{ lastUpdated: string; dateCount: number }>(
      '/api/drive/sync',
      {
        dates: dates ?? dateStore.getDates(),
        coupleProfile: coupleProfile ?? dateStore.getProfile(),
      }
    );

    publish('synced');
    return true;
  } catch (error) {
    console.error('Failed to push to Google Drive:', error);
    publish('error', toUserMessage(error, 'Could not save to Google Drive.'));
    return false;
  } finally {
    isSyncing = false;
  }
}
