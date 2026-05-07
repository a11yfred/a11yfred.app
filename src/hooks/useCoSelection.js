import { useCallback, useRef } from 'react'

const STORAGE_KEY = 'coSelectionPairs'
const SESSION_KEY = 'sessionCopiedIds'
const MAX_PAIRS = 500

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function readPairs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writePairs(pairs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs))
  } catch { /* storage unavailable */ }
}

function readSessionCopied() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function writeSessionCopied(set) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]))
  } catch { /* storage unavailable */ }
}

// Prune pairs object to MAX_PAIRS by dropping lowest-count entries
function pruneIfNeeded(pairs) {
  const keys = Object.keys(pairs)
  if (keys.length <= MAX_PAIRS) return pairs
  const sorted = keys.sort((a, b) => pairs[a] - pairs[b])
  const pruned = {}
  sorted.slice(keys.length - MAX_PAIRS).forEach(k => { pruned[k] = pairs[k] })
  return pruned
}

export function useCoSelection() {
  // Track the last ID that had a copy event this session, for pairing
  const lastCopiedRef = useRef(null)

  // Call this when the user copies desc, fix, or copy-all for a finding
  const recordCopy = useCallback((findingId) => {
    if (!findingId) return

    // Mark this ID as copied in sessionStorage (weak signal)
    const copied = readSessionCopied()
    copied.add(findingId)
    writeSessionCopied(copied)

    // If there was a previous copy in this session for a different entry, record the pair
    const prev = lastCopiedRef.current
    if (prev && prev !== findingId) {
      let pairs = readPairs()
      const key = pairKey(prev, findingId)
      pairs[key] = (pairs[key] || 0) + 1
      pairs = pruneIfNeeded(pairs)
      writePairs(pairs)
    }

    lastCopiedRef.current = findingId
  }, [])

  // Return the count for a specific pair (for ranking use)
  const getPairCount = useCallback((idA, idB) => {
    const pairs = readPairs()
    return pairs[pairKey(idA, idB)] || 0
  }, [])

  // Return all pair counts as a map keyed by the other ID, given one ID
  const getPairsFor = useCallback((findingId) => {
    const pairs = readPairs()
    const result = {}
    Object.entries(pairs).forEach(([key, count]) => {
      const [a, b] = key.split('|')
      if (a === findingId) result[b] = count
      else if (b === findingId) result[a] = count
    })
    return result
  }, [])

  return { recordCopy, getPairCount, getPairsFor }
}
