export default function SearchBar({ query, onChange, onSearch, typeahead }) {
  const handleKeyDown = (e) => {
    if (!typeahead && e.key === 'Enter') onSearch()
  }

  return (
    <search aria-label="Defect search" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor="defect-search"
        style={{
          display: 'block',
          fontSize: 'var(--fs-small)',
          fontWeight: 500,
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Describe the defect
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id="defect-search"
          type="text"
          value={query}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. modal close button no label"
          autoFocus // eslint-disable-line jsx-a11y/no-autofocus -- intentional: search is always the first action
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: '3rem',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--fs-body)',
            lineHeight: 1.5,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--focus)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {!typeahead && (
          <button
            onClick={onSearch}
            disabled={query.length < 2}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--fs-body)',
              fontWeight: 500,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--accent)',
              background: 'var(--accent-bg)',
              color: 'var(--accent-text)',
              opacity: query.length < 2 ? 0.5 : 1,
              cursor: query.length < 2 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-end',
              minHeight: '3rem',
            }}
          >
            Search
          </button>
        )}
      </div>
      {query.length === 0 && (
        <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-faint)', marginTop: 'var(--space-2)' }}>
          {typeahead
            ? 'Results appear as you type.'
            : 'Type a description and press Search or Enter.'}
        </p>
      )}
    </search>
  )
}
