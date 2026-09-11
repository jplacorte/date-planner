'use client';

import { useCallback, useEffect, useState } from 'react';

import { ApiRequestError, apiFetch, apiPostJson } from '@/lib/http/api-client';

interface SessionState {
  authenticated: boolean;
  authRequired: boolean;
}

export type SessionStatus = 'loading' | 'ready';

export interface UseSessionResult extends SessionState {
  status: SessionStatus;
  signIn: (passcode: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Tracks whether the current browser holds a valid session.
 *
 * The session cookie is HttpOnly, so this asks the server rather than reading
 * a cookie. That is the point: the client is told yes or no and never handles
 * the token itself.
 */
export function useSession(): UseSessionResult {
  const [state, setState] = useState<SessionState>({
    authenticated: false,
    authRequired: true,
  });
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    apiFetch<SessionState>('/api/auth/session')
      .then((session) => {
        if (!cancelled) setState(session);
      })
      .catch(() => {
        // Treat an unreachable session endpoint as "gate required" so a
        // network failure can never fall open.
        if (!cancelled) {
          setState({ authenticated: false, authRequired: true });
        }
      })
      .finally(() => {
        if (!cancelled) setStatus('ready');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (passcode: string) => {
    // Let ApiRequestError propagate so the form can show the server's message.
    await apiPostJson<{ authenticated: boolean }>('/api/auth/login', {
      passcode,
    });
    setState((previous) => ({ ...previous, authenticated: true }));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiPostJson<{ authenticated: boolean }>('/api/auth/logout', {});
    } catch (error) {
      if (!(error instanceof ApiRequestError)) throw error;
    }
    setState((previous) => ({ ...previous, authenticated: false }));
  }, []);

  return { ...state, status, signIn, signOut };
}
