import { env } from '@/lib/env/server';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth/session';
import { apiSuccess } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = apiSuccess({ authenticated: false });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions(env.isProduction),
    maxAge: 0,
  });
  return response;
}
