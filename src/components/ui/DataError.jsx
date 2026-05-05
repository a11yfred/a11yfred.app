import { useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { useT } from '../../plugins/i18n/index.js'
import { announce } from '../../plugins/announce/index.js'

export default function DataError({ onRetry }) {
  const t = useT()
  const headingRef = useRef(null)

  useEffect(() => {
    announce(t('error.announce'), { priority: 'assertive' })
    headingRef.current?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- announce only on first appearance

  return (
    <section className="no-results">
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="no-results__icon"
      >
        <circle cx="28" cy="28" r="22" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="28" y1="16" x2="28" y2="32" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="28" cy="39" r="1.5" fill="var(--text-faint)"/>
      </svg>
      <p className="no-results__heading" ref={headingRef} tabIndex={-1}>{t('error.heading')}</p>
      <p className="no-results__body">
        {t('error.body')}{' '}
        {onRetry && (
          <button type="button" className="btn--tertiary error-retry-inline" onClick={onRetry}>
            <RotateCcw size={12} aria-hidden="true" />
            {t('error.retry')}
          </button>
        )}
        {!onRetry && t('error.retry')}
        .
      </p>
    </section>
  )
}
