import { useState } from 'react'

const STORAGE_KEY = 'defect_ratings'
const DEFAULT_RATING = {
  score: 0,
  starred: false,
  archived: false,
  popularity: 0,
  starredAt: null,
  lifetimeStarred: 0,
  lifetimePinned: 0,
  lifetimeOpened: 0,
  lifetimeCopiedTitle: 0,
  lifetimeCopiedPrimarySc: 0,
  lifetimeCopiedRelatedSc: 0,
  lifetimeCopiedDesc: 0,
  lifetimeCopiedFix: 0,
  lifetimeCopiedAll: 0,
}

const COPY_FIELD = {
  title:      'lifetimeCopiedTitle',
  primarySc:  'lifetimeCopiedPrimarySc',
  relatedSc:  'lifetimeCopiedRelatedSc',
  desc:       'lifetimeCopiedDesc',
  fix:        'lifetimeCopiedFix',
  all:        'lifetimeCopiedAll',
}

function loadRatings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export default function useFindingRatings() {
  const [ratings, setRatings] = useState(loadRatings)

  function update(id, fn) {
    setRatings(prev => {
      const next = { ...prev, [id]: fn(prev[id] || DEFAULT_RATING) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function resetRankings() {
    setRatings(prev => {
      const next = Object.fromEntries(
        Object.entries(prev).map(([id, r]) => [id, { ...r, score: 0 }])
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function clearAllRatings() {
    localStorage.removeItem(STORAGE_KEY)
    setRatings({})
  }

  return {
    ratings,
    getRating:     (id) => ratings[id] || DEFAULT_RATING,
    rankUp:        (id) => update(id, r => ({ ...r, score: r.score + 1, popularity: (r.popularity ?? 0) + 1 })),
    rankDown:      (id) => update(id, r => ({ ...r, score: r.score - 1, popularity: (r.popularity ?? 0) - 1 })),
    toggleStar:    (id) => update(id, r => {
      const nowStarring = !r.starred
      return {
        ...r,
        starred:         nowStarring,
        starredAt:       nowStarring ? Date.now() : null,
        lifetimeStarred: (r.lifetimeStarred ?? 0) + (nowStarring ? 1 : 0),
        popularity:      (r.popularity ?? 0) + (nowStarring ? 2 : -1),
      }
    }),
    toggleArchive: (id) => update(id, r => ({
      ...r,
      archived:   !r.archived,
      popularity: (r.popularity ?? 0) + (r.archived ? 1 : -1),
    })),
    recordPin: (id) => update(id, r => ({
      ...r,
      lifetimePinned: (r.lifetimePinned ?? 0) + 1,
      popularity:     (r.popularity ?? 0) + 1,
    })),
    recordOpen: (id) => update(id, r => ({
      ...r,
      lifetimeOpened: (r.lifetimeOpened ?? 0) + 1,
      popularity:     (r.popularity ?? 0) + 0.5,
    })),
    recordCopy: (id, type) => update(id, r => {
      const field = COPY_FIELD[type]
      return {
        ...r,
        ...(field ? { [field]: (r[field] ?? 0) + 1 } : {}),
        popularity: (r.popularity ?? 0) + 0.25,
      }
    }),
    resetRankings,
    clearAllRatings,
  }
}
