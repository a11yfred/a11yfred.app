import { useState, useEffect, useRef, useCallback } from 'react'
import '../debug.css'
import { createTabStopWatcher } from '../core/tabstops.js'

const IS_DEV = import.meta.env.DEV

export function TabStopsDebugger({ enabled = false }) {
  const [stops, setStops]         = useState([])
  const [recording, setRecording] = useState(false)
  const watcherRef = useRef(null)

  const clear = useCallback(() => {
    watcherRef.current?.clear()
    setStops([])
    setRecording(false)
  }, [])

  useEffect(() => {
    if (!IS_DEV || !enabled) { clear(); return }

    setRecording(true)

    const watcher = createTabStopWatcher(
      (stop) => setStops(prev => [...prev, stop]),
      () => setStops([]),
    )
    watcherRef.current = watcher

    return () => {
      watcher.destroy()
      watcherRef.current = null
    }
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
      {stops.length > 1 && (
        <svg className="tab-stops-svg">
          {svgLines}
        </svg>
      )}

      {stops.map(stop => (
        <div
          key={stop.seq}
          className="tab-stop-badge"
          style={{ left: stop.cx, top: stop.cy }}
        >
          {stop.seq}
        </div>
      ))}

      {recording && stops.length === 0 && (
        <div className="tab-stops-hint">
          Tab through the page to record focus order
        </div>
      )}

      {stops.length > 0 && (
        <button className="tab-stops-clear" onClick={clear}>
          Clear
        </button>
      )}
    </div>
  )
}
