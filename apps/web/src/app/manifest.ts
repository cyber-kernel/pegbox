import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pegbox — Browser-Native File Tools',
    short_name: 'Pegbox',
    description: 'Free, private, browser-based media and file tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#6D4AFF',
    icons: [
      {
        src: '/brand/png/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/png/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

