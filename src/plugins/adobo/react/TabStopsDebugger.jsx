import { useEffect } from 'react'
import '../debug.css'
import { mountTabStopsDebugger } from '../overlay/tabstops.js'

const IS_DEV = import.meta.env.DEV

export function TabStopsDebugger({ enabled = false }) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountTabStopsDebugger()
    return () => overlay.destroy()
  }, [enabled])

  return null
}
