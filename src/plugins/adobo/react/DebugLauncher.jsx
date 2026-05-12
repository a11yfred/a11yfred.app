import { useEffect } from 'react'
import { mountDebugLauncher } from '../overlay/launcher.js'

const IS_DEV = import.meta.env.DEV

export function DebugLauncher({ enabled = false, position = 'bottom-right', onCommand, customSections = [] }) {
  useEffect(() => {
    if (!IS_DEV || !enabled) return
    const overlay = mountDebugLauncher({ position, onCommand, customSections })
    return () => overlay.destroy()
  }, [enabled, position, onCommand, customSections])

  return null
}
