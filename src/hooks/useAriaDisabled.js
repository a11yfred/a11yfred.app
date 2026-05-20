import { useEffect } from 'react'
import { applyAriaDisabled } from '@ulam/ube/core'

export function useAriaDisabled(ref, disabled) {
  useEffect(() => {
    if (!ref || !ref.current) return
    if (disabled) {
      return applyAriaDisabled(ref.current)
    } else {
      ref.current.removeAttribute('aria-disabled')
    }
  }, [ref, disabled])
}
