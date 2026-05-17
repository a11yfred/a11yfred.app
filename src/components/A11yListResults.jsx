import { ArrowUp, PinOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '@ulam/taho'
import { useT } from '@ulam/calamansi/react'
import Button from './ui/Button.jsx'
import NoResults from './ui/NoResults.jsx'
import TileAd from './TileAd.jsx'
import A11yListResultCard from './A11yListResultCard.jsx'
import ResultsMetaHeader from './ResultsMetaHeader.jsx'
import ResultsActiveFilterBar from './ResultsActiveFilterBar.jsx'
import { DEFAULT_RATING, pluralResult, ARCHIVE_FOCUS_DELAY_MS, RESULTS_VIEW_ALL_THRESHOLD, UNPIN_FLY_MS } from '../utils/constants.js'
import { useKeydown } from '../hooks/useKeydown.js'
import useSwipeReveal from '../hooks/useSwipeReveal.js'
import { useFlipList } from '../hooks/useFlipList.js'
import { useSettings } from '../context/ContextSettings.js'
import { useSearch } from '../context/ContextSearch.js'
import { useRatings } from '../context/ContextRatings.js'
import './A11yListResults.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function PinnedSection({ entries, onSelect, onClearPins, headingRef }) {
  const t = useT()
  const { showVoting: showRanking } = useSettings()
  const [clearingAll, setClearingAll] = useState(false)
  if (!entries.length) return null

  const handleClearAll = () => {
    if (prefersReducedMotion || !onClearPins) { onClearPins?.(); return }
    setClearingAll(true)
    setTimeout(() => { onClearPins(); setClearingAll(false) }, UNPIN_FLY_MS + 80)
  }

  const pinnedSectionClass = `pinned-section pinned-results${clearingAll ? ' pinned-section--clearing' : ''}`

  return (
    <div className={pinnedSectionClass}>
      <div className="pinned-section__header">
        <h2 ref={headingRef} tabIndex={-1} className="pinned-section__heading">
          {t('results.pinned_heading')}
          <span className="pinned-section__count">{entries.length}</span>
        </h2>
        {onClearPins && (
          <Button variant="tertiary" className="pinned-unpin-all-btn" onClick={handleClearAll} icon={<PinOff size={14} aria-hidden="true" />}>
            {t('results.unpin_all')}
          </Button>
        )}
      </div>
      <A11yListResults
        results={entries}
        onSelect={onSelect}
        selected={null}
        query=""
        showRankingSort={showRanking}
        hideCount
        hideFilters
        hasPinnedItems={false}
      />
    </div>
  )
}

export default function A11yListResults({ results, selected, onSelect, query, _countRef, onCopyLink, hideCount = false, hideFilters = false, filterLabel, narrowResults = null, _showRankingSort = false, showAds = false, adFrequency = 8, onClear, onClearQuery, hasPinnedItems = false, defaultWcagFilter = null, onOpenSettings, onBadgeClick, isBadgeFiltered = false }) {
  const { liveSearch, showVoting: showRanking, platform, setPlatform: onPlatformChange, wcagFilter, setWcagFilter } = useSettings()
  const { narrowMode, narrowQuery, sortBy, setSortBy: onSortChange, setNarrowMode, setNarrowQuery, setSubmittedNarrowQuery } = useSearch()
  const onNarrow = () => setNarrowMode(true)
  const onNarrowExit = () => { setNarrowMode(false); setNarrowQuery(''); setSubmittedNarrowQuery('') }
  const onNarrowChange = setNarrowQuery
  const onNarrowSearch = () => setSubmittedNarrowQuery(narrowQuery)
  const { ratings, rankUp: onRankUp, rankDown: onRankDown, toggleStar: onStar, toggleArchive: onArchive, pinnedIds, togglePin: onPin } = useRatings()
  const t = useT()
  const platformLabels = {
    all:      t('settings.platform_all'),
    web:      t('settings.platform_web'),
    native:   t('settings.platform_native'),
    document: t('settings.platform_document'),
  }
  const itemRefs = useRef({})
  const countHeadingRef = useRef(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [pendingSort, setPendingSort] = useState(sortBy)
  const [sortToCommit, setSortToCommit] = useState(null)
  const [clearPending, setClearPending] = useState(false)
  const [sortFlash, setSortFlash] = useState(false)
  const { listRef, snapshotPositions } = useFlipList()
  const [animatingUp, setAnimatingUp] = useState(() => new Set())
  const [animatingDown, setAnimatingDown] = useState(() => new Set())
  const [pinningIds, setPinningIds] = useState(() => new Set())
  const [unpinningIds, setUnpinningIds] = useState(() => new Set())
  const [archivingIds, setArchivingIds] = useState(() => new Set())
  const [unarchivingIds, setUnarchivingIds] = useState(() => new Set())
  const prevNarrowResultsRef = useRef(undefined)
  const { swipeOpenId, setSwipeOpenId, swipeTouchRef } = useSwipeReveal({ listRef, showRanking, onPin, pinnedIds })

  useEffect(() => { setPendingSort(sortBy) }, [sortBy]) // eslint-disable-line react-hooks/set-state-in-effect -- intentional sync from parent prop

  useEffect(() => {
    if (sortToCommit === null) return
    onSortChange(sortToCommit)
    setSortToCommit(null) // eslint-disable-line react-hooks/set-state-in-effect
  }, [sortToCommit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!clearPending) return
    setClearPending(false) // eslint-disable-line react-hooks/set-state-in-effect
    onClear?.()
  }, [clearPending]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prev = prevNarrowResultsRef.current
    prevNarrowResultsRef.current = narrowResults
    if (!narrowMode || narrowResults === null || narrowResults === undefined) return
    if (prev === undefined) return
    const count = narrowResults.length
    const result = pluralResult(count)
    const platformLabel = platformLabels[platform] ?? platform
    if (platform !== 'all') {
      announce(t('announce.narrow_results_platform', { count, result, total: results.length, platform: platformLabel }))
    } else {
      announce(t('announce.narrow_results', { count, result, total: results.length }))
    }
  }, [narrowResults]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayResults = narrowMode && narrowResults ? narrowResults : results
  const displayCount = narrowMode && narrowResults
    ? t('results.narrow_count', { narrowed: narrowResults.length, total: results.length, result: pluralResult(narrowResults.length) })
    : (filterLabel
      ? t('results.count_badge', { count: results.length, result: pluralResult(results.length), filter: filterLabel })
      : hasPinnedItems
        ? t('results.count_more', { count: results.length, result: pluralResult(results.length) })
        : t('results.count', { count: results.length, result: pluralResult(results.length) })
    )

  const handleKeyDown = useCallback((e) => {
    if (!listRef.current) return
    const focusedBtn = document.activeElement?.closest('.result-item')
    if (!focusedBtn) return

    const currentIndex = displayResults.findIndex(r => itemRefs.current[r.id] === document.activeElement)
    if (currentIndex === -1) return

    const currentEntry = displayResults[currentIndex]
    const rating = ratings[currentEntry.id] || DEFAULT_RATING
    const { starred, archived } = rating
    const searchInput = document.querySelector('input[type="search"]')
    const isTyping = searchInput === document.activeElement

    if (isTyping) return

    switch (e.key.toLowerCase()) {
      case 'j':
        e.preventDefault()
        if (currentIndex < displayResults.length - 1) {
          itemRefs.current[displayResults[currentIndex + 1].id]?.focus()
        }
        break
      case 'k':
        e.preventDefault()
        if (currentIndex > 0) {
          itemRefs.current[displayResults[currentIndex - 1].id]?.focus()
        }
        break
      case 's':
        e.preventDefault()
        onStar?.(currentEntry.id)
        announce(starred ? t('announce.unstarred') : t('announce.starred'))
        break
      case 'e':
        e.preventDefault()
        announce(archived ? t('announce.unarchived') : t('announce.archived'), { priority: 'assertive' })
        setTimeout(() => onArchive?.(currentEntry.id), ARCHIVE_FOCUS_DELAY_MS)
        break
      case 'u':
        e.preventDefault()
        if (archived) {
          onArchive?.(currentEntry.id)
          announce(t('announce.unarchived'))
        }
        break
      default:
        if (e.shiftKey && (e.key === 'ArrowUp' || e.key === '↑')) {
          e.preventDefault()
          onRankUp?.(currentEntry.id)
          const newRating = ratings[currentEntry.id] || DEFAULT_RATING
          announce(t('announce.ranked_up', { title: currentEntry.title, score: newRating.score + 1 }))
        } else if (e.shiftKey && (e.key === 'ArrowDown' || e.key === '↓')) {
          e.preventDefault()
          onRankDown?.(currentEntry.id)
          const newRating = ratings[currentEntry.id] || DEFAULT_RATING
          announce(t('announce.ranked_down', { title: currentEntry.title, score: newRating.score - 1 }))
        }
    }
  }, [displayResults, ratings, onStar, onArchive, onRankUp, onRankDown, t]) // eslint-disable-line react-hooks/exhaustive-deps -- listRef is a stable ref

  useKeydown(handleKeyDown, { target: listRef })

  useEffect(() => {
    if (!swipeOpenId) return
    function handleOutsideTap(e) {
      if (!e.target.closest(`[data-swipe-id="${swipeOpenId.id}"]`)) {
        setSwipeOpenId(null)
      }
    }
    document.addEventListener('pointerdown', handleOutsideTap)
    return () => document.removeEventListener('pointerdown', handleOutsideTap)
  }, [swipeOpenId]) // eslint-disable-line react-hooks/exhaustive-deps -- setSwipeOpenId is stable

  const activeFilters = [
    query && onClearQuery
      ? { label: `"${query}"`, onRemove: onClearQuery }
      : null,
    narrowMode && narrowQuery
      ? { label: t('results.filter_narrow', { query: narrowQuery }), onRemove: onNarrowExit }
      : null,
    onPlatformChange && platform !== 'all'
      ? { label: platformLabels[platform] ?? platform, onRemove: () => onPlatformChange('all') }
      : null,
    !filterLabel && !isBadgeFiltered && wcagFilter && defaultWcagFilter && wcagFilter.maxVersion !== defaultWcagFilter.maxVersion
      ? { label: `WCAG ${wcagFilter.maxVersion}`, onRemove: () => setWcagFilter({ ...wcagFilter, maxVersion: defaultWcagFilter.maxVersion }) }
      : null,
    !filterLabel && !isBadgeFiltered && wcagFilter && defaultWcagFilter && wcagFilter.maxLevel !== defaultWcagFilter.maxLevel
      ? { label: `Level ${wcagFilter.maxLevel}`, onRemove: () => setWcagFilter({ ...wcagFilter, maxLevel: defaultWcagFilter.maxLevel }) }
      : null,
  ].filter(Boolean)

  const hasNonDefaultSort = sortBy !== 'smart'
  const hasAnyActiveFilter = activeFilters.length > 0 || hasNonDefaultSort

  if (results.length === 0 && platform === 'all') {
    return <NoResults
      query={query}
      ariaLabel={t('results.no_results_aria')}
      heading={t('results.no_results_heading', { query })}
      body={t('results.no_results_body')}
      onMount={() => announce(t('results.no_results_announce', { query }))}
      activeFilters={activeFilters}
      onClearFilters={hasAnyActiveFilter ? onClear : undefined}
      onOpenSettings={onOpenSettings}
    />
  }

  const platformNoResults = results.length === 0 && platform !== 'all'
  const narrowNoResults = narrowMode && narrowResults && narrowResults.length === 0

  const sortLabels = {
    smart: t('results.sort_smart'),
    relevance: t('results.sort_relevance'),
    'severity-desc': t('results.sort_severity_desc'),
    'severity-asc': t('results.sort_severity_asc'),
    'title-az': t('results.sort_title_az'),
    'title-za': t('results.sort_title_za'),
    sc: t('results.sort_sc'),
    'wcag-version': t('results.sort_wcag_version'),
    'wcag-level': t('results.sort_wcag_level'),
    platform: t('results.sort_platform'),
    popularity: t('results.sort_popularity'),
  }

  return (
    <div className="result-list-section">
      <ResultsMetaHeader
        displayCount={displayCount}
        query={query}
        onCopyLink={onCopyLink}
        linkCopied={linkCopied}
        setLinkCopied={setLinkCopied}
        sortBy={sortBy}
        pendingSort={pendingSort}
        setPendingSort={setPendingSort}
        onSortChange={onSortChange}
        setSortToCommit={setSortToCommit}
        setSortFlash={setSortFlash}
        sortFlash={sortFlash}
        showRankingSort={showRanking}
        narrowMode={narrowMode}
        narrowResults={narrowResults}
        narrowQuery={narrowQuery}
        onNarrowChange={onNarrowChange}
        onNarrowSearch={onNarrowSearch}
        liveSearch={liveSearch}
        onOpenSettings={onOpenSettings}
        onNarrow={onNarrow}
        onNarrowExit={onNarrowExit}
        platform={platform}
        onPlatformChange={onPlatformChange}
        hideCount={hideCount}
        hideFilters={hideFilters}
        results={results}
        platformNoResults={platformNoResults}
        platformLabels={platformLabels}
        onClear={() => { announce(t('announce.filters_cleared')); setClearPending(true) }}
        countHeadingRef={countHeadingRef}
        hasAnyActiveFilter={hasAnyActiveFilter}
      />

      {!hideFilters && results.length > 0 && !platformNoResults && !narrowNoResults && (
        <ResultsActiveFilterBar
          activeFilters={activeFilters}
          sortBy={sortBy}
          sortLabels={sortLabels}
          onSortChange={onSortChange}
          hasNonDefaultSort={hasNonDefaultSort}
        />
      )}

      {(narrowNoResults || platformNoResults)
        ? <NoResults
            query={narrowNoResults ? narrowQuery : query}
            ariaLabel={t('results.no_results_aria')}
            heading={t('results.no_results_heading', { query: narrowNoResults ? narrowQuery : query })}
            body={t('results.no_results_body')}
            activeFilters={activeFilters}
            onClearFilters={narrowNoResults || hasAnyActiveFilter ? onClear : undefined}
            onOpenSettings={onOpenSettings}
          />
        : <ul ref={listRef} className={`result-list${selected ? ' result-list--has-selection' : ''}${hasPinnedItems ? ' result-list--has-pinned' : ''}`} aria-label={t('results.aria_label')}>
          {displayResults.map((entry, index) => {
            const showAdAfter = showAds && adFrequency > 0 && (index + 1) % adFrequency === 0
            return (
              <>
                <A11yListResultCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  selected={selected}
                  onSelect={onSelect}
                  displayResults={displayResults}
                  showRanking={showRanking}
                  showRankingSort={showRanking}
                  onPin={onPin}
                  onRankUp={onRankUp}
                  onRankDown={onRankDown}
                  onStar={onStar}
                  onArchive={onArchive}
                  onBadgeClick={onBadgeClick}
                  ratings={ratings}
                  pinnedIds={pinnedIds}
                  animatingUp={animatingUp}
                  animatingDown={animatingDown}
                  archivingIds={archivingIds}
                  unarchivingIds={unarchivingIds}
                  pinningIds={pinningIds}
                  unpinningIds={unpinningIds}
                  setAnimatingUp={setAnimatingUp}
                  setAnimatingDown={setAnimatingDown}
                  setArchivingIds={setArchivingIds}
                  setUnarchivingIds={setUnarchivingIds}
                  setPinningIds={setPinningIds}
                  setUnpinningIds={setUnpinningIds}
                  swipeOpenId={swipeOpenId}
                  setSwipeOpenId={setSwipeOpenId}
                  swipeTouchRef={swipeTouchRef}
                  itemRefs={itemRefs}
                  snapshotPositions={snapshotPositions}
                />
                {showAdAfter && <li role="presentation"><TileAd /></li>}
              </>
            )
          })}
        </ul>
      }
      {results.length > 0 && !hideCount && !narrowNoResults && !platformNoResults && (
        <p className="results-end-marker">{t('results.end_of_results')}</p>
      )}
      {results.length > RESULTS_VIEW_ALL_THRESHOLD && (
        <div className="view-all-section">
          <Button
            variant="secondary"
            className="back-to-top-btn"
            onClick={() => {
              const drawer = document.querySelector('.drawer-panel.is-open')
              ;(drawer ?? window).scrollTo({ top: 0, behavior: 'smooth' })
              countHeadingRef.current?.focus({ preventScroll: true })
            }}
          >
            <ArrowUp size={16} aria-hidden="true" />
            {t('results.back_to_top')}
          </Button>
        </div>
      )}
    </div>
  )
}

export { default as A11yListResultSkeleton } from './A11yListResultSkeleton.jsx'
export { default as DataError } from './ui/DataError.jsx'
