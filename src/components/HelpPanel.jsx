import { useT } from '../i18n/index.jsx'
import Panel from './ui/Panel.jsx'
import Button from './ui/Button.jsx'

export default function HelpPanel({ onClose, onStartTour }) {
  const t = useT()

  return (
    <Panel
      className="help-panel"
      heading={t('help.sheet_label')}
      onClose={onClose}
      closeAriaLabel={t('settings.back')}
      pageTitle={t('help.sheet_label')}
    >

      {onStartTour && (
        <section className="help-section">
          <h3 className="help-section-heading">{t('help.walkthrough_heading')}</h3>
          <div className="help-tour-section">
            <p className="help-tour-description">{t('help.take_tour_description')}</p>
            <Button
              variant="primary"
              className="help-tour-btn help-tour-btn--with-margin"
              onClick={() => { onClose(); onStartTour() }}
            >
              {t('help.take_tour')}
            </Button>
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
                  <span className="help-step-optional">{' '}{t('common.optional')}</span>
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
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">Shift+↑</code> {t('help.shortcut_rank_up')}</li>
          <li className="help-shortcut"><code className="help-shortcut-key" aria-hidden="true">Shift+↓</code> {t('help.shortcut_rank_down')}</li>
        </ul>
      </section>
    </Panel>
  )
}
