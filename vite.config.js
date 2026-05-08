import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Uncomment and set to your repo name when deploying to a GitHub Pages subpath.
// Leave as '/' for Netlify or root-path GitHub Pages.
//const REPO_NAME = 'A11yHelper'

export default defineConfig({
  plugins: [react()],
  base: '/',
  //base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',

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
