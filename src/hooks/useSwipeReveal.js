import { useState, useRef, useEffect } from 'react'
import { SWIPE_REVEAL, SWIPE_ACTIVATE } from '../utils/constants.js'

export default function useSwipeReveal({ listRef, showRanking, onPin, pinnedIds }) {
  const [swipeOpenId, setSwipeOpenId] = useState(null)
  const swipeTouchRef = useRef(null)
  const swipeStateRef = useRef({})

  // Keep snapshot in sync so the non-passive touchmove handler always sees current values
  useEffect(() => { swipeStateRef.current = { swipeOpenId, showRanking, onPin, pinnedIds } })

  // Non-passive native touchmove so e.preventDefault() actually works
  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return
    function handleTouchMove(e) {
      const touch = swipeTouchRef.current
      if (!touch) return
      const dx = e.touches[0].clientX - touch.startX
      const dy = e.touches[0].clientY - touch.startY
      if (!touch.moved && Math.abs(dy) > Math.abs(dx)) { swipeTouchRef.current = null; return }
      touch.moved = true
      const li = listEl.querySelector(`[data-swipe-id="${touch.id}"]`)
      const el = li?.querySelector('.result-swipe-wrap')
      if (!el) return
      const { swipeOpenId: openId, showRanking: sr, onPin: op, pinnedIds: pids } = swipeStateRef.current
      const isOpen = openId?.id === touch.id
      const side = isOpen ? openId.side : null
      const pinned = pids.has(touch.id)
      const base = isOpen ? (side === 'left' ? -SWIPE_REVEAL : SWIPE_REVEAL) : 0
      const minX = (sr && !pinned) ? -SWIPE_REVEAL : 0
      const maxX = op ? SWIPE_ACTIVATE : 0
      if (minX === 0 && maxX === 0) return
      const clamped = Math.max(minX, Math.min(maxX, base + dx))
      el.style.transition = 'none'
      el.style.transform = `translateX(${clamped}px)`
      const leftPanel = li?.querySelector('.result-action-panel--left')
      if (leftPanel && clamped < 0) leftPanel.style.width = `${Math.abs(clamped)}px`
      const rightPanel = li?.querySelector('.result-action-panel--right')
      if (rightPanel && clamped > 0) rightPanel.style.width = `${clamped}px`
      e.preventDefault()
    }
    listEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => listEl.removeEventListener('touchmove', handleTouchMove)
  }) // no deps -- re-runs each render to track listRef.current

  return { swipeOpenId, setSwipeOpenId, swipeTouchRef, swipeStateRef }
}
