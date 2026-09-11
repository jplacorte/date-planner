'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Route-level error boundary.
 *
 * Shows a fixed message rather than `error.message`: in production that string
 * is already redacted by React, and echoing it would only risk surfacing
 * internals.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 text-center">
      <div className="max-w-sm space-y-4">
        <h1 className="font-serif text-2xl text-neutral-100">
          Something went sideways
        </h1>
        <p className="text-sm text-neutral-500">
          Your saved dates are safe. Try loading the page again.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-neutral-700">
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-neutral-950 font-medium text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
