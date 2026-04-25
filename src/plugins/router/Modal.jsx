import { useEffect, useRef } from 'react'
import { useFocusTrap } from './useFocusTrap.js'

/**
 * Centered dialog modal.
 * - Centered in the viewport, 50% of the main container width (max 360px)
 * - Scrollable content area, max 90dvh height
 * - Full-width OK / close button at the bottom
 * - Saves focus to the trigger element on open; restores on close
 * - Traps Tab focus within the modal while open (WCAG 2.1.2)
 * - Dismisses on Escape (intercepts before underlying panels) or OK button
 * - Uses the HTML `inert` attribute to block interaction when closed
 *
 * CSS classes expected in index.css:
 *   .modal-backdrop  .modal-backdrop.is-open
 *   .modal-panel     .modal-panel.is-open
 *   .modal-body      .modal-heading    .modal-content    .modal-footer
 *
 * Props:
 *   open      boolean                    — whether the modal is visible
 *   onClose   fn                         — called on Escape or default OK button
 *   heading   string                     — visible heading and aria-label for the dialog
 *   actions   [{ label, onClick, className }]  — custom footer buttons; defaults to a single OK button
 *   children  node                       — rendered inside the modal body only while open
 */
export default function Modal({ open, onClose, heading = 'Information', actions, children }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

  // Use capture phase + stopImmediatePropagation so this handler fires before
  // any underlying panel (Drawer, BottomSheet) also listening to Escape on document.
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

  return (
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
        aria-label={heading}
        // eslint-disable-next-line react/no-unknown-property
        inert={!open ? '' : undefined}
      >
        {open && (
          <>
            <div className="modal-body">
              <h2 className="modal-heading">{heading}</h2>
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
    </>
  )
}
