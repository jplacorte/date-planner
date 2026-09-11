import type { NextConfig } from 'next';

/**
 * Headers that need no per-request value live here so they also cover static
 * assets. The Content-Security-Policy is set in `src/proxy.ts` instead, because
 * it carries a per-request nonce.
 */
const securityHeaders = [
  // Stops browsers from MIME-sniffing a response into an executable type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Belt-and-braces alongside the CSP frame-ancestors directive, for old browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The app needs none of these, so deny them outright.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // This is a private planner; keep it out of search results and caches.
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Hides the framework and version from responses.
  poweredByHeader: false,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  images: {
    // Only these hosts may be passed through the image optimiser, so a stored
    // URL cannot turn the optimiser into an open proxy.
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
  },

  // googleapis is a large CommonJS dependency; keep it out of the bundle trace.
  serverExternalPackages: ['googleapis'],
};

export default nextConfig;
