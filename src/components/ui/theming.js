import { useEffect } from 'react'

// ─── Fiesta palette constants ─────────────────────────────────────────────────

const FIESTA_COMPLEMENT_OFFSET = 180
const FIESTA_TRIAD_OFFSET      = 120
const FIESTA_GRAD_RANGE        = 80
const FIESTA_GRAD_MIN          = 10

const FIESTA_CSS_KEYS = [
  '--bg', '--bg-subtle', '--border', '--border-control',
  '--text-heading', '--text-body', '--text-muted', '--text-disabled',
  '--accent', '--accent-bg', '--accent-text', '--focus', '--success', '--overlay-bg',
  '--severity-critical-text', '--severity-critical-bg',
  '--severity-high-text',     '--severity-high-bg',
  '--severity-medium-text',   '--severity-medium-bg',
  '--severity-low-text',      '--severity-low-bg',
  '--fiesta-grad-x', '--fiesta-grad-y',
]

function generateFiestaPalette() {
  const h    = Math.floor(Math.random() * 360)
  const comp = (h + FIESTA_COMPLEMENT_OFFSET) % 360
  const tri  = (h + FIESTA_TRIAD_OFFSET)      % 360
  return {
    '--bg':             `hsl(${h},    85%, 88%)`,
    '--bg-subtle':      `hsl(${h},    75%, 80%)`,
    '--border':         `hsl(${h},    50%, 68%)`,
    '--border-control': `hsl(${comp}, 55%, 30%)`,
    '--text-heading':   `hsl(${comp}, 70%,  8%)`,
    '--text-body':      `hsl(${comp}, 45%, 22%)`,
    '--text-muted':     `hsl(${comp}, 35%, 32%)`,
    '--text-disabled':  `hsl(${comp}, 20%, 58%)`,
    '--accent':         `hsl(${tri},  85%, 38%)`,
    '--accent-bg':      `hsl(${tri},  75%, 88%)`,
    '--accent-text':    `hsl(${tri},  80%, 22%)`,
    '--focus':          `hsl(${tri},  85%, 38%)`,
    '--success':        'hsl(140, 60%, 30%)',
    '--overlay-bg':     `hsla(${h}, 40%, 15%, 0.55)`,
    '--severity-critical-text': '#a32d2d',
    '--severity-critical-bg':   '#fcebeb',
    '--severity-high-text':     '#854f0b',
    '--severity-high-bg':       '#faeeda',
    '--severity-medium-text':   '#185fa5',
    '--severity-medium-bg':     '#e6f1fb',
    '--severity-low-text':      '#3b6d11',
    '--severity-low-bg':        '#eaf3de',
    '--fiesta-grad-x': `${Math.floor(Math.random() * FIESTA_GRAD_RANGE) + FIESTA_GRAD_MIN}%`,
    '--fiesta-grad-y': `${Math.floor(Math.random() * FIESTA_GRAD_RANGE) + FIESTA_GRAD_MIN}%`,
  }
}

function clearFiestaPalette(el = document.documentElement) {
  FIESTA_CSS_KEYS.forEach(k => el.style.removeProperty(k))
}

// ─── applyTheme ───────────────────────────────────────────────────────────────

/**
 * Applies a theme to the document root (or a custom element).
 * Sets data-theme; handles 'auto' by reading prefers-color-scheme.
 * For 'fiesta', also generates and applies a random color palette.
 *
 * @param {'auto'|'light'|'dark'|'fiesta'} theme
 * @param {HTMLElement} [el=document.documentElement]
 */
export function applyTheme(theme, el = document.documentElement) {
  clearFiestaPalette(el)

  if (theme === 'fiesta') {
    el.setAttribute('data-theme', 'fiesta')
    const palette = generateFiestaPalette()
    Object.entries(palette).forEach(([k, v]) => el.style.setProperty(k, v))
    return
  }

  const resolved = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  el.setAttribute('data-theme', resolved)
}

// ─── useThemeManager (React) ──────────────────────────────────────────────────

const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'])

/**
 * React hook. Applies the theme and wires up fiesta-mode interactive effects.
 *
 * @param {'auto'|'light'|'dark'|'fiesta'} theme
 * @param {object}   [opts]
 * @param {Function} [opts.onFiestaActivated]  - Called when fiesta mode turns on (e.g. to announce it)
 * @param {Function} [opts.onFiestaClick]      - Called on any interactive click in fiesta mode (e.g. play a sound)
 * @param {Function} [opts.onFiestaKey]        - Called on keydown in fiesta mode; receives the event
 * @param {number}   [opts.keyFrequency=1]     - Call onFiestaKey every N keystrokes (e.g. 3 for every 3rd key)
 * @param {string}   [opts.keyTargetId]        - Only count keystrokes on this element id
 */
export function useThemeManager(theme, {
  onFiestaActivated,
  onFiestaClick,
  onFiestaKey,
  keyFrequency = 1,
  keyTargetId,
} = {}) {
  // Apply theme + fiesta palette
  useEffect(() => {
    applyTheme(theme)
    if (theme === 'fiesta') onFiestaActivated?.()

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => applyTheme(theme)
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fiesta click sounds
  useEffect(() => {
    if (theme !== 'fiesta' || !onFiestaClick) return
    const INTERACTIVE = 'button,[role="button"],input[type="submit"],input[type="button"],input[type="checkbox"],input[type="radio"],select'
    const handler = (e) => { if (e.target.closest(INTERACTIVE)) onFiestaClick() }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [theme, onFiestaClick])

  // Fiesta key sounds
  useEffect(() => {
    if (theme !== 'fiesta' || !onFiestaKey) return
    let count = 0
    const handler = (e) => {
      if (IGNORED_KEYS.has(e.key)) return
      if (keyTargetId && e.target.id !== keyTargetId) return
      count++
      if (count % keyFrequency === 0) onFiestaKey(e)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [theme, onFiestaKey, keyFrequency, keyTargetId])
}
