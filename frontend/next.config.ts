import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8000';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  register: false,
});

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

// Serwist hooks webpack — use Turbopack for `next dev`, webpack only for `next build`.
export default process.env.NODE_ENV === 'production' ? withSerwist(nextConfig) : nextConfig;
