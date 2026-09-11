'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Loader2, Lock } from 'lucide-react';

import { useSession } from '@/hooks/use-session';
import { ApiRequestError } from '@/lib/http/api-client';

/**
 * Blocks the app behind the shared passcode.
 *
 * Renders nothing but children when no passcode is configured, which is only
 * possible in development since the production build requires `APP_PASSCODE`.
 */
export default function PasscodeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, authenticated, authRequired, signIn } = useSession();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avoid flashing the gate before the session check resolves.
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!authRequired || authenticated) {
    return <>{children}</>;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || passcode.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(passcode);
    } catch (cause) {
      setError(
        cause instanceof ApiRequestError
          ? cause.message
          : 'Could not reach the server. Check your connection.'
      );
      setPasscode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-white/70" />
          </div>
          <h1 className="font-serif text-2xl text-neutral-100">
            A private little place
          </h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Enter the passcode to open your date planner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Passcode"
            autoFocus
            autoComplete="current-password"
            maxLength={256}
            aria-label="Passcode"
            aria-invalid={error !== null}
            aria-describedby={error ? 'passcode-error' : undefined}
            className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/25 transition-colors text-center tracking-[0.3em]"
          />

          {error && (
            <p
              id="passcode-error"
              role="alert"
              className="text-xs text-red-400 text-center"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || passcode.length === 0}
            className="w-full px-4 py-3.5 rounded-2xl bg-white text-neutral-950 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {isSubmitting ? 'Checking' : 'Open'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
