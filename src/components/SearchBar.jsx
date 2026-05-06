import { useRef, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'
import InputWithClear from './ui/InputWithClear.jsx'

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

export default function SearchBar({ query, onChange, onSearch, liveSearch, platform, aiEnabled, providerName, showVoting, hasPins, narrowMode = false, narrowQuery = '', onNarrowChange, onNarrowToggle, resultsCount = null }) {
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

  useEffect(() => {
    if (narrowMode) {
      inputRef.current?.focus()
    }
  }, [narrowMode])

  const handlePhraseClick = (phrase) => {
    onChange(phrase.text)
    inputRef.current?.focus()
  }

  const platformLabel = platform === 'web' ? t('settings.platform_web') : t('settings.platform_native')
  const currentPhrase = TYPEWRITER_PHRASES[phraseIdx]

  const inputLabel = t('search.label')
  const clearAriaLabel = t('search.clear_aria')
  const handleClear = () => {
    if (narrowMode) {
      onNarrowChange('')
    } else {
      onChange('')
    }
    inputRef.current?.focus()
  }
  const handleInput = (value) => {
    if (narrowMode) {
      onNarrowChange(value)
    } else {
      onChange(value)
    }
  }
  const handleKeyDownInner = (e) => {
    if (e.key === 'Enter') {
      if (narrowMode) return
      onSearch()
    }
  }

  return (
    <search aria-label={t('search.aria_label')} className="search-bar">
      <div className="search-label-row">
        <label htmlFor="finding-search" className="search-label">
          {inputLabel}
        </label>
        {query.length === 0 && !narrowMode && !prefersReducedMotion && (
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
        <InputWithClear
          id="finding-search"
          type="text"
          value={query}
          onChange={onChange}
          onKeyDown={handleKeyDownInner}
          onClear={() => onChange('')}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          spellCheck={false}
          clearAriaLabel={clearAriaLabel}
          wrapClassName="search-input-wrap"
          inputClassName={`search-input${query.length ? ' search-input--has-value' : ''}${narrowMode ? ' search-input--disabled' : ''}`}
          clearButtonClassName="btn--primary search-clear-btn"
          inputRef={inputRef}
          disabled={narrowMode}
        />
        {!liveSearch && !narrowMode && (
          <button
            onClick={onSearch}
            disabled={query.length < 2}
            className="btn--primary search-submit-btn"
          >
            {t('search.button')}
          </button>
        )}
      </div>
      {currentInputLength === 0 && !narrowMode && (
        <p className="search-hint">
          {liveSearch ? t('search.hint_live') : t('search.hint_submit')}
          {' '}
          {t('search.hint_platform', { platform: platformLabel })}
          {aiEnabled && providerName ? ` ${t('search.hint_ai', { provider: providerName })}` : ''}
          {showVoting ? ` ${t('search.hint_voting')}` : ''}
          {hasPins ? ` ${t('search.hint_pin')}` : ''}
          {' '}
          {t('search.hint_syntax')}
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
