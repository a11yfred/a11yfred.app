import { useEffect } from 'react'
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
          <p className="no-results__filters">
            <span className="no-results__filters-label">{t('results.no_results_filters_active')}</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="no-results__filter-tag">{f}</span>
            ))}
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
          {t('results.no_results_clear_filters')}
        </button>
      )}
    </section>
  )
}
