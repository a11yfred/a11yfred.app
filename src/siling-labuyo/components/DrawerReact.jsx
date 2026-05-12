import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { returnFocus } from '../../sili/core/returnFocus.js'
import DrawerPrimitive from './Drawer.jsx'

export default function Drawer({ open, onClose, focusOnClose, children, ...rest }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)
  useEscapeKey(open, onClose)

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      panelRef.current?.focus()
    } else {
      returnFocus(focusOnClose?.current ?? triggerRef.current)
    }
  }, [open, focusOnClose])

  return (
    <DrawerPrimitive open={open} onClose={onClose} panelRef={panelRef} {...rest}>
      {children}
    </DrawerPrimitive>
  )
}
