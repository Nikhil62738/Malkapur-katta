import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

// Resolve a path relative to this config file.
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    // Redirect all `firebase/*` imports to the local REST adapter (shim) so the
    // app talks to the Express + MongoDB backend instead of Firebase. The real
    // `firebase` package stays installed only so TypeScript can type-check
    // against its types; nothing from it is bundled.
    alias: [
      { find: /^firebase\/app$/, replacement: r('./src/lib/fbshim/app.ts') },
      { find: /^firebase\/auth$/, replacement: r('./src/lib/fbshim/auth.ts') },
      { find: /^firebase\/firestore$/, replacement: r('./src/lib/fbshim/firestore.ts') },
      { find: /^firebase\/storage$/, replacement: r('./src/lib/fbshim/storage.ts') },
      { find: /^firebase\/messaging$/, replacement: r('./src/lib/fbshim/messaging.ts') },
      { find: '@', replacement: r('./src') },
    ],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpeg'],
      manifest: {
        name: 'Malkapur Katta Official',
        short_name: 'Malkapur Katta',
        description: 'The digital identity of Malkapur — news, events, culture & community.',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['news', 'social', 'lifestyle'],
        icons: [
          {
            src: '/logo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any',
          },
          {
            src: '/logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'picsum-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbs',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          swiper: ['swiper'],
        },
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
});
