import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';

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
  style: ['normal', 'italic'],
});

const monoFont = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'https://date-planner.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Phillip & Lyca | Romantic Date Planner & Memory Scrapbook',
    template: '%s | Phillip & Lyca Date Planner',
  },
  description:
    'Curated romantic date planner, couple bucket list, and memory scrapbook. Discover date ideas, track milestones, and preserve memories together in an aesthetic monochrome journal.',
  keywords: [
    'date planner',
    'couple checklist',
    'romantic date ideas',
    'relationship bucket list',
    'date night planner',
    'memory scrapbook',
    'couple milestones',
    'aesthetic date planner',
  ],
  authors: [{ name: 'Phillip & Lyca' }],
  creator: 'Phillip & Lyca',
  publisher: 'Phillip & Lyca',
  applicationName: 'Date Planner',
  category: 'Lifestyle',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Phillip & Lyca | Romantic Date Planner & Memory Scrapbook',
    description:
      'Curated romantic date planner, couple bucket list, and memory scrapbook. Discover date ideas, track milestones, and preserve memories together.',
    url: '/',
    siteName: 'Phillip & Lyca Date Planner',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phillip & Lyca | Romantic Date Planner & Memory Scrapbook',
    description:
      'Curated romantic date planner, couple bucket list, and memory scrapbook.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Date Planner',
    statusBarStyle: 'black-translucent',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Phillip & Lyca Date Planner',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'All',
  description:
    'Curated romantic date planner, couple bucket list, and memory scrapbook.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Romantic Date Checklist',
    'Interactive Date Map',
    'Polaroid Memory Scrapbook',
    'Date Roulette Generator',
    'Cloud Photo Storage',
  ],
};

function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.032] mix-blend-overlay select-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} ${monoFont.variable} dark`}
      data-theme="dusk"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-black text-[#faf8f5] font-sans antialiased overflow-x-hidden transition-colors duration-700"
        suppressHydrationWarning
      >
        <FilmGrain />
        <SmoothScroll>
          <PasscodeGate>
            <DateProvider>{children}</DateProvider>
          </PasscodeGate>
        </SmoothScroll>
      </body>
    </html>
  );
}
