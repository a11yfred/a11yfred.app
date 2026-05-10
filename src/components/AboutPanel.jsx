import { useState } from 'react'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { useT } from '../i18n/index.jsx'
import Panel from './ui/Panel.jsx'
import Button from './ui/Button.jsx'
import findingSlug from '../utils/findingSlug.js'

export default function AboutPanel({ onClose, allFindings = [] }) {
  const t = useT()

  const [exampleFindings] = useState(() => {
    if (allFindings.length === 0) return []
    const shuffled = [...allFindings].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })

  return (
    <Panel
      className="about-panel"
      heading={t('about.sheet_label')}
      onClose={onClose}
      closeAriaLabel={t('settings.back')}
      pageTitle={t('about.sheet_label')}
    >

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.what_heading')}</h3>
        <p className="about-body">{t('about.what_body')}</p>
        <p className="about-body">
          {t('about.what_body_2_prefix')}
          <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer" className="about-inline-link">Web Content Accessibility Guidelines (WCAG)<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
          {t('about.what_body_2_suffix')}
        </p>
        <p className="about-body">{t('about.what_wcag')}</p>
        {exampleFindings.length > 0 && (
          <>
            <p className="about-body">{t('about.examples_intro')}</p>
            <ul className="about-coming">
              {exampleFindings.map(f => (
                <li key={f.id}>
                  <a href={`#/finding/${f.id}/${findingSlug(f.title)}`} className="about-inline-link">{f.title}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.features_heading')}</h3>
        <ul className="about-features">
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_a11y_label')}</h4>
            <p className="about-feature-body">{t('about.feature_a11y_body')}</p>
          </li>
          <li className="about-feature">
            <h4 className="about-feature-label">{t('about.feature_ai_label')}</h4>
            <p className="about-feature-body">
              {t('about.feature_ai_body')}{' '}
              <a href="#/settings" className="about-inline-link">{t('common.settings')}</a>.{' '}
              {t('about.feature_agentic_body')}
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
              <a href="#/settings" className="about-inline-link">{t('common.settings')}</a>.
            </p>
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('settings.privacy_heading')}</h3>
        <h4 className="about-subheading">{t('settings.privacy_subhead_storage')}</h4>
        <p className="about-body">{t('settings.privacy_body_1')}</p>
        <p className="about-body">{t('settings.privacy_body_2')}</p>
        <h4 className="about-subheading">{t('settings.privacy_subhead_translations')}</h4>
        <p className="about-body">{t('settings.privacy_body_translations')}</p>
      </section>

      <section className="about-section about-section--last">
        <h3 className="about-section-heading">{t('about.sources_heading')}</h3>
        <p className="about-body">{t('about.sources_body')}</p>
        <p className="about-body">{t('about.sources_intro')}</p>
        <ul className="about-sources-list about-body">
          <li>
            <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noreferrer" className="about-inline-link">WCAG 2.2 Understanding documents<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
            {' '}(W3C / WAI)
          </li>
          <li>
            <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noreferrer" className="about-inline-link">axe-core<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
            {' '}rule descriptions and{' '}
            <a href="https://dequeuniversity.com" target="_blank" rel="noreferrer" className="about-inline-link">Deque University<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
            {' '}course materials (Deque Systems)
          </li>
          <li>
            <a href="https://webaim.org" target="_blank" rel="noreferrer" className="about-inline-link">WebAIM<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
            {' '}articles and reference guides
          </li>
          <li>
            <a href="https://appt.org" target="_blank" rel="noreferrer" className="about-inline-link">appt.org<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
            {' '}accessibility guidelines for native apps
          </li>
        </ul>
      </section>

      <div className="panel-mobile-back">
        <Button
          variant="primary"
          className="panel-mobile-back-btn"
          icon={<ArrowLeft size={16} aria-hidden="true" />}
          onClick={onClose}
          tabIndex={-1}
        >
          {t('settings.back')}
        </Button>
      </div>
    </Panel>
  )
}
