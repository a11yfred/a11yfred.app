import { useState, useEffect, useCallback } from 'react'
import './debug.css'

const IS_DEV = import.meta.env.DEV

const LEVEL_COLORS = {
  H1: 'rgb(255 100 100)',
  H2: 'rgb(255 170  60)',
  H3: 'rgb(100 220 100)',
  H4: 'rgb( 80 190 255)',
  H5: 'rgb(200 130 255)',
  H6: 'rgb(255 210  80)',
}

function collectHeadings() {
  const els = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
  return els
    .filter(el => !el.closest('[aria-hidden="true"]') && el.offsetParent !== null)
    .map((el, i) => {
      const rect = el.getBoundingClientRect()
      const tag  = el.tagName.toUpperCase()
      const text = el.textContent.trim().slice(0, 60)
      return {
        key: i,
        tag,
        text,
        color: LEVEL_COLORS[tag] ?? 'rgb(200 200 200)',
        top:   rect.top  + window.scrollY,
        left:  rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      }
    })
}

/**
 * Overlays every heading on the page with a level badge and outline.
 * Shows the full heading hierarchy as a floating panel.
 *
 * Props:
 *   enabled  boolean
 */
export function HeadingMapDebugger({ enabled = false }) {
  const [headings, setHeadings] = useState([])

  const refresh = useCallback(() => {
    setHeadings(collectHeadings())
  }, [])

  useEffect(() => {
    if (!IS_DEV || !enabled) { setHeadings([]); return }

    refresh()

    // Re-scan if layout shifts or new content renders
    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)
    window.addEventListener('scroll', refresh, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', refresh)
    }
  }, [enabled, refresh])

  if (!IS_DEV || !enabled || headings.length === 0) return null

  return (
    <div className="heading-map-overlay" aria-hidden="true">
      {/* Outline boxes + badges over each heading */}
      {headings.map(h => (
        <div
          key={h.key}
          className="heading-map-box"
          style={{
            top: h.top, left: h.left,
            width: h.width, height: Math.max(h.height, 20),
            borderColor: h.color,
          }}
        >
          <span className="heading-map-badge" style={{ background: h.color }}>
            {h.tag}
          </span>
        </div>
      ))}

      {/* Floating outline panel */}
      <div className="heading-map-panel">
        <div className="heading-map-panel__title">Heading Map</div>
        <ol className="heading-map-panel__list">
          {headings.map(h => (
            <li
              key={h.key}
              className="heading-map-panel__item"
              style={{ paddingLeft: `${(parseInt(h.tag[1], 10) - 1) * 0.9}rem` }}
            >
              <span className="heading-map-panel__level" style={{ color: h.color }}>{h.tag}</span>
              <span className="heading-map-panel__text">{h.text || '(empty)'}</span>
            </li>
          ))}
        </ol>
        <button className="heading-map-panel__refresh" onClick={refresh}>
          Refresh
        </button>
      </div>
    </div>
  )
}
