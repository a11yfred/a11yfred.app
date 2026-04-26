import { useEffect } from 'react'
import { Star, ChevronUp, ChevronDown, Archive, ArchiveRestore } from 'lucide-react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'

const PRIORITY_VARS = {
  Critical:        { color: 'var(--priority-critical-text)', bg: 'var(--priority-critical-bg)', key: 'priority.critical'     },
  High:            { color: 'var(--priority-high-text)',     bg: 'var(--priority-high-bg)',     key: 'priority.high'          },
  Medium:          { color: 'var(--priority-medium-text)',   bg: 'var(--priority-medium-bg)',   key: 'priority.medium'        },
  Low:             { color: 'var(--priority-low-text)',      bg: 'var(--priority-low-bg)',      key: 'priority.low'           },
  'Best Practice': { color: 'var(--text-muted)',             bg: 'var(--bg-subtle)',            key: 'priority.best_practice' },
}

export default function ResultList({ results, selected, onSelect, query, ratings = {}, onUpvote, onDownvote, onStar, onArchive, showVoting = true }) {
  const t = useT()

  if (results.length === 0) {
    return <NoResults query={query} />
  }

  const DEFAULT_RATING = { score: 0, starred: false, archived: false }

  return (
    <div className="result-list-section">
      <div className="results-meta">
        <p className="results-count">{t('results.count', { count: results.length })}</p>
        <p className="results-vote-hint">{t('results.vote_hint')}</p>
      </div>

      <ul className="result-list" role="listbox" aria-label={t('results.aria_label')}>
        {results.map(defect => {
          const isSelected = selected?.id === defect.id
          const p = PRIORITY_VARS[defect.priority] || PRIORITY_VARS['Best Practice']
          const rating = ratings[defect.id] || DEFAULT_RATING
          const { score, starred, archived } = rating

          const truncDesc = defect.desc.length > 180
            ? defect.desc.slice(0, 180).trimEnd() + '…'
            : defect.desc

          const cardLabel = archived
            ? t('results.archived_label', { title: defect.title })
            : `${defect.title}, ${t(p.key)}, ${defect.scLabel}, ${truncDesc}`

          function handleUpvote(e) {
            e.stopPropagation()
            onUpvote?.(defect.id)
            announce(t('announce.upvoted', { title: defect.title, score: score + 1 }))
          }

          function handleDownvote(e) {
            e.stopPropagation()
            onDownvote?.(defect.id)
            announce(t('announce.downvoted', { title: defect.title, score: score - 1 }))
          }

          function handleStar(e) {
            e.stopPropagation()
            onStar?.(defect.id)
            announce(starred
              ? t('announce.unstarred', { title: defect.title })
              : t('announce.starred', { title: defect.title })
            )
          }

          function handleArchive(e) {
            e.stopPropagation()
            onArchive?.(defect.id)
            announce(archived
              ? t('announce.unarchived', { title: defect.title })
              : t('announce.archived', { title: defect.title })
            )
          }

          return (
            <li
              key={defect.id}
              role="presentation"
              className={`result-row${archived ? ' result-row--archived' : ''}`}
            >
              {/* Vote controls — outside role="option" so they have independent accessible names */}
              {showVoting && <div className="result-vote-col">
                <button
                  className={`result-vote-btn result-vote-btn--star${starred ? ' result-vote-btn--active' : ''}`}
                  aria-pressed={starred}
                  aria-label={starred ? t('results.unstar', { title: defect.title }) : t('results.star', { title: defect.title })}
                  disabled={archived}
                  onClick={handleStar}
                >
                  <Star size={13} aria-hidden="true" fill={starred ? 'currentColor' : 'none'} />
                </button>

                <button
                  className="result-vote-btn result-vote-btn--up"
                  aria-label={t('results.upvote', { title: defect.title })}
                  disabled={archived}
                  onClick={handleUpvote}
                >
                  <ChevronUp size={14} aria-hidden="true" />
                </button>

                <span
                  className="result-vote-score"
                  aria-label={t('results.score_label', { score })}
                >
                  {score}
                </span>

                <button
                  className="result-vote-btn result-vote-btn--down"
                  aria-label={t('results.downvote', { title: defect.title })}
                  disabled={archived}
                  onClick={handleDownvote}
                >
                  <ChevronDown size={14} aria-hidden="true" />
                </button>

                <button
                  className={`result-vote-btn result-vote-btn--archive${archived ? ' result-vote-btn--active' : ''}`}
                  aria-pressed={archived}
                  aria-label={archived ? t('results.unarchive', { title: defect.title }) : t('results.archive', { title: defect.title })}
                  onClick={handleArchive}
                >
                  {archived
                    ? <ArchiveRestore size={13} aria-hidden="true" />
                    : <Archive size={13} aria-hidden="true" />
                  }
                </button>
              </div>}

              {/* Selectable result card */}
              <div
                role="option"
                aria-selected={isSelected}
                aria-label={cardLabel}
                tabIndex={archived ? -1 : 0}
                onClick={() => { if (!archived) onSelect(defect) }}
                onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !archived) onSelect(defect) }}
                className={`result-item${isSelected ? ' result-item--selected' : ''}`}
              >
                <div className="result-item__header">
                  <span className="result-item__title">
                    {isSelected && <span aria-hidden="true" className="result-item__dot" />}
                    {defect.title}
                  </span>
                  <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
                    {t(p.key)}
                  </span>
                </div>

                <div className="result-item__sc">{defect.scLabel}</div>

                <div className="result-item__desc">{defect.desc}</div>
              </div>
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
