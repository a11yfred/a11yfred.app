import { useEffect, useRef } from 'react'
import { useFocusTrap } from './useFocusTrap.js'
import { returnFocus } from './returnFocus.js'

/**
 * Drawer panel that slides in from the left on mobile.
 * - Manages its own Escape key handler
 * - Saves focus to the trigger element on open; restores on close
 * - Traps Tab focus within the panel while open (WCAG 2.1.2)
 * - Uses the HTML `inert` attribute to block interaction with closed content
 * - Announces itself as a dialog to screen readers
 *
 * CSS classes expected in index.css:
 *   .overlay-backdrop  .overlay-backdrop.is-open  (shared with BottomSheet/Modal)
 *   .drawer-panel      .drawer-panel.is-open
 *
 * Props:
 *   open         boolean           — whether the panel is visible
 *   onClose      fn                — called on Escape or backdrop click
 *   label        string            — aria-label for the dialog (default: 'Menu')
 *   focusOnClose React.RefObject   — if provided, receives focus on close instead
 *                                    of the triggering element (e.g. a page heading)
 *   children     node              — rendered inside the panel only when open
 */
export default function Drawer({ open, onClose, label = 'Menu', children, focusOnClose }) {
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
      returnFocus(target)
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
        className={`overlay-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`drawer-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        inert={!open ? '' : undefined}
      >
        {/* Only mount children while open — useFocusOnMount fires on each open */}
        {open && children}
      </div>
    </>
  )
}
