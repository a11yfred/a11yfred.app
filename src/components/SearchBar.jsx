import { useRef } from 'react'
import { X } from 'lucide-react'
import { useRouter } from '../plugins/router/index.js'

export default function SearchBar({ query, onChange, onSearch, typeahead }) {
  const { navigate } = useRouter()
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (!typeahead && e.key === 'Enter') onSearch()
  }

  return (
    <search aria-label="Defect search" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor="defect-search"
        style={{
          display: 'block',
          fontSize: 'var(--fs-body)',
          fontWeight: 500,
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Describe the defect or observation
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            id="defect-search"
            type="text"
            value={query}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. modal close button no label"
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: '3rem',
              padding: query ? 'var(--space-3) 2.5rem var(--space-3) var(--space-4)' : 'var(--space-3) var(--space-4)',
              fontSize: 'var(--fs-sub)',
              lineHeight: 1.5,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-control)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
              marginBottom: 0,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--focus)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-control)'}
          />
          {query && (
            <button
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="btn-accent"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                fontSize: 'var(--fs-body)',
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </div>
        {!typeahead && (
          <button
            onClick={onSearch}
            disabled={query.length < 2}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--fs-sub)',
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
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-faint)', marginTop: 'var(--space-2)' }}>
          {typeahead ? (
            <>
              Results appear as you type. This can be changed from{' '}
              <button
                onClick={() => navigate('/settings')}
                style={{
                  fontSize: 'inherit',
                  color: 'var(--accent-text)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-text)'}
              >
                Settings
              </button>.
            </>
          ) : (
            'Type a description and press Search or Enter.'
          )}
        </p>
      )}
    </search>
  )
}
