import { useState, useCallback, useRef } from 'react'
import { getAdapter } from '../sawsawan/platformAdapter.js'

const readJson      = (key, fallback) => getAdapter().readPrefJson(key, fallback)
const writeJson     = (key, value)    => getAdapter().writePrefJson(key, value)
const readSessionJson  = (key, fallback) => getAdapter().readSessionJson(key, fallback)
const writeSessionJson = (key, value)    => getAdapter().writeSessionJson(key, value)
const removeKey     = (key)           => getAdapter().removePref(key)

// ─── useItemSignals ──────────────────────────────────────────────────────────
// Tracks all user interaction signals for a corpus of items.
// storageKey      — localStorage key for the signals map
// popWeights      — optional boost/penalty overrides for popularity scoring
//
// Default signal shape per item:
//   { score, starred, archived, popularity, starredAt,
//     lifetimeStarred, lifetimePinned, lifetimeOpened, ...lifetimeCopied* }

const DEFAULT_SIGNALS = {
  score: 0,
  starred: false,
  archived: false,
  popularity: 0,
  starredAt: null,
  lifetimeStarred: 0,
  lifetimePinned: 0,
  lifetimeOpened: 0,
}

const DEFAULT_WEIGHTS = {
  starBonus: 3,
  unstarPenalty: 1,
  archivePenalty: 2,
  openBoost: 0.5,
  copyBoost: 1,
}

export function useItemSignals(storageKey, popWeights = {}) {
  const w = { ...DEFAULT_WEIGHTS, ...popWeights }
  const [signals, setSignals] = useState(() => readJson(storageKey, {}))

  function update(id, fn) {
    setSignals(prev => {
      const next = { ...prev, [id]: fn(prev[id] || DEFAULT_SIGNALS) }
      writeJson(storageKey, next)
      return next
    })
  }

  function resetScores() {
    setSignals(prev => {
      const next = Object.fromEntries(
        Object.entries(prev).map(([id, s]) => [id, { ...s, score: 0 }])
      )
      writeJson(storageKey, next)
      return next
    })
  }

  function clearAll() {
    removeKey(storageKey)
    setSignals({})
  }

  return {
    signals,
    getSignals:    (id) => signals[id] || DEFAULT_SIGNALS,
    rankUp:        (id) => update(id, s => ({ ...s, score: s.score + 1, popularity: (s.popularity ?? 0) + 1 })),
    rankDown:      (id) => update(id, s => ({ ...s, score: s.score - 1, popularity: (s.popularity ?? 0) - 1 })),
    toggleStar:    (id) => update(id, s => {
      const nowStarring = !s.starred
      return {
        ...s,
        starred:         nowStarring,
        starredAt:       nowStarring ? Date.now() : null,
        lifetimeStarred: (s.lifetimeStarred ?? 0) + (nowStarring ? 1 : 0),
        popularity:      (s.popularity ?? 0) + (nowStarring ? w.starBonus : -w.unstarPenalty),
      }
    }),
    toggleArchive: (id) => update(id, s => ({
      ...s,
      archived:   !s.archived,
      popularity: (s.popularity ?? 0) + (s.archived ? w.archivePenalty : -w.archivePenalty),
    })),
    recordPin:  (id) => update(id, s => ({
      ...s,
      lifetimePinned: (s.lifetimePinned ?? 0) + 1,
      popularity:     (s.popularity ?? 0) + 1,
    })),
    recordOpen: (id) => update(id, s => ({
      ...s,
      lifetimeOpened: (s.lifetimeOpened ?? 0) + 1,
      popularity:     (s.popularity ?? 0) + w.openBoost,
    })),
    recordCopy: (id, field) => update(id, s => ({
      ...s,
      ...(field ? { [field]: (s[field] ?? 0) + 1 } : {}),
      popularity: (s.popularity ?? 0) + w.copyBoost,
    })),
    resetScores,
    clearAll,
  }
}

// ─── usePinnedItems ──────────────────────────────────────────────────────────
// Persists a set of pinned item IDs.

export function usePinnedItems(storageKey) {
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return new Set(readJson(storageKey, [])) } catch { return new Set() }
  })

  function togglePin(id) {
    setPinnedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeJson(storageKey, [...next])
      return next
    })
  }

  function clearPins() {
    setPinnedIds(new Set())
    removeKey(storageKey)
  }

  return { pinnedIds, togglePin, clearPins }
}

// ─── useCoSelection ──────────────────────────────────────────────────────────
// Tracks which items are copied/selected together to infer affinity pairs.
// coKey       — localStorage key for the pair weight map
// sessionKey  — sessionStorage key for the current-session copied-ID set
// maxPairs    — prune threshold (default 500)

export function useCoSelection(coKey, sessionKey, maxPairs = 500) {
  const lastRef = useRef(null)

  function pairKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`
  }

  function prune(pairs) {
    const keys = Object.keys(pairs)
    if (keys.length <= maxPairs) return pairs
    const sorted = keys.sort((a, b) => pairs[a] - pairs[b])
    const pruned = {}
    sorted.slice(keys.length - maxPairs).forEach(k => { pruned[k] = pairs[k] })
    return pruned
  }

  const recordSelection = useCallback((id) => {
    if (!id) return

    const copied = new Set(readSessionJson(sessionKey, []))
    copied.add(id)
    writeSessionJson(sessionKey, [...copied])

    const prev = lastRef.current
    if (prev && prev !== id) {
      let pairs = readJson(coKey, {})
      const key = pairKey(prev, id)
      pairs[key] = (pairs[key] || 0) + 1
      pairs = prune(pairs)
      writeJson(coKey, pairs)
    }

    lastRef.current = id
  }, [coKey, sessionKey]) // eslint-disable-line react-hooks/exhaustive-deps -- prune/pairKey are stable

  const getPairsFor = useCallback((id) => {
    const pairs = readJson(coKey, {})
    const result = {}
    Object.entries(pairs).forEach(([key, count]) => {
      const [a, b] = key.split('|')
      if (a === id) result[b] = count
      else if (b === id) result[a] = count
    })
    return result
  }, [coKey])

  return { recordSelection, getPairsFor }
}

// ─── relatedItems ────────────────────────────────────────────────────────────
// Pure function. Returns the top N most relevant items from corpus relative to
// a focal item, using a caller-supplied ranking function.
//
// item        — the focal item
// corpus      — all items (focal item excluded automatically)
// rankFn      — (candidate, focal, coSelectionPairs) => { tier: number, boost: number }
//               lower tier = more relevant; ties broken by boost (higher = better)
// getPairsFor — (id) => { [otherId]: count } from useCoSelection
// options     — { maxTier: number (default 5), limit: number (default 5) }

export function relatedItems(item, corpus, rankFn, getPairsFor, options = {}) {
  const { maxTier = 5, limit = 5 } = options
  const coSelectionPairs = getPairsFor ? getPairsFor(item.id) : {}

  return corpus
    .filter(c => c.id !== item.id)
    .map(c => ({ item: c, ...rankFn(c, item, coSelectionPairs) }))
    .filter(({ tier }) => tier <= maxTier)
    .sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : b.boost - a.boost)
    .slice(0, limit)
    .map(({ item: c }) => c)
}
