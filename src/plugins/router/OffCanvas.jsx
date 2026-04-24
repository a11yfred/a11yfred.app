import { useEffect, useRef } from 'react'
import { useFocusTrap } from './useFocusTrap.js'

/**
 * Off-canvas panel that slides in from the left on mobile.
 * - Manages its own Escape key handler
 * - Saves focus to the trigger element on open; restores on close
 * - Traps Tab focus within the panel while open (WCAG 2.1.2)
 * - Uses the HTML `inert` attribute to block interaction with closed content
 * - Announces itself as a dialog to screen readers
 *
 * CSS classes expected in index.css:
 *   .offcanvas-backdrop   .offcanvas-backdrop.is-open
 *   .offcanvas-panel      .offcanvas-panel.is-open
 *
 * Props:
 *   open      boolean  — whether the panel is visible
 *   onClose   fn       — called on Escape or backdrop click
 *   label     string   — aria-label for the dialog (default: 'Settings')
 *   children  node     — rendered inside the panel only when open
 */
/**
 * @param {React.RefObject} [focusOnClose] - If provided, this element receives
 *   focus when the panel closes instead of the element that triggered the open.
 *   Use this when closing the panel should land focus on a page heading rather
 *   than the control that opened it (e.g. navigating from a settings panel back
 *   to the home page heading).
 */
export default function OffCanvas({ open, onClose, label = 'Settings', children, focusOnClose }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  // Save trigger element when opening; restore focus when closing.
  // If focusOnClose ref is provided, use that target instead of the trigger.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else {
      const target = focusOnClose?.current ?? triggerRef.current
      target?.focus()
    }
  }, [open, focusOnClose])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop — click to dismiss */}
      <div
        className={`offcanvas-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`offcanvas-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        // inert blocks all interaction when closed; React 18 passes unknown
        // HTML attributes through to the DOM so this works without a polyfill.
        // eslint-disable-next-line react/no-unknown-property
        inert={!open ? '' : undefined}
      >
        {/* Only mount children while open — useFocusOnMount fires on each open */}
        {open && children}
      </div>
    </>
  )
}
