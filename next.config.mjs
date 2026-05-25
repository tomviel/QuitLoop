import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache /session aggressively — used during emergencies
      urlPattern: /^\/session($|\?)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'session-page',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      // Cache /offline page for offline fallback
      urlPattern: /^\/offline($|\?)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-page',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
    {
      // Never cache AI API calls
      urlPattern: /^\/api\/ai\//,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /\/_next\/image\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
};

export default pwaConfig(nextConfig);
