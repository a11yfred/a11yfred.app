import { useEffect } from 'react'
import { announce } from '../plugins/announce/index.js'

const PRIORITY_VARS = {
  Critical:        { color: 'var(--priority-critical-text)', bg: 'var(--priority-critical-bg)' },
  High:            { color: 'var(--priority-high-text)',     bg: 'var(--priority-high-bg)'     },
  Medium:          { color: 'var(--priority-medium-text)',   bg: 'var(--priority-medium-bg)'   },
  Low:             { color: 'var(--priority-low-text)',      bg: 'var(--priority-low-bg)'      },
  'Best Practice': { color: 'var(--text-muted)',             bg: 'var(--bg-subtle)'            },
}

export default function ResultList({ results, selected, onSelect, query }) {
  if (results.length === 0) {
    return <NoResults query={query} />
  }

  return (
    <ul style={{ listStyle: 'none', marginBottom: 'var(--space-6)' }} role="listbox" aria-label="Defect candidates">
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
            style={{
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 4,
              borderRadius: 'var(--radius)',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              background: isSelected ? 'var(--accent-bg)' : 'var(--bg)',
              cursor: 'pointer',
              transition: 'border-color 0.1s',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--text-faint)' }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {/* Title + priority badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <span style={{
                fontSize: 'var(--fs-sub)',
                fontWeight: 500,
                color: isSelected ? 'var(--accent-text)' : 'var(--text)',
              }}>
                {defect.title}
              </span>
              <span style={{
                fontSize: 'var(--fs-body)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                background: p.bg,
                color: p.color,
                flexShrink: 0,
              }}>
                {defect.priority}
              </span>
            </div>

            {/* SC label */}
            <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              {defect.scLabel}
            </div>

            {/* Description preview */}
            <div style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--text-faint)',
              marginTop: 'var(--space-1)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}>
              {defect.desc}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function NoResults({ query }) {
  useEffect(() => {
    announce(`No results for "${query}". Try a component name, element type, or a different phrase.`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional: announce only on first appearance, not every keystroke

  return (
    <section
      aria-label="No results"
      style={{
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}
      >
        <circle cx="22" cy="22" r="14" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="33" y1="33" x2="47" y2="47" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="19" x2="30" y2="19" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <line x1="14" y1="23" x2="27" y2="23" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="14" y1="27" x2="24" y2="27" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
      </svg>

      <p style={{
        fontSize: 'var(--fs-sub)',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: 'var(--space-2)',
      }}>
        No results for &ldquo;{query}&rdquo;
      </p>
      <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
        Try a component name, element type, or a different phrase.
      </p>
    </section>
  )
}
