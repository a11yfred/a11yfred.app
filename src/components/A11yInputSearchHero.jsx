import { InputWithClear, Button } from '@ulam/ube'
import { useRef, useState, useEffect } from 'react'
import { useT } from '@ulam/calamansi/react'


import { CYCLE_MS } from '../utils/constants.js'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'
import './A11yInputSearchHero.css'

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

export default function A11yInputSearchHero({ query, onChange, onSearch, onExampleSearch, onFocus, onBlur, liveSearch, narrowMode = false, inputRef: externalRef, onOpenSettings }) {
  const t = useT()
  const internalRef = useRef(null)
  const inputRef = externalRef || internalRef
  const [phraseIdx, setPhraseIdx] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || query.length > 0) return
    const id = setInterval(() => setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [prefersReducedMotion, query.length])

  const handlePhraseClick = (phrase) => {
    onChange(phrase.text)
    inputRef.current?.focus()
  }

  const currentPhrase = TYPEWRITER_PHRASES[phraseIdx]

  return (
    <search className="search-bar">
      <div className="search-label-row">
        <label htmlFor="entry-search" className="search-label">
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
          id="entry-search"
          type="text"
          value={query}
          onChange={onChange}
          onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
          onFocus={onFocus}
          onBlur={onBlur}
          onClear={() => onChange('')}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          spellCheck={false}
          clearAriaLabel={t('search.clear_aria')}
          wrapClassName="search-input-wrap"
          inputClassName={`search-input${query.length ? ' search-input--has-value' : ''}`}
          clearButtonClassName="btn--primary input-clear-btn"
          inputRef={inputRef}
        />
        {!liveSearch && (
          <Button
            onClick={onSearch}
            disabled={query.length < 2}
            variant="primary"
            className="search-submit-btn btn--input-height"
          >
            {t('search.button')}
          </Button>
        )}
      </div>
      {query.length === 0 && !narrowMode && (
        <p className="search-hint">
          {liveSearch ? <>{'Live Search is '}
            <button
              type="button"
              className="search-hint-link search-hint-link--inline"
              onClick={() => {
                onOpenSettings?.()
                setTimeout(() => document.getElementById('toggle-live-search')?.focus(), 300)
              }}
            >ON</button>
            {': Results appear as you type. '}
          </> : ''}
          {t('search.hint_syntax_prefix')}{' '}
          <a
            href="#/?q=focus+-missing"
            className="search-hint-link"
            onClick={e => { e.preventDefault(); onExampleSearch?.('focus -missing') }}
          >focus -missing</a>
          {t('search.hint_syntax_suffix')}
          {' '}
          {t('search.hint_filter_sort')}{' '}
          {t('search.hint_change_in')}{' '}
          <a href="#/settings" className="search-hint-link">
            {t('common.settings')}
          </a>.
        </p>
      )}
    </search>
  )
}
