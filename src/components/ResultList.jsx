import { useEffect } from 'react'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'

const PRIORITY_VARS = {
  Critical:        { color: 'var(--priority-critical-text)', bg: 'var(--priority-critical-bg)' },
  High:            { color: 'var(--priority-high-text)',     bg: 'var(--priority-high-bg)'     },
  Medium:          { color: 'var(--priority-medium-text)',   bg: 'var(--priority-medium-bg)'   },
  Low:             { color: 'var(--priority-low-text)',      bg: 'var(--priority-low-bg)'      },
  'Best Practice': { color: 'var(--text-muted)',             bg: 'var(--bg-subtle)'            },
}

export default function ResultList({ results, selected, onSelect, query }) {
  const t = useT()

  if (results.length === 0) {
    return <NoResults query={query} />
  }

  return (
    <ul className="result-list" role="listbox" aria-label={t('results.aria_label')}>
      {results.map(defect => {
        const isSelected = selected?.id === defect.id
        const p = PRIORITY_VARS[defect.priority] || PRIORITY_VARS['Best Practice']

        return (
          <li
            key={defect.id}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => onSelect(defect)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(defect)}
            className={`result-item${isSelected ? ' result-item--selected' : ''}`}
          >
            <div className="result-item__header">
              <span className="result-item__title">
                {isSelected && <span aria-hidden="true" className="result-item__dot" />}
                {defect.title}
              </span>
              <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
                {defect.priority}
              </span>
            </div>

            <div className="result-item__sc">{defect.scLabel}</div>

            <div className="result-item__desc">{defect.desc}</div>
          </li>
        )
      })}
    </ul>
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
