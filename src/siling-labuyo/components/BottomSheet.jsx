import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, ChevronsUp } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { useDir } from '../hooks/useDir.js'
import { returnFocus } from '../../sili/core/returnFocus.js'

/**
 * Bottom sheet that slides up from the bottom of the viewport.
 * Rendered via a portal at document.body so transformed ancestors don't break position:fixed.
 *
 * - Scroll-locks the body while open AND not collapsed
 * - Swipe-to-dismiss: drag down from the chrome area to close
 * - Traps Tab focus while open AND not collapsed
 * - Background remains fully accessible and interactive when collapsed
 * - Dismisses on Escape or backdrop click (only when not collapsed)
 *
 * Props:
 *   open            boolean
 *   onClose         fn
 *   collapsed       boolean         controlled collapsed state (desktop only)
 *   onCollapse      fn              called with next collapsed boolean
 *   label           string          aria-label for the dialog/region
 *   keepMounted     boolean         keep children mounted while closed (preserves state)
 *   returnFocusRef  React.RefObject explicit return-focus target
 *   children        node
 */
export default function BottomSheet({
  open,
  onClose,
  collapsed = false,
  onCollapse,
  label = 'Detail',
  closeLabel = 'Close',
  heading,
  keepMounted = false,
  returnFocusRef,
  onBack,
  backLabel = 'Back',
  hideCloseBottom = false,
  closeIcon: CloseIcon = X,
  backLtrIcon: BackLtrIcon = ChevronLeft,
  backRtlIcon: BackRtlIcon = ChevronRight,
  children
}) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const dragStartY = useRef(null)
  const dragDelta = useRef(0)
  const dir = useDir()

  // Keep children mounted during exit animation so the sheet doesn't appear empty
  // while sliding down. Unmount 250ms after close (--duration-base).
  const [mounted, setMounted] = useState(open)
  const chromeRef = useRef(null)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(open), open ? 0 : 250)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => { if (!open) onCollapse?.(false) }, [open, onCollapse])

  // Track chrome height for collapsed transform and CSS page padding
  useEffect(() => {
    if (!open || !chromeRef.current || !panelRef.current) return
    const h = chromeRef.current.offsetHeight
    panelRef.current.style.setProperty('--sheet-chrome-height', `${h}px`)
    document.documentElement.style.setProperty('--sheet-chrome-height', `${h}px`)
    return () => { document.documentElement.style.removeProperty('--sheet-chrome-height') }
  }, [open])

  const BackChevron = dir === 'rtl' ? BackRtlIcon : BackLtrIcon
  const isDesktop = window.matchMedia('(width >= 768px)').matches

  // Trap and aria-hide disabled when collapsed so background remains accessible
  useFocusTrap(panelRef, open && !collapsed)
  useAriaHide(panelRef, open && !collapsed)

  // Parent effect fires after child effects — panel focus wins over useFocusOnMount in children
  useEffect(() => {
    if (open && !collapsed) {
      if (!returnFocusRef) triggerRef.current = document.activeElement
      panelRef.current?.focus()
    } else if (!open) {
      returnFocus(returnFocusRef?.current ?? triggerRef.current)
    }
  }, [open, collapsed, returnFocusRef])

  useEscapeKey(open && !collapsed, onClose)

  useEffect(() => {
    if (open && !collapsed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, collapsed])

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
      <div
        className={`sheet-backdrop${open && !collapsed ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`sheet-panel${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
        role={collapsed ? 'region' : 'dialog'}
        aria-modal={collapsed ? undefined : true}
        aria-label={label}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        inert={!open || undefined}
      >
        <div ref={chromeRef} className="sheet-chrome">
          {isDesktop ? (
            <button
              className="btn--icon sheet-handle--btn"
              aria-label={collapsed ? 'Expand sheet' : 'Collapse sheet'}
              onClick={() => onCollapse?.(!collapsed)}
            >
              {collapsed
                ? <ChevronsUp size={16} aria-hidden="true" />
                : <div className="sheet-handle" aria-hidden="true" />
              }
            </button>
          ) : (
            <div className="sheet-handle" aria-hidden="true" />
          )}
          {onBack && (
            <button
              onClick={onBack}
              aria-label={backLabel}
              className="btn--icon sheet-back-btn"
            >
              <BackChevron size={20} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="btn--icon sheet-close-btn"
          >
            <CloseIcon size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <div className="sheet-content">
          {(mounted || keepMounted) && (
            <>
              {children}
              {!hideCloseBottom && (
                <div className="sheet-close-bottom">
                  <button
                    onClick={onClose}
                    className="btn--primary sheet-close-bottom-btn"
                    aria-label={heading ? `${closeLabel} ${heading}` : undefined}
                  >
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
