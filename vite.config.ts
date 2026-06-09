import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
  plugins: [react()],
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
