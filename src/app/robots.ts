import type { MetadataRoute } from 'next';

/**
 * This is a private planner holding personal photos and notes, so no crawler
 * should index any part of it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
