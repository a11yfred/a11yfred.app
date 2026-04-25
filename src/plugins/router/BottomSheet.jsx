import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from './useFocusTrap.js'

/**
 * Bottom sheet that slides up from the bottom of the viewport.
 * - Covers the full viewport (all breakpoints)
 * - Sticky chrome: drag handle pill centered, close (×) button top-right
 * - Saves focus to the trigger element on open; restores on close
 * - Traps Tab focus within the panel while open (WCAG 2.1.2)
 * - Dismisses on Escape key or backdrop click
 * - Uses the HTML `inert` attribute to block interaction when closed
 *
 * CSS classes expected in index.css:
 *   .sheet-backdrop    .sheet-backdrop.is-open
 *   .sheet-panel       .sheet-panel.is-open
 *   .sheet-chrome      .sheet-handle
 *   .sheet-close-btn   .sheet-content
 *
 * Props:
 *   open      boolean  — whether the sheet is visible
 *   onClose   fn       — called on Escape, backdrop click, or close button
 *   label     string   — aria-label for the dialog
 *   children  node     — rendered inside the sheet only while open
 */
export default function BottomSheet({ open, onClose, label = 'Detail', children }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  // Save the triggering element on open; restore focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

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
        className={`sheet-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`sheet-panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        // eslint-disable-next-line react/no-unknown-property
        inert={!open ? '' : undefined}
      >
        {/* Chrome: drag handle + close button — sticky so it stays visible while scrolling */}
        <div className="sheet-chrome">
          <div className="sheet-handle" aria-hidden="true" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-icon btn-icon-accent sheet-close-btn"
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Content — only mounts while open so useFocusOnMount fires on each open */}
        <div className="sheet-content">
          {open && children}
        </div>
      </div>
    </>
  )
}
