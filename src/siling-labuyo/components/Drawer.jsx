import { useRef } from 'react'

/**
 * Drawer shell — structure only, no focus management or escape handling.
 * Use Drawer (from @ulam/siling-labuyo/react) for the fully-wired React + sili version.
 *
 * Props:
 *   open         boolean
 *   onClose      fn
 *   label        string
 *   panelRef     React.RefObject
 *   children     node
 */
export default function DrawerShell({ open, onClose, label = 'Menu', children, panelRef: externalPanelRef }) {
  const internalPanelRef = useRef(null)
  const panelRef = externalPanelRef ?? internalPanelRef

  return (
    <>
      <div
        className={`overlay-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
        data-overlay-backdrop
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
