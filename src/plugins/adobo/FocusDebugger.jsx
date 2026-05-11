import { useState, useEffect, useRef } from 'react'
import './debug.css'

const IS_DEV = import.meta.env.DEV

const SKIP_CLASSES = new Set(['sr-only'])

function formatTarget(el) {
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter(c => !SKIP_CLASSES.has(c))
    .slice(0, 2)
  const cls = classes.length ? '.' + classes.join('.') : ''
  return `<${tag}${cls}>`
}

function getOutlineInfo(el) {
  const style = getComputedStyle(el)
  const hasFocusOutline = parseFloat(style.outlineWidth) > 0 && style.outlineStyle !== 'none'
  const isFocusVisible = document.querySelector(':focus-visible') === el
  return { hasFocusOutline, isFocusVisible }
}

function flashElement(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return
  const overlay = document.createElement('div')
  overlay.className = 'focus-debug-flash'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), 750)
}

/**
 * Shows a dev-only toast whenever keyboard focus moves, indicating the target
 * element, whether :focus has a visible outline, and whether :focus-visible matches.
 * Also briefly flashes the focused element with a teal overlay.
 *
 * Props:
 *   enabled  boolean , defaults to true; set false to suppress (e.g. "debug all off")
 */
export function FocusDebugger({ enabled = true }) {
  const [toast, setToast] = useState(null)
  const showTimer = useRef(null)
  const fadeTimer = useRef(null)

  useEffect(() => {
    if (!IS_DEV) return

    const handleFocusIn = (e) => {
      const el = e.target
      if (!el || el === document.body) return

      clearTimeout(showTimer.current)
      clearTimeout(fadeTimer.current)

      const { hasFocusOutline, isFocusVisible } = getOutlineInfo(el)
      flashElement(el)

      setToast({ label: formatTarget(el), hasFocusOutline, isFocusVisible, fading: false })

      showTimer.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, fading: true } : null)
        fadeTimer.current = setTimeout(() => setToast(null), 400)
      }, 3000)
    }

    document.addEventListener('focusin', handleFocusIn)
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      clearTimeout(showTimer.current)
      clearTimeout(fadeTimer.current)
    }
  }, [])

  if (!IS_DEV || !enabled || !toast) return null

  return (
    <div className={`focus-toast${toast.fading ? ' focus-toast--fading' : ''}`} aria-hidden="true">
      <div className="focus-toast__row">
        <span className="focus-toast__label">KB Focus</span>
        <code className="focus-toast__target">{toast.label}</code>
      </div>
      <div className="focus-toast__indicators">
        <span className={`focus-toast__indicator${toast.hasFocusOutline ? ' focus-toast__indicator--on' : ' focus-toast__indicator--off'}`}>
          :focus {toast.hasFocusOutline ? '✓' : '✗'}
        </span>
        <span className={`focus-toast__indicator${toast.isFocusVisible ? ' focus-toast__indicator--on' : ' focus-toast__indicator--off'}`}>
          :focus-visible {toast.isFocusVisible ? '✓' : '✗'}
        </span>
      </div>
    </div>
  )
}
