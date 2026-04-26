import { useState } from 'react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useFocusOnMount, usePageTitle, BottomSheet, useDir } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

export default function AboutPanel({ onClose }) {
  const t = useT()
  const headingRef = useFocusOnMount()
  const dir = useDir()
  usePageTitle(t('about.sheet_label'))
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft
  const [privacyOpen, setPrivacyOpen] = useState(false)

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
        <p className="about-body">{t('about.what_wcag')}</p>
        <p className="about-body">{t('about.examples_intro')}</p>
        <ul className="about-coming">
          <li>Unlabeled Button or Link</li>
          <li>Control Label Describes Appearance, Not Purpose</li>
          <li>Heading Structure Incorrect</li>
          <li>No H1 on the Page</li>
          <li>ARIA Used Incorrectly</li>
        </ul>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.how_heading')}</h3>
        <ol className="about-steps">
          {[1, 2, 3, 4, 5].map(n => (
            <li key={n} className="about-step">
              <span className="about-step-label">{t(`about.step_${n}_label`)}</span>
              <span className="about-step-body">{t(`about.step_${n}_body`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-section">
        <h3 className="about-section-heading">{t('about.features_heading')}</h3>
        <ul className="about-features">
          {['ai', 'languages', 'party', 'a11y'].map(key => (
            <li key={key} className="about-feature">
              <span className="about-feature-label">{t(`about.feature_${key}_label`)}</span>
              <span className="about-feature-body">{t(`about.feature_${key}_body`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section about-section--last">
        <h3 className="about-section-heading">{t('about.coming_heading')}</h3>
        <ul className="about-coming">
          <li>{t('about.coming_auth')}</li>
          <li>{t('about.coming_custom')}</li>
          <li>{t('about.coming_ai')}</li>
        </ul>
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="about-privacy-btn"
        >
          <Info size={14} aria-hidden="true" />
          {t('settings.privacy_button')}
        </button>
      </section>

      <BottomSheet
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        label={t('settings.privacy_heading')}
        closeLabel={t('common.close')}
      >
        <h2 className="sheet-heading">{t('settings.privacy_heading')}</h2>
        <h3 className="settings-modal-subhead">{t('settings.privacy_subhead_storage')}</h3>
        <p>{t('settings.privacy_body_1')}</p>
        <p>{t('settings.privacy_body_2')}</p>
        <h3 className="settings-modal-subhead">{t('settings.privacy_subhead_translations')}</h3>
        <p>{t('settings.privacy_body_translations')}</p>
      </BottomSheet>
    </div>
  )
}
