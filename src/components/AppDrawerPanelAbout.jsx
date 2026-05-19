import { Panel, ButtonText, IconExternalLink } from '@ulam/ube'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useT } from '@ulam/calamansi/react'



import entrySlug from '../utils/entrySlug.js'
import { version } from '../../package.json'
import './app-drawer-panel-about.css'

function ExtLink({ href, children }) {
  return <a href={href} target="_blank" rel="noreferrer" className="panel-inline-link">{children}<IconExternalLink /><span className="sr-only"> (opens in new tab)</span></a>
}

export default function AppDrawerPanelAbout({ onClose, allEntries = [] }) {
  const t = useT()

  const [exampleEntries] = useState(() => {
    if (allEntries.length === 0) return []
    const shuffled = [...allEntries].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })

  return (
    <Panel
      className="about-panel page-panel"
      heading={t('about.sheet_label')}
      onClose={onClose}
      closeAriaLabel={t('settings.back')}
      pageTitle={t('about.sheet_label')}
    >

      <section className="panel-section">
        <h3 className="panel-section-heading">{t('about.what_heading')}</h3>
        <p className="panel-body">{t('about.what_body')}</p>
        <p className="panel-body">
          {t('about.what_body_2_prefix')}
          <ExtLink href="https://www.w3.org/TR/WCAG22/">Web Content Accessibility Guidelines (WCAG)</ExtLink>
          {t('about.what_body_2_suffix')}
        </p>
        <p className="panel-body">{t('about.what_wcag')}</p>
        {exampleEntries.length > 0 && (
          <>
            <p className="panel-body">{t('about.examples_intro')}</p>
            <ul className="about-coming">
              {exampleEntries.map(f => (
                <li key={f.id}>
                  <a href={`#/entry/${f.id}/${entrySlug(f.title)}`} className="panel-inline-link">{f.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="panel-section">
        <h3 className="panel-section-heading">{t('about.features_heading')}</h3>
        <ul className="about-features">
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_a11y_label')}</h4>
            <p className="about-feature-body">{t('about.feature_a11y_body')}</p>
          </li>
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_ai_label')}</h4>
            <p className="about-feature-body">
              {t('about.feature_ai_body')}{' '}
              <a href="#/settings" className="panel-inline-link">{t('common.settings')}</a>.
            </p>
            <p className="about-feature-body about-feature-body--sub">
              <strong>{t('about.feature_agentic_label')}: </strong>{t('about.feature_agentic_body')}
            </p>
          </li>
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_pinning_label')}</h4>
            <p className="about-feature-body">{t('about.feature_pinning_body')}</p>
          </li>
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_languages_label')}</h4>
            <p className="about-feature-body">
              {t('about.feature_languages_body')}{' '}
              <a href="#/settings" className="panel-inline-link">{t('common.settings')}</a>.
            </p>
          </li>
        </ul>
      </section>

      <section className="panel-section">
        <h3 className="panel-section-heading">{t('settings.privacy_heading')}</h3>
        <h4 className="panel-subheading">{t('settings.privacy_subhead_storage')}</h4>
        <p className="panel-body">{t('settings.privacy_body_1')}</p>
        <p className="panel-body">{t('settings.privacy_body_2')}</p>
        <h4 className="panel-subheading">{t('settings.privacy_subhead_translations')}</h4>
        <p className="panel-body">{t('settings.privacy_body_translations')}</p>
      </section>

      <section className="panel-section">
        <h3 className="panel-section-heading">{t('about.sources_heading')}</h3>
        <p className="panel-body">{t('about.sources_body')}</p>
        <p className="panel-body">{t('about.sources_intro')}</p>
        <ul className="about-sources-list panel-body">
          <li>
            <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer" className="panel-inline-link">WCAG 2.2 Understanding documents<IconExternalLink /><span className="sr-only"> (opens in new tab)</span></a>
            {' '}(W3C / WAI)
          </li>
          <li>
            <ExtLink href="https://github.com/dequelabs/axe-core">axe-core</ExtLink>
            {' '}rule descriptions and{' '}
            <ExtLink href="https://dequeuniversity.com">Deque University</ExtLink>
            {' '}course materials (Deque Systems)
          </li>
          <li>
            <ExtLink href="https://webaim.org">WebAIM</ExtLink>
            {' '}articles and reference guides
          </li>
          <li>
            <ExtLink href="https://appt.org">appt.org</ExtLink>
            {' '}accessibility guidelines for native apps
          </li>
        </ul>
      </section>

      <div className="about-footer">
        <small className="about-version">
          A11yFred v{version}
        </small>
      </div>

      <div className="panel-mobile-back">
        <ButtonText
          variant="primary"
          className="panel-mobile-back-btn"
          icon={<ArrowLeft size={16} aria-hidden="true" />}
          onClick={onClose}
          tabIndex={-1}
        >
          {t('settings.back')}
        </ButtonText>
      </div>
    </Panel>
  )
}
