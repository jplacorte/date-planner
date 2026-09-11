import 'server-only';
import { cookies } from 'next/headers';

import { getAuthSecret, isAuthEnabled } from '@/lib/env/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

/**
 * Whether the current request carries a valid session.
 *
 * When no passcode is configured (local development only, since
 * {@link getAppPasscode} throws in production) every request is treated as
 * authenticated so the app stays usable without setup.
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAuthEnabled()) return true;

  const secret = getAuthSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token, secret);
}
