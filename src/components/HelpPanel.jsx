import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useDir } from '../plugins/router/index.js'
import { useT } from '../i18n/index.jsx'

export default function HelpPanel({ onClose, onStartTour }) {
  const t = useT()
  const headingRef = useFocusOnMount()
  const dir = useDir()
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft

  usePageTitle(t('help.sheet_label'))

  return (
    <div className="help-panel">
      <div className="help-header">
        <button
          onClick={onClose}
          aria-label={t('settings.back')}
          className="btn--icon btn--icon-accent"
        >
          <BackChevron size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="help-title">
          {t('help.sheet_label')}
        </h2>
      </div>

      {onStartTour && (
        <section className="help-section">
          <h3 className="help-section-heading">{t('help.take_tour')}</h3>
          <div className="help-tour-section">
            <button
              type="button"
              className="btn--primary help-tour-btn btn--height-standard"
              onClick={() => { onClose(); onStartTour() }}
            >
              {t('help.take_tour')}
            </button>
            <p className="help-tour-description">{t('help.take_tour_description')}</p>
          </div>
        </section>
      )}

      <section className="help-section">
        <h3 className="help-section-heading">{t('help.how_heading')}</h3>
        <ol className="help-steps">
          {[1, 2, 3, 4, 5].map(n => (
            <li key={n} className="help-step">
              <span className="help-step-label">
                {t(`help.step_${n}_label`)}
                {(n === 2 || n === 4) && (
                  <span className="help-step-optional">{' '}{t('help.step_optional')}</span>
                )}
              </span>
              <span className="help-step-body">{t(`help.step_${n}_body`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="help-section help-section--last">
        <h3 className="help-section-heading">{t('help.shortcuts_heading')}</h3>
        <p className="help-shortcuts-note">{t('help.shortcuts_note')}</p>
        <ul className="help-shortcuts">
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">J</code> {t('help.shortcut_j')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">K</code> {t('help.shortcut_k')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">S</code> {t('help.shortcut_s')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">E</code> {t('help.shortcut_e')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">U</code> {t('help.shortcut_u')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">Shift+↑</code> {t('help.shortcut_upvote')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">Shift+↓</code> {t('help.shortcut_downvote')}</li>
        </ul>
      </section>
    </div>
  )
}
