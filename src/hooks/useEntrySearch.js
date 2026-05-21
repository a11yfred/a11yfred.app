import { useState, useEffect, useMemo, useCallback } from 'react'
import { getEntries } from '../services/dataService.js'
import { mergeEntries, filterByPlatform, filterByWcag, sortEntries, searchEntries } from '../services/entrySearchService.js'
import { SEARCH_LOAD_TIMEOUT_MS, DEBUG_SKELETON_QUERY, DEFAULT_WCAG_FILTER } from '../utils/constants.js'

/**
 * Searches the entries corpus with fuzzy matching, filtering, and sorting.
 *
 * @param {string} query - search string; supports +required and -excluded operators
 * @param {string} platform - 'all' | 'web' | 'native' | 'document'
 * @param {string} [locale='en'] - BCP 47 locale code for translated corpus
 * @param {number} [searchKey=0] - increment to force a re-search with the same query
 * @param {Object} [ratings={}] - map of entry id to rating object { score, starred, archived }
 * @param {Array} [userEntries=[]] - user-created entries to append to corpus
 * @param {{ maxVersion: string, maxLevel: string }} [wcagFilter] - WCAG version/level ceiling
 * @param {Object} [userOverrides={}] - locale override map applied to corpus entries
 * @returns {{
 *   results: Array,        search results (up to MAX_SEARCH_RESULTS), empty when query < 2 chars
 *   allEntries: Array,     full corpus with overrides and user entries merged
 *   sortedEntries: Array,  allEntries sorted by ratings then severity
 *   dataLoading: boolean,
 *   dataError: boolean,
 *   retryData: Function,   call to retry after a load error
 * }}
 */
export default function useEntrySearch(query, platform, locale = 'en', searchKey = 0, ratings = {}, userEntries = [], wcagFilter = DEFAULT_WCAG_FILTER, userOverrides = {}) {
  const [corpusEntries, setCorpusEntries] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState(false)
  const [dataErrorMessage, setDataErrorMessage] = useState('')
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
    setDataErrorMessage('')

    const timeout = setTimeout(() => {
      if (!cancelled) { setDataError(true); setDataLoading(false) }
    }, SEARCH_LOAD_TIMEOUT_MS)

    getEntries(locale)
      .then(data => {
        if (cancelled) return
        clearTimeout(timeout)
        setCorpusEntries(data)
        setDataLoading(false)
        setDataErrorMessage('')
      })
      .catch((error) => {
        if (cancelled) return
        clearTimeout(timeout)
        setDataError(true)
        setDataLoading(false)
        setDataErrorMessage(error?.message || `Failed to load accessibility data for ${locale}`)
      })

    return () => { cancelled = true; clearTimeout(timeout) }
  }, [locale, retryCount])

  const allEntries = useMemo(
    () => mergeEntries(corpusEntries, locale, userOverrides, userEntries),
    [corpusEntries, userEntries, locale, userOverrides]
  )

  const versionFiltered = useMemo(
    () => filterByWcag(filterByPlatform(allEntries, platform), wcagFilter),
    [allEntries, platform, wcagFilter]
  )

  const sortedEntries = useMemo(
    () => sortEntries(versionFiltered, ratings),
    [versionFiltered, ratings]
  )

  const results = useMemo(
    () => searchEntries(versionFiltered, query, ratings, searchKey),
    [versionFiltered, query, ratings, searchKey]
  )

  if (query === DEBUG_SKELETON_QUERY) {
    return { results: [], allEntries, sortedEntries, dataLoading: debugLoading, dataError: debugError, dataErrorMessage, retryData }
  }

  return { results, allEntries, sortedEntries, dataLoading, dataError, dataErrorMessage, retryData }
}
