import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { returnFocus } from '../../sili/core/returnFocus.js'
import { onEscapeKey } from '../../sili/core/escapeKey.js'
import ModalPrimitive from './Modal.jsx'

export default function Modal({ open, onClose, returnFocusRef, children, ...rest }) {
  const autoTriggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)

  useEffect(() => {
    if (open) {
      if (!returnFocusRef) autoTriggerRef.current = document.activeElement
      requestAnimationFrame(() => {
        if (!panelRef.current) return
        panelRef.current.focus({ preventScroll: true })
        panelRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
    } else {
      returnFocus(returnFocusRef?.current ?? autoTriggerRef.current)
    }
  }, [open, returnFocusRef])

  // Capture phase so this fires before Drawer / Sheet Escape handlers
  useEffect(() => {
    if (!open) return
    return onEscapeKey(onClose, { useCapture: true, stopPropagation: true })
  }, [open, onClose])

  return (
    <ModalPrimitive open={open} onClose={onClose} panelRef={panelRef} {...rest}>
      {children}
    </ModalPrimitive>
  )
}
