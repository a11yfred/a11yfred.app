import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache app shell, corpus JSON, locale JSONs, and all assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        // Corpus + locale JSONs can be large; raise the size warning limit
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [],
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
          { src: '/icon.svg',                    sizes: 'any',     type: 'image/svg+xml', purpose: 'any' },
          { src: '/android-chrome-192x192.png',  sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: command === 'serve' ? {
      '@ulam/sawsawan': new URL('./src/sawsawan/index.js', import.meta.url).pathname,
      '@ulam/sili/react': new URL('../ulam/packages/sili/react', import.meta.url).pathname,
      '@ulam/sili': new URL('../ulam/packages/sili', import.meta.url).pathname,
      '@ulam/ube': new URL('../ulam/packages/ube', import.meta.url).pathname,
    } : {
      '@ulam/sawsawan': new URL('./src/sawsawan/index.js', import.meta.url).pathname,
    },
  },
  define: {
    'globalThis.ROGERS_DEV': mode === 'production' ? 'false' : 'true',
    ...(mode === 'production' ? { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true' } : {}),
  },
  server: {
    host: true,
  },

  build: {
    sourcemap: true,
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
          if (id.includes('node_modules/exceljs/')) return 'exceljs'
        },
      },
    },
  },
}))
