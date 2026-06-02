import type { MetadataRoute } from 'next';

// Canonical origin. Kept in one place so a future domain change only
// edits one file.
const SITE_URL = 'https://companynamecheck.uk';

// Public, indexable routes. Authenticated pages (dashboard/general,
// dashboard/team, dashboard/security, dashboard/activity) and API
// routes are intentionally excluded — they require a session and would
// 307 to /sign-in for crawlers anyway.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/dashboard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sign-in`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
