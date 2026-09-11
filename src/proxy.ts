import { NextResponse, type NextRequest } from 'next/server';

/**
 * Per-request security headers.
 *
 * Named `proxy` rather than `middleware`: the middleware file convention is
 * deprecated in Next.js 16 and renamed to proxy.
 *
 * The Content-Security-Policy lives here rather than in `next.config.ts`
 * because it carries a per-request nonce, which Next.js then applies to its own
 * bootstrap scripts. Static headers that need no nonce are set in
 * `next.config.ts` so they also cover static assets.
 */

const isProduction = process.env.NODE_ENV === 'production';

/** Origins that serve Drive-hosted and Cloudinary photos. */
const IMAGE_SOURCES = [
  "'self'",
  'data:',
  'blob:',
  'https://res.cloudinary.com',
  'https://images.unsplash.com',
  'https://*.unsplash.com',
  'https://lh3.googleusercontent.com',
  'https://drive.google.com',
  'https://*.googleusercontent.com',
].join(' ');

function buildContentSecurityPolicy(nonce: string): string {
  const directives = [
    "default-src 'self'",
    // 'strict-dynamic' lets the nonced Next.js bootstrap load the rest of the
    // chunks, so no host allowlist is needed for scripts. React uses eval in
    // development only, for readable error stacks.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isProduction ? '' : " 'unsafe-eval'"
    }`,
    // React and Motion write inline style attributes on every animated element,
    // which style-src governs. A nonce cannot cover style attributes, so
    // 'unsafe-inline' is required here. It carries far less risk than on
    // script-src.
    "style-src 'self' 'unsafe-inline'",
    `img-src ${IMAGE_SOURCES}`,
    "font-src 'self' data:",
    // next/font self-hosts its fonts, so no third-party connect target is
    // needed. Drive traffic is proxied through this app's own API routes.
    `connect-src 'self'${isProduction ? '' : ' ws: http://localhost:*'}`,
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Blocks clickjacking; the modern equivalent of X-Frame-Options.
    "frame-ancestors 'none'",
  ];

  if (isProduction) directives.push('upgrade-insecure-requests');

  return directives.join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const csp = buildContentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next.js reads the nonce from this request header to stamp its own scripts.
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Runs on pages but not on static assets, image optimisation output, or
     * prefetch requests, none of which need a per-request nonce.
     */
    {
      source: '/((?!_next/static|_next/image|favicon.svg|.*\\.svg$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
