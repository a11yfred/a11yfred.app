import { useState, useEffect, useMemo, useCallback } from 'react'
import { getFindings } from '../services/dataService.js'
import { mergeFindings, filterByPlatform, filterByWcag, sortFindings, searchFindings } from '../services/findingSearchService.js'
import { SEARCH_LOAD_TIMEOUT_MS, DEBUG_SKELETON_QUERY, DEFAULT_WCAG_FILTER } from '../utils/constants.js'

/**
 * Searches the findings corpus with fuzzy matching, filtering, and sorting.
 *
 * @param {string} query - search string; supports +required and -excluded operators
 * @param {string} platform - 'all' | 'web' | 'native' | 'document'
 * @param {string} [locale='en'] - BCP 47 locale code for translated corpus
 * @param {number} [searchKey=0] - increment to force a re-search with the same query
 * @param {Object} [ratings={}] - map of finding id to rating object { score, starred, archived }
 * @param {Array} [userFindings=[]] - user-created findings to append to corpus
 * @param {{ maxVersion: string, maxLevel: string }} [wcagFilter] - WCAG version/level ceiling
 * @param {Object} [userOverrides={}] - locale override map applied to corpus entries
 * @returns {{
 *   results: Array,        search results (up to MAX_SEARCH_RESULTS), empty when query < 2 chars
 *   allFindings: Array,    full corpus with overrides and user findings merged
 *   sortedFindings: Array, allFindings sorted by ratings then severity
 *   dataLoading: boolean,
 *   dataError: boolean,
 *   retryData: Function,   call to retry after a load error
 * }}
 */
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
    if (query !== DEBUG_SKELETON_QUERY) {
      setDebugLoading(false) // eslint-disable-line react-hooks/set-state-in-effect -- intentional reset when debug mode exits
      setDebugError(false)
      return
    }
    setDebugLoading(true)
    setDebugError(false)
    const t = setTimeout(() => { setDebugLoading(false); setDebugError(true) }, SEARCH_LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [query, retryCount])

  useEffect(() => {
    let cancelled = false
    setDataLoading(true)  // eslint-disable-line react-hooks/set-state-in-effect -- standard async loading pattern
    setDataError(false)

    const timeout = setTimeout(() => {
      if (!cancelled) { setDataError(true); setDataLoading(false) }
    }, SEARCH_LOAD_TIMEOUT_MS)

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

  const allFindings = useMemo(
    () => mergeFindings(corpusFindings, locale, userOverrides, userFindings),
    [corpusFindings, userFindings, locale, userOverrides]
  )

  const versionFiltered = useMemo(
    () => filterByWcag(filterByPlatform(allFindings, platform), wcagFilter),
    [allFindings, platform, wcagFilter]
  )

  const sortedFindings = useMemo(
    () => sortFindings(versionFiltered, ratings),
    [versionFiltered, ratings]
  )

  const results = useMemo(
    () => searchFindings(versionFiltered, query, ratings, searchKey),
    [versionFiltered, query, ratings, searchKey]
  )

  if (query === DEBUG_SKELETON_QUERY) {
    return { results: [], allFindings, sortedFindings, dataLoading: debugLoading, dataError: debugError, retryData }
  }

  return { results, allFindings, sortedFindings, dataLoading, dataError, retryData }
}
