import { useRef } from 'react'
import { Pencil } from 'lucide-react'
import { useRouter } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

export default function SearchBar({ query, onChange, onSearch, liveSearch, platform, aiEnabled, providerName, showVoting }) {
  const { navigate } = useRouter()
  const t = useT()
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (!liveSearch && e.key === 'Enter') onSearch()
  }

  const platformLabel = platform === 'web' ? t('settings.platform_web') : t('settings.platform_native')

  return (
    <search aria-label={t('search.aria_label')} className="search-bar">
      <label htmlFor="defect-search" className="search-label">
        {t('search.label')}
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
            placeholder={t('search.placeholder')}
            autoComplete="off"
            spellCheck={false}
            className={`search-input${query ? ' search-input--has-value' : ''}`}
          />
          {!query && (
            <Pencil size={18} strokeWidth={1.5} aria-hidden="true" className="search-decor-icon" />
          )}
          {query && (
            <button
              onClick={() => { onChange(''); inputRef.current?.focus() }}
              aria-label={t('search.clear_aria')}
              className="btn-accent search-clear-btn"
            >
              ↺
            </button>
          )}
        </div>
        {!liveSearch && (
          <button
            onClick={onSearch}
            disabled={query.length < 2}
            className="btn-accent search-submit-btn"
          >
            {t('search.button')}
          </button>
        )}
      </div>
      {query.length === 0 && (
        <p className="search-hint">
          {liveSearch ? t('search.hint_live') : t('search.hint_submit')}
          {' '}
          {t('search.hint_platform', { platform: platformLabel })}
          {aiEnabled && providerName ? ` ${t('search.hint_ai', { provider: providerName })}` : ''}
          {showVoting ? ` ${t('search.hint_voting')}` : ''}
          {' '}
          {t('search.hint_change_in')}{' '}
          <button onClick={() => navigate('/settings')} className="search-hint-link">
            {t('search.hint_settings_link')}
          </button>.
        </p>
      )}
    </search>
  )
}
