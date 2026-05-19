const SKELETON_CARDS = 8

export default function A11yResultSkeleton({ count = SKELETON_CARDS }) {
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
