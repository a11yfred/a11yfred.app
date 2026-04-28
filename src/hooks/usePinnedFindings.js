import { useState } from 'react'

const STORAGE_KEY = 'pinnedFindings'

function loadPins() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) } catch { return new Set() }
}

export default function usePinnedFindings() {
  const [pinnedIds, setPinnedIds] = useState(loadPins)

  function togglePin(id) {
    setPinnedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }

  function clearPins() {
    setPinnedIds(new Set())
    localStorage.removeItem(STORAGE_KEY)
  }

  return { pinnedIds, togglePin, clearPins }
}
