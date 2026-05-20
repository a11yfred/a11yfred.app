import { Heart, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { useT } from '../hooks/useTranslate.js'
import { URL_GITHUB_SPONSORS, URL_LINKEDIN, URL_PERSONAL_SITE, URL_PRIVACY_POLICY, FOOTER_CREDIT_NAME } from '../utils/constants.js'

export default function A11yScreenFooter() {
  const t = useT()
  const credit = t('footer.credit')
  const nameIdx = credit.indexOf(FOOTER_CREDIT_NAME)
  return (
    <footer className="page-footer">
      <p className="footer-credit">
        <span className="footer-credit-left">
          {nameIdx >= 0 ? (
            <>
              {credit.slice(0, nameIdx)}
              <a href={URL_PERSONAL_SITE} target="_blank" rel="noreferrer" className="footer-link"><strong className="footer-credit__name">Mikey Ilagan</strong><span className="sr-only"> (opens in new tab)</span></a>
              {credit.slice(nameIdx + FOOTER_CREDIT_NAME.length)}
            </>
          ) : credit}
          <br />
          <a
            href={URL_GITHUB_SPONSORS}
            target="_blank"
            rel="noreferrer"
            className="footer-link"
            title={t('footer.sponsor_title') || 'Support on GitHub Sponsors'}
          >
            <Heart aria-hidden="true" className="inline-icon footer-brand-icon" fill="currentColor" strokeWidth={0} />
            {t('footer.sponsor')}<ExternalLinkIcon size="0.7em" className="inline-icon footer-ext-icon" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
          {'  ·  '}
          <a
            href={URL_LINKEDIN}
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="inline-icon footer-brand-icon"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            {t('footer.linkedin')}<ExternalLinkIcon size="0.7em" className="inline-icon footer-ext-icon" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </span>
        <a
          href={URL_PRIVACY_POLICY}
          target="_blank"
          rel="noreferrer"
          className="footer-link footer-privacy-link"
          title="Privacy Policy"
        >
          {t('footer.privacy') || 'Privacy'}<ExternalLinkIcon size="0.7em" className="inline-icon footer-ext-icon" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
        </a>
      </p>
    </footer>
  )
}
