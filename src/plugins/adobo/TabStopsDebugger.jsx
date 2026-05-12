import { useState, useEffect, useRef, useCallback } from 'react'
import './debug.css'

const IS_DEV = import.meta.env.DEV

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])', 'area[href]',
  'audio[controls]', 'video[controls]', 'details > summary:first-of-type',
].join(',')

function isTabbable(el) {
  if (el.closest('[aria-hidden="true"]')) return false
  if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false
  return true
}

function getTabOrder() {
  const all = Array.from(document.querySelectorAll(FOCUSABLE)).filter(isTabbable)
  const positive = all.filter(el => (el.tabIndex ?? 0) > 0).sort((a, b) => a.tabIndex - b.tabIndex)
  const natural  = all.filter(el => (el.tabIndex ?? 0) === 0)
  return [...positive, ...natural]
}

/**
 * Records keyboard tab order and renders numbered circles + SVG connecting lines
 * as a fixed overlay.
 *
 * Props:
 *   enabled  boolean  — when false the overlay is hidden and recording stops
 */
export function TabStopsDebugger({ enabled = false }) {
  const [stops, setStops]       = useState([])
  const [recording, setRecording] = useState(false)
  const seqRef  = useRef(0)
  const stopsRef = useRef([])

  const clear = useCallback(() => {
    seqRef.current = 0
    stopsRef.current = []
    setStops([])
    setRecording(false)
  }, [])

  useEffect(() => {
    if (!IS_DEV || !enabled) { clear(); return }

    setRecording(true)

    const handleFocusIn = (e) => {
      const el = e.target
      if (!el || el === document.body || el === document.documentElement) return
      if (el.closest('[aria-hidden="true"]')) return

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return

      const cx = rect.left + rect.width  / 2 + window.scrollX
      const cy = rect.top  + rect.height / 2 + window.scrollY

      seqRef.current += 1
      const stop = { seq: seqRef.current, cx, cy, label: el.tagName.toLowerCase() }
      stopsRef.current = [...stopsRef.current, stop]
      setStops([...stopsRef.current])
    }

    document.addEventListener('focusin', handleFocusIn)
    return () => { document.removeEventListener('focusin', handleFocusIn) }
  }, [enabled, clear])

  if (!IS_DEV || !enabled) return null

  const svgLines = stops.slice(1).map((stop, i) => {
    const prev = stops[i]
    return (
      <line
        key={stop.seq}
        x1={prev.cx} y1={prev.cy}
        x2={stop.cx} y2={stop.cy}
        stroke="rgb(0 200 230 / 0.55)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
    )
  })

  return (
    <div className="tab-stops-overlay" aria-hidden="true">
      {/* SVG connecting lines — spans full document */}
      {stops.length > 1 && (
        <svg className="tab-stops-svg">
          {svgLines}
        </svg>
      )}

      {/* Numbered badges */}
      {stops.map(stop => (
        <div
          key={stop.seq}
          className="tab-stop-badge"
          style={{ left: stop.cx, top: stop.cy }}
        >
          {stop.seq}
        </div>
      ))}

      {/* Recording indicator */}
      {recording && stops.length === 0 && (
        <div className="tab-stops-hint">
          Tab through the page to record focus order
        </div>
      )}

      {/* Clear button */}
      {stops.length > 0 && (
        <button className="tab-stops-clear" onClick={clear}>
          Clear
        </button>
      )}
    </div>
  )
}
