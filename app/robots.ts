import type { MetadataRoute } from 'next';

const SITE_URL = 'https://companynamecheck.uk';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block private/internal surfaces from being crawled or indexed.
        // - /api/*           server-only routes, useless to crawl
        // - /dashboard/general, /team, /security, /activity
        //                    require auth, redirect to /sign-in
        // - /sign-in         we don't want auth pages competing in SERP
        disallow: [
          '/api/',
          '/dashboard/general',
          '/dashboard/team',
          '/dashboard/security',
          '/dashboard/activity',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
