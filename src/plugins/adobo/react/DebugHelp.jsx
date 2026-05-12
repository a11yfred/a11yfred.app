import { useEffect, useRef } from 'react'
import { mountDebugHelp } from '../overlay/help.js'

const IS_DEV = import.meta.env.DEV

export function DebugHelp({ open, onClose, customCommands = [] }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!IS_DEV) return
    const panel = mountDebugHelp({ onClose, customCommands })
    panelRef.current = panel
    return () => { panel.destroy(); panelRef.current = null }
  // customCommands is stable array reference from caller — intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  useEffect(() => {
    if (!IS_DEV) return
    if (open) panelRef.current?.open()
    else panelRef.current?.close()
  }, [open])

  return null
}
