// Local wrapper that imports from framework in dev, falls back to package in production
// This allows us to test unreleased framework features locally before npm publishing
// Vite alias in vite.config.js points @ulam/sili to local packages in dev

export { OverlayShell as default } from '@ulam/sili/react'
