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

export default function useDefectSearch(query, platform, locale = 'en', searchKey = 0) {
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
      .slice(0, 8)
      .map(r => r.item)
  }, [fuse, query, searchKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return results
}
