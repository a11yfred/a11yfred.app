import { useRef } from 'react'
import './InputSearch.css'

/**
 * Self-contained search field with form[role="search"] wrapper,
 * optional live search mode, clear button, and submit icon button.
 *
 * liveSearch={true}  — fires onChange on every keystroke, hides submit button
 * liveSearch={false} — shows submit icon button, fires onSubmit on Enter or click
 *
 * Pair with a visible <label> or pass label to set aria-label on the form.
 */
export default function InputSearch({
  id,
  value,
  onChange,
  onSubmit,
  onClear,
  liveSearch = false,
  placeholder = 'Search…',
  disabled = false,
  label,
  submitAriaLabel = 'Search',
  clearAriaLabel = 'Clear',
  inputRef: externalRef,
  ...rest
}) {
  const internalRef = useRef(null)
  const ref = externalRef || internalRef

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
    ref.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!liveSearch) onSubmit?.()
  }

  const handleChange = (e) => {
    onChange(e.target.value)
    if (liveSearch) onSubmit?.(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !liveSearch) onSubmit?.()
    rest.onKeyDown?.(e)
  }

  const hasValue = Boolean(value)

  return (
    <form
      role="search"
      className="search-input-form"
      onSubmit={handleSubmit}
      aria-label={label}
    >
      <div className={[
        'search-input-wrap',
        liveSearch ? 'search-input-wrap--live' : '',
      ].filter(Boolean).join(' ')}>
        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={[
            'search-input-field',
            hasValue ? 'search-input-field--has-value' : '',
            disabled ? 'search-input-field--disabled' : '',
          ].filter(Boolean).join(' ')}
          {...rest}
        />

        {hasValue && !disabled && (
          <button
            type="button"
            className="search-input-clear"
            onClick={handleClear}
            aria-label={clearAriaLabel}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {!liveSearch && (
          <button
            type="submit"
            className="search-input-submit"
            aria-label={submitAriaLabel}
            aria-disabled={(disabled || !hasValue) || undefined}
            onClick={(disabled || !hasValue) ? (e => e.preventDefault()) : undefined}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
