import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { returnFocus } from '../../sili/core/returnFocus.js'
import { onEscapeKey } from '../../sili/core/escapeKey.js'

/**
 * Centered dialog modal rendered via a portal at document.body.
 *
 * - Centers in the viewport regardless of scroll or ancestor transforms
 * - Focuses the panel (tabIndex -1) on open; scrolls it into view as fallback
 * - Restores focus to the trigger element on close
 * - Traps Tab focus within the modal while open (WCAG 2.1.2)
 * - Dismisses on Escape (capture phase, before underlying panels) or action buttons
 *
 * Props:
 *   open          boolean
 *   onClose       fn
 *   heading       string                           aria-label and visible heading text
 *   headingIcon   ReactNode                        optional icon before heading (visual only)
 *   actions       [{ label, onClick, className }]  footer buttons; defaults to single OK
 *   returnFocusRef React.RefObject                 explicit return-focus target
 *   children      node
 */
export default function Modal({ open, onClose, heading = 'Information', headingIcon, actions, children, returnFocusRef }) {
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
      const target = returnFocusRef?.current ?? autoTriggerRef.current
      returnFocus(target)
    }
  }, [open, returnFocusRef])

  // Capture phase so this fires before Drawer / BottomSheet Escape handlers
  useEffect(() => {
    if (!open) return
    return onEscapeKey(onClose, { useCapture: true, stopPropagation: true })
  }, [open, onClose])

  return createPortal(
    <>
      <div
        className={`modal-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`modal-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        tabIndex={-1}
        inert={!open || undefined}
      >
        {open && (
          <>
            <div className="modal-body">
              <h2 className="modal-heading">
                {headingIcon && <span className="modal-heading-icon" aria-hidden="true">{headingIcon}</span>}
                {heading}
              </h2>
              <div className="modal-content">{children}</div>
            </div>
            <div className="modal-footer">
              {(actions ?? [{ label: 'OK', onClick: onClose, className: 'btn--primary modal-ok-btn' }])
                .map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={action.className ?? 'btn--primary modal-ok-btn'}
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
