import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

// BASE: '/' for the Android app and a custom domain; GitHub Pages serves the
// site under /Tajweed-keys/, so the Pages workflow sets VITE_BASE to that.
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'مفاتيح التجويد',
        short_name: 'مفاتيح التجويد',
        description: 'دروس التجويد، بطاقات، مفاتيح حفظ، اختبارات، وتدريب مقالي',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#0B5D4F',
        background_color: '#F6F8F5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Everything (lessons are bundled) works offline after the first visit.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          { urlPattern: /\.pdf$/, handler: 'CacheFirst', options: { cacheName: 'pdf', expiration: { maxEntries: 2 } } },
        ],
      },
    }),
  ],
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version) },
});
