import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { getFindings } from '../services/dataService.js'

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

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, 'Best Practice': 4 }
const LOAD_TIMEOUT_MS = 8000

const DEFAULT_RATING = { score: 0, starred: false, archived: false }

export default function useFindingSearch(query, platform, locale = 'en', searchKey = 0, ratings = {}, userFindings = []) {
  const [corpusFindings, setCorpusFindings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [debugLoading, setDebugLoading] = useState(false)
  const [debugError, setDebugError] = useState(false)

  const retryData = useCallback(() => {
    setRetryCount(c => c + 1)
  }, [])

  useEffect(() => {
    if (query !== 'debug skeleton') {
      setDebugLoading(false) // eslint-disable-line react-hooks/set-state-in-effect -- intentional reset when debug mode exits
      setDebugError(false)
      return
    }
    setDebugLoading(true)
    setDebugError(false)
    const t = setTimeout(() => { setDebugLoading(false); setDebugError(true) }, LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [query, retryCount])

  useEffect(() => {
    let cancelled = false
    setDataLoading(true)  // eslint-disable-line react-hooks/set-state-in-effect -- standard async loading pattern
    setDataError(false)

    const timeout = setTimeout(() => {
      if (!cancelled) { setDataError(true); setDataLoading(false) }
    }, LOAD_TIMEOUT_MS)

    getFindings(locale)
      .then(data => {
        if (cancelled) return
        clearTimeout(timeout)
        setCorpusFindings(data)
        setDataLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        clearTimeout(timeout)
        setDataError(true)
        setDataLoading(false)
      })

    return () => { cancelled = true; clearTimeout(timeout) }
  }, [locale, retryCount])

  // Merge corpus findings with user-created findings.
  const allFindings = useMemo(
    () => userFindings.length ? [...corpusFindings, ...userFindings] : corpusFindings,
    [corpusFindings, userFindings]
  )

  const platformFiltered = useMemo(() => {
    if (!platform || platform === 'web') {
      return allFindings.filter(d => !d.nativeOnly)
    }
    if (platform === 'native') {
      return allFindings.filter(d => !d.webOnly)
    }
    return allFindings
  }, [allFindings, platform])

  const sortedFindings = useMemo(() =>
    [...platformFiltered].sort((a, b) => {
      const ra = ratings[a.id] || DEFAULT_RATING
      const rb = ratings[b.id] || DEFAULT_RATING
      if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
      if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
      const pa = PRIORITY_ORDER[a.priority] ?? 99
      const pb = PRIORITY_ORDER[b.priority] ?? 99
      if (pa !== pb) return pa - pb
      return (a.scLabel ?? '').localeCompare(b.scLabel ?? '')
    })
  , [platformFiltered, ratings])

  const fuse = useMemo(() => new Fuse(platformFiltered, FUSE_OPTIONS), [platformFiltered])

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return []
    return fuse
      .search(query.trim())
      .slice(0, 12)
      .sort((a, b) => {
        const ra = ratings[a.item.id] || DEFAULT_RATING
        const rb = ratings[b.item.id] || DEFAULT_RATING
        if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
        if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
        const adjA = (a.score ?? 1) - (ra.score * 0.05)
        const adjB = (b.score ?? 1) - (rb.score * 0.05)
        return adjA - adjB
      })
      .slice(0, 8)
      .map(r => r.item)
  }, [fuse, query, searchKey, ratings]) // eslint-disable-line react-hooks/exhaustive-deps

  if (query === 'debug skeleton') {
    return { results: [], allFindings, sortedFindings, dataLoading: debugLoading, dataError: debugError, retryData }
  }

  return { results, allFindings, sortedFindings, dataLoading, dataError, retryData }
}
