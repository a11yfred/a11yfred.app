import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'a11ytexthelper' with your actual GitHub repo name before deploying
const REPO_NAME = 'a11ytexthelper'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/',
})
