import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

const projectRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Phase 17 — serve the MediaPipe Tasks-Vision WASM fileset from
 * `/mediapipe-wasm/` instead of a remote CDN. The package ships the
 * WASM under `node_modules/@mediapipe/tasks-vision/wasm/`; we serve
 * that directory through dev middleware and copy it into the build
 * output so production loads stay on Motionly's origin and the
 * service-worker `/mediapipe-wasm/` cache rule actually works.
 */
function motionlyMediaPipeWasm(): Plugin {
  const wasmSourceDir = resolve(projectRoot, 'node_modules/@mediapipe/tasks-vision/wasm');
  const urlBase = '/mediapipe-wasm/';

  return {
    name: 'motionly:mediapipe-wasm',
    configureServer(server) {
      server.middlewares.use(urlBase, (req, res, next) => {
        if (!req.url || !existsSync(wasmSourceDir)) {
          next();
          return;
        }
        const relative = (req.url.split('?')[0] ?? '').replace(/^\/+/, '');
        if (relative.length === 0 || relative.includes('..')) {
          next();
          return;
        }
        const candidate = join(wasmSourceDir, relative);
        if (!candidate.startsWith(wasmSourceDir + sep) || !existsSync(candidate)) {
          next();
          return;
        }
        const stats = statSync(candidate);
        if (!stats.isFile()) {
          next();
          return;
        }
        const contentType = relative.endsWith('.wasm')
          ? 'application/wasm'
          : relative.endsWith('.js')
            ? 'application/javascript; charset=utf-8'
            : 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.end(readFileSync(candidate));
      });
    },
    closeBundle() {
      if (!existsSync(wasmSourceDir)) {
        return;
      }
      const outputDir = resolve(projectRoot, 'dist', 'mediapipe-wasm');
      mkdirSync(outputDir, { recursive: true });
      for (const file of readdirSync(wasmSourceDir)) {
        const sourcePath = join(wasmSourceDir, file);
        const stats = statSync(sourcePath);
        if (!stats.isFile()) {
          continue;
        }
        copyFileSync(sourcePath, join(outputDir, file));
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    motionlyMediaPipeWasm(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon-96x96.png',
        'favicon-light-96x96.png',
        'apple-touch-icon.png',
        'motionly-mark-light-192.png',
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
        globIgnores: [
          '**/Motionly.png',
          '**/motionly-mark-light.png',
          // Pose model files and the MediaPipe WASM fileset are intentionally
          // not precached — they are large and only needed for the active
          // pose-debug surface. The runtime caching rules below take over
          // after first use.
          '**/models/*.task',
          '**/mediapipe-wasm/**',
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Pose / ML model files (added in Phase 17 under /models/).
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
            // MediaPipe Tasks-Vision WASM fileset (Phase 17). Served from
            // /mediapipe-wasm/ so it never depends on a remote CDN. CacheFirst
            // because the WASM is pinned to the package version in
            // package.json and effectively immutable per release.
            urlPattern: ({ url }) => url.pathname.startsWith('/mediapipe-wasm/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'motionly-mediapipe-wasm',
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24 * 90,
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
              request.destination === 'font' || /\.(?:woff2?|ttf|otf)$/i.test(url.pathname),
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
