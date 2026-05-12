import { useRef, useState, useEffect } from 'react'
import { useT } from '../calamansi/react.js'
import InputWithClear from './ui/InputWithClear.jsx'
import Button from './ui/Button.jsx'
import { CYCLE_MS } from '../utils/constants.js'
import './SearchBar.css'

// Each phrase has a display label and an optional accessible expansion.
// Clicking a phrase populates the search field with its `text` value.
const TYPEWRITER_PHRASES = [
  { text: 'keyboard' },
  { text: 'screen reader' },
  { text: 'contrast' },
  { text: 'label' },
  { text: 'modal' },
  { text: 'heading' },
  { text: 'touch target' },
  { text: 'focus' },
  { text: 'alt text' },
  { text: 'error' },
]

export default function SearchBar({ query, onChange, onSearch, liveSearch, platform, aiEnabled, providerName, showRanking, hasPins, narrowMode = false, inputRef: externalRef }) {
  const t = useT()
  const internalRef = useRef(null)
  const inputRef = externalRef || internalRef
  const [phraseIdx, setPhraseIdx] = useState(0)
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion || query.length > 0) return
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [prefersReducedMotion, query.length])

  const handlePhraseClick = (phrase) => {
    onChange(phrase.text)
    inputRef.current?.focus()
  }

  const platformLabel = { web: t('settings.platform_web'), native: t('settings.platform_native'), document: t('settings.platform_document') }[platform] ?? t('settings.platform_web')
  const currentPhrase = TYPEWRITER_PHRASES[phraseIdx]

  return (
    <search className="search-bar">
      <div className="search-label-row">
        <label htmlFor="finding-search" className={`search-label${narrowMode ? ' search-label--disabled' : ''}`}>
          {t('search.label')}
        </label>
        {query.length === 0 && !narrowMode && !prefersReducedMotion && (
          <span className="search-typewriter">
            {t('search.typewriter_try')}{' '}
            <button
              key={phraseIdx}
              type="button"
              className="search-typewriter__phrase"
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
          onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
          onClear={() => onChange('')}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          spellCheck={false}
          clearAriaLabel={t('search.clear_aria')}
          wrapClassName="search-input-wrap"
          inputClassName={`search-input${query.length ? ' search-input--has-value' : ''}${narrowMode ? ' search-input--disabled' : ''}`}
          clearButtonClassName="btn--primary input-clear-btn"
          inputRef={inputRef}
          disabled={narrowMode}
        />
        {!liveSearch && (
          <Button
            onClick={onSearch}
            disabled={query.length < 2}
            variant="primary"
            className={`search-submit-btn btn--input-height${narrowMode ? ' search-submit-btn--disabled' : ''}`}
          >
            {t('search.button')}
          </Button>
        )}
      </div>
      {query.length === 0 && !narrowMode && (
        <p className="search-hint">
          {liveSearch ? t('search.hint_live') : t('search.hint_submit')}
          {' '}
          {t('search.hint_platform', { platform: platformLabel })}
          {platform === 'native' ? ` ${t('search.hint_platform_native_caveat')}` : ''}
          {aiEnabled && providerName ? ` ${t('search.hint_ai', { provider: providerName })}` : ''}
          {showRanking ? ` ${t('search.hint_ranking')}` : ''}
          {hasPins ? ` ${t('search.hint_pin')}` : ''}
          {' '}
          {t('search.hint_syntax_prefix')}{' '}
          <a href="#/?q=keyboard+%2Bscreen+reader+-wcag2.2" className="search-hint-link">keyboard +screen reader -wcag2.2</a>
          {t('search.hint_syntax_suffix')}
          {' '}
          {t('search.hint_change_in')}{' '}
          <a href="#/settings" className="search-hint-link">
            {t('common.settings')}
          </a>.
        </p>
      )}
    </search>
  )
}
