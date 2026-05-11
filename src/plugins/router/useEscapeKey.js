import { useEffect } from 'react'

export function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return
    const handler = (e) => { if (e.key === 'Escape') onEscape() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isActive, onEscape])
}
