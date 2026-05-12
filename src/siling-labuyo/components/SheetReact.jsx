import { useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import { useAriaHide } from '../hooks/useAriaHide.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { useDir } from '../hooks/useDir.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { returnFocus } from '../../sili/core/returnFocus.js'
import { lockScroll } from '../../sili/core/scrollLock.js'
import { useEffect } from 'react'
import Sheet from './Sheet.jsx'

export default function SheetReact({
  open,
  onClose,
  collapsed = false,
  returnFocusRef,
  children,
  ...rest
}) {
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const chromeRef = useRef(null)
  const dir = useDir()
  const isDesktop = useMediaQuery('(width >= 768px)')

  useFocusTrap(panelRef, open && !collapsed)
  useAriaHide(panelRef, open && !collapsed)
  useEscapeKey(open && !collapsed, onClose)

  useEffect(() => {
    if (open && !collapsed) {
      if (!returnFocusRef) triggerRef.current = document.activeElement
      panelRef.current?.focus()
    } else if (!open) {
      returnFocus(returnFocusRef?.current ?? triggerRef.current)
    }
  }, [open, collapsed, returnFocusRef])

  useEffect(() => {
    if (open && !collapsed) return lockScroll()
  }, [open, collapsed])

  return (
    <Sheet
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      panelRef={panelRef}
      chromeRef={chromeRef}
      dir={dir}
      isDesktop={isDesktop}
      returnFocusRef={returnFocusRef}
      {...rest}
    >
      {children}
    </Sheet>
  )
}
