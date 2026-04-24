import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Uncomment and set to your repo name when deploying to a GitHub Pages subpath.
// Leave as '/' for Netlify or root-path GitHub Pages.
//const REPO_NAME = 'a11ytexthelper'

export default defineConfig({
  plugins: [react()],
  base: '/',
  //base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',

  build: {
    rollupOptions: {
      output: {
        // Split vendor chunks so the browser can cache React and Fuse.js
        // independently from app code — only changed chunks are re-downloaded.
        manualChunks: {
          react: ['react', 'react-dom'],
          fuse:  ['fuse.js'],
        },
      },
    },
  },
})
