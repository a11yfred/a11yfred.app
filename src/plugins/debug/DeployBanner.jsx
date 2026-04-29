const IS_DEV = import.meta.env.DEV

const LABELS = {
  netlify: 'Deploying to Netlify',
  pages:   'Deploying to GitHub Pages',
  vercel:  'Deploying to Vercel',
  off:     'Deploying OFF',
}

/**
 * Fixed bottom-left banner showing the active deployment target.
 * Dev-only. Hidden in production.
 *
 * Props:
 *   target  'netlify' | 'pages' | 'vercel' | 'off' | null
 *           null = banner hidden; 'off' = visible with "Deploying OFF" text
 */
export function DeployBanner({ target }) {
  if (!IS_DEV || !target) return null
  return (
    <div className={`deploy-banner deploy-banner--${target}`} aria-hidden="true">
      {LABELS[target] ?? target}
    </div>
  )
}
