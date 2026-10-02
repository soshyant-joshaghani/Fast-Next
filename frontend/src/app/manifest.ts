import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Fast-Next',
    short_name: 'Fast-Next',
    description: 'Fast-Next dashboard foundation',
    theme_color: '#09090b',
    background_color: '#09090b',
    display: 'standalone',
    orientation: 'any',
    scope: '/',
    start_url: '/',
    lang: 'en',
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/pwa-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
