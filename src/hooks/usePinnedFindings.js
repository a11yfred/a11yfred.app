import { useState } from 'react'
import { LS_PINNED_FINDINGS } from '../utils/constants.js'
import { getStorageJson, setStorageJson, removeStorage } from '../utils/storage.js'

function loadPins() {
  try { return new Set(getStorageJson(LS_PINNED_FINDINGS, [])) } catch { return new Set() }
}

export default function usePinnedFindings() {
  const [pinnedIds, setPinnedIds] = useState(loadPins)

  function togglePin(id) {
    setPinnedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setStorageJson(LS_PINNED_FINDINGS, [...next])
      return next
    })
  }

  function clearPins() {
    setPinnedIds(new Set())
    removeStorage(LS_PINNED_FINDINGS)
  }

  return { pinnedIds, togglePin, clearPins }
}
