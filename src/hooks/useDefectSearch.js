import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { getDefects } from '../services/dataService.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',    weight: 0.45 },
    { name: 'keywords', weight: 0.35 },
    { name: 'desc',     weight: 0.15 },
    { name: 'rem',      weight: 0.05 },
  ],
  threshold: 0.4,        // 0 = exact, 1 = match anything
  minMatchCharLength: 2,
  includeScore: true,
}

export default function useDefectSearch(query, platform) {
  const [allDefects, setAllDefects] = useState([])

  useEffect(() => {
    getDefects().then(setAllDefects)
  }, [])

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
      .slice(0, 8)
      .map(r => r.item)
  }, [fuse, query])

  return results
}
