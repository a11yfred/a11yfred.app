import { useEffect } from 'react'
import { useT } from '../../plugins/i18n/index.js'
import { announce } from '../../plugins/announce/index.js'

export default function NoResults({ query }) {
  const t = useT()

  useEffect(() => {
    announce(t('results.no_results_announce', { query }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional: announce only on first appearance

  return (
    <section aria-label={t('results.no_results_aria')} className="no-results">
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="no-results__icon"
      >
        <circle cx="22" cy="22" r="14" stroke="var(--border)" strokeWidth="2.5"/>
        <line x1="33" y1="33" x2="47" y2="47" stroke="var(--border)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="14" y1="19" x2="30" y2="19" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
        <line x1="14" y1="23" x2="27" y2="23" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="14" y1="27" x2="24" y2="27" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
      </svg>

      <p className="no-results__heading">
        {t('results.no_results_heading', { query })}
      </p>
      <p className="no-results__body">
        {t('results.no_results_body')}
      </p>
    </section>
  )
}
