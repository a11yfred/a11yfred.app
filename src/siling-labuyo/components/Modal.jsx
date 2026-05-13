import { useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal shell — structure only, no focus management or escape handling.
 * Use Modal (from @ulam/siling-labuyo/react) for the fully-wired React + sili version.
 *
 * Props:
 *   open          boolean
 *   onClose       fn
 *   heading       string
 *   headingIcon   ReactNode
 *   actions       [{ label, onClick, className }]
 *   panelRef      React.RefObject
 *   children      node
 */
export default function ModalShell({ open, onClose, heading = 'Information', headingIcon, actions, children, panelRef: externalPanelRef }) {
  const internalPanelRef = useRef(null)
  const panelRef = externalPanelRef ?? internalPanelRef

  return createPortal(
    <>
      <div
        className={`modal-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
        data-overlay-backdrop
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
