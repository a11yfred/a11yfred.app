import { ExternalLink } from 'lucide-react'
import { useT } from '../i18n/index.jsx'
import Panel from './ui/Panel.jsx'

export default function AboutPanel({ onClose }) {
  const t = useT()

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
        <p className="about-body">{t('about.what_body_2')}</p>
        <p className="about-body">
          {t('about.what_wcag').split('{wcag}')[0]}
          <a
            href="https://www.w3.org/TR/WCAG22/"
            target="_blank"
            rel="noreferrer"
            className="about-inline-link"
          >Web Content Accessibility Guidelines (WCAG) 2.2<ExternalLink size={11} aria-hidden="true" className="external-link-icon" /></a>
          {t('about.what_wcag').split('{wcag}')[1]}
        </p>
        <p className="about-body">{t('about.examples_intro')}</p>
        <ul className="about-coming">
          {[
            { id: 'ATH-001', slug: 'unlabeled-button-or-link',                            label: 'Unlabeled Button or Link' },
            { id: 'ATH-010', slug: 'control-label-describes-appearance-not-purpose',       label: 'Control Label Describes Appearance, Not Purpose' },
            { id: 'ATH-013', slug: 'incorrect-heading-structure',                          label: 'Incorrect Heading Structure' },
            { id: 'ATH-014', slug: 'no-h1-on-the-page',                                   label: 'No H1 on the Page' },
            { id: 'ATH-019', slug: 'aria-used-incorrectly',                               label: 'ARIA Used Incorrectly' },
          ].map(({ id, slug, label }) => (
            <li key={id}>
              <a href={`#/finding/${id}/${slug}`} className="about-inline-link">{label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.features_heading')}</h3>
        <ul className="about-features">
          {['a11y', 'languages', 'party', 'pinning'].map(key => (
            <li key={key} className="about-feature">
              <span className="about-feature-label">{t(`about.feature_${key}_label`)}</span>
              <span className="about-feature-body">{t(`about.feature_${key}_body`)}</span>
            </li>
          ))}
          <li className="about-feature">
            <span className="about-feature-label">{t('about.feature_ai_label')}</span>
            <span className="about-feature-body">
              {t('about.feature_ai_body')}{' '}
              <a href="#/settings" className="about-inline-link">{t('about.feature_ai_setup_link')}</a>.
            </span>
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

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.sources_heading')}</h3>
        <p className="about-body">{t('about.sources_body')}</p>
        <ul className="about-sources-list">
          {['wcag', 'axe', 'webaim', 'deque'].map(key => (
            <li key={key} className="about-body">{t(`about.sources_${key}`)}</li>
          ))}
        </ul>
      </section>

      <section className="about-section about-section--last">
        <h3 className="about-section-heading">{t('about.coming_heading')}</h3>
        <ul className="about-coming">
          <li>{t('about.coming_auth')}</li>
          <li>{t('about.coming_custom')}</li>
        </ul>
      </section>
    </Panel>
  )
}
