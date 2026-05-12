import { useEffect } from 'react'
import { mountNamesDebugger } from '../overlay/names.js'

const IS_DEV = import.meta.env.DEV

export function NamesDebugger({ enabled = true }) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountNamesDebugger()
    return () => overlay.destroy()
  }, [enabled])

  return null
}
