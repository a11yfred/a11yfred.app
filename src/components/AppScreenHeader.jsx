import { Button, LinkSkipTo } from '@ulam/ube'
import { Settings, X, Info, HelpCircle, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { useT } from '../hooks/useTranslate.js'


import A11yTitle from './A11yTitle.jsx'
import { URL_GITHUB_REPO } from '../utils/constants.js'

export default function AppScreenHeader({ h1Ref, h1LinkRef, settingsOpen, aboutOpen, helpOpen, onboardingOpen, onOpenSettings, onCloseSettings, onOpenAbout, onCloseAbout, onOpenHelp, onCloseHelp, onCloseOnboarding, isDesktop, skipTarget }) {
  const t = useT()
  const compact = isDesktop && (settingsOpen || aboutOpen || helpOpen || onboardingOpen)
  return (
    <header className={`page-header${compact ? ' page-header--compact' : ''}`} inert={isDesktop && onboardingOpen ? true : undefined}>
      <LinkSkipTo onClick={(e) => { e.preventDefault(); document.getElementById(skipTarget)?.focus() }}>{t('common.skip_to_main')}</LinkSkipTo>
      {!compact && (
        <a
          href={URL_GITHUB_REPO}
          target="_blank"
          rel="noreferrer"
          className="header-github-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
          </svg>
          {t('header.github')}<ExternalLinkIcon size="1em" className="inline-icon" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
        </a>
      )}

      <div className="page-header__actions">
        {compact && !onboardingOpen ? (
          <Button
            onClick={settingsOpen ? onCloseSettings : aboutOpen ? onCloseAbout : helpOpen ? onCloseHelp : onCloseOnboarding}
            label={t('common.close')}
            icon={<X size={20} strokeWidth={2.5} aria-hidden="true" />}
            className="page-header__close-btn"
          />
        ) : !onboardingOpen && (
          <>
            <Button
              onClick={onOpenHelp}
              label={t('help.open_help')}
              icon={<HelpCircle size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__help-btn"
            />
            <Button
              onClick={onOpenAbout}
              label={t('header.open_about')}
              icon={<Info size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__about-btn"
            />
            <Button
              onClick={onOpenSettings}
              label={t('header.open_settings')}
              icon={<Settings size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__settings-btn"
            />
          </>
        )}
      </div>

      {(onboardingOpen || settingsOpen || aboutOpen || helpOpen) ? (
        <h1 ref={h1Ref} tabIndex={-1} className={compact ? 'sr-only' : 'page-title'}>
          <A11yTitle t={t} />
        </h1>
      ) : (
        <h1 ref={h1Ref} tabIndex={-1} className={compact ? 'sr-only' : 'page-title'}>
          <a ref={h1LinkRef} href="/" className={`page-title-link${compact ? ' sr-only' : ''}`}>
            <A11yTitle t={t} />
          </a>
        </h1>
      )}

      {!compact && (
        <p className="page-tagline"><em>{t('app.tagline')}</em></p>
      )}
    </header>
  )
}
