import { useRef, useState, useEffect } from 'react'
import { useRouter } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

// Each phrase has a display label and an optional accessible expansion.
// Clicking a phrase populates the search field with its `text` value.
const TYPEWRITER_PHRASES = [
  { text: 'modals' },
  { text: 'buttons' },
  { text: 'focus management' },
  { text: 'wcag 2.2' },
  { text: 'mobile devices' },
  { text: 'content' },
  { text: 'ext kb mobile', aria: 'external keyboard mobile' },
  { text: 'voiceover' },
]
const CYCLE_MS = 2500

export default function SearchBar({ query, onChange, onSearch, liveSearch, platform, aiEnabled, providerName, showVoting, hasPins }) {
  const { navigate } = useRouter()
  const t = useT()
  const inputRef = useRef(null)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion || query.length > 0) return
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [prefersReducedMotion, query.length])

  const handleKeyDown = (e) => {
    if (!liveSearch && e.key === 'Enter') onSearch()
  }

  const handlePhraseClick = (phrase) => {
    onChange(phrase.text)
    inputRef.current?.focus()
  }

  const platformLabel = platform === 'web' ? t('settings.platform_web') : t('settings.platform_native')
  const currentPhrase = TYPEWRITER_PHRASES[phraseIdx]

  return (
    <search aria-label={t('search.aria_label')} className="search-bar">
      <div className="search-label-row">
        <label htmlFor="finding-search" className="search-label">
          {t('search.label')}
        </label>
        {query.length === 0 && !prefersReducedMotion && (
          <span className="search-typewriter">
            {t('search.typewriter_try')}{' '}
            <button
              key={phraseIdx}
              type="button"
              className="search-typewriter__phrase"
              aria-label={currentPhrase.aria
                ? `${t('search.typewriter_try')} ${currentPhrase.aria}`
                : undefined}
              onClick={() => handlePhraseClick(currentPhrase)}
            >
              {currentPhrase.text}
            </button>
          </span>
        )}
      </div>
      <div className="search-row">
        <div className="search-input-wrap">
          <input
            ref={inputRef}
            id="finding-search"
            type="text"
            value={query}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            spellCheck={false}
            className={`search-input${query ? ' search-input--has-value' : ''}`}
          />
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
          {hasPins ? ` ${t('search.hint_pin')}` : ''}
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
