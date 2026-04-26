import { useState } from 'react'

const STORAGE_KEY = 'defect_ratings'
const DEFAULT_RATING = { score: 0, starred: false, archived: false }

function loadRatings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export default function useDefectRatings() {
  const [ratings, setRatings] = useState(loadRatings)

  function update(id, fn) {
    setRatings(prev => {
      const next = { ...prev, [id]: fn(prev[id] || DEFAULT_RATING) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return {
    ratings,
    getRating:     (id) => ratings[id] || DEFAULT_RATING,
    upvote:        (id) => update(id, r => ({ ...r, score: r.score + 1 })),
    downvote:      (id) => update(id, r => ({ ...r, score: r.score - 1 })),
    toggleStar:    (id) => update(id, r => ({ ...r, starred: !r.starred })),
    toggleArchive: (id) => update(id, r => ({ ...r, archived: !r.archived })),
  }
}
