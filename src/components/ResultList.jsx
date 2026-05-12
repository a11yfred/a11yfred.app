import { Star, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, Link, Check, Pin, PinOff, Filter, ChevronsLeft, ChevronsRight, ChevronUp, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '../taho-bayabas/index.js'
import { useT } from '../calamansi/react.js'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import Button from './ui/Button.jsx'
import SkipLink from './ui/SkipLink.jsx'
import RadioChip from './ui/RadioChip.jsx'
import ButtonIcon from './ui/ButtonIcon.jsx'
import Badge from './ui/Badge.jsx'
import Select from './ui/Select.jsx'
import InputWithClear from './ui/InputWithClear.jsx'
import NoResults from './ui/NoResults.jsx'
import InfoBox from './ui/InfoBox.jsx'
import SponsoredTile from './SponsoredTile.jsx'
import findingSlug from '../utils/findingSlug.js'
import { DEFAULT_RATING, CLIPBOARD_TIMEOUT, pluralResult, DESC_PREVIEW_LENGTH, TITLE_TRUNCATE_LENGTH, SWIPE_REVEAL, SWIPE_THRESHOLD, SWIPE_ACTIVATE, SORT_FLASH_MS, RANK_ANIM_MS, ARCHIVE_FOCUS_DELAY_MS, RESULTS_VIEW_ALL_THRESHOLD } from '../utils/constants.js'
import './ResultList.css'

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

export function PinnedSection({ findings, onClearPins, headingRef, showRanking = true, ...listProps }) {
  const t = useT()
  if (!findings.length) return null
  return (
    <div className="pinned-section pinned-results">
      <div className="pinned-section__header">
        <h2 ref={headingRef} tabIndex={-1} className="pinned-section__heading">
          {t('results.pinned_heading')}
          <span className="pinned-section__count">{findings.length}</span>
        </h2>
        {onClearPins && (
          <Button variant="tertiary" className="pinned-unpin-all-btn" onClick={onClearPins} icon={<PinOff size={14} aria-hidden="true" />}>
            {t('results.unpin_all')}
          </Button>
        )}
      </div>
      <ResultList
        {...listProps}
        results={findings}
        selected={null}
        query=""
        showRanking={showRanking}
        showRankingSort={showRanking}
        hideCount
        hasPinnedItems={false}
      />
    </div>
  )
}

export default function ResultList({ results, selected, onSelect, query, ratings = {}, onRankUp, onRankDown, onStar, onArchive, showRanking = true, countRef, onCopyLink, pinnedIds = new Set(), onPin, hideCount = false, filterLabel, narrowMode = false, narrowQuery = '', narrowResults = null, onNarrow, onNarrowExit, onNarrowChange, liveSearch = true, onNarrowSearch, showRankingSort = false, showAds = false, adFrequency = 8, onClear, hasPinnedItems = false, sortBy = 'relevance', onSortChange, platform = 'all', onPlatformChange }) {
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
  const listRef = useRef(null)
  const [animatingUp, setAnimatingUp] = useState(() => new Set())
  const [animatingDown, setAnimatingDown] = useState(() => new Set())
  const prevNarrowResultsRef = useRef(undefined)
  const [swipeOpenId, setSwipeOpenId] = useState(null) // null | { id, side: 'left'|'right' }
  const swipeTouchRef = useRef(null) // { startX, startY, id, el }
  const swipeStateRef = useRef({}) // snapshot of swipe-related state for native touchmove handler

  // Keep swipeStateRef in sync so native touchmove handler always sees current values
  useEffect(() => { swipeStateRef.current = { swipeOpenId, showRanking, onPin, pinnedIds } })

  // Non-passive native touchmove so e.preventDefault() actually works
  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return
    function handleTouchMove(e) {
      const touch = swipeTouchRef.current
      if (!touch) return
      const dx = e.touches[0].clientX - touch.startX
      const dy = e.touches[0].clientY - touch.startY
      if (!touch.moved && Math.abs(dy) > Math.abs(dx)) { swipeTouchRef.current = null; return }
      touch.moved = true
      const li = listEl.querySelector(`[data-swipe-id="${touch.id}"]`)
      const el = li?.querySelector('.result-swipe-wrap')
      if (!el) return
      const { swipeOpenId: openId, showRanking: sr, onPin: op, pinnedIds: pids } = swipeStateRef.current
      const isOpen = openId?.id === touch.id
      const side = isOpen ? openId.side : null
      const pinned = pids.has(touch.id)
      const base = isOpen ? (side === 'left' ? -SWIPE_REVEAL : SWIPE_REVEAL) : 0
      const minX = (sr && !pinned) ? -SWIPE_REVEAL : 0
      const maxX = op ? SWIPE_ACTIVATE : 0
      if (minX === 0 && maxX === 0) return
      const clamped = Math.max(minX, Math.min(maxX, base + dx))
      el.style.transition = 'none'
      el.style.transform = `translateX(${clamped}px)`
      const leftPanel = li?.querySelector('.result-action-panel--left')
      if (leftPanel && clamped < 0) leftPanel.style.width = `${Math.abs(clamped)}px`
      const rightPanel = li?.querySelector('.result-action-panel--right')
      if (rightPanel && clamped > 0) rightPanel.style.width = `${clamped}px`
      e.preventDefault()
    }
    listEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => listEl.removeEventListener('touchmove', handleTouchMove)
  }) // no deps -- re-runs each render to track listRef.current

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

    const currentFinding = displayResults[currentIndex]
    const rating = ratings[currentFinding.id] || DEFAULT_RATING
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
        onStar?.(currentFinding.id)
        announce(starred ? t('announce.unstarred') : t('announce.starred'))
        break
      case 'e':
        e.preventDefault()
        announce(archived ? t('announce.unarchived') : t('announce.archived'), { priority: 'assertive' })
        setTimeout(() => onArchive?.(currentFinding.id), ARCHIVE_FOCUS_DELAY_MS)
        break
      case 'u':
        e.preventDefault()
        if (archived) {
          onArchive?.(currentFinding.id)
          announce(t('announce.unarchived'))
        }
        break
      default:
        if (e.shiftKey && (e.key === 'ArrowUp' || e.key === '↑')) {
          e.preventDefault()
          onRankUp?.(currentFinding.id)
          const newRating = ratings[currentFinding.id] || DEFAULT_RATING
          announce(t('announce.ranked_up', { title: currentFinding.title, score: newRating.score + 1 }))
        } else if (e.shiftKey && (e.key === 'ArrowDown' || e.key === '↓')) {
          e.preventDefault()
          onRankDown?.(currentFinding.id)
          const newRating = ratings[currentFinding.id] || DEFAULT_RATING
          announce(t('announce.ranked_down', { title: currentFinding.title, score: newRating.score - 1 }))
        }
    }
  }, [displayResults, ratings, onStar, onArchive, onRankUp, onRankDown, t])

  useEffect(() => {
    const listEl = listRef.current
    listEl?.addEventListener('keydown', handleKeyDown)
    return () => listEl?.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
  }, [swipeOpenId])

  if (results.length === 0 && platform === 'all') {
    return <NoResults
      query={query}
      ariaLabel={t('results.no_results_aria')}
      heading={t('results.no_results_heading', { query })}
      body={t('results.no_results_body')}
      onMount={() => announce(t('results.no_results_announce', { query }))}
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
      {!hideCount && <div className="results-meta">
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
          const hasQuery = !!query
          const hasNarrow = narrowMode && !!narrowQuery
          let summaryKey
          if (hasQuery && hasNarrow) summaryKey = 'results.summary_query'
          else if (hasQuery) summaryKey = 'results.summary_no_narrow'
          else if (hasNarrow) summaryKey = 'results.summary_no_query'
          else summaryKey = 'results.summary_no_query_no_narrow'
          return (
            <p className="results-summary">
              {t(summaryKey, { query, sort: sortLabels[sortBy] ?? sortBy, narrow: narrowQuery, platform: platformLabels[platform] ?? platform })}
            </p>
          )
        })()}
        {onSortChange && results.length > 0 && (() => {
          const infoLabel = t('detail.note_label')
          if (sortBy === 'smart') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_smart_info')}</InfoBox>
          if (sortBy === 'wcag-level') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_wcag_level_info')}</InfoBox>
          if (sortBy === 'popularity') return <InfoBox label={infoLabel} className="results-sort-info">{t('results.sort_popularity_info')}</InfoBox>
          return null
        })()}
        {onSortChange && results.length > 0 && (showRanking || liveSearch) && (
          <p className="results-rank-hint">
            {showRanking && t('results.rank_hint')}
            {showRanking && liveSearch && ' '}
            {liveSearch && <span className="results-sort-live-hint"><strong>{t('results.sort_live_hint')}</strong></span>}
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
                    <X size={16} aria-hidden="true" />
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
                aria-label={t('results.clear_results')}
                title={t('results.clear_results')}
                onClick={() => { announce(t('announce.filters_cleared')); setClearPending(true) }}
              >
                {t('results.clear_results')}
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
            <label htmlFor="narrow-filter" className="results-narrow-label">
              {t('search.narrowing_results')}
            </label>
            <div className="results-narrow-row">
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
                placeholder={narrowResults ? t('search.narrow_placeholder', { count: results.length }) : 'Filter results…'}
                clearAriaLabel={t('search.narrow_clear_aria')}
                wrapClassName="results-narrow-input-wrap"
                inputClassName={`results-narrow-input${narrowQuery ? ' results-narrow-input--has-value' : ''}`}
                clearButtonClassName="btn--primary input-clear-btn"
              />
              {!liveSearch && (
                <Button
                  onClick={onNarrowSearch}
                  disabled={narrowQuery.length < 2}
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
            <legend className="sr-only">{t('settings.platform_label')}</legend>
            <div className="radio-chip-group">
              {Object.entries(platformLabels).map(([value, label]) => (
                <RadioChip
                  key={value}
                  name="narrow-platform"
                  value={value}
                  label={label}
                  current={platform}
                  onChange={onPlatformChange}
                />
              ))}
            </div>
          </fieldset>
        )}
        {onPlatformChange && narrowMode && <hr className="results-narrow-divider" aria-hidden="true" />}
      </div>}

      {(narrowNoResults || platformNoResults)
        ? <NoResults
            query={narrowNoResults ? narrowQuery : query}
            ariaLabel={t('results.no_results_aria')}
            heading={t('results.no_results_heading', { query: narrowNoResults ? narrowQuery : query })}
            body={t('results.no_results_body')}
          />
        : <ul ref={listRef} className={`result-list${selected ? ' result-list--has-selection' : ''}${hasPinnedItems ? ' result-list--has-pinned' : ''}`} aria-label={t('results.aria_label')}>
          {displayResults.map((finding, index) => {
          const showAdAfter = showAds && adFrequency > 0 && (index + 1) % adFrequency === 0
          const isSelected = selected?.id === finding.id
          const p = SEVERITY_VARS[finding.severity] || SEVERITY_VARS['Best Practice']
          const rating = ratings[finding.id] || DEFAULT_RATING
          const { score, starred, archived } = rating

          const truncDesc = finding.desc.length > DESC_PREVIEW_LENGTH
            ? finding.desc.slice(0, DESC_PREVIEW_LENGTH).trimEnd() + '…'
            : finding.desc

          const cardLabel = archived
            ? t('results.archived_label', { title: finding.title })
            : `${finding.title}, ${t(p.key)}, ${finding.primarySC}, ${truncDesc}`

          // Truncate title used in vote-button labels only, full title used in announce() calls
          const shortTitle = (() => {
            if (finding.title.length <= TITLE_TRUNCATE_LENGTH) return finding.title
            const cut = finding.title.slice(0, TITLE_TRUNCATE_LENGTH)
            const lastSpace = cut.lastIndexOf(' ')
            return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
          })()

          function handleRankUp(e) {
            e.stopPropagation()
            triggerButtonAnimation(e.currentTarget, finding.id, setAnimatingUp)
            onRankUp?.(finding.id)
            announce(t('announce.ranked_up', { title: finding.title, score: score + 1 }))
          }

          function handleRankDown(e) {
            e.stopPropagation()
            triggerButtonAnimation(e.currentTarget, finding.id, setAnimatingDown)
            onRankDown?.(finding.id)
            announce(t('announce.ranked_down', { title: finding.title, score: score - 1 }))
          }

          function handleStar(e) {
            e.stopPropagation()
            onStar?.(finding.id)
          }

          function handleArchive(e) {
            e.stopPropagation()
            announce(t('announce.archived'), { priority: 'assertive' })
            const idx = displayResults.indexOf(finding)
            const next = displayResults[idx + 1] || displayResults[idx - 1]
            const nextId = next?.id
            setTimeout(() => {
              onArchive?.(finding.id)
              if (nextId) requestAnimationFrame(() => itemRefs.current[nextId]?.focus())
            }, ARCHIVE_FOCUS_DELAY_MS)
          }

          const pinned = pinnedIds.has(finding.id)

          function handlePin(e) {
            e.stopPropagation()
            onPin?.(finding.id)
            announce(pinned
              ? t('announce.unpinned', { title: finding.title })
              : t('announce.pinned', { title: finding.title })
            )
          }

          const swipeIsOpen = swipeOpenId?.id === finding.id
          const swipeSide = swipeIsOpen ? swipeOpenId.side : null

          function handleSwipeTouchStart(e) {
            const t = e.touches[0]
            swipeTouchRef.current = { startX: t.clientX, startY: t.clientY, id: finding.id, moved: false }
          }

          function handleSwipeTouchEnd(e) {
            const touch = swipeTouchRef.current
            if (!touch || touch.id !== finding.id) return
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
              setSwipeOpenId({ id: finding.id, side: 'left' })
            } else if (onPin && current >= SWIPE_ACTIVATE) {
              setSwipeOpenId(null)
              if (!archived) handlePin(e)
            } else if (delta > SWIPE_THRESHOLD) {
              setSwipeOpenId({ id: finding.id, side: 'right' })
            } else {
              setSwipeOpenId(null)
            }
            el.style.transform = ''
          }

          const nextFinding = displayResults[index + 1] ?? displayResults[0]
          const skipHref = `#result-${nextFinding.id}`

          function handleSkipToNext(e) {
            e.preventDefault()
            itemRefs.current[nextFinding.id]?.focus()
          }

          const swipeClass = swipeIsOpen ? ` result-row--swipe-${swipeSide}` : ''

          return (
            <Fragment key={finding.id}>
            <li
              id={`result-${finding.id}`}
              data-swipe-id={finding.id}
              className={`result-row${archived ? ' result-row--archived' : ''}${swipeClass}`}
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
                    ref={el => { itemRefs.current[finding.id] = el }}
                    data-finding-id={finding.id}
                    href={`#/finding/${finding.id}/${findingSlug(finding.title)}`}
                    aria-label={cardLabel}
                    onClick={e => {
                      e.preventDefault()
                      if (swipeIsOpen) { setSwipeOpenId(null); return }
                      if (!archived) onSelect?.(finding, e.currentTarget)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[results[index + 1]?.id]?.focus() }
                      if (e.key === 'ArrowUp')   { e.preventDefault(); itemRefs.current[results[index - 1]?.id]?.focus() }
                    }}
                    className={`result-item${isSelected ? ' result-item--selected' : ''}${onPin ? ' result-item--pinnable' : ''}`}
                  >
                    <div className="result-item__header">
                      <span className="result-item__title">
                        {finding.title}
                      </span>
                      <span className="result-item__badges">
                        <Badge
                          variant="severity"
                          bg={archived ? undefined : p.bg}
                          color={archived ? undefined : p.color}
                          prefix={finding.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
                        >
                          {t(p.key)}
                        </Badge>
                        {finding.creditNames?.map(src => (
                          <Badge
                            key={src}
                            variant="source"
                            prefix={t('badge.source_prefix')}
                            title={`Source: ${src}`}
                          >
                            {src}
                          </Badge>
                        ))}
                        {finding.wcagVersion && finding.wcagLevel && (
                          <Badge
                            variant="wcag"
                            title={`${t('badge.wcag_prefix')}${finding.wcagVersion}, ${t('badge.level_prefix')}${finding.wcagLevel}`}
                          >
                            <span className="badge-prefix">{t('badge.wcag_prefix')}</span>
                            {finding.wcagVersion},{' '}
                            <span className="badge-prefix">{t('badge.level_prefix')}</span>
                            {finding.wcagLevel}
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="result-item__sc">{finding.primarySC}</div>

                    <div className="result-item__desc">{finding.desc}</div>
                  </a>

                  {showRankingSort && index < displayResults.length - 1 && (
                    <SkipLink
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
                    </SkipLink>
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
                      aria-hidden={true}
                      tabIndex={-1}
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
                      icon={<ThumbsUp size={14} aria-hidden="true" fill={animatingUp.has(finding.id) ? 'currentColor' : 'none'} />}
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
                      icon={<ThumbsDown size={14} aria-hidden="true" fill={animatingDown.has(finding.id) ? 'currentColor' : 'none'} />}
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
                <div className="result-action-panel result-action-panel--right">
                  <ButtonIcon
                    variant="tertiary"
                    label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    disabled={archived}
                    onClick={handlePin}
                    onFocus={() => setSwipeOpenId({ id: finding.id, side: 'right' })}
                    onBlur={() => setSwipeOpenId(null)}
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
                  onFocus={() => setSwipeOpenId({ id: finding.id, side: 'left' })}
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
            {showAdAfter && <SponsoredTile />}
            </Fragment>
          )
        })}
        </ul>
      }
      {results.length > 0 && !hideCount && (
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
              countHeadingRef.current?.focus()
            }}
          >
            <ChevronUp size={16} aria-hidden="true" />
            {t('results.back_to_top')}
          </Button>
        </div>
      )}
    </div>
  )
}

export { default as ResultListSkeleton } from './ResultListSkeleton.jsx'
export { default as DataError } from './ui/DataError.jsx'
