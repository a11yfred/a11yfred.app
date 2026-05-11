import { useCallback, useRef } from 'react'
import { LS_CO_SELECTION, SS_COPIED_IDS } from '../utils/constants.js'
import { getStorageJson, setStorageJson, getSessionJson, setSessionJson } from '../utils/storage.js'

const MAX_PAIRS = 500

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function pruneIfNeeded(pairs) {
  const keys = Object.keys(pairs)
  if (keys.length <= MAX_PAIRS) return pairs
  const sorted = keys.sort((a, b) => pairs[a] - pairs[b])
  const pruned = {}
  sorted.slice(keys.length - MAX_PAIRS).forEach(k => { pruned[k] = pairs[k] })
  return pruned
}

export function useCoSelection() {
  const lastCopiedRef = useRef(null)

  const recordCopy = useCallback((findingId) => {
    if (!findingId) return

    const copied = new Set(getSessionJson(SS_COPIED_IDS, []))
    copied.add(findingId)
    setSessionJson(SS_COPIED_IDS, [...copied])

    const prev = lastCopiedRef.current
    if (prev && prev !== findingId) {
      let pairs = getStorageJson(LS_CO_SELECTION, {})
      const key = pairKey(prev, findingId)
      pairs[key] = (pairs[key] || 0) + 1
      pairs = pruneIfNeeded(pairs)
      setStorageJson(LS_CO_SELECTION, pairs)
    }

    lastCopiedRef.current = findingId
  }, [])

  const getPairsFor = useCallback((findingId) => {
    const pairs = getStorageJson(LS_CO_SELECTION, {})
    const result = {}
    Object.entries(pairs).forEach(([key, count]) => {
      const [a, b] = key.split('|')
      if (a === findingId) result[b] = count
      else if (b === findingId) result[a] = count
    })
    return result
  }, [])

  return { recordCopy, getPairsFor }
}
