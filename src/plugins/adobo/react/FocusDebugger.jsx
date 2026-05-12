import { useEffect } from 'react'
import '../debug.css'
import { mountFocusDebugger } from '../overlay/focus.js'

const IS_DEV = import.meta.env.DEV

export function FocusDebugger({ enabled = true }) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountFocusDebugger()
    return () => overlay.destroy()
  }, [enabled])

  return null
}
