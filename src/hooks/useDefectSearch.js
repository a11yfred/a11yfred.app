import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { getDefects } from '../services/dataService.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',     weight: 0.32 },  // translated title
    { name: '_title_en', weight: 0.28 },  // English title — cross-language search
    { name: 'keywords',  weight: 0.30 },  // always English
    { name: 'desc',      weight: 0.07 },
    { name: 'rem',       weight: 0.03 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
}

const DEFAULT_RATING = { score: 0, starred: false, archived: false }

export default function useDefectSearch(query, platform, locale = 'en', searchKey = 0, ratings = {}) {
  const [allDefects, setAllDefects] = useState([])

  useEffect(() => {
    getDefects(locale).then(setAllDefects)
  }, [locale])

  const platformFiltered = useMemo(() => {
    if (!platform || platform === 'web') {
      return allDefects.filter(d => !d.nativeOnly)
    }
    if (platform === 'native') {
      return allDefects.filter(d => !d.webOnly)
    }
    return allDefects
  }, [allDefects, platform])

  const fuse = useMemo(() => new Fuse(platformFiltered, FUSE_OPTIONS), [platformFiltered])

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return []
    return fuse
      .search(query.trim())
      .slice(0, 12)
      .sort((a, b) => {
        const ra = ratings[a.item.id] || DEFAULT_RATING
        const rb = ratings[b.item.id] || DEFAULT_RATING
        // Archived items always sink to the bottom
        if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
        // Starred non-archived items float to the top
        if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
        // Adjust fuse score (0=best, 1=worst) by vote score
        const adjA = (a.score ?? 1) - (ra.score * 0.05)
        const adjB = (b.score ?? 1) - (rb.score * 0.05)
        return adjA - adjB
      })
      .slice(0, 8)
      .map(r => r.item)
  }, [fuse, query, searchKey, ratings]) // eslint-disable-line react-hooks/exhaustive-deps

  return results
}
