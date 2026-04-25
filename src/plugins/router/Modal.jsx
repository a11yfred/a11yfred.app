import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from './useFocusTrap.js'
import { useAriaHide } from './useAriaHide.js'

/**
 * Centered dialog modal.
 * Rendered via a portal at document.body so that a transformed ancestor
 * (e.g. the Drawer using translateX) does not break position: fixed.
 *
 * - Centers in the viewport regardless of scroll or ancestor transforms
 * - Focuses the heading (tabIndex -1) on open; scrolls it into view as fallback
 * - Restores focus to the trigger element on close
 * - Traps Tab focus within the modal while open (WCAG 2.1.2)
 * - Dismisses on Escape (capture phase, before underlying panels) or action buttons
 *
 * Props:
 *   open      boolean                              — whether the modal is visible
 *   onClose   fn                                   — called on Escape or default OK button
 *   heading   string                               — visible heading and aria-label for the dialog
 *   actions   [{ label, onClick, className }]      — footer buttons; defaults to a single OK button
 *   children  node                                 — rendered inside the modal body
 */
export default function Modal({ open, onClose, heading = 'Information', actions, children }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const headingRef = useRef(null)

  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)

  // Save trigger on open; focus the heading (tabIndex -1) so screen readers announce the dialog.
  // Scroll into view as a fallback in case the panel somehow sits outside the viewport.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      requestAnimationFrame(() => {
        if (headingRef.current) {
          headingRef.current.focus()
          headingRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      })
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

  // Escape — capture phase so this fires before Drawer / BottomSheet Escape handlers
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [open, onClose])

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`modal-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`modal-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        inert={!open ? '' : undefined}
      >
        {open && (
          <>
            <div className="modal-body">
              <h2
                id="modal-heading"
                ref={headingRef}
                className="modal-heading"
                tabIndex={-1}
              >
                {heading}
              </h2>
              <div className="modal-content">{children}</div>
            </div>
            <div className="modal-footer">
              {(actions ?? [{ label: 'OK', onClick: onClose, className: 'btn-accent modal-ok-btn' }])
                .map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={action.className ?? 'btn-accent modal-ok-btn'}
                  >
                    {action.label}
                  </button>
                ))
              }
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  )
}
