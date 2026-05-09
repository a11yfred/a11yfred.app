import { useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

export default function DataError({
  onRetry,
  ariaLabel = 'Error loading data',
  heading = 'Unable to load data',
  body = 'An error occurred while loading data.',
  retryLabel = 'Try again',
  onMount
}) {
  const headingRef = useRef(null)

  useEffect(() => {
    onMount?.()
    headingRef.current?.focus()
  }, [onMount])

  return (
    <section className="no-results" aria-label={ariaLabel}>
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="no-results__icon"
      >
        <circle cx="28" cy="28" r="22" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="28" y1="16" x2="28" y2="32" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="28" cy="39" r="1.5" fill="var(--text-muted)"/>
      </svg>
      <p className="no-results__heading" ref={headingRef} tabIndex={-1}>{heading}</p>
      <p className="no-results__body">
        {body}{' '}
        {onRetry && (
          <button type="button" className="btn--tertiary error-retry-inline" onClick={onRetry}>
            <RotateCcw size={12} aria-hidden="true" />
            {retryLabel}
          </button>
        )}
        {!onRetry && retryLabel}
        .
      </p>
    </section>
  )
}
