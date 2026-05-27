

const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Best Practice']

export default function AdminDatasetSelector({ dataset, setDataset, stats, onFilter }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Corpus</h2>
      <div className="admin-dataset-tabs">
        {[
          { key: 'public',   label: 'Public',   count: dataset === 'public' ? stats.total : '?' },
          { key: 'legacy',   label: 'Legacy',   count: dataset === 'legacy' ? stats.total : '?' },
          { key: 'personal', label: 'Personal', count: dataset === 'personal' ? stats.total : '?' },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            className={dataset === key ? 'btn--primary' : 'btn--secondary'}
            onClick={() => setDataset(key)}
          >
            {label} <span className="admin-tab-count">({count})</span>
          </button>
        ))}
      </div>

      <p className="admin-total">
        {stats.total} total entries
      </p>

      <div className="admin-stats-row">
        <div className="admin-stat-group">
          <h3 className="admin-stat-group__title">WCAG Version</h3>
          <ul className="admin-stat-list">
            {['2.0', '2.1', '2.2', 'N/A'].map(v => (
              <li key={v}>
                <button className="admin-stat-link" onClick={() => { onFilter({ type: 'wcag', value: v }) }}>
                  WCAG {v}
                </button>
                <span className="admin-count-badge">{stats.byVersion[v] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-stat-group">
          <h3 className="admin-stat-group__title">Priority</h3>
          <ul className="admin-stat-list">
            {PRIORITY_ORDER.map(p => (
              <li key={p}>
                <button className="admin-stat-link" onClick={() => { onFilter({ type: 'priority', value: p }) }}>
                  {p}
                </button>
                <span className="admin-count-badge">{stats.bySeverity[p] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>

        {Object.keys(stats.bySource).length > 0 && (
          <div className="admin-stat-group">
            <h3 className="admin-stat-group__title">Source</h3>
            <ul className="admin-stat-list">
              {Object.entries(stats.bySource)
                .sort(([, a], [, b]) => b - a)
                .map(([src, count]) => (
                  <li key={src}>
                    <button className="admin-stat-link" onClick={() => { onFilter({ type: 'source', value: src }) }}>
                      {src}
                    </button>
                    <span className="admin-count-badge">{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
