import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

function DefaultCloseIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DefaultBackLtrIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function DefaultBackRtlIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function DefaultCollapseIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" />
    </svg>
  )
}

/**
 * Bottom sheet shell — structure, swipe gesture, and CSS classes only.
 * No focus management, aria-hide, escape handling, or scroll lock.
 * Use SheetReact (exported as Sheet from @ulam/siling-labuyo/react) for the
 * fully-wired React + sili version.
 *
 * Props:
 *   open            boolean
 *   onClose         fn
 *   collapsed       boolean
 *   onCollapse      fn
 *   label           string
 *   closeLabel      string
 *   heading         string
 *   keepMounted     boolean
 *   panelRef        React.RefObject   attach to the panel div (for focus trap etc.)
 *   chromeRef       React.RefObject   attach to the chrome div (for height measurement)
 *   dir             'ltr' | 'rtl'
 *   isDesktop       boolean
 *   onBack          fn
 *   backLabel       string
 *   hideCloseBottom boolean
 *   closeIcon       component
 *   backLtrIcon     component
 *   backRtlIcon     component
 *   collapseIcon    component
 *   children        node
 */
export default function Sheet({
  open,
  onClose,
  collapsed = false,
  onCollapse,
  label = 'Detail',
  closeLabel = 'Close',
  heading,
  keepMounted = false,
  panelRef: externalPanelRef,
  chromeRef: externalChromeRef,
  dir = 'ltr',
  isDesktop = false,
  onBack,
  backLabel = 'Back',
  hideCloseBottom = false,
  closeIcon: CloseIcon = DefaultCloseIcon,
  backLtrIcon: BackLtrIcon = DefaultBackLtrIcon,
  backRtlIcon: BackRtlIcon = DefaultBackRtlIcon,
  collapseIcon: CollapseIcon = DefaultCollapseIcon,
  children,
}) {
  const internalPanelRef = useRef(null)
  const internalChromeRef = useRef(null)
  const panelRef = externalPanelRef ?? internalPanelRef
  const chromeRef = externalChromeRef ?? internalChromeRef

  const dragStartY = useRef(null)
  const dragDelta = useRef(0)

  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(open), open ? 0 : 250)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => { if (!open) onCollapse?.(false) }, [open, onCollapse])

  useEffect(() => {
    if (!open || !chromeRef.current || !panelRef.current) return
    const h = chromeRef.current.offsetHeight
    panelRef.current.style.setProperty('--sheet-chrome-height', `${h}px`)
    document.documentElement.style.setProperty('--sheet-chrome-height', `${h}px`)
    return () => { document.documentElement.style.removeProperty('--sheet-chrome-height') }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- chromeRef and panelRef are stable React refs

  const BackChevron = dir === 'rtl' ? BackRtlIcon : BackLtrIcon

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
    if (dragDelta.current > 100) onClose()
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
        data-overlay-backdrop
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
        onClick={collapsed ? () => onCollapse?.(false) : undefined}
        onKeyDown={collapsed ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCollapse?.(false) } } : undefined}
        inert={!open || undefined}
      >
        <div ref={chromeRef} className="sheet-chrome">
          {isDesktop ? (
            <button
              className="btn--icon sheet-handle--btn"
              aria-label={collapsed ? 'Expand sheet' : 'Collapse sheet'}
              onClick={(e) => { e.stopPropagation(); onCollapse?.(!collapsed) }}
            >
              {collapsed
                ? <CollapseIcon />
                : <div className="sheet-handle" aria-hidden="true" />
              }
            </button>
          ) : (
            <div className="sheet-handle" aria-hidden="true" />
          )}
          {onBack && (
            <button onClick={onBack} aria-label={backLabel} className="btn--icon sheet-back-btn">
              <BackChevron />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onClose() }} aria-label={closeLabel} className="btn--icon sheet-close-btn">
            <CloseIcon />
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
                    className="btn btn--primary sheet-close-bottom-btn"
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
