import { useEffect, useState } from 'react'

// Wrapper for prefers-reduced-motion media query
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

// Keyboard event handler hook (basic implementation)
export function useKeydown(handler, dependencies = []) {
  useEffect(() => {
    const onKeydown = (e) => handler(e)
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, dependencies)
}

// List flip/reorder utility (basic implementation for visual reordering)
export function useFlipList(items, transform = (x) => x) {
  const [flipped, setFlipped] = useState([])

  const flip = () => {
    setFlipped((prev) =>
      prev.length === items.length ? [] : items.map((_, i) => i)
    )
  }

  return {
    flipped,
    flip,
    transform: (items) =>
      flipped.length > 0
        ? flipped.map((i) => items[i]).filter(Boolean)
        : items,
  }
}
