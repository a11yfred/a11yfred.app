import { Star, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, Link, Check, Pin, PinOff, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { PRIORITY_VARS } from '../data/priorityStyles.js'
import StateButton from './ui/StateButton.jsx'
import Badge from './ui/Badge.jsx'
import InputWithClear from './ui/InputWithClear.jsx'
import NoResults from './ui/NoResults.jsx'
import SponsoredTile from './SponsoredTile.jsx'
import findingSlug from '../utils/findingSlug.js'
import { DEFAULT_RATING, CLIPBOARD_TIMEOUT, DESC_PREVIEW_LENGTH, TITLE_TRUNCATE_LENGTH } from '../utils/constants.js'

export function PinnedSection({ findings, selected, onSelect, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true, pinnedIds = new Set(), onPin, onClearPins }) {
  const t = useT()
  if (!findings.length) return null
  return (
    <div className="pinned-section">
      <div className={`pinned-section__header${showVoting ? ' pinned-section__header--with-sort' : ''}`}>
        <h2 className="pinned-section__heading">
          {t('results.pinned_heading')}
          <span className="pinned-section__count">{findings.length}</span>
        </h2>
        {onClearPins && (
          <button type="button" className="btn--tertiary pinned-unpin-all-btn" onClick={onClearPins}>
            {t('results.unpin_all')}
          </button>
        )}
      </div>
      <ResultList
        results={findings}
        selected={selected}
        onSelect={onSelect}
        query=""
        ratings={ratings}
        onUpvote={onUpvote}
        onDownvote={onDownvote}
        onStar={onStar}
        onArchive={onArchive}
        showVoting={showVoting}
        pinnedIds={pinnedIds}
        onPin={onPin}
        hideCount
        showPrioritySort={showVoting}
      />
    </div>
  )
}

export default function ResultList({ results, selected, _onSelect, query, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true, countRef, onCopyLink, pinnedIds = new Set(), onPin, hideCount = false, filterLabel, narrowMode = false, narrowQuery = '', narrowResults = null, onNarrow, onNarrowExit, onNarrowChange, liveSearch = true, onNarrowSearch, showPrioritySort = false, showAds = false, adFrequency = 8, onClear }) {
  const t = useT()
  const itemRefs = useRef({})
  const skipBtnRefs = useRef({})
  const focusNextRef = useRef(null)
  const countHeadingRef = useRef(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const listRef = useRef(null)

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
          onUpvote?.(currentFinding.id)
          const newRating = ratings[currentFinding.id] || DEFAULT_RATING
          announce(t('announce.upvoted', { title: currentFinding.title, score: newRating.score + 1 }))
        } else if (e.shiftKey && (e.key === 'ArrowDown' || e.key === '↓')) {
          e.preventDefault()
          onDownvote?.(currentFinding.id)
          const newRating = ratings[currentFinding.id] || DEFAULT_RATING
          announce(t('announce.downvoted', { title: currentFinding.title, score: newRating.score - 1 }))
        }
    }
  }, [displayResults, ratings, onStar, onArchive, onUpvote, onDownvote, t])

  useEffect(() => {
    const listEl = listRef.current
    listEl?.addEventListener('keydown', handleKeyDown)
    return () => listEl?.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (results.length === 0) {
    return <NoResults query={query} />
  }

  if (narrowMode && narrowResults && narrowResults.length === 0) {
    return <NoResults query={narrowQuery} />
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
            <StateButton
              active={linkCopied}
              icon={<Link size={14} aria-hidden="true" />}
              activeIcon={<Check size={14} aria-hidden="true" />}
              label={t('results.copy_link_aria')}
              activeLabel={t('results.copied_link')}
              className="btn--secondary results-copy-link-btn"
              showLabel
              labelText={t('results.copy_link')}
              activeLabelText={t('results.copied_link')}
              title={linkCopied ? t('results.copied_link') : t('results.copy_link')}
              onClick={() => {
                onCopyLink()
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), CLIPBOARD_TIMEOUT)
              }}
            />
          )}
        </div>
        {showVoting && <p className="results-vote-hint">{t('results.vote_hint')}</p>}
        <div className="results-actions-row">
          {results.length > 0 && onNarrow && (
            <button
              type="button"
              className="btn--secondary results-narrow-btn"
              title={narrowMode ? t('search.exit_narrow_aria') : t('results.narrow_title')}
              onClick={narrowMode ? onNarrowExit : onNarrow}
            >
              {narrowMode ? (
                <>
                  <X size={16} aria-hidden="true" />
                  <span>{narrowResults ? `${narrowResults.length} Narrow Results` : 'Narrow Results'}</span>
                </>
              ) : (
                <>
                  <Filter size={16} aria-hidden="true" />
                  <span>{t('results.narrow_results')}</span>
                </>
              )}
            </button>
          )}
          {results.length > 0 && onClear && (
            <button
              type="button"
              className="btn--tertiary results-clear-btn"
              aria-label={t('results.clear_results')}
              title={t('results.clear_results')}
              onClick={onClear}
            >
              {t('results.clear_results')}
            </button>
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
                clearButtonClassName="results-narrow-clear-btn"
              />
              {!liveSearch && (
                <button
                  onClick={onNarrowSearch}
                  disabled={narrowQuery.length < 2}
                  className="btn--primary results-narrow-submit-btn"
                >
                  {t('search.button')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>}

      <ul ref={listRef} className={`result-list${selected ? ' result-list--has-selection' : ''}`} aria-label={t('results.aria_label')}>
        {displayResults.map((finding, index) => {
          const showAdAfter = showAds && adFrequency > 0 && (index + 1) % adFrequency === 0
          const isSelected = selected?.id === finding.id
          const p = PRIORITY_VARS[finding.priority] || PRIORITY_VARS['Best Practice']
          const rating = ratings[finding.id] || DEFAULT_RATING
          const { score, starred, archived } = rating

          const truncDesc = finding.desc.length > DESC_PREVIEW_LENGTH
            ? finding.desc.slice(0, DESC_PREVIEW_LENGTH).trimEnd() + '…'
            : finding.desc

          const cardLabel = archived
            ? t('results.archived_label', { title: finding.title })
            : `${finding.title}, ${t(p.key)}, ${finding.scLabel}, ${truncDesc}`

          // Truncate title used in vote-button labels only — full title used in announce() calls
          const shortTitle = (() => {
            if (finding.title.length <= TITLE_TRUNCATE_LENGTH) return finding.title
            const cut = finding.title.slice(0, TITLE_TRUNCATE_LENGTH)
            const lastSpace = cut.lastIndexOf(' ')
            return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
          })()

          function handleUpvote(e) {
            e.stopPropagation()
            // Force animation restart by removing and re-adding the class
            e.currentTarget.classList.remove('animating')
            void e.currentTarget.offsetWidth // Trigger reflow
            e.currentTarget.classList.add('animating')
            setTimeout(() => e.currentTarget.classList.remove('animating'), 400)
            onUpvote?.(finding.id)
            announce(t('announce.upvoted', { title: finding.title, score: score + 1 }))
          }

          function handleDownvote(e) {
            e.stopPropagation()
            // Force animation restart by removing and re-adding the class
            e.currentTarget.classList.remove('animating')
            void e.currentTarget.offsetWidth // Trigger reflow
            e.currentTarget.classList.add('animating')
            setTimeout(() => e.currentTarget.classList.remove('animating'), 400)
            onDownvote?.(finding.id)
            announce(t('announce.downvoted', { title: finding.title, score: score - 1 }))
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
                  <button
                    type="button"
                    className={`result-pin-btn${pinned ? ' result-pin-btn--active' : ''}`}
                    aria-label={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    title={pinned ? t('results.unpin', { title: shortTitle }) : t('results.pin', { title: shortTitle })}
                    disabled={archived}
                    onClick={handlePin}
                  >
                    {pinned
                      ? <PinOff size={12} aria-hidden="true" fill="currentColor" />
                      : <Pin size={12} aria-hidden="true" fill="none" />
                    }
                  </button>
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
                      variant="priority"
                      bg={archived ? undefined : p.bg}
                      color={archived ? undefined : p.color}
                      prefix={finding.priority !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
                    >
                      {t(p.key)}
                    </Badge>
                    {finding.sourceCredits?.filter(src => src !== 'ATH').map(src => (
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

                <div className="result-item__sc">{finding.scLabel}</div>

                <div className="result-item__desc">{finding.desc}</div>
              </a>

              {showPrioritySort && (
                <button
                  ref={el => { skipBtnRefs.current[finding.id] = el }}
                  type="button"
                  tabIndex={archived ? -1 : undefined}
                  onClick={handleSkipToNext}
                  aria-label={t('results.skip_to_next')}
                  className="result-skip-btn"
                >
                  {t('results.skip_to_next')}
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              )}
              </div>

              {showVoting && <div className="result-vote-col">
                <button
                  className={`result-vote-btn result-vote-btn--star${starred ? ' result-vote-btn--active' : ''}`}
                  aria-label={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
                  title={starred ? t('results.unstar', { title: shortTitle }) : t('results.star', { title: shortTitle })}
                  disabled={archived}
                  onClick={handleStar}
                >
                  <Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />
                </button>

                <button
                  className="result-vote-btn result-vote-btn--up"
                  aria-label={t('results.upvote', { title: shortTitle })}
                  title={t('results.upvote', { title: shortTitle })}
                  disabled={archived}
                  onClick={handleUpvote}
                >
                  <ThumbsUp size={14} aria-hidden="true" />
                </button>

                <span
                  className="result-vote-score"
                  aria-label={t('results.score_label', { score })}
                  title={t('results.score_label', { score })}
                >
                  {score}
                </span>

                <button
                  className="result-vote-btn result-vote-btn--down"
                  aria-label={t('results.downvote', { title: shortTitle })}
                  title={t('results.downvote', { title: shortTitle })}
                  disabled={archived}
                  onClick={handleDownvote}
                >
                  <ThumbsDown size={14} aria-hidden="true" />
                </button>

                <button
                  className={`result-vote-btn result-vote-btn--archive${archived ? ' result-vote-btn--active' : ''}`}
                  aria-label={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
                  title={archived ? t('results.unarchive', { title: shortTitle }) : t('results.archive', { title: shortTitle })}
                  onClick={handleArchive}
                >
                  {archived
                    ? <ArchiveRestore size={13} aria-hidden="true" />
                    : <Archive size={13} aria-hidden="true" />
                  }
                </button>
              </div>}
            </li>
            {showAdAfter && <SponsoredTile />}
            </Fragment>
          )
        })}
      </ul>
      {results.length > 50 && (
        <div className="view-all-section">
          <button
            type="button"
            className="btn--secondary back-to-top-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              countHeadingRef.current?.focus()
            }}
          >
            <ChevronUp size={16} aria-hidden="true" />
            {t('results.back_to_top')}
          </button>
        </div>
      )}
    </div>
  )
}

export { default as ResultListSkeleton } from './ui/ResultListSkeleton.jsx'
export { default as DataError } from './ui/DataError.jsx'
