import { useState, useEffect, useRef } from 'react'
import '../debug.css'
import { createHeadingWatcher } from '../core/headings.js'

const IS_DEV = import.meta.env.DEV

export function HeadingMapDebugger({ enabled = false }) {
  const [headings, setHeadings] = useState([])
  const watcherRef = useRef(null)

  useEffect(() => {
    if (!IS_DEV || !enabled) { setHeadings([]); return }

    const watcher = createHeadingWatcher(setHeadings)
    watcherRef.current = watcher

    return () => {
      watcher.destroy()
      watcherRef.current = null
    }
  }, [enabled])

  if (!IS_DEV || !enabled || headings.length === 0) return null

  const refresh = () => watcherRef.current?.refresh()

  return (
    <div className="heading-map-overlay" aria-hidden="true">
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
