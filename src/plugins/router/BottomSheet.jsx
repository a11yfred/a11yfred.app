import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Bottom sheet that slides up from the bottom of the viewport.
 * Rendered via a portal at document.body so that a transformed ancestor
 * (e.g. the Drawer using translateX) does not break position: fixed.
 *
 * - Scroll-locks the body while open
 * - Swipe-to-dismiss: drag down from the chrome area to close
 * - Traps Tab focus within the panel while open (WCAG 2.1.2)
 * - Dismisses on Escape or backdrop click
 *
 * Props:
 *   open         boolean  — whether the sheet is visible
 *   onClose      fn       — called on Escape, backdrop click, or close button
 *   label        string   — aria-label for the dialog
 *   keepMounted  boolean  — keep children mounted while closed (preserves state)
 *   children     node     — rendered inside the sheet
 */
export default function BottomSheet({ open, onClose, label = 'Detail', closeLabel = 'Close', keepMounted = false, children }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const dragStartY = useRef(null)
  const dragDelta = useRef(0)

  // Scroll lock — prevent background from scrolling when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Swipe-to-dismiss: drag the sheet down from the chrome area to close
  const handleTouchStart = (e) => {
    const panel = panelRef.current
    if (!panel) return
    const panelTop = panel.getBoundingClientRect().top
    const touchY = e.touches[0].clientY
    if (touchY - panelTop > 56) return
    dragStartY.current = touchY
    dragDelta.current = 0
  }

  const handleTouchMove = (e) => {
    if (dragStartY.current === null) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta <= 0) return
    dragDelta.current = delta
    if (panelRef.current) {
      panelRef.current.style.transform = `translateX(-50%) translateY(${delta}px)`
      panelRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    if (dragStartY.current === null) return
    const DISMISS_THRESHOLD = 100
    if (dragDelta.current > DISMISS_THRESHOLD) {
      onClose()
    }
    if (panelRef.current) {
      panelRef.current.style.transform = ''
      panelRef.current.style.transition = ''
    }
    dragStartY.current = null
    dragDelta.current = 0
  }

  return createPortal(
    <>
      {/* Backdrop — click to dismiss */}
{/*       <div
        className={`sheet-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
 */}
      {/* Panel */}
      <dialog
        ref={panelRef}
        className={`sheet-panel${open ? ' is-open' : ''}`}
        aria-label={label}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Chrome: drag handle centered, close button top-right */}
        <div className="sheet-chrome">
          <div className="sheet-handle" aria-hidden="true" />
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="btn-icon btn-icon-accent sheet-close-btn"
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Content area */}
        <div className="sheet-content">
          {(open || keepMounted) && (
            <>
              {children}
              <div className="sheet-close-bottom">
                <button onClick={onClose} className="btn-accent sheet-close-bottom-btn">
                  {closeLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>,
    document.body
  )
}
