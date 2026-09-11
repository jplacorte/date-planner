'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const FEEDBACK_DURATION_MS = 2500;

export interface SavedFeedback {
  /** Current toast message, or null when nothing is showing. */
  message: string | null;
  /** Shows a message and clears it automatically. */
  notify: (message: string) => void;
}

/**
 * Transient "saved" toast used across the date detail tabs.
 *
 * Keeps its own timer handle so a rapid sequence of saves cannot leave a
 * stale timeout that clears a newer message, and clears on unmount.
 */
export function useSavedFeedback(): SavedFeedback {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((next: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(next);
    timeoutRef.current = setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, FEEDBACK_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return { message, notify };
}
