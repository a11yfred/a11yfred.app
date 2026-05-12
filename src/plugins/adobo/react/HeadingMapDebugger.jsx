import { useEffect } from 'react'
import '../debug.css'
import { mountHeadingMapDebugger } from '../overlay/headings.js'

const IS_DEV = import.meta.env.DEV

export function HeadingMapDebugger({ enabled = false }) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountHeadingMapDebugger()
    return () => overlay.destroy()
  }, [enabled])

  return null
}
