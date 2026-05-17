import { useT } from '@ulam/calamansi/react'

export default function ResultsActiveFilterBar({ activeFilters, sortBy, sortLabels, onSortChange, hasNonDefaultSort }) {
  const t = useT()

  const sortTag = hasNonDefaultSort && onSortChange
    ? { label: sortLabels[sortBy] ?? sortBy, prefix: t('results.filter_sort_prefix'), onRemove: () => onSortChange('smart') }
    : null

  if (!activeFilters.length && !sortTag) return null

  const renderTag = (f, i) => (
    <span key={i} className="active-bar__group">
      {f.prefix && <span className="active-bar__label">{f.prefix}</span>}
      <span
        className={`active-bar__tag${f.onRemove ? ' active-bar__tag--removable' : ''}`}
        onClick={f.onRemove ? (e => { if (e.detail > 0) f.onRemove() }) : undefined}
        onKeyDown={f.onRemove ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.onRemove() } }) : undefined}
        role={f.onRemove ? 'button' : undefined}
        tabIndex={f.onRemove ? 0 : undefined}
      >
        {f.label}
        {f.onRemove && (
          <button
            type="button"
            className="active-bar__remove"
            aria-label={t('results.filter_remove_aria', { filter: f.label })}
            onClick={e => { e.stopPropagation(); f.onRemove() }}
          >
            ×
          </button>
        )}
      </span>
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
