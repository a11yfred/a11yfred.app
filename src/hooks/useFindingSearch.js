import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { getFindings } from '../services/dataService.js'
import { applyOverride } from '../services/userOverridesService.js'
import { DEFAULT_RATING, MAX_SEARCH_ALL, MAX_SEARCH_RESULTS } from '../utils/constants.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',     weight: 0.28 },  // translated title
    { name: '_title_en', weight: 0.24 },  // English title, cross-language search
    { name: 'keywords',  weight: 0.20 },  // always English
    { name: 'desc',      weight: 0.18 },  // problem description
    { name: 'fix',       weight: 0.10 },  // suggested fix guidance
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
}

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, 'Best Practice': 4 }
const LOAD_TIMEOUT_MS = 8000

const DEFAULT_WCAG_FILTER = { maxVersion: '2.2', maxLevel: 'AA' }
const VERSION_ORDER = { '2.0': 0, '2.1': 1, '2.2': 2 }
const LEVEL_ORDER   = { 'A': 0, 'AA': 1, 'AAA': 2 }

// Parse boolean search operators: +term (required), -term (excluded)
function parseSearchQuery(query) {
  const trimmed = query.trim()
  const required = []
  const excluded = []

  // Extract all +term and -term operators
  const opPattern = /([+-])(\S+)/g
  let match
  while ((match = opPattern.exec(trimmed)) !== null) {
    const operator = match[1]
    const term = match[2]
    if (operator === '+') {
      required.push(term)
    } else {
      excluded.push(term)
    }
  }

  // Remove operators to get the freetext search terms
  const baseQuery = trimmed.replace(/[+-]\S+/g, '').trim()

  return { baseQuery, required, excluded }
}

export default function useFindingSearch(query, platform, locale = 'en', searchKey = 0, ratings = {}, userFindings = [], wcagFilter = DEFAULT_WCAG_FILTER, userOverrides = {}) {
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

  // Apply personal locale overrides then merge with user-created findings.
  const allFindings = useMemo(() => {
    const hasOverrides = Object.keys(userOverrides).length > 0
    const corpus = hasOverrides
      ? corpusFindings.map(f => applyOverride(f, locale, userOverrides))
      : corpusFindings
    return userFindings.length ? [...corpus, ...userFindings] : corpus
  }, [corpusFindings, userFindings, locale, userOverrides])

  const platformFiltered = useMemo(() => {
    if (!platform || platform === 'web') {
      return allFindings.filter(d => !d.platform || d.platform === 'web')
    }
    if (platform === 'native') {
      return allFindings.filter(d => !d.platform || d.platform === 'native')
    }
    if (platform === 'document') {
      return allFindings.filter(d => !d.platform || d.platform === 'document')
    }
    return allFindings
  }, [allFindings, platform])

  const versionFiltered = useMemo(() => {
    const { maxVersion = '2.2', maxLevel = 'AA' } = wcagFilter ?? {}
    const vMax = VERSION_ORDER[maxVersion] ?? 2
    const lMax = LEVEL_ORDER[maxLevel] ?? 1
    if (vMax === 2 && lMax >= 1) return platformFiltered
    return platformFiltered.filter(f => {
      if (f.wcagVersion && (VERSION_ORDER[f.wcagVersion] ?? 0) > vMax) return false
      if (f.wcagLevel  && (LEVEL_ORDER[f.wcagLevel]   ?? 0) > lMax) return false
      return true
    })
  }, [platformFiltered, wcagFilter])

  const sortedFindings = useMemo(() =>
    [...versionFiltered].sort((a, b) => {
      const ra = ratings[a.id] || DEFAULT_RATING
      const rb = ratings[b.id] || DEFAULT_RATING
      if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
      if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
      const sa = SEVERITY_ORDER[a.severity] ?? 99
      const sb = SEVERITY_ORDER[b.severity] ?? 99
      if (sa !== sb) return sa - sb
      return (a.primarySC ?? '').localeCompare(b.primarySC ?? '')
    })
  , [versionFiltered, ratings])

  const fuse = useMemo(() => new Fuse(versionFiltered, FUSE_OPTIONS), [versionFiltered])

  const results = useMemo(() => {
    if (!query || query.trim().length < 2) return []
    const { baseQuery, required, excluded } = parseSearchQuery(query)

    // eslint-disable-next-line react-hooks/purity -- intentional: dev-only profiling, side-effect-free
    const t0 = performance.now()
    const searchTerm = baseQuery || query.trim()
    const raw = fuse.search(searchTerm).slice(0, MAX_SEARCH_ALL)
    // eslint-disable-next-line react-hooks/purity -- intentional: dev-only profiling, side-effect-free
    const elapsed = performance.now() - t0
    if (import.meta.env.DEV && elapsed > 20) {
      console.warn(`[useFindingSearch] search took ${elapsed.toFixed(1)}ms for "${query}" over ${versionFiltered.length} entries`)
    }

    // Apply boolean filters: required terms and excluded terms
    const filtered = raw.filter(r => {
      const item = r.item
      const searchableText = [
        item.title, item.desc, item.fix, (item.keywords || []).join(' ')
      ].join(' ').toLowerCase()

      // Check required terms (all must be present)
      for (const term of required) {
        if (!searchableText.includes(term.toLowerCase())) return false
      }

      // Check excluded terms (none should be present)
      for (const term of excluded) {
        if (searchableText.includes(term.toLowerCase())) return false
      }

      return true
    })

    return filtered
      .sort((a, b) => {
        const ra = ratings[a.item.id] || DEFAULT_RATING
        const rb = ratings[b.item.id] || DEFAULT_RATING
        if (ra.archived !== rb.archived) return ra.archived ? 1 : -1
        if (ra.starred !== rb.starred) return ra.starred ? -1 : 1
        const adjA = (a.score ?? 1) - (ra.score * 0.05)
        const adjB = (b.score ?? 1) - (rb.score * 0.05)
        return adjA - adjB
      })
      .slice(0, MAX_SEARCH_RESULTS)
      .map(r => r.item)
  }, [fuse, query, searchKey, ratings]) // eslint-disable-line react-hooks/exhaustive-deps

  if (query === 'debug skeleton') {
    return { results: [], allFindings, sortedFindings, dataLoading: debugLoading, dataError: debugError, retryData }
  }

  return { results, allFindings, sortedFindings, dataLoading, dataError, retryData }
}
