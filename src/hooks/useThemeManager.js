import { useEffect } from 'react'
import { playPartySound, playSqueak } from '../utils/partySounds.js'
import { PARTY_SQUEAK_FREQUENCY, LS_THEME, PARTY_COMPLEMENT_OFFSET, PARTY_TRIAD_OFFSET, PARTY_GRAD_RANGE, PARTY_GRAD_MIN } from '../utils/constants.js'
import { setStorage } from '../utils/storage.js'

const PARTY_KEYS = [
  '--bg', '--bg-subtle', '--border', '--border-control',
  '--text-heading', '--text-body', '--text-muted', '--text-disabled',
  '--accent', '--accent-bg', '--accent-text', '--focus', '--success', '--overlay-bg',
  '--severity-critical-text', '--severity-critical-bg',
  '--severity-high-text', '--severity-high-bg',
  '--severity-medium-text', '--severity-medium-bg',
  '--severity-low-text', '--severity-low-bg',
  '--party-grad-x', '--party-grad-y',
]

function generatePartyPalette() {
  const h = Math.floor(Math.random() * 360)
  const comp = (h + PARTY_COMPLEMENT_OFFSET) % 360
  const tri = (h + PARTY_TRIAD_OFFSET) % 360
  return {
    '--bg':              `hsl(${h},    85%, 88%)`,
    '--bg-subtle':       `hsl(${h},    75%, 80%)`,
    '--border':          `hsl(${h},    50%, 68%)`,
    '--border-control':  `hsl(${comp}, 55%, 30%)`,
    '--text-heading':            `hsl(${comp}, 70%,  8%)`,
    '--text-body':      `hsl(${comp}, 45%, 22%)`,
    '--text-muted':      `hsl(${comp}, 35%, 32%)`,
    '--text-disabled':   `hsl(${comp}, 20%, 58%)`,
    '--accent':          `hsl(${tri},  85%, 38%)`,
    '--accent-bg':       `hsl(${tri},  75%, 88%)`,
    '--accent-text':     `hsl(${tri},  80%, 22%)`,
    '--focus':           `hsl(${tri},  85%, 38%)`,
    '--success':         'hsl(140, 60%, 30%)',
    '--overlay-bg':      `hsla(${h}, 40%, 15%, 0.55)`,
    '--severity-critical-text': '#a32d2d',
    '--severity-critical-bg':   '#fcebeb',
    '--severity-high-text':     '#854f0b',
    '--severity-high-bg':       '#faeeda',
    '--severity-medium-text':   '#185fa5',
    '--severity-medium-bg':     '#e6f1fb',
    '--severity-low-text':      '#3b6d11',
    '--severity-low-bg':        '#eaf3de',
    '--party-grad-x':    `${Math.floor(Math.random() * PARTY_GRAD_RANGE) + PARTY_GRAD_MIN}%`,
    '--party-grad-y':    `${Math.floor(Math.random() * PARTY_GRAD_RANGE) + PARTY_GRAD_MIN}%`,
  }
}

export function applyTheme(theme, el = document.documentElement) {
  if (theme === 'party') { el.setAttribute('data-theme', 'party'); return }
  const resolved = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  el.setAttribute('data-theme', resolved)
}

const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'])

/**
 * Applies theme to the document and wires up party-mode effects.
 *
 * @param {string} theme - 'auto' | 'light' | 'dark' | 'party'
 * @param {(msg: string, opts?: object) => void} announceParty - locale-aware party announce callback
 */
export default function useThemeManager(theme, announceParty) {
  useEffect(() => {
    PARTY_KEYS.forEach(k => document.documentElement.style.removeProperty(k))

    if (theme === 'party') {
      applyTheme('party')
      const palette = generatePartyPalette()
      Object.entries(palette).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, v)
      )
      setStorage(LS_THEME, theme)
      announceParty()
      return
    }

    const apply = () => applyTheme(theme)
    apply()
    setStorage(LS_THEME, theme)
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps -- announceParty excluded: party announce fires on theme change only

  useEffect(() => {
    if (theme !== 'party') return
    function handleClick(e) {
      const el = e.target.closest('button, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select')
      if (el) playPartySound()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [theme])

  useEffect(() => {
    if (theme !== 'party') return
    let count = 0
    function handleKeyDown(e) {
      if (e.target.id === 'finding-search' && !IGNORED_KEYS.has(e.key)) {
        count++
        if (count % PARTY_SQUEAK_FREQUENCY === 0) playSqueak()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [theme])
}

