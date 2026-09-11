import 'server-only';

/**
 * Centralised, validated access to server-side environment variables.
 *
 * Importing this module from a Client Component is a build-time error thanks to
 * `server-only`, which keeps credentials from ever being bundled for the browser.
 */

const isProduction = process.env.NODE_ENV === 'production';

/** Reads a variable, treating blank/whitespace-only values as absent. */
function read(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Google Drive file and folder IDs are URL-safe base64-ish tokens. */
const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,128}$/;

export interface DriveOAuthCredentials {
  kind: 'oauth';
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface DriveServiceAccountCredentials {
  kind: 'service-account';
  clientEmail: string;
  privateKey: string;
}

export type DriveCredentials =
  | DriveOAuthCredentials
  | DriveServiceAccountCredentials;

/**
 * Resolves Drive credentials, preferring OAuth2 user credentials (which carry a
 * personal storage quota) over a service account (which has none of its own).
 * Returns `null` when Drive has not been configured at all.
 */
export function getDriveCredentials(): DriveCredentials | null {
  const clientId = read('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = read('GOOGLE_OAUTH_CLIENT_SECRET');
  const refreshToken = read('GOOGLE_OAUTH_REFRESH_TOKEN');

  if (clientId && clientSecret && refreshToken) {
    return { kind: 'oauth', clientId, clientSecret, refreshToken };
  }

  const clientEmail = read('GOOGLE_CLIENT_EMAIL');
  const rawPrivateKey = read('GOOGLE_PRIVATE_KEY');

  if (clientEmail && rawPrivateKey) {
    return {
      kind: 'service-account',
      clientEmail,
      // Env files store the PEM with literal "\n" sequences.
      privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

/** The Drive folder that backs photo uploads and the synced database file. */
export function getDriveFolderId(): string | null {
  const folderId = read('GOOGLE_DRIVE_FOLDER_ID');
  if (!folderId) return null;

  if (!DRIVE_ID_PATTERN.test(folderId)) {
    throw new Error(
      'GOOGLE_DRIVE_FOLDER_ID is malformed. Expected the ID segment from the ' +
        'folder URL, not the full URL.'
    );
  }

  return folderId;
}

/**
 * The shared passcode that guards every write path.
 *
 * Absent in development this only disables the gate locally; absent in
 * production it is fatal, so an unauthenticated deployment cannot happen by
 * omission.
 */
export function getAppPasscode(): string | null {
  const passcode = read('APP_PASSCODE');

  if (!passcode) {
    if (isProduction) {
      throw new Error(
        'APP_PASSCODE is required in production. Without it the API routes ' +
          'would be open to anyone who can reach the deployment.'
      );
    }
    return null;
  }

  if (passcode.length < 8) {
    throw new Error('APP_PASSCODE must be at least 8 characters long.');
  }

  return passcode;
}

/**
 * Key used to sign session cookies. Falls back to deriving from the passcode so
 * a minimal deployment needs one secret, while rotating `AUTH_SECRET`
 * independently invalidates every existing session.
 */
export function getAuthSecret(): string | null {
  const secret = read('AUTH_SECRET');
  if (secret) {
    if (secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters long.');
    }
    return secret;
  }

  const passcode = getAppPasscode();
  return passcode ? `derived-session-key:${passcode}` : null;
}

/** True when the passcode gate is active for this process. */
export function isAuthEnabled(): boolean {
  return getAppPasscode() !== null;
}

export const env = {
  isProduction,
  isDevelopment: process.env.NODE_ENV === 'development',
};
