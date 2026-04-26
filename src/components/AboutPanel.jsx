import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useDir, useRouter } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

export default function AboutPanel({ onClose }) {
  const t = useT()
  const headingRef = useFocusOnMount()
  const dir = useDir()
  const { navigate } = useRouter()
  usePageTitle(t('about.sheet_label'))
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft

  return (
    <div className="about-panel">
      <div className="about-header">
        <button
          onClick={onClose}
          aria-label={t('settings.back')}
          className="btn-icon btn-icon-accent"
        >
          <BackChevron size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="about-title">
          {t('about.sheet_label')}
        </h2>
      </div>

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
              <button
                type="button"
                className="about-inline-link"
                onClick={() => navigate(`/finding/${id}/${slug}`)}
              >{label}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.how_heading')}</h3>
        <ol className="about-steps">
          {[1, 2, 3, 4, 5].map(n => (
            <li key={n} className="about-step">
              <span className="about-step-label">
                {t(`about.step_${n}_label`)}
                {(n === 2 || n === 4) && (
                  <span className="about-step-optional">{' '}{t('about.step_optional')}</span>
                )}
              </span>
              <span className="about-step-body">{t(`about.step_${n}_body`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.features_heading')}</h3>
        <ul className="about-features">
          {['a11y', 'languages', 'party'].map(key => (
            <li key={key} className="about-feature">
              <span className="about-feature-label">{t(`about.feature_${key}_label`)}</span>
              <span className="about-feature-body">{t(`about.feature_${key}_body`)}</span>
            </li>
          ))}
          <li className="about-feature">
            <span className="about-feature-label">{t('about.feature_ai_label')}</span>
            <span className="about-feature-body">
              {t('about.feature_ai_body')}{' '}Set it up in{' '}
              <button
                type="button"
                className="about-inline-link"
                onClick={() => navigate('/settings')}
              >{t('search.hint_settings_link')}</button>.
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

      <section className="about-section about-section--last">
        <h3 className="about-section-heading">{t('about.coming_heading')}</h3>
        <ul className="about-coming">
          <li>{t('about.coming_auth')}</li>
          <li>{t('about.coming_custom')}</li>
          <li>{t('about.coming_ai')}</li>
        </ul>
      </section>
    </div>
  )
}
