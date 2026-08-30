import { DateIdea, CoupleProfile } from '../types/date';
import { dateStore } from './dateStore';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

let isSyncing = false;
let syncListeners: ((status: SyncStatus, lastSynced?: Date, errorMsg?: string) => void)[] = [];
let currentStatus: SyncStatus = 'idle';
let lastSyncedAt: Date | undefined = undefined;
let lastError: string | undefined = undefined;

export function subscribeToSyncStatus(
  listener: (status: SyncStatus, lastSynced?: Date, errorMsg?: string) => void
) {
  syncListeners.push(listener);
  listener(currentStatus, lastSyncedAt, lastError);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function notifySyncListeners() {
  syncListeners.forEach((l) => l(currentStatus, lastSyncedAt, lastError));
}

/**
 * Pulls dates and profile from Google Drive.
 */
export async function pullFromGoogleDrive(): Promise<boolean> {
  if (isSyncing) return false;
  try {
    isSyncing = true;
    currentStatus = 'syncing';
    notifySyncListeners();

    const res = await fetch('/api/drive/sync');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.exists && json.data) {
      if (Array.isArray(json.data.dates)) {
        dateStore.setDates(json.data.dates);
      }
      if (json.data.coupleProfile) {
        dateStore.setProfile(json.data.coupleProfile);
      }
      currentStatus = 'synced';
      lastSyncedAt = new Date();
      lastError = undefined;
      notifySyncListeners();
      return true;
    } else {
      currentStatus = 'idle';
      notifySyncListeners();
      return false;
    }
  } catch (err: unknown) {
    console.error('Failed to pull from Google Drive:', err);
    currentStatus = 'error';
    lastError = err instanceof Error ? err.message : 'Sync pull failed';
    notifySyncListeners();
    return false;
  } finally {
    isSyncing = false;
  }
}

/**
 * Pushes current local dates and couple profile to Google Drive.
 */
export async function pushToGoogleDrive(
  dates?: DateIdea[],
  coupleProfile?: CoupleProfile
): Promise<boolean> {
  if (isSyncing) return false;
  try {
    isSyncing = true;
    currentStatus = 'syncing';
    notifySyncListeners();

    const currentDates = dates || dateStore.getDates();
    const currentProfile = coupleProfile || dateStore.getProfile();

    const res = await fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dates: currentDates,
        coupleProfile: currentProfile,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    currentStatus = 'synced';
    lastSyncedAt = new Date();
    lastError = undefined;
    notifySyncListeners();
    return true;
  } catch (err: unknown) {
    console.error('Failed to push to Google Drive:', err);
    currentStatus = 'error';
    lastError = err instanceof Error ? err.message : 'Sync push failed';
    notifySyncListeners();
    return false;
  } finally {
    isSyncing = false;
  }
}
