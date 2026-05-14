import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useT } from '@ulam/calamansi/react'

export default function NoResults({
  _query,
  ariaLabel = 'No results found',
  heading = 'No results found',
  body = 'Try adjusting your search terms.',
  onMount,
  activeFilters = [],
  onClearFilters,
  onOpenSettings,
}) {
  const t = useT()

  useEffect(() => {
    onMount?.()
  }, [onMount])

  return (
    <section aria-label={ariaLabel} className="no-results">
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
        <line x1="14" y1="19" x2="30" y2="19" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <line x1="14" y1="23" x2="27" y2="23" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="14" y1="27" x2="24" y2="27" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
      </svg>

      <p className="no-results__heading">
        {heading}
      </p>
      <p className="no-results__body">
        {body}
      </p>

      {activeFilters.length > 0 && (
        <>
          <p className="active-bar no-results__filters">
            <span className="active-bar__label">{t('results.no_results_filters_active')}</span>
            {activeFilters.map((f, i) => {
              const label = typeof f === 'string' ? f : f.label
              const onRemove = typeof f === 'object' ? f.onRemove : undefined
              return (
                <span // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- mouse-only convenience; keyboard path is the × button inside
                  key={i}
                  className={`active-bar__tag${onRemove ? ' active-bar__tag--removable' : ''}`}
                  onClick={onRemove ? (e => { if (e.detail > 0) onRemove() }) : undefined}
                >
                  {label}
                  {onRemove && (
                    <button
                      type="button"
                      className="active-bar__remove"
                      aria-label={t('results.filter_remove_aria', { filter: label })}
                      onClick={e => { e.stopPropagation(); onRemove() }}
                    >
                      ×
                    </button>
                  )}
                </span>
              )
            })}
          </p>

          {onOpenSettings && (
            <p className="no-results__settings-hint">
              {t('results.no_results_settings_hint')}{' '}
              <button className="no-results__settings-link" onClick={onOpenSettings}>
                {t('results.no_results_settings_link')}
              </button>.
            </p>
          )}
        </>
      )}

      {onClearFilters && (
        <button className="btn btn--primary no-results__clear-btn" onClick={onClearFilters}>
          <span className="btn-icon"><Trash2 size={14} aria-hidden="true" /></span>
          {t('results.clear_all_results')}
        </button>
      )}
    </section>
  )
}
