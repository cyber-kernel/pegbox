import type { MetadataRoute } from 'next';
import { MANIFESTS } from '@/lib/registry.generated';
import { CATEGORY_LIST } from '@pegbox/tool-kit';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pegbox.vercel.app';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/licenses`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_LIST.map((c) => ({
    url: `${baseUrl}/c/${c.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = MANIFESTS.filter((m) => m.status === 'live').map(
    (m) => ({
      url: `${baseUrl}/tools/${m.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  );

  return [...staticPages, ...categoryPages, ...toolPages];
}

