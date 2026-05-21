import { useState, useEffect } from 'react'
import { Sheet as FrameworkSheet } from '@ulam/sili/react'

export default function A11ySheet({ open, onClose, ...props }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (open && isClosing) setIsClosing(false)
  }, [open, isClosing])

  const handleClose = () => {
    setIsClosing(true)
    onClose()
  }

  return (
    <FrameworkSheet
      open={open || isClosing}
      onClose={handleClose}
      {...props}
    />
  )
}
