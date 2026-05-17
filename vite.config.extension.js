import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      apply: 'build',
      enforce: 'post',
      closeBundle() {
        mkdirSync('dist-extension', { recursive: true })
        copyFileSync('extension-static/manifest.json', 'dist-extension/manifest.json')
        console.log('✓ copied extension-static/manifest.json to dist-extension')
      },
    },
  ],
  base: './',
  resolve: {
    alias: {
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
    outDir: 'dist-extension',
    css: { transformer: 'lightningcss' },
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
          if (id.includes('node_modules/fuse.js/')) return 'fuse'
          if (id.includes('node_modules/exceljs/')) return 'exceljs'
        },
      },
    },
  },
}))
