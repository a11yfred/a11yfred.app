import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useFocusTrap } from './useFocusTrap.js'
import { useAriaHide } from './useAriaHide.js'
import { returnFocus } from './returnFocus.js'
import { useDir } from './useDir.js'

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
 *   open            boolean          — whether the sheet is visible
 *   onClose         fn               — called on Escape, backdrop click, or close button
 *   label           string           — aria-label for the dialog
 *   keepMounted     boolean          — keep children mounted while closed (preserves state)
 *   returnFocusRef  React.RefObject  — if provided, focus this element on close instead of
 *                                      auto-captured trigger; use when child effects move focus
 *                                      before this component's useEffect fires (child effects
 *                                      fire before parent effects in React)
 *   children        node             — rendered inside the sheet
 */
export default function BottomSheet({ open, onClose, label = 'Detail', closeLabel = 'Close', keepMounted = false, returnFocusRef, onBack, backLabel = 'Back', hideCloseBottom = false, closeIcon: CloseIcon = X, backLtrIcon: BackLtrIcon = ChevronLeft, backRtlIcon: BackRtlIcon = ChevronRight, children }) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const dragStartY = useRef(null)
  const dragDelta = useRef(0)
  const dir = useDir()

  // Keep children mounted during the exit animation so the sheet doesn't
  // appear empty while sliding down. Unmount 250ms after close (--duration-base).
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(open), open ? 0 : 250)
    return () => clearTimeout(timer)
  }, [open])
  const BackChevron = dir === 'rtl' ? BackRtlIcon : BackLtrIcon

  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)

  // Save the triggering element on open; focus the panel; restore focus on close.
  // Panel focus fires here (parent effect) after useFocusOnMount in children (child
  // effects run first), so the panel wins and NVDA announces the dialog label once.
  useEffect(() => {
    if (open) {
      if (!returnFocusRef) triggerRef.current = document.activeElement
      panelRef.current?.focus()
    } else {
      returnFocus(returnFocusRef?.current ?? triggerRef.current)
    }
  }, [open, returnFocusRef])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

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
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        inert={!open || undefined}
      >
        {/* Chrome: drag handle centered, optional back button top-left, close button top-right */}
        <div className="sheet-chrome">
          <div className="sheet-handle" aria-hidden="true" />
          {onBack && (
            <button
              onClick={onBack}
              aria-label={backLabel}
              className="btn-icon btn-icon-accent sheet-back-btn"
            >
              <BackChevron size={20} strokeWidth={2.5} aria-hidden="true" role="presentation" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="btn-icon btn-icon-accent sheet-close-btn"
          >
            <CloseIcon size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Content area */}
        <div className="sheet-content">
          {(mounted || keepMounted) && (
            <>
              {children}
              {!hideCloseBottom && (
                <div className="sheet-close-bottom">
                  <button onClick={onClose} className="btn-accent sheet-close-bottom-btn">
                    {closeLabel}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
