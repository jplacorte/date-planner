import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';

import './globals.css';
import { DateProvider } from '@/context/DateContext';
import PasscodeGate from '@/components/auth/PasscodeGate';
import SmoothScroll from '@/components/layout/SmoothScroll';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const serifFont = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Rendered per request so `src/proxy.ts` can stamp a fresh CSP nonce into the
 * bootstrap scripts. A prerendered shell would be cached without one, and
 * 'strict-dynamic' makes browsers ignore the 'self' fallback, so every script
 * would be blocked. The page is a client-side app, so this costs only the
 * shell render.
 */
export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: "Phillip's Date Planner",
  description:
    'Romantic date planner, bucket list curator, and memory scrapbook.',
  // Private app: keep it out of search indexes and link previews.
  robots: { index: false, follow: false, nocache: true },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} dark`}
      data-theme="dusk"
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased overflow-x-hidden transition-colors duration-700"
        suppressHydrationWarning
      >
        <SmoothScroll>
          <PasscodeGate>
            <DateProvider>{children}</DateProvider>
          </PasscodeGate>
        </SmoothScroll>
      </body>
    </html>
  );
}
