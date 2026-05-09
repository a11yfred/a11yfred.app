import { Star, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, Link, Check, Pin, PinOff, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import Button from './ui/Button.jsx'
import IconButton from './ui/IconButton.jsx'
import Badge from './ui/Badge.jsx'
import Select from './ui/Select.jsx'
import InputWithClear from './ui/InputWithClear.jsx'
import NoResults from './ui/NoResults.jsx'
import SponsoredTile from './SponsoredTile.jsx'
import findingSlug from '../utils/findingSlug.js'
import { DEFAULT_RATING, CLIPBOARD_TIMEOUT, DESC_PREVIEW_LENGTH, TITLE_TRUNCATE_LENGTH } from '../utils/constants.js'

export function PinnedSection({ findings, selected, onSelect, ratings = {}, onRankUp, onRankDown, onStar, onArchive, showRanking = true, pinnedIds = new Set(), onPin, onClearPins, headingRef }) {
  const t = useT()
  if (!findings.length) return null
  return (
    <div className="pinned-section pinned-results">
      <div className={`pinned-section__header${showRanking ? ' pinned-section__header--with-sort' : ''}`}>
        <h2 ref={headingRef} tabIndex={-1} className="pinned-section__heading">
          {t('results.pinned_heading')}
          <span className="pinned-section__count">{findings.length}</span>
        </h2>
        {onClearPins && (
          <Button variant="tertiary" className="pinned-unpin-all-btn" onClick={onClearPins}>
            {t('results.unpin_all')}
          </Button>
        )}
      </div>
      <ResultList
        results={findings}
        selected={selected}
        onSelect={onSelect}
        query=""
        ratings={ratings}
        onRankUp={onRankUp}
        onRankDown={onRankDown}
        onStar={onStar}
        onArchive={onArchive}
        showRanking={showRanking}
        pinnedIds={pinnedIds}
        onPin={onPin}
        hideCount
        showRankingSort={showRanking}
        hasPinnedItems={false}
      />
    </div>
  )
}

export default function ResultList({ results, selected, query, ratings = {}, onRankUp, onRankDown, onStar, onArchive, showRanking = true, countRef, onCopyLink, pinnedIds = new Set(), onPin, hideCount = false, filterLabel, narrowMode = false, narrowQuery = '', narrowResults = null, onNarrow, onNarrowExit, onNarrowChange, liveSearch = true, onNarrowSearch, showRankingSort = false, showAds = false, adFrequency = 8, onClear, hasPinnedItems = false, sortBy = 'relevance', onSortChange }) {
  const t = useT()
  const itemRefs = useRef({})
  const focusNextRef = useRef(null)
  const countHeadingRef = useRef(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [pendingSort, setPendingSort] = useState(sortBy)
  const listRef = useRef(null)
  const [animatingUp, setAnimatingUp] = useState(() => new Set())
  const [animatingDown, setAnimatingDown] = useState(() => new Set())

  // Keep pendingSort in sync when sortBy changes externally
  useEffect(() => { setPendingSort(sortBy) }, [sortBy]) // eslint-disable-line react-hooks/set-state-in-effect -- intentional sync from parent prop

  // Use narrowResults if provided (filtered), otherwise use all results
  const displayResults = narrowMode && narrowResults ? narrowResults : results
  const displayCount = narrowMode && narrowResults
    ? t('results.narrow_count', { narrowed: narrowResults.length, total: results.length })
    : (filterLabel
      ? t('results.count_badge', { count: results.length, filter: filterLabel })
      : t('results.count', { count: results.length })
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
        announce(starred
          ? t('announce.unstarred', { title: currentFinding.title })
          : t('announce.starred', { title: currentFinding.title })
        )
        break
      case 'e':
        e.preventDefault()
        onArchive?.(currentFinding.id)
        announce(archived
          ? t('announce.unarchived', { title: currentFinding.title })
          : t('announce.archived', { title: currentFinding.title })
        )
        break
      case 'u':
        e.preventDefault()
        if (archived) {
          onArchive?.(currentFinding.id)
          announce(t('announce.unarchived', { title: currentFinding.title }))
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

  if (results.length === 0) {
    return <NoResults
      query={query}
      ariaLabel={t('results.no_results_aria')}
      heading={t('results.no_results_heading', { query })}
      body={t('results.no_results_body')}
      onMount={() => announce(t('results.no_results_announce', { query }))}
    />
  }

  if (narrowMode && narrowResults && narrowResults.length === 0) {
    return <NoResults
      query={narrowQuery}
      ariaLabel={t('results.no_results_aria')}
      heading={t('results.no_results_heading', { query: narrowQuery })}
      body={t('results.no_results_body')}
      onMount={() => announce(t('results.no_results_announce', { query: narrowQuery }))}
    />
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
        {onSortChange && results.length > 0 && (showRanking || liveSearch) && (
          <p className="results-rank-hint">
            {showRanking && t('results.rank_hint')}
            {showRanking && liveSearch && ' '}
            {liveSearch && <span className="results-sort-live-hint"><strong>{t('results.sort_live_hint')}</strong></span>}
          </p>
        )}
        <div className="results-actions-row">
          {onSortChange && results.length > 0 && (
            <div className="results-sort-group">
              <div className="results-sort-controls">
                <label htmlFor="results-sort" className="results-sort-label">{t('results.sort_label')}</label>
                <Select
                  id="results-sort"
                  value={liveSearch ? sortBy : pendingSort}
                  onChange={e => {
                    if (liveSearch) {
                      onSortChange(e.target.value)
                    } else {
                      setPendingSort(e.target.value)
                    }
                  }}
                  wrapClass="results-sort-select-wrap"
                >
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
                    className="results-sort-btn"
                    onClick={() => onSortChange(pendingSort)}
                  >
                    {t('results.sort_apply')}
                  </Button>
                )}
              </div>
            </div>
          )}
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
          {results.length > 0 && onClear && (
            <Button
              variant="tertiary"
              className="results-clear-btn"
              aria-label={t('results.clear_results')}
              title={t('results.clear_results')}
              onClick={onClear}
            >
              {t('results.clear_results')}
            </Button>
          )}
        </div>

        {narrowMode && onNarrowChange && (
          <div className="results-narrow-input-section">
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
                clearAriaLabel={t('search.clear_aria')}
                wrapClassName="results-narrow-input-wrap"
                inputClassName={`results-narrow-input${narrowQuery ? ' results-narrow-input--has-value' : ''}`}
                clearButtonClassName="btn--primary results-narrow-clear-btn"
              />
              {!liveSearch && (
                <Button
                  onClick={onNarrowSearch}
                  disabled={narrowQuery.length < 2}
                  variant="primary"
                  className="results-narrow-submit-btn btn--input-height"
                >
                  {t('search.button')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>}

      <ul ref={listRef} className={`result-list${selected ? ' result-list--has-selection' : ''}${hasPinnedItems ? ' result-list--has-pinned' : ''}`} aria-label={t('results.aria_label')}>
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
            const btn = e.currentTarget
            btn.classList.remove('animating')
            void btn.offsetWidth
            btn.classList.add('animating')
            setAnimatingUp(s => new Set(s).add(finding.id))
            setTimeout(() => {
              btn.classList.remove('animating')
              setAnimatingUp(s => { const n = new Set(s); n.delete(finding.id); return n })
            }, 400)
            onRankUp?.(finding.id)
            announce(t('announce.ranked_up', { title: finding.title, score: score + 1 }))
          }

          function handleRankDown(e) {
            e.stopPropagation()
            const btn = e.currentTarget
            btn.classList.remove('animating')
            void btn.offsetWidth
            btn.classList.add('animating')
            setAnimatingDown(s => new Set(s).add(finding.id))
            setTimeout(() => {
              btn.classList.remove('animating')
              setAnimatingDown(s => { const n = new Set(s); n.delete(finding.id); return n })
            }, 400)
            onRankDown?.(finding.id)
            announce(t('announce.ranked_down', { title: finding.title, score: score - 1 }))
          }

          function handleStar(e) {
            e.stopPropagation()
            onStar?.(finding.id)
            announce(starred
              ? t('announce.unstarred', { title: finding.title })
              : t('announce.starred', { title: finding.title })
            )
          }

          function handleArchive(e) {
            e.stopPropagation()
            const idx = results.indexOf(finding)
            const next = results[idx + 1] || results[idx - 1]
            if (next) focusNextRef.current = next.id
            onArchive?.(finding.id)
            announce(archived
              ? t('announce.unarchived', { title: finding.title })
              : t('announce.archived', { title: finding.title })
            )
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

          function handleSkipToNext() {
            const nextIndex = index + 1
            if (nextIndex < displayResults.length) {
              itemRefs.current[displayResults[nextIndex].id]?.focus()
            } else {
              itemRefs.current[displayResults[0].id]?.focus()
            }
          }

          return (
            <Fragment key={finding.id}>
            <li
              className={`result-row${archived ? ' result-row--archived' : ''}`}
              style={{ '--result-i': index }}
            >
              <div className="result-card-wrap">
                {onPin && (
                  <IconButton
                    variant="tertiary"
                    label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    title={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    disabled={archived}
                    onClick={handlePin}
                    icon={pinned
                      ? <PinOff size={12} aria-hidden="true" fill="currentColor" />
                      : <Pin size={12} aria-hidden="true" fill="none" />
                    }
                    className={`result-pin-btn${pinned ? ' result-pin-btn--active' : ''}`}
                  />
                )}
                <a
                  ref={el => { itemRefs.current[finding.id] = el }}
                  href={`#/finding/${finding.id}/${findingSlug(finding.title)}`}
                  aria-label={cardLabel}
                  onClick={archived ? e => e.preventDefault() : undefined}
                  onKeyDown={e => {
                    if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[results[index + 1]?.id]?.focus() }
                    if (e.key === 'ArrowUp')   { e.preventDefault(); itemRefs.current[results[index - 1]?.id]?.focus() }
                  }}
                  className={`result-item${isSelected ? ' result-item--selected' : ''}${onPin ? ' result-item--pinnable' : ''}`}
                >
                <div className="result-item__header">
                  <span className="result-item__title">
                    {isSelected && <span aria-hidden="true" className="result-item__dot" />}
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

              {showRankingSort && (
                <a
                  href="#/"
                  tabIndex={archived ? -1 : 0}
                  onClick={(e) => { e.preventDefault(); handleSkipToNext() }}
                  onFocus={(e) => {
                    const row = e.currentTarget.closest('li.result-row')
                    if (row) row.classList.add('result-row--skip-focused')
                  }}
                  onBlur={(e) => {
                    const row = e.currentTarget.closest('li.result-row')
                    if (row) row.classList.remove('result-row--skip-focused')
                  }}
                  aria-label={t('results.skip_to_next')}
                  className="skip-link"
                >
                  {t('results.skip_to_next')}
                  <ChevronDown size={14} aria-hidden="true" />
                </a>
              )}
              </div>

              {showRanking && <div className="result-rank-col">
                <IconButton
                  variant="tertiary"
                  label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
                  title={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
                  disabled={archived}
                  onClick={handleStar}
                  icon={<Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />}
                  className={`result-rank-btn result-rank-btn--star${starred ? ' result-rank-btn--active' : ''}`}
                />

                {!pinned && <>
                  <IconButton
                    variant="tertiary"
                    label={t('results.rank_up', { title: shortTitle })}
                    title={t('results.rank_up', { title: shortTitle })}
                    disabled={archived}
                    onClick={handleRankUp}
                    icon={<ThumbsUp size={14} aria-hidden="true" fill={animatingUp.has(finding.id) ? 'currentColor' : 'none'} />}
                    className="result-rank-btn result-rank-btn--up"
                  />

                  <span
                    className="result-rank-score"
                    aria-label={t('results.score_label', { score })}
                    title={t('results.score_label', { score })}
                  >
                    {score}
                  </span>

                  <IconButton
                    variant="tertiary"
                    label={t('results.rank_down', { title: shortTitle })}
                    title={t('results.rank_down', { title: shortTitle })}
                    disabled={archived}
                    onClick={handleRankDown}
                    icon={<ThumbsDown size={14} aria-hidden="true" fill={animatingDown.has(finding.id) ? 'currentColor' : 'none'} />}
                    className="result-rank-btn result-rank-btn--down"
                  />
                </>}

                <IconButton
                  variant="tertiary"
                  label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
                  title={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
                  onClick={handleArchive}
                  icon={archived
                    ? <ArchiveRestore size={13} aria-hidden="true" />
                    : <Archive size={13} aria-hidden="true" />
                  }
                  className={`result-rank-btn result-rank-btn--archive${archived ? ' result-rank-btn--active' : ''}`}
                />
              </div>}
            </li>
            {showAdAfter && <SponsoredTile />}
            </Fragment>
          )
        })}
      </ul>
      {results.length > 50 && (
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

export { default as ResultListSkeleton } from './ui/ResultListSkeleton.jsx'
export { default as DataError } from './ui/DataError.jsx'
