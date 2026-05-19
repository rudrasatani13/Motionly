import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
      ],
      manifest: {
        name: 'Motionly',
        short_name: 'Motionly',
        description: 'Motionly — Move Better.',
        theme_color: '#0A0A0F',
        background_color: '#0A0A0F',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: 'favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
        globIgnores: ['**/Motionly.png'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Pose / ML model files (added in later phases under /models/)
            urlPattern: ({ url }) => url.pathname.startsWith('/models/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'motionly-models',
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Audio cues (added in later phases under /audio/cues/)
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'motionly-audio',
              expiration: {
                maxEntries: 128,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Web fonts (Google / self-hosted .woff2)
            urlPattern: ({ request, url }) =>
              request.destination === 'font' ||
              /\.(?:woff2?|ttf|otf)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'motionly-fonts',
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images (icons, illustrations)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'motionly-images',
              expiration: {
                maxEntries: 128,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
