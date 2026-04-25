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
    <search aria-label="Defect search" className="search-bar">
      <label htmlFor="defect-search" className="search-label">
        Describe the defect or observation
      </label>
      <div className="search-row">
        <div className="search-input-wrap">
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
            className={`search-input${query ? ' search-input--has-value' : ''}`}
          />
          {query && (
            <button
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="btn-accent search-clear-btn"
            >
              <X size={12} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </div>
        {!typeahead && (
          <button
            onClick={onSearch}
            disabled={query.length < 2}
            className="btn-accent search-submit-btn"
          >
            Search
          </button>
        )}
      </div>
      {query.length === 0 && (
        <p className="search-hint">
          {typeahead ? (
            <>
              Results appear as you type. This can be changed from{' '}
              <button
                onClick={() => navigate('/settings')}
                className="search-hint-link"
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
