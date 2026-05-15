import { Star, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, Link, Check, Pin, PinOff, Filter, ChevronsLeft, ChevronsRight, ArrowUp, OctagonX, Trash2 } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '@ulam/taho'
import { useT } from '@ulam/calamansi/react'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import Button from './ui/Button.jsx'
import LinkSkipTo from './ui/LinkSkipTo.jsx'
import RadioChip from './ui/RadioChip.jsx'
import ButtonIcon from './ui/ButtonIcon.jsx'
import Badge from './ui/Badge.jsx'
import Select from './ui/Select.jsx'
import InputWithClear from './ui/InputWithClear.jsx'
import NoResults from './ui/NoResults.jsx'
import InfoBox from './ui/InfoBox.jsx'
import TileAd from './TileAd.jsx'
import entrySlug from '../utils/entrySlug.js'
import { DEFAULT_RATING, CLIPBOARD_TIMEOUT, pluralResult, DESC_PREVIEW_LENGTH, TITLE_TRUNCATE_LENGTH, SWIPE_THRESHOLD, SWIPE_REVEAL, SWIPE_ACTIVATE, SWIPE_PIN_FLASH_MS, SORT_FLASH_MS, RANK_ANIM_MS, ARCHIVE_FOCUS_DELAY_MS, RESULTS_VIEW_ALL_THRESHOLD, PIN_FLY_MS, UNPIN_FLY_MS, ARCHIVE_FLY_MS, UNARCHIVE_FLY_MS } from '../utils/constants.js'
import { useKeydown } from '../hooks/useKeydown.js'
import useSwipeReveal from '../hooks/useSwipeReveal.js'
import { useFlipList } from '../hooks/useFlipList.js'
import { useSettings } from '../context/ContextSettings.js'
import { useSearch } from '../context/ContextSearch.js'
import { useRatings } from '../context/ContextRatings.js'
import './A11yListResults.css'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function truncateAtWord(text, maxLength) {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
}

function triggerButtonAnimation(btn, id, setAnimating) {
  btn.classList.remove('animating')
  void btn.offsetWidth
  btn.classList.add('animating')
  setAnimating(s => new Set(s).add(id))
  setTimeout(() => {
    btn.classList.remove('animating')
    setAnimating(s => { const n = new Set(s); n.delete(id); return n })
  }, RANK_ANIM_MS)
}

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

  return (
    <div className={`pinned-section pinned-results${clearingAll ? ' pinned-section--clearing' : ''}`}>
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

export default function A11yListResults({ results, selected, onSelect, query, countRef, onCopyLink, hideCount = false, hideFilters = false, filterLabel, narrowResults = null, showRankingSort = false, showAds = false, adFrequency = 8, onClear, onClearQuery, hasPinnedItems = false, defaultWcagFilter = null, onOpenSettings, onBadgeClick }) {
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
  const focusNextRef = useRef(null)
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

  // Keep pendingSort in sync when sortBy changes externally
  useEffect(() => { setPendingSort(sortBy) }, [sortBy]) // eslint-disable-line react-hooks/set-state-in-effect -- intentional sync from parent prop

  // Commit sort after announcement has rendered
  useEffect(() => {
    if (sortToCommit === null) return
    onSortChange(sortToCommit)
    setSortToCommit(null) // eslint-disable-line react-hooks/set-state-in-effect
  }, [sortToCommit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Commit clear after announcement has rendered
  useEffect(() => {
    if (!clearPending) return
    setClearPending(false) // eslint-disable-line react-hooks/set-state-in-effect
    onClear?.()
  }, [clearPending]) // eslint-disable-line react-hooks/exhaustive-deps

  // Announce narrow search results count when narrowResults first arrives or changes
  useEffect(() => {
    const prev = prevNarrowResultsRef.current
    prevNarrowResultsRef.current = narrowResults
    if (!narrowMode || narrowResults === null || narrowResults === undefined) return
    if (prev === undefined) return // skip mount
    const count = narrowResults.length
    const result = pluralResult(count)
    const platformLabel = platformLabels[platform] ?? platform
    if (platform !== 'all') {
      announce(t('announce.narrow_results_platform', { count, result, total: results.length, platform: platformLabel }))
    } else {
      announce(t('announce.narrow_results', { count, result, total: results.length }))
    }
  }, [narrowResults]) // eslint-disable-line react-hooks/exhaustive-deps

  // Use narrowResults if provided (filtered), otherwise use all results
  const displayResults = narrowMode && narrowResults ? narrowResults : results
  const displayCount = narrowMode && narrowResults
    ? t('results.narrow_count', { narrowed: narrowResults.length, total: results.length, result: pluralResult(narrowResults.length) })
    : (filterLabel
      ? t('results.count_badge', { count: results.length, result: pluralResult(results.length), filter: filterLabel })
      : hasPinnedItems
        ? t('results.count_more', { count: results.length, result: pluralResult(results.length) })
        : t('results.count', { count: results.length, result: pluralResult(results.length) })
    )

  useEffect(() => {
    if (!focusNextRef.current) return
    const el = itemRefs.current[focusNextRef.current]
    if (el) { el.focus(); focusNextRef.current = null }
  })

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

  // Close swipe drawer on outside tap (iOS Mail behaviour)
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
    !filterLabel && wcagFilter && defaultWcagFilter && wcagFilter.maxVersion !== defaultWcagFilter.maxVersion
      ? { label: `WCAG ${wcagFilter.maxVersion}`, onRemove: () => setWcagFilter({ ...wcagFilter, maxVersion: defaultWcagFilter.maxVersion }) }
      : null,
    !filterLabel && wcagFilter && defaultWcagFilter && wcagFilter.maxLevel !== defaultWcagFilter.maxLevel
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
      {!hideCount && !platformNoResults && <div className="results-meta">
        <div className="results-count-row">
          <h2
            ref={el => { countHeadingRef.current = el; if (countRef) countRef.current = el }}
            tabIndex={-1}
            className="results-count"
          >
            {displayCount}
          </h2>
          {onCopyLink && (
            <Button
              active={linkCopied}
              icon={<Link size={14} aria-hidden="true" />}
              activeIcon={<Check size={14} aria-hidden="true" />}
              label={t('results.copy_link_aria')}
              activeLabel={t('results.copied_link')}
              variant="secondary"
              className="results-copy-link-btn"
              title={linkCopied ? t('results.copied_link') : t('results.copy_link')}
              onClick={() => {
                onCopyLink()
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), CLIPBOARD_TIMEOUT)
              }}
            >
              {linkCopied ? t('results.copied_link') : t('results.copy_link')}
            </Button>
          )}
        </div>
        {onSortChange && results.length > 0 && (() => {
          const infoLabel = t('detail.note_label')
          if (sortBy === 'smart') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_smart_info')}</InfoBox>
          if (sortBy === 'wcag-level') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_wcag_level_info')}</InfoBox>
          if (sortBy === 'popularity') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_popularity_info')}</InfoBox>
          return null
        })()}
        {onSortChange && results.length > 0 && (showRanking || liveSearch) && (
          <p className="results-rank-hint">
            {showRanking && <>
              {'Pin '}
              <Pin size={13} aria-hidden="true" className="rank-hint-icon" />
              {' to show on every page. Star '}
              <Star size={13} aria-hidden="true" className="rank-hint-icon" />
              {' to always show first. Archive '}
              <Archive size={13} aria-hidden="true" className="rank-hint-icon" />
              {' to always show last. Rank up '}
              <ThumbsUp size={13} aria-hidden="true" className="rank-hint-icon" />
              {' or rank down '}
              <ThumbsDown size={13} aria-hidden="true" className="rank-hint-icon" />
              {' to fine-tune the rest. Sort order is applied last. All actions can be '}
              <a href="#/settings" className="rank-hint-link">{t('results.rank_hint_undone')}</a>
              {'.'}
            </>}
            {showRanking && liveSearch && ' '}
            {liveSearch && <span className="results-sort-live-hint">
              <strong>{'Live Search is '}
                <button
                  type="button"
                  className="rank-hint-link rank-hint-link--inline"
                  onClick={() => {
                    onOpenSettings?.()
                    setTimeout(() => document.getElementById('toggle-live-search')?.focus(), 300)
                  }}
                >ON</button>
                {': Results will sort immediately after entering or making a selection change.'}
              </strong>
            </span>}
          </p>
        )}
<div className="results-actions-row">
          {onSortChange && (
            <div className={`results-sort-group${results.length > 0 ? ' results-sort-group--visible' : ''}`}>
              <div className="results-sort-controls">
                <label htmlFor="results-sort" className="results-sort-label">{t('results.sort_label')}</label>
                <Select
                  id="results-sort"
                  value={liveSearch ? sortBy : pendingSort}
                  onChange={e => {
                    if (liveSearch) {
                      onSortChange(e.target.value)
                      announce(t('announce.sorted', { count: displayResults.length, result: pluralResult(displayResults.length), label: sortLabels[e.target.value] ?? e.target.value }))
                    } else {
                      setPendingSort(e.target.value)
                    }
                  }}
                  wrapClass="results-sort-select-wrap"
                >
                  <option value="smart">{t('results.sort_smart')}</option>
                  {query && <option value="relevance">{t('results.sort_relevance')}</option>}
                  <option value="severity-desc">{t('results.sort_severity_desc')}</option>
                  <option value="severity-asc">{t('results.sort_severity_asc')}</option>
                  <option value="title-az">{t('results.sort_title_az')}</option>
                  <option value="title-za">{t('results.sort_title_za')}</option>
                  <option value="sc">{t('results.sort_sc')}</option>
                  <option value="wcag-version">{t('results.sort_wcag_version')}</option>
                  <option value="wcag-level">{t('results.sort_wcag_level')}</option>
                  <option value="platform">{t('results.sort_platform')}</option>
                  <option value="popularity">{t('results.sort_popularity')}</option>
                </Select>
                {!liveSearch && (
                  <Button
                    variant="primary"
                    active={sortFlash}
                    className="results-sort-btn"
                    onClick={() => {
                      announce(t('announce.sorted', { count: displayResults.length, result: pluralResult(displayResults.length), label: sortLabels[pendingSort] ?? pendingSort }))
                      setSortToCommit(pendingSort)
                      setSortFlash(true)
                      setTimeout(() => setSortFlash(false), SORT_FLASH_MS)
                    }}
                  >
                    {t('results.sort_apply')}
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="results-filter-btns">
            {results.length > 0 && onNarrow && (
              <Button
                variant="secondary"
                className="results-narrow-btn"
                title={narrowMode ? t('search.exit_narrow_aria') : t('results.narrow_title')}
                onClick={narrowMode ? onNarrowExit : onNarrow}
              >
                {narrowMode ? (
                  <>
                    <OctagonX size={16} aria-hidden="true" />
                    <span>{t('search.exit_narrow')}</span>
                  </>
                ) : (
                  <>
                    <Filter size={16} aria-hidden="true" />
                    <span>{t('results.narrow_results')}</span>
                  </>
                )}
              </Button>
            )}
            {onClear && (
              <Button
                variant="tertiary"
                className={`results-clear-btn${results.length > 0 ? ' results-clear-btn--visible' : ''}`}
                title={t('results.clear_all_results')}
                icon={<Trash2 size={14} aria-hidden="true" />}
                disabled={!hasAnyActiveFilter}
                onClick={() => { announce(t('announce.filters_cleared')); setClearPending(true) }}
              >
                {t('results.clear_all_results')}
              </Button>
            )}
          </div>
        </div>

        {onNarrowChange && (
          <div
            className={`results-narrow-input-section${narrowMode ? ' results-narrow-input-section--visible' : ''}`}
            aria-hidden={!narrowMode || undefined}
            inert={!narrowMode || undefined}
          >
            <label
              htmlFor="narrow-filter"
              className={`results-narrow-label${!query && !narrowQuery ? ' results-narrow-label--dimmed' : ''}`}
            >
              {t('search.narrowing_results')}
            </label>
            <div className={`results-narrow-row${!query && !narrowQuery ? ' results-narrow-row--dimmed' : ''}`}>
              <InputWithClear
                id="narrow-filter"
                type="text"
                value={narrowQuery}
                onChange={onNarrowChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !liveSearch && onNarrowSearch) {
                    onNarrowSearch()
                  }
                }}
                onClear={() => onNarrowChange('')}
                placeholder={!query && !narrowQuery ? t('search.narrow_placeholder_needs_query') : narrowResults ? t('search.narrow_placeholder', { count: results.length }) : t('search.narrow_placeholder_default')}
                clearAriaLabel={t('search.narrow_clear_aria')}
                wrapClassName="results-narrow-input-wrap"
                inputClassName={`results-narrow-input${narrowQuery ? ' results-narrow-input--has-value' : ''}`}
                clearButtonClassName="btn--primary input-clear-btn"
                disabled={!query && !narrowQuery}
              />
              {!liveSearch && (
                <Button
                  onClick={onNarrowSearch}
                  disabled={narrowQuery.length < 2 || (!query && !narrowQuery)}
                  variant="primary"
                  className="results-narrow-submit-btn btn--input-height"
                >
                  {t('search.narrow_button')}
                </Button>
              )}
            </div>
          </div>
        )}
        {onPlatformChange && narrowMode && (
          <fieldset className="results-narrow-platform-group">
            <legend className="results-narrow-platform-legend">{t('results.narrow_platform_label')}</legend>
            <div className="radio-chip-group">
              {Object.entries(platformLabels).map(([value, label]) => (
                <RadioChip
                  key={value}
                  name="narrow-platform"
                  value={value}
                  label={label}
                  current={sortBy === 'platform' ? 'all' : platform}
                  onChange={(val) => {
                    if (val === 'all') {
                      onPlatformChange('all')
                      if (sortBy === 'platform') onSortChange('smart')
                    } else {
                      onPlatformChange('all')
                      onSortChange('platform')
                    }
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}
        {onPlatformChange && narrowMode && <hr className="results-narrow-divider" aria-hidden="true" />}
      </div>}

      {!hideFilters && results.length > 0 && !platformNoResults && !narrowNoResults && (() => {
        const sortTag = hasNonDefaultSort && onSortChange
          ? { label: sortLabels[sortBy] ?? sortBy, prefix: t('results.filter_sort_prefix'), onRemove: () => onSortChange('smart') }
          : null
        if (!hasAnyActiveFilter) return null
        const renderTag = (f, i) => (
          <span key={i} className="active-bar__group">
            {f.prefix && <span className="active-bar__label">{f.prefix}</span>}
            <span // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- mouse-only convenience; keyboard path is the × button inside
              className={`active-bar__tag${f.onRemove ? ' active-bar__tag--removable' : ''}`}
              onClick={f.onRemove ? (e => { if (e.detail > 0) f.onRemove() }) : undefined}
            >
              {f.label}
              {f.onRemove && (
                <button
                  type="button"
                  className="active-bar__remove"
                  aria-label={t('results.filter_remove_aria', { filter: f.label })}
                  onClick={e => { e.stopPropagation(); f.onRemove() }}
                >
                  ×
                </button>
              )}
            </span>
          </span>
        )
        return (
          <>
            {activeFilters.length > 0 && (
              <p className="active-bar results-active-filters">
                <span className="active-bar__label">{t('results.no_results_filters_active')}</span>
                {activeFilters.map(renderTag)}
              </p>
            )}
            {sortTag && (
              <p className="active-bar results-active-filters results-active-filters--sort">
                {renderTag(sortTag, 0)}
              </p>
            )}
          </>
        )
      })()}

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
          const isSelected = selected?.id === entry.id
          const p = SEVERITY_VARS[entry.severity] || SEVERITY_VARS['Best Practice']
          const rating = ratings[entry.id] || DEFAULT_RATING
          const { score, starred, archived } = rating

          const truncDesc = entry.desc.length > DESC_PREVIEW_LENGTH
            ? entry.desc.slice(0, DESC_PREVIEW_LENGTH).trimEnd() + '…'
            : entry.desc

          const cardLabel = archived
            ? t('results.archived_label', { title: entry.title })
            : `${entry.title}, ${t(p.key)}, ${entry.primarySC}, ${truncDesc}`

          const shortTitle = truncateAtWord(entry.title, TITLE_TRUNCATE_LENGTH)

          function handleRankUp(e) {
            e.stopPropagation()
            if (!prefersReducedMotion) snapshotPositions()
            triggerButtonAnimation(e.currentTarget, entry.id, setAnimatingUp)
            onRankUp?.(entry.id)
            announce(t('announce.ranked_up', { title: entry.title, score: score + 1 }))
          }

          function handleRankDown(e) {
            e.stopPropagation()
            if (!prefersReducedMotion) snapshotPositions()
            triggerButtonAnimation(e.currentTarget, entry.id, setAnimatingDown)
            onRankDown?.(entry.id)
            announce(t('announce.ranked_down', { title: entry.title, score: score - 1 }))
          }

          function handleStar(e) {
            e.stopPropagation()
            onStar?.(entry.id)
          }

          function handleArchive(e) {
            e.stopPropagation()
            const idx = displayResults.indexOf(entry)
            const next = displayResults[idx + 1] || displayResults[idx - 1]
            const nextId = next?.id
            if (!archived) {
              announce(t('announce.archived'), { priority: 'assertive' })
              if (prefersReducedMotion || displayResults.length === 1) {
                onArchive?.(entry.id)
                if (nextId) requestAnimationFrame(() => itemRefs.current[nextId]?.focus())
              } else {
                setArchivingIds(s => new Set(s).add(entry.id))
                setTimeout(() => {
                  onArchive?.(entry.id)
                  setArchivingIds(s => { const n = new Set(s); n.delete(entry.id); return n })
                  if (nextId) requestAnimationFrame(() => itemRefs.current[nextId]?.focus())
                }, ARCHIVE_FLY_MS)
              }
            } else {
              announce(t('announce.unarchived'), { priority: 'assertive' })
              if (prefersReducedMotion || displayResults.length === 1) {
                onArchive?.(entry.id)
              } else {
                setUnarchivingIds(s => new Set(s).add(entry.id))
                setTimeout(() => {
                  onArchive?.(entry.id)
                  setUnarchivingIds(s => { const n = new Set(s); n.delete(entry.id); return n })
                }, UNARCHIVE_FLY_MS)
              }
            }
          }

          const pinned = pinnedIds.has(entry.id)

          function handlePin(e) {
            e.stopPropagation()
            announce(pinned
              ? t('announce.unpinned', { title: entry.title })
              : t('announce.pinned', { title: entry.title })
            )
            if (prefersReducedMotion) {
              onPin?.(entry.id)
            } else if (!pinned) {
              setPinningIds(s => new Set(s).add(entry.id))
              setTimeout(() => {
                onPin?.(entry.id)
                setPinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
              }, PIN_FLY_MS)
            } else {
              setUnpinningIds(s => new Set(s).add(entry.id))
              setTimeout(() => {
                onPin?.(entry.id)
                setUnpinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
              }, UNPIN_FLY_MS)
            }
          }

          const swipeIsOpen = swipeOpenId?.id === entry.id
          const swipeSide = swipeIsOpen ? swipeOpenId.side : null

          function handleSwipeTouchStart(e) {
            const t = e.touches[0]
            swipeTouchRef.current = { startX: t.clientX, startY: t.clientY, id: entry.id, moved: false }
          }

          function handleSwipeTouchEnd(e) {
            const touch = swipeTouchRef.current
            if (!touch || touch.id !== entry.id) return
            swipeTouchRef.current = null
            const el = e.currentTarget.querySelector('.result-swipe-wrap')
            if (!el) return
            const leftPanel = e.currentTarget.querySelector('.result-action-panel--left')
            if (leftPanel) leftPanel.style.width = ''
            const rightPanel = e.currentTarget.querySelector('.result-action-panel--right')
            if (rightPanel) rightPanel.style.width = ''
            const current = new DOMMatrix(getComputedStyle(el).transform).m41
            el.style.transition = ''
            const base = swipeIsOpen ? (swipeSide === 'left' ? -SWIPE_REVEAL : SWIPE_REVEAL) : 0
            const delta = current - base
            if (delta < -SWIPE_THRESHOLD) {
              setSwipeOpenId({ id: entry.id, side: 'left' })
            } else if (onPin && current >= SWIPE_ACTIVATE) {
              if (!archived) {
                const row = e.currentTarget
                const flashClass = pinned ? 'result-row--unpin-flash' : 'result-row--pin-flash'
                row.classList.add(flashClass)
                setTimeout(() => {
                  row.classList.remove(flashClass)
                  setSwipeOpenId(null)
                  announce(pinned
                    ? t('announce.unpinned', { title: entry.title })
                    : t('announce.pinned', { title: entry.title })
                  )
                  if (prefersReducedMotion) {
                    onPin?.(entry.id)
                  } else if (!pinned) {
                    setPinningIds(s => new Set(s).add(entry.id))
                    setTimeout(() => {
                      onPin?.(entry.id)
                      setPinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
                    }, PIN_FLY_MS)
                  } else {
                    setUnpinningIds(s => new Set(s).add(entry.id))
                    setTimeout(() => {
                      onPin?.(entry.id)
                      setUnpinningIds(s => { const n = new Set(s); n.delete(entry.id); return n })
                    }, UNPIN_FLY_MS)
                  }
                }, SWIPE_PIN_FLASH_MS)
              } else {
                setSwipeOpenId(null)
              }
            } else if (delta > SWIPE_THRESHOLD) {
              setSwipeOpenId({ id: entry.id, side: 'right' })
            } else {
              setSwipeOpenId(null)
            }
            el.style.transform = ''
          }

          const nextEntry = displayResults[index + 1] ?? displayResults[0]
          const skipHref = `#result-${nextEntry.id}`

          function handleSkipToNext(e) {
            e.preventDefault()
            itemRefs.current[nextEntry.id]?.focus()
          }

          const swipeClass = swipeIsOpen ? ` result-row--swipe-${swipeSide}` : ''

          return (
            <Fragment key={entry.id}>
            <li
              id={`result-${entry.id}`}
              data-swipe-id={entry.id}
              data-flip-id={entry.id}
              className={`result-row${archived ? ' result-row--archived' : ''}${swipeClass}${pinningIds.has(entry.id) ? ' result-row--pinning' : ''}${unpinningIds.has(entry.id) ? ' result-row--unpinning' : ''}${archivingIds.has(entry.id) ? ' result-row--archiving' : ''}${unarchivingIds.has(entry.id) ? ' result-row--unarchiving' : ''}`}
              style={{ '--result-i': index }}
              onTouchStart={(showRanking || onPin) ? handleSwipeTouchStart : undefined}
              onTouchEnd={(showRanking || onPin) ? handleSwipeTouchEnd : undefined}
            >
              {/* Swipe wrap: slides over the action panels */}
              <div className="result-swipe-wrap">
                <div className="result-card-wrap">
                  {(showRanking || onPin) && (
                    <div className="result-swipe-hint" aria-hidden="true">
                      {onPin && <ChevronsRight size={18} className="result-swipe-hint__chevron result-swipe-hint__chevron--left" aria-hidden="true" />}
                      {showRanking && !pinned && <ChevronsLeft size={18} className="result-swipe-hint__chevron result-swipe-hint__chevron--right" aria-hidden="true" />}
                    </div>
                  )}
                  <a
                    ref={el => { itemRefs.current[entry.id] = el }}
                    data-entry-id={entry.id}
                    href={`#/entry/${entry.id}/${entrySlug(entry.title)}`}
                    aria-label={cardLabel}
                    onClick={e => {
                      e.preventDefault()
                      if (swipeIsOpen) { setSwipeOpenId(null); return }
                      if (!archived) onSelect?.(entry, e.currentTarget)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[results[index + 1]?.id]?.focus() }
                      if (e.key === 'ArrowUp')   { e.preventDefault(); itemRefs.current[results[index - 1]?.id]?.focus() }
                    }}
                    className={`result-item${isSelected ? ' result-item--selected' : ''}${starred ? ' result-item--starred' : ''}${pinned ? ' result-item--pinned' : ''}${onPin ? ' result-item--pinnable' : ''}`}
                  >
                    <div className="result-item__header">
                      <span className="result-item__title">
                        {entry.title}
                      </span>
                      <span className="result-item__badges">
                        <Badge
                          variant="severity"
                          bg={archived ? undefined : p.bg}
                          color={archived ? undefined : p.color}
                          prefix={entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
                        >
                          {t(p.key)}
                        </Badge>
                        {entry.creditNames?.map(src => (
                          <Badge
                            key={src}
                            variant="source"
                            prefix={t('badge.source_prefix')}
                            title={`Source: ${src}`}
                          >
                            {src}
                          </Badge>
                        ))}
                        {entry.wcagVersion && (
                          <Badge
                            variant="wcag"
                            title={`${t('badge.wcag_prefix')}${entry.wcagVersion}`}
                            aria-label={`${t('badge.wcag_prefix')}${entry.wcagVersion}, ${t('results.badge_filter_aria')}`}
                            onClick={() => onBadgeClick?.({ type: 'wcag', value: entry.wcagVersion })}
                          >
                            {entry.wcagVersion}
                          </Badge>
                        )}
                        {entry.wcagLevel && (
                          <Badge
                            variant="wcag-level"
                            title={`${t('badge.level_prefix')}${entry.wcagLevel}`}
                            aria-label={`${t('badge.level_prefix')}${entry.wcagLevel}, ${t('results.badge_filter_aria')}`}
                            onClick={() => onBadgeClick?.({ type: 'wcag-level', value: entry.wcagLevel })}
                          >
                            {entry.wcagLevel}
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="result-item__sc">{entry.primarySC}</div>

                    <div className="result-item__desc">{entry.desc}</div>
                  </a>

                  {showRankingSort && index < displayResults.length - 1 && (
                    <LinkSkipTo
                      href={skipHref}
                      tabIndex={archived ? -1 : 0}
                      onClick={handleSkipToNext}
                      onFocus={(e) => {
                        const row = e.currentTarget.closest('li.result-row')
                        if (row) row.classList.add('result-row--skip-focused')
                      }}
                      onBlur={(e) => {
                        const row = e.currentTarget.closest('li.result-row')
                        if (row) row.classList.remove('result-row--skip-focused')
                      }}
                    >
                      {t('results.skip_to_next')}
                    </LinkSkipTo>
                  )}
                  {onPin && (
                    <ButtonIcon
                      variant="tertiary"
                      label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                      disabled={archived}
                      onClick={handlePin}
                      icon={pinned
                        ? <PinOff size={14} aria-hidden="true" fill="currentColor" />
                        : <Pin size={14} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} />
                      }
                      className={`result-pin-btn${pinned ? ' result-pin-btn--active' : ''}`}
                    />
                  )}
                </div>

                {showRanking && !pinned && <div className="result-rank-col">
                  <ButtonIcon
                    variant="tertiary"
                    label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
                    disabled={archived}
                    onClick={handleStar}
                    icon={<Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />}
                    className={`result-rank-btn result-rank-btn--star${starred ? ' result-rank-btn--active' : ''}`}
                  />

                  {!pinned && <>
                    <ButtonIcon
                      variant="tertiary"
                      label={t('results.rank_up', { title: shortTitle })}
                      disabled={archived}
                      onClick={handleRankUp}
                      icon={<ThumbsUp size={14} aria-hidden="true" fill={animatingUp.has(entry.id) ? 'currentColor' : 'none'} />}
                      className="result-rank-btn result-rank-btn--up"
                    />

                    <span
                      className="result-rank-score"
                      title={t('results.score_label', { score })}
                    >
                      <span className="sr-only">{t('results.score_label', { score })}</span>
                      <span aria-hidden="true">{score}</span>
                    </span>

                    <ButtonIcon
                      variant="tertiary"
                      label={t('results.rank_down', { title: shortTitle })}
                      disabled={archived}
                      onClick={handleRankDown}
                      icon={<ThumbsDown size={14} aria-hidden="true" fill={animatingDown.has(entry.id) ? 'currentColor' : 'none'} />}
                      className="result-rank-btn result-rank-btn--down"
                    />
                  </>}

                  <ButtonIcon
                    variant="tertiary"
                    label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
                    onClick={handleArchive}
                    icon={archived
                      ? <ArchiveRestore size={13} aria-hidden="true" />
                      : <Archive size={13} aria-hidden="true" />
                    }
                    className={`result-rank-btn result-rank-btn--archive${archived ? ' result-rank-btn--active' : ''}`}
                  />
                </div>}
              </div>

              {/* Right action panel: pin (revealed by swiping right) */}
              {/* Mobile: pin button inside swipe-reveal action panel */}
              {onPin && (
                <div
                  className="result-action-panel result-action-panel--right"
                  onFocus={() => setSwipeOpenId({ id: entry.id, side: 'right' })}
                  onBlur={() => setSwipeOpenId(null)}
                >
                  <ButtonIcon
                    variant="tertiary"
                    label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    disabled={archived}
                    onClick={handlePin}
                    icon={pinned
                      ? <PinOff size={14} aria-hidden="true" fill="currentColor" />
                      : <Pin size={14} aria-hidden="true" fill="currentColor" />
                    }
                    className={`result-rank-btn${pinned ? ' result-pin-btn--active' : ''}`}
                  />
                </div>
              )}

              {/* Left action panel: ranking controls (revealed by swiping left) */}
              {showRanking && !pinned && (
                <div
                  className="result-action-panel result-action-panel--left"
                  onFocus={() => setSwipeOpenId({ id: entry.id, side: 'left' })}
                  onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSwipeOpenId(null) }}
                >
                  <ButtonIcon variant="tertiary" label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })} onClick={handleStar}
                    icon={<Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />}
                    className={`result-rank-btn result-rank-btn--star${starred ? ' result-rank-btn--active' : ''}`}
                  />
                  <ButtonIcon variant="tertiary" label={t('results.rank_up', { title: shortTitle })} disabled={archived} onClick={handleRankUp}
                    icon={<ThumbsUp size={14} aria-hidden="true" />}
                    className="result-rank-btn result-rank-btn--up"
                  />
                  <span className="result-rank-score" aria-hidden="true">{score}</span>
                  <ButtonIcon variant="tertiary" label={t('results.rank_down', { title: shortTitle })} disabled={archived} onClick={handleRankDown}
                    icon={<ThumbsDown size={14} aria-hidden="true" />}
                    className="result-rank-btn result-rank-btn--down"
                  />
                  <ButtonIcon variant="tertiary" label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })} onClick={handleArchive}
                    icon={archived ? <ArchiveRestore size={13} aria-hidden="true" /> : <Archive size={13} aria-hidden="true" />}
                    className={`result-rank-btn result-rank-btn--archive${archived ? ' result-rank-btn--active' : ''}`}
                  />
                </div>
              )}
            </li>
            {showAdAfter && <TileAd />}
            </Fragment>
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
