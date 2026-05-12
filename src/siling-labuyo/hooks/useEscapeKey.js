import { useEffect } from 'react'
import { onEscapeKey } from '../../sili/core/escapeKey.js'

export function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return
    return onEscapeKey(onEscape)
  }, [isActive, onEscape])
}
