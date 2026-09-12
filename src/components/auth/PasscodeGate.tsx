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
    const cleanPasscode = passcode.trim();
    if (isSubmitting || cleanPasscode.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(cleanPasscode);
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
    <div className="min-h-screen flex items-center justify-center px-5 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center mb-2">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400">
            PRIVATE MONOGRAPH // RESTRICTED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
            A Private Anthology
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-serif italic max-w-xs leading-relaxed">
            &ldquo;Inscribe the secret cipher to unlock your shared archive of dates, memories, and dreams.&rdquo;
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="CIPHER"
            autoFocus
            autoComplete="current-password"
            maxLength={256}
            aria-label="Passcode"
            aria-invalid={error !== null}
            aria-describedby={error ? 'passcode-error' : undefined}
            className="w-full px-4 py-3.5 rounded-2xl bg-neutral-950 border border-white/15 text-white placeholder:text-neutral-600 outline-none focus:border-white transition-colors text-center font-mono tracking-[0.4em] text-sm uppercase"
          />

          {error && (
            <p
              id="passcode-error"
              role="alert"
              className="text-xs font-mono text-red-400 text-center tracking-wide"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || passcode.length === 0}
            className="w-full px-4 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-mono font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-3.5 h-3.5 fill-black text-black" />
            )}
            {isSubmitting ? 'VERIFYING...' : 'ENTER ANTHOLOGY'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
