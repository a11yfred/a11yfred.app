import { useT } from '../hooks/useTranslate.js'

export default function ResultsActiveFilterBar({ activeFilters, sortBy, sortLabels, onSortChange, hasNonDefaultSort }) {
  const t = useT()

  const sortTag = hasNonDefaultSort && onSortChange
    ? { label: sortLabels[sortBy] ?? sortBy, prefix: t('results.filter_sort_prefix'), onRemove: () => onSortChange('smart') }
    : null

  if (!activeFilters.length && !sortTag) return null

  const renderTag = (f, i) => (
    <span key={i} className="active-bar__group">
      {f.prefix && <span className="active-bar__label">{f.prefix}</span>}
      {f.onRemove ? (
        <button
          type="button"
          className={`active-bar__tag active-bar__tag--removable`}
          aria-label={t('results.filter_remove_aria_label', { filter: f.label })}
          onClick={f.onRemove}
        >
          {f.label}
          <span className="active-bar__remove" aria-hidden="true">×</span>
        </button>
      ) : (
        <span className="active-bar__tag">
          {f.label}
        </span>
      )}
    </span>
  )

  return (
    <>
      {activeFilters.length > 0 && (
        <p className="active-bar results-active-filters">
          <span className="active-bar__label">{t('results.no_results_filters_active')}</span>
          {activeFilters.map(renderTag)}
        </p>
      )}
      {sortTag && (
        <p className="active-bar results-active-filters results-active-filters--sort">
          {renderTag(sortTag, 0)}
        </p>
      )}
    </>
  )
}
