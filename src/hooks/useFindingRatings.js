import { useState } from 'react'
import { POP_STAR_BONUS, POP_UNSTAR_PENALTY, POP_ARCHIVE_PENALTY, POP_OPEN_BOOST, POP_COPY_BOOST, LS_DEFECT_RATINGS } from '../utils/constants.js'
import { getStorageJson, setStorageJson, removeStorage } from '../utils/storage.js'
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

function loadRatings() { return getStorageJson(LS_DEFECT_RATINGS, {}) }

export default function useFindingRatings() {
  const [ratings, setRatings] = useState(loadRatings)

  function update(id, fn) {
    setRatings(prev => {
      const next = { ...prev, [id]: fn(prev[id] || DEFAULT_RATING) }
      setStorageJson(LS_DEFECT_RATINGS, next)
      return next
    })
  }

  function resetRankings() {
    setRatings(prev => {
      const next = Object.fromEntries(
        Object.entries(prev).map(([id, r]) => [id, { ...r, score: 0 }])
      )
      setStorageJson(LS_DEFECT_RATINGS, next)
      return next
    })
  }

  function clearAllRatings() {
    removeStorage(LS_DEFECT_RATINGS)
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
        popularity:      (r.popularity ?? 0) + (nowStarring ? POP_STAR_BONUS : -POP_UNSTAR_PENALTY),
      }
    }),
    toggleArchive: (id) => update(id, r => ({
      ...r,
      archived:   !r.archived,
      popularity: (r.popularity ?? 0) + (r.archived ? POP_ARCHIVE_PENALTY : -POP_ARCHIVE_PENALTY),
    })),
    recordPin: (id) => update(id, r => ({
      ...r,
      lifetimePinned: (r.lifetimePinned ?? 0) + 1,
      popularity:     (r.popularity ?? 0) + 1,
    })),
    recordOpen: (id) => update(id, r => ({
      ...r,
      lifetimeOpened: (r.lifetimeOpened ?? 0) + 1,
      popularity:     (r.popularity ?? 0) + POP_OPEN_BOOST,
    })),
    recordCopy: (id, type) => update(id, r => {
      const field = COPY_FIELD[type]
      return {
        ...r,
        ...(field ? { [field]: (r[field] ?? 0) + 1 } : {}),
        popularity: (r.popularity ?? 0) + POP_COPY_BOOST,
      }
    }),
    resetRankings,
    clearAllRatings,
  }
}
