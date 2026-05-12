import { useState, useEffect } from 'react'
import { createNamesWatcher } from '../core/names.js'

const IS_DEV = import.meta.env.DEV

export function NamesDebugger({ enabled = true }) {
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!IS_DEV || !enabled) return

    const watcher = createNamesWatcher(
      ({ name, source, x, y }) => setTooltip({ name, source, x, y }),
      () => setTooltip(null),
    )

    return () => watcher.destroy()
  }, [enabled])

  if (!IS_DEV || !enabled || !tooltip) return null

  return (
    <div
      className="names-tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
      aria-hidden="true"
    >
      <span className="names-tooltip__source">{tooltip.source}</span>
      <span className="names-tooltip__name">{tooltip.name}</span>
    </div>
  )
}
