import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useEntrySearch from './useEntrySearch'
import {
  SEVERITY_SCORE,
  SMART_SCORE_STAR_BONUS,
  SMART_SCORE_RANK_WEIGHT,
  SMART_SCORE_POP_WEIGHT,
  SMART_SCORE_ARCHIVE_PENALTY,
  SMART_SCORE_INDEX_PENALTY,
  SEVERITY_SORT_ORDER,
  SORT_MISSING_ORDER,
  WCAG_VERSION_ORDER,
  WCAG_LEVEL_ORDER,
  PLATFORM_ORDER,
  MS_PER_DAY,
  RESULTS_COUNT_FOCUS_DELAY,
  DEFAULT_WCAG_FILTER,
  EASTER_EGGS,
} from '../utils/constants.js'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import { getPinnedEntries, getUnpinnedEntries } from '../utils/entryFilters.js'
import { getViewAllPlatformLabel } from '../utils/labelFormatters.js'
import { announce } from '@ulam/taho'

const pluralResult = (n) => n === 1 ? 'result' : 'results'

/**
 * Manages search state, filtering, sorting, and URL synchronization.
 * Handles live vs submitted query, narrow mode, badges, and results presentation.
 *
 * @param {Object} deps - Dependencies
 * @param {string} deps.query - Current search query from context
 * @param {Function} deps.setQuery - Setter for query
 * @param {string} deps.submittedQuery - Last submitted query
 * @param {Function} deps.setSubmittedQuery - Setter for submitted query
 * @param {number} deps.searchKey - Key to trigger search
 * @param {Function} deps.setSearchKey - Setter for search key
 * @param {string} deps.sortBy - Current sort mode
 * @param {Function} deps.setSortBy - Setter for sort mode
 * @param {string} deps.narrowQuery - Current narrow filter query
 * @param {Function} deps.setNarrowQuery - Setter for narrow query
 * @param {string} deps.submittedNarrowQuery - Last submitted narrow query
 * @param {Function} deps.setSubmittedNarrowQuery - Setter for submitted narrow query
 * @param {boolean} deps.narrowMode - Whether narrow mode is active
 * @param {Function} deps.setNarrowMode - Setter for narrow mode
 * @param {Object} deps.ratings - Entry ratings object
 * @param {Set<string>} deps.pinnedIds - Set of pinned entry IDs
 * @param {Function} deps.togglePin - Toggle pin for an entry
 * @param {Function} deps.recordOpen - Record entry open event
 * @param {string} deps.platform - Current platform filter
 * @param {string} deps.language - Current language
 * @param {Object} deps.wcagFilter - WCAG version/level filter
 * @param {boolean} deps.liveSearch - Whether live search is enabled
 * @param {boolean} deps.showPersonalCorpus - Whether to include personal entries
 * @param {Array} deps.userEntries - User's custom entries
 * @param {Object} deps.userOverrides - User's custom entry overrides
 * @param {Function} deps.t - Translation function
 * @param {Function} deps.navigate - Router navigate function
 * @param {Function} deps.setLanguage - Setter for language
 *
 * @returns {{
 *   query: string,
 *   setQuery: Function,
 *   submittedQuery: string,
 *   setSubmittedQuery: Function,
 *   searchFocused: boolean,
 *   badgeFilter: { type: string, value: string } | null,
 *   setBadgeFilter: Function,
 *   narrowMode: boolean,
 *   narrowQuery: string,
 *   submittedNarrowQuery: string,
 *   sortBy: string,
 *   results: Array,
 *   allEntries: Array,
 *   sortedEntries: Array,
 *   dataLoading: boolean,
 *   dataError: boolean,
 *   retryData: Function,
 *   activeQuery: string,
 *   pinnedResults: Array,
 *   unpinnedResults: Array,
 *   pinnedSearchMatches: Array,
 *   badgeFilterLabel: string | null,
 *   badgeResults: Array,
 *   narrowedResults: Array | null,
 *   viewAllLoading: boolean,
 *   handleQueryChange: (q: string) => void,
 *   handleSearch: () => void,
 *   handleSearchFocus: () => void,
 *   handleSearchBlur: () => void,
 *   handleClearQuery: () => void,
 *   handleClearResults: () => void,
 *   handleBadgeClick: (filter: Object | null) => void,
 *   handleAdminSearch: (q: string) => void,
 *   handleCopyLink: () => void,
 *   clearNarrowState: () => void,
 *   applySortBy: (arr: Array) => Array,
 *   searchInputRef: React.MutableRefObject<HTMLInputElement | null>,
 *   resultsCountRef: React.MutableRefObject<HTMLElement | null>,
 * }}
 */
export default function useSearchManager({
  query,
  setQuery,
  submittedQuery,
  setSubmittedQuery,
  searchKey,
  setSearchKey,
  sortBy,
  setSortBy,
  narrowQuery,
  setNarrowQuery,
  submittedNarrowQuery,
  setSubmittedNarrowQuery,
  narrowMode,
  setNarrowMode,
  ratings,
  pinnedIds,
  platform,
  setPlatform,
  language,
  setLanguage,
  wcagFilter,
  setWcagFilter,
  liveSearch,
  showPersonalCorpus,
  userEntries,
  userOverrides,
  t,
  navigate,
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [badgeFilter, setBadgeFilter] = useState(() => {
    const badge = new URLSearchParams(window.location.search).get('badge')
    if (!badge) return null
    const colonIdx = badge.indexOf(':')
    if (colonIdx < 0) return null
    const type = badge.slice(0, colonIdx)
    const rest = badge.slice(colonIdx + 1)
    if (!['severity', 'source', 'wcag', 'wcag-level'].includes(type) || !rest) return null
    return { type, value: rest }
  })
  const [viewAllLoading, setViewAllLoading] = useState(false)

  const searchBlurTimerRef = useRef(null)
  const resultsCountRef = useRef(null)
  const searchInputRef = useRef(null)
  const lastAnnouncedQuery = useRef(null)
  const liveSearchHadResultsRef = useRef(false)
  const lastAnnouncedPlatformRef = useRef(platform)

  const activeQuery = liveSearch ? (searchFocused ? query : submittedQuery) : submittedQuery

  const { results, allEntries, sortedEntries, dataLoading, dataError, retryData } = useEntrySearch(
    activeQuery,
    platform,
    language,
    searchKey,
    ratings,
    showPersonalCorpus ? userEntries : [],
    wcagFilter,
    userOverrides
  )

  const smartScore = useCallback((f, index) => {
    const r = ratings[f.id]
    let score = SEVERITY_SCORE[f.severity] ?? 0
    if (r?.starred) {
      score += SMART_SCORE_STAR_BONUS
      if (r.starredAt) {
        const days = (Date.now() - r.starredAt) / MS_PER_DAY
        score += Math.log1p(days)
      }
    }
    if (r?.score) score += r.score * SMART_SCORE_RANK_WEIGHT
    if (r?.popularity) score += (r.popularity ?? 0) * SMART_SCORE_POP_WEIGHT
    if (r?.archived) score -= SMART_SCORE_ARCHIVE_PENALTY
    score -= index * SMART_SCORE_INDEX_PENALTY
    return score
  }, [ratings])

  const applySortBy = useCallback((arr) => {
    const ra = (f) => ratings[f.id]
    const isArchived = (f) => ra(f)?.archived ?? false
    const isStarred = (f) => ra(f)?.starred ?? false
    const rankScore = (f) => ra(f)?.score ?? 0

    const sortComparator = (() => {
      if (sortBy === 'smart') {
        const scores = new Map(arr.map((f, i) => [f.id, smartScore(f, i)]))
        return (a, b) => scores.get(b.id) - scores.get(a.id)
      }
      if (sortBy === 'severity-desc') return (a, b) => (SEVERITY_SORT_ORDER[a.severity] ?? SORT_MISSING_ORDER) - (SEVERITY_SORT_ORDER[b.severity] ?? SORT_MISSING_ORDER)
      if (sortBy === 'severity-asc') return (a, b) => (SEVERITY_SORT_ORDER[b.severity] ?? SORT_MISSING_ORDER) - (SEVERITY_SORT_ORDER[a.severity] ?? SORT_MISSING_ORDER)
      if (sortBy === 'title-az') return (a, b) => a.title.localeCompare(b.title)
      if (sortBy === 'title-za') return (a, b) => b.title.localeCompare(a.title)
      if (sortBy === 'sc') return (a, b) => (a.primarySC ?? '').localeCompare(b.primarySC ?? '')
      if (sortBy === 'wcag-version') return (a, b) => (WCAG_VERSION_ORDER[a.wcagVersion] ?? SORT_MISSING_ORDER) - (WCAG_VERSION_ORDER[b.wcagVersion] ?? SORT_MISSING_ORDER)
      if (sortBy === 'wcag-level') return (a, b) => (WCAG_LEVEL_ORDER[a.wcagLevel] ?? SORT_MISSING_ORDER) - (WCAG_LEVEL_ORDER[b.wcagLevel] ?? SORT_MISSING_ORDER)
      if (sortBy === 'platform') return (a, b) => (PLATFORM_ORDER[a.platform] ?? SORT_MISSING_ORDER) - (PLATFORM_ORDER[b.platform] ?? SORT_MISSING_ORDER)
      if (sortBy === 'popularity') return (a, b) => (ra(b)?.popularity ?? 0) - (ra(a)?.popularity ?? 0)
      return null
    })()

    return [...arr].sort((a, b) => {
      if (isArchived(a) !== isArchived(b)) return isArchived(a) ? 1 : -1
      if (isArchived(a) && isArchived(b)) return (ra(b)?.archivedAt ?? 0) - (ra(a)?.archivedAt ?? 0)
      if (isStarred(a) !== isStarred(b)) return isStarred(a) ? -1 : 1
      const rd = rankScore(b) - rankScore(a)
      if (rd !== 0) return rd
      return sortComparator ? sortComparator(a, b) : 0
    })
  }, [sortBy, ratings, smartScore])

  const pinnedResults = useMemo(() => {
    const order = [...pinnedIds]
    return getPinnedEntries(allEntries, pinnedIds)
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  }, [allEntries, pinnedIds])

  const unpinnedResults = useMemo(() =>
    applySortBy(getUnpinnedEntries(results, pinnedIds)),
    [results, pinnedIds, applySortBy]
  )

  const pinnedSearchMatches = useMemo(() =>
    activeQuery.length >= 2 ? getPinnedEntries(results, pinnedIds) : [],
    [results, pinnedIds, activeQuery]
  )

  const badgeFilterLabel = useMemo(() => {
    if (!badgeFilter) return null
    if (badgeFilter.type === 'severity') {
      const p = SEVERITY_VARS[badgeFilter.value]
      return p ? t(p.key) : badgeFilter.value
    }
    if (badgeFilter.type === 'wcag') return null
    if (badgeFilter.type === 'wcag-level') return null
    return badgeFilter.value
  }, [badgeFilter, t])

  const badgeResults = useMemo(() => {
    if (!badgeFilter) return []
    return sortedEntries.filter(f => {
      if (pinnedIds.has(f.id)) return false
      if (badgeFilter.type === 'severity') return f.severity === badgeFilter.value
      if (badgeFilter.type === 'source') return f.creditNames?.includes(badgeFilter.value)
      if (badgeFilter.type === 'wcag') {
        if (badgeFilter.value === 'N/A') return !f.wcagVersion || f.wcagVersion === ''
        // WCAG 2.1 includes 2.0; WCAG 2.2 includes 2.1 and 2.0
        const versionOrder = { '2.0': 0, '2.1': 1, '2.2': 2 }
        const filterVersion = versionOrder[badgeFilter.value] ?? -1
        const entryVersion = versionOrder[f.wcagVersion] ?? -1
        return entryVersion >= 0 && entryVersion <= filterVersion
      }
      if (badgeFilter.type === 'wcag-level') {
        // Level AA includes A; Level AAA includes AA and A
        const levelOrder = { 'A': 0, 'AA': 1, 'AAA': 2 }
        const filterLevel = levelOrder[badgeFilter.value] ?? -1
        const entryLevel = levelOrder[f.wcagLevel] ?? -1
        return entryLevel >= 0 && entryLevel <= filterLevel
      }
      return false
    })
  }, [sortedEntries, badgeFilter, pinnedIds])

  const activeNarrowQuery = liveSearch ? narrowQuery : submittedNarrowQuery
  const narrowedResults = useMemo(() => {
    if (!narrowMode || !activeNarrowQuery) return null
    const base = activeQuery.length >= 2 ? results : sortedEntries
    if (!base || base.length === 0) return null
    const lowerNarrow = activeNarrowQuery.toLowerCase()
    const narrowFiltered = base.filter(f =>
      f.title.toLowerCase().includes(lowerNarrow) ||
      f.desc.toLowerCase().includes(lowerNarrow) ||
      f.keywords?.some(k => k.toLowerCase().includes(lowerNarrow)) ||
      f.creditNames?.some(s => s.toLowerCase().includes(lowerNarrow))
    )
    return [...getPinnedEntries(narrowFiltered, pinnedIds), ...getUnpinnedEntries(narrowFiltered, pinnedIds)]
  }, [narrowMode, activeNarrowQuery, activeQuery, results, sortedEntries, pinnedIds])

  // Result count announcement
  useEffect(() => {
    if (liveSearch || submittedQuery.length < 2) return
    if (submittedQuery === lastAnnouncedQuery.current) return
    lastAnnouncedQuery.current = submittedQuery
    announce(t('results.count', { count: results.length, result: results.length === 1 ? t('results.one_result') : t('results.multiple_results') }))
  }, [results, submittedQuery, liveSearch, t])

  // Live search loading announcement
  useEffect(() => {
    if (!liveSearch || query.length < 2) { liveSearchHadResultsRef.current = false; return }
    if (liveSearchHadResultsRef.current) announce(t('results.loading_aria_live'))
    if (results.length > 0) liveSearchHadResultsRef.current = true
  }, [query, liveSearch, results, t])

  // Platform change announcement
  useEffect(() => {
    if (platform === lastAnnouncedPlatformRef.current) return
    lastAnnouncedPlatformRef.current = platform
    if (!dataLoading && allEntries.length > 0) {
      const base = activeQuery.length >= 2 ? results.length : sortedEntries.length
      const platformLabel = platform !== 'all' ? getViewAllPlatformLabel(platform, t) : ''
      const baseStr = `${base} ${pluralResult(base)}`
      if (narrowedResults !== null) {
        const narrowStr = `${narrowedResults.length} ${pluralResult(narrowedResults.length)}`
        announce(platform !== 'all' ? `${narrowStr} of ${baseStr}; ${platformLabel} only.` : `${narrowStr} of ${baseStr}.`)
      } else {
        announce(platform !== 'all' ? `${baseStr}; ${platformLabel} only.` : `${baseStr}.`)
      }
    }
  }, [platform, results, sortedEntries, narrowedResults, activeQuery, dataLoading, allEntries, t])

  // Clear narrow on query change
  useEffect(() => {
    setNarrowMode(false)
    setNarrowQuery('')
    setSubmittedNarrowQuery('')
  }, [activeQuery, setNarrowMode, setNarrowQuery, setSubmittedNarrowQuery])

  // ViewAll loading timeout
  useEffect(() => {
    if (!viewAllLoading) return
    const id = setTimeout(() => setViewAllLoading(false), 500) // VIEW_ALL_LOADING_DELAY
    return () => clearTimeout(id)
  }, [viewAllLoading])

  const syncSearchUrl = (q) => {
    const url = new URL(window.location.href)
    if (q) url.searchParams.set('q', q)
    else url.searchParams.delete('q')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  const syncBadgeUrl = (filter) => {
    const url = new URL(window.location.href)
    if (filter) {
      url.searchParams.set('badge', `${filter.type}:${filter.value}`)
      url.searchParams.delete('q')
    } else {
      url.searchParams.delete('badge')
    }
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  const syncFiltersUrl = useCallback(({ platformVal, sortVal, narrowVal, wcagVal } = {}) => {
    const url = new URL(window.location.href)
    const p = platformVal ?? platform
    const s = sortVal ?? sortBy
    const n = narrowVal ?? narrowQuery
    const w = wcagVal ?? wcagFilter
    if (p && p !== 'all') url.searchParams.set('platform', p)
    else url.searchParams.delete('platform')
    if (s && s !== 'smart') url.searchParams.set('sort', s)
    else url.searchParams.delete('sort')
    if (n) url.searchParams.set('narrow', n)
    else url.searchParams.delete('narrow')
    const isDefaultWcag = w.maxVersion === '2.2' && w.maxLevel === 'AA'
    if (!isDefaultWcag) url.searchParams.set('wcag', `${w.maxVersion}|${w.maxLevel}`)
    else url.searchParams.delete('wcag')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }, [platform, sortBy, narrowQuery, wcagFilter])

  // Sync filters to URL
  useEffect(() => { syncFiltersUrl() }, [platform, sortBy, narrowQuery, wcagFilter, syncFiltersUrl])

  function handleSearchFocus() {
    clearTimeout(searchBlurTimerRef.current)
    setSearchFocused(true)
  }

  function handleSearchBlur() {
    searchBlurTimerRef.current = setTimeout(() => {
      setSearchFocused(false)
      setSubmittedQuery(query)
    }, 500)
  }

  const activateEasterEgg = (egg) => {
    setLanguage(egg)
    setQuery(submittedQuery)
  }

  function handleQueryChange(q) {
    if (q) { setBadgeFilter(null); syncBadgeUrl(null) }
    if (liveSearch) {
      const egg = EASTER_EGGS[q.trim().toLowerCase()]
      if (egg) { activateEasterEgg(egg); return }
      syncSearchUrl(q)
    }
    setQuery(q)
    if (q === '') {
      setSubmittedQuery('')
      syncSearchUrl('')
    }
  }

  function handleSearch() {
    setBadgeFilter(null)
    syncBadgeUrl(null)
    const egg = EASTER_EGGS[query.trim().toLowerCase()]
    if (egg) { activateEasterEgg(egg); return }
    setSubmittedQuery(query)
    setSearchKey(k => k + 1)
    syncSearchUrl(query)
    setTimeout(() => resultsCountRef.current?.focus(), RESULTS_COUNT_FOCUS_DELAY)
  }

  function handleAdminSearch(q) {
    setQuery(q)
    setSubmittedQuery(q)
    setBadgeFilter(null)
    syncSearchUrl(q)
    navigate('/')
  }

  function handleBadgeClick(filter) {
    const isClickingSameBadge = badgeFilter?.type === filter.type && badgeFilter?.value === filter.value
    const nextFilter = isClickingSameBadge ? null : filter
    setBadgeFilter(nextFilter)
    setQuery('')
    setSubmittedQuery('')
    syncBadgeUrl(nextFilter)
    syncSearchUrl('')
    navigate('/results/all')
    setTimeout(() => resultsCountRef.current?.focus(), RESULTS_COUNT_FOCUS_DELAY)
  }

  function clearNarrowState() {
    setNarrowMode(false)
    setNarrowQuery('')
    setSubmittedNarrowQuery('')
  }

  function handleClearQuery() {
    setQuery('')
    setSubmittedQuery('')
    setSearchKey(k => k + 1)
    clearNarrowState()
    setWcagFilter(DEFAULT_WCAG_FILTER)
    syncSearchUrl('')
    searchInputRef.current?.focus()
  }

  function handleClearResults() {
    setPlatform('all')
    setNarrowMode(false)
    setSortBy('smart')
    setWcagFilter(DEFAULT_WCAG_FILTER)
    setBadgeFilter(null)
    syncBadgeUrl(null)
    searchInputRef.current?.focus()
  }

  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.origin + window.location.pathname)
    const current = new URL(window.location.href)

    if (submittedQuery) url.searchParams.set('q', submittedQuery)
    const badge = current.searchParams.get('badge')
    if (badge) url.searchParams.set('badge', badge)
    const platformParam = current.searchParams.get('platform')
    if (platformParam) url.searchParams.set('platform', platformParam)
    const sort = current.searchParams.get('sort')
    if (sort) url.searchParams.set('sort', sort)
    const wcag = current.searchParams.get('wcag')
    if (wcag) url.searchParams.set('wcag', wcag)
    const narrow = current.searchParams.get('narrow')
    if (narrow) url.searchParams.set('narrow', narrow)

    const hash = window.location.hash || ''
    const shareUrl = url.toString() + hash

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl)
    } else {
      const el = document.createElement('textarea')
      el.value = shareUrl
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }, [submittedQuery])

  return {
    query,
    setQuery,
    submittedQuery,
    searchFocused,
    badgeFilter,
    setBadgeFilter,
    narrowMode,
    narrowQuery,
    submittedNarrowQuery,
    sortBy,
    results,
    allEntries,
    sortedEntries,
    dataLoading,
    dataError,
    retryData,
    activeQuery,
    pinnedResults,
    unpinnedResults,
    pinnedSearchMatches,
    badgeFilterLabel,
    badgeResults,
    narrowedResults,
    viewAllLoading,
    setViewAllLoading,
    handleQueryChange,
    handleSearch,
    handleSearchFocus,
    handleSearchBlur,
    handleClearQuery,
    handleClearResults,
    handleBadgeClick,
    handleAdminSearch,
    handleCopyLink,
    clearNarrowState,
    applySortBy,
    searchInputRef,
    resultsCountRef,
    syncSearchUrl,
    syncBadgeUrl,
    syncFiltersUrl,
  }
}
