import { isAuthenticated } from '@/lib/auth/guard';
import { isAuthEnabled } from '@/lib/env/server';
import { apiInternalError, apiSuccess } from '@/lib/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lets the client decide whether to render the passcode gate.
 *
 * Deliberately returns only booleans: no hint about the passcode itself.
 */
export async function GET() {
  try {
    return apiSuccess({
      authenticated: await isAuthenticated(),
      authRequired: isAuthEnabled(),
    });
  } catch (cause) {
    return apiInternalError('auth/session', cause);
  }
}
