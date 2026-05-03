import { Star, ChevronUp, ChevronDown, Archive, ArchiveRestore, RotateCcw, Link, Check, Pin, PinOff, Filter, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { PRIORITY_VARS } from '../data/priorityStyles.js'
import SponsoredTile from './SponsoredTile.jsx'

export function PinnedSection({ findings, selected, onSelect, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true, pinnedIds = new Set(), onPin, onClearPins }) {
  const t = useT()
  if (!findings.length) return null
  return (
    <div className="pinned-section">
      <div className="pinned-section__header">
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
      />
    </div>
  )
}

export default function ResultList({ results, selected, onSelect, query, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true, countRef, onCopyLink, pinnedIds = new Set(), onPin, hideCount = false, filterLabel, narrowMode = false, narrowQuery = '', narrowResults = null, onNarrow, showPrioritySort = false, showAds = false, adFrequency = 8, onClear }) {
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

    const DEFAULT_RATING = { score: 0, starred: false, archived: false }
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

  const DEFAULT_RATING = { score: 0, starred: false, archived: false }

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
          <div className="results-count-actions">
            {query && results.length > 0 && onClear && (
              <button
                type="button"
                className="btn--secondary results-clear-btn"
                title={t('results.clear_results')}
                onClick={onClear}
              >
                <X size={16} aria-hidden="true" />
                <span>{t('results.clear_results')}</span>
              </button>
            )}
            {!narrowMode && results.length > 0 && onNarrow && (
              <button
                type="button"
                className="btn--secondary results-narrow-btn"
                title={t('results.narrow_title')}
                onClick={onNarrow}
              >
                <Filter size={16} aria-hidden="true" />
                <span>{t('results.narrow_results')}</span>
              </button>
            )}
            {onCopyLink && (
              <button
                type="button"
                className={`btn--secondary results-copy-link-btn${linkCopied ? ' btn__field--success' : ''}`}
                aria-label={linkCopied ? t('results.copied_link') : t('results.copy_link_aria')}
                title={linkCopied ? t('results.copied_link') : t('results.copy_link')}
                onClick={() => {
                  onCopyLink()
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                }}
              >
                {linkCopied ? <Check size={14} aria-hidden="true" /> : <Link size={14} aria-hidden="true" />}
                {linkCopied ? t('results.copied_link') : t('results.copy_link')}
              </button>
            )}
          </div>
        </div>
        {showVoting && <p className="results-vote-hint">{t('results.vote_hint')}</p>}
      </div>}

      <ul ref={listRef} className={`result-list${selected ? ' result-list--has-selection' : ''}`} aria-label={t('results.aria_label')}>
        {displayResults.map((finding, index) => {
          const showAdAfter = showAds && adFrequency > 0 && (index + 1) % adFrequency === 0
          const isSelected = selected?.id === finding.id
          const p = PRIORITY_VARS[finding.priority] || PRIORITY_VARS['Best Practice']
          const rating = ratings[finding.id] || DEFAULT_RATING
          const { score, starred, archived } = rating

          const truncDesc = finding.desc.length > 180
            ? finding.desc.slice(0, 180).trimEnd() + '…'
            : finding.desc

          const cardLabel = archived
            ? t('results.archived_label', { title: finding.title })
            : `${finding.title}, ${t(p.key)}, ${finding.scLabel}, ${truncDesc}`

          // Truncate title used in vote-button labels only — full title used in announce() calls
          const shortTitle = (() => {
            if (finding.title.length <= 36) return finding.title
            const cut = finding.title.slice(0, 36)
            const lastSpace = cut.lastIndexOf(' ')
            return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
          })()

          function handleUpvote(e) {
            e.stopPropagation()
            onUpvote?.(finding.id)
            announce(t('announce.upvoted', { title: finding.title, score: score + 1 }))
          }

          function handleDownvote(e) {
            e.stopPropagation()
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
                <button
                  ref={el => { itemRefs.current[finding.id] = el }}
                  aria-label={cardLabel}
                  aria-disabled={archived ? 'true' : undefined}
                  tabIndex={archived ? -1 : undefined}
                  onClick={() => { if (!archived) onSelect(finding) }}
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
                    <span className="priority-badge" style={archived ? undefined : { background: p.bg, color: p.color }}>
                      {finding.priority !== 'Best Practice' && <span className="badge-prefix">{t('badge.severity_prefix')}</span>}
                      {t(p.key)}
                    </span>
                    {finding.sources?.filter(src => src.name !== 'ATH').map(src => src.url ? (
                      <a
                        key={src.name}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="source-badge"
                        aria-label={`${t('badge.source_prefix')}${src.name}`}
                      >
                        <span className="badge-prefix">{t('badge.source_prefix')}</span>
                        {src.name}
                      </a>
                    ) : (
                      <span key={src.name} className="source-badge">
                        <span className="badge-prefix">{t('badge.source_prefix')}</span>
                        {src.name}
                      </span>
                    ))}
                    {finding.wcagVersion && finding.wcagLevel && (
                      <span className="wcag-badge">
                        <span className="badge-prefix">{t('badge.wcag_prefix')}</span>
                        {finding.wcagVersion},{' '}
                        <span className="badge-prefix">{t('badge.level_prefix')}</span>
                        {finding.wcagLevel}
                      </span>
                    )}
                  </span>
                </div>

                <div className="result-item__sc">{finding.scLabel}</div>

                <div className="result-item__desc">{finding.desc}</div>
              </button>

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
                  <ChevronUp size={14} aria-hidden="true" />
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
                  <ChevronDown size={14} aria-hidden="true" />
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

function NoResults({ query }) {
  const t = useT()

  useEffect(() => {
    announce(t('results.no_results_announce', { query }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional: announce only on first appearance

  return (
    <section aria-label={t('results.no_results_aria')} className="no-results">
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="no-results__icon"
      >
        <circle cx="22" cy="22" r="14" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="33" y1="33" x2="47" y2="47" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="19" x2="30" y2="19" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <line x1="14" y1="23" x2="27" y2="23" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="14" y1="27" x2="24" y2="27" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
      </svg>

      <p className="no-results__heading">
        {t('results.no_results_heading', { query })}
      </p>
      <p className="no-results__body">
        {t('results.no_results_body')}
      </p>
    </section>
  )
}

const SKELETON_CARDS = 8

export function ResultListSkeleton({ count = SKELETON_CARDS }) {
  return (
    <div className="result-list-section" aria-busy="true" aria-live="polite">
      <div className="results-meta">
        <p className="results-count">
          <span className="skeleton-line skeleton-line--count" style={{ height: '1em' }} />
        </p>
      </div>
      <ul className="result-list">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="result-row" role="presentation">
            <div className="skeleton-card">
              <div className="skeleton-card__header">
                <span className="skeleton-line skeleton-line--title" style={{ height: '1em' }} />
                <span className="skeleton-line skeleton-line--sm" style={{ height: '1em' }} />
              </div>
              <span className="skeleton-line skeleton-line--md" style={{ height: '0.85em' }} />
              <span className="skeleton-line skeleton-line--lg" style={{ height: '0.8em' }} />
              <span className="skeleton-line" style={{ height: '0.8em', width: '70%' }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DataError({ onRetry }) {
  const t = useT()
  const headingRef = useRef(null)

  useEffect(() => {
    announce(t('error.announce'), { priority: 'assertive' })
    headingRef.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- announce only on first appearance

  return (
    <section className="no-results">
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="no-results__icon"
      >
        <circle cx="28" cy="28" r="22" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="28" y1="16" x2="28" y2="32" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="28" cy="39" r="1.5" fill="var(--text-faint)"/>
      </svg>
      <p className="no-results__heading" ref={headingRef} tabIndex={-1}>{t('error.heading')}</p>
      <p className="no-results__body">
        {t('error.body')}{' '}
        {onRetry && (
          <button type="button" className="btn--tertiary error-retry-inline" onClick={onRetry}>
            <RotateCcw size={12} aria-hidden="true" />
            {t('error.retry')}
          </button>
        )}
        {!onRetry && t('error.retry')}
        .
      </p>
    </section>
  )
}
