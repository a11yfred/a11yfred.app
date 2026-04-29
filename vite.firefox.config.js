import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'extension-firefox-static',
  build: {
    outDir: 'dist-extension-firefox',
    emptyOutDir: true,
    css: { transformer: 'lightningcss' },
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
          if (id.includes('node_modules/fuse.js/')) return 'fuse'
          if (id.includes('node_modules/xlsx/')) return 'xlsx'
        },
      },
    },
  },
})
