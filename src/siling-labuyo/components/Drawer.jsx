import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { returnFocus } from '../../sili/core/returnFocus.js'

/**
 * Drawer panel that slides in from the left on mobile.
 *
 * - Saves focus to the trigger on open; restores on close
 * - Traps Tab focus within the panel while open (WCAG 2.1.2)
 * - Uses `inert` to block interaction with closed content
 * - Dismisses on Escape or backdrop click
 *
 * Props:
 *   open         boolean
 *   onClose      fn
 *   label        string           aria-label for the dialog (default: 'Menu')
 *   focusOnClose React.RefObject  if provided, receives focus on close
 *   children     node
 */
export default function Drawer({ open, onClose, label = 'Menu', children, focusOnClose }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      panelRef.current?.focus()
    } else {
      const target = focusOnClose?.current ?? triggerRef.current
      returnFocus(target)
    }
  }, [open, focusOnClose])

  useEscapeKey(open, onClose)

  return (
    <>
      <div
        className={`overlay-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`drawer-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        inert={!open || undefined}
      >
        {open && children}
      </div>
    </>
  )
}
