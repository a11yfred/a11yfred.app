import { useEffect, useRef } from 'react'
import { Star, ChevronUp, ChevronDown, Archive, ArchiveRestore, RotateCcw } from 'lucide-react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { PRIORITY_VARS } from '../data/priorityStyles.js'

export default function ResultList({ results, selected, onSelect, query, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true }) {
  const t = useT()
  const countRef = useRef(null)

  useEffect(() => {
    countRef.current?.focus()
  }, [])

  if (results.length === 0) {
    return <NoResults query={query} />
  }

  const DEFAULT_RATING = { score: 0, starred: false, archived: false }

  return (
    <div className="result-list-section">
      <div className="results-meta">
        <h2
          ref={countRef}
          tabIndex={-1}
          className="results-count"
        >
          {t('results.count', { count: results.length })}
        </h2>
        {showVoting && <p className="results-vote-hint">{t('results.vote_hint')}</p>}
      </div>

      <ul className="result-list" aria-label={t('results.aria_label')}>
        {results.map(finding => {
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
          const shortTitle = finding.title.length > 24
            ? finding.title.slice(0, 24).trimEnd() + '…'
            : finding.title

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
            onArchive?.(finding.id)
            announce(archived
              ? t('announce.unarchived', { title: finding.title })
              : t('announce.archived', { title: finding.title })
            )
          }

          return (
            <li
              key={finding.id}
              className={`result-row${archived ? ' result-row--archived' : ''}`}
            >
              {showVoting && <div className="result-vote-col">
                <button
                  className={`result-vote-btn result-vote-btn--star${starred ? ' result-vote-btn--active' : ''}`}
                  aria-pressed={starred}
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
                  aria-pressed={archived}
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

              {/* Selectable result card — button so each item has its own interactive context;
                  aria-pressed communicates selection state */}
              <button
                aria-pressed={isSelected}
                aria-label={cardLabel}
                tabIndex={archived ? -1 : undefined}
                onClick={() => { if (!archived) onSelect(finding) }}
                className={`result-item${isSelected ? ' result-item--selected' : ''}`}
              >
                <div className="result-item__header">
                  <span className="result-item__title">
                    {isSelected && <span aria-hidden="true" className="result-item__dot" />}
                    {finding.title}
                  </span>
                  <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
                    {t(p.key)}
                  </span>
                </div>

                <div className="result-item__sc">{finding.scLabel}</div>

                <div className="result-item__desc">{finding.desc}</div>
              </button>
            </li>
          )
        })}
      </ul>
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
          <span className="skeleton-line" style={{ display: 'inline-block', height: '1em', width: '7rem', verticalAlign: 'middle' }} />
        </p>
      </div>
      <ul className="result-list">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="result-row" role="presentation">
            <div className="skeleton-card">
              <div className="skeleton-card__header">
                <span className="skeleton-line" style={{ display: 'block', height: '1em', width: '55%' }} />
                <span className="skeleton-line" style={{ display: 'block', height: '1em', width: '3.5rem', borderRadius: '999px', flexShrink: 0 }} />
              </div>
              <span className="skeleton-line" style={{ display: 'block', height: '0.85em', width: '38%' }} />
              <span className="skeleton-line" style={{ display: 'block', height: '0.8em', width: '92%' }} />
              <span className="skeleton-line" style={{ display: 'block', height: '0.8em', width: '70%' }} />
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
          <button type="button" className="btn-tertiary error-retry-inline" onClick={onRetry}>
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
