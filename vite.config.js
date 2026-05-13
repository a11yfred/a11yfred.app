import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache app shell, corpus JSON, locale JSONs, and all assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        // Corpus + locale JSONs can be large; raise the size warning limit
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts stylesheet
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'A11yFred',
        short_name: 'A11yFred',
        description: 'Search and copy professional WCAG defect descriptions in seconds. Free tool for accessibility auditors.',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  base: '/',
  define: { 'globalThis.ROGERS_DEV': 'import.meta.env.DEV' },
  server: {
    host: true,
  },

  build: {
    // Enable LightningCSS for faster, smaller CSS output
    css: { transformer: 'lightningcss' },
    // 50+ locale JSON files make the main bundle intentionally large; suppress warning
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split vendor chunks so the browser can cache React and Fuse.js
        // independently from app code — only changed chunks are re-downloaded.
        // Vite 8 (rolldown) requires manualChunks to be a function.
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
          if (id.includes('node_modules/fuse.js/')) return 'fuse'
          if (id.includes('node_modules/xlsx/')) return 'xlsx'
        },
      },
    },
  },
})
