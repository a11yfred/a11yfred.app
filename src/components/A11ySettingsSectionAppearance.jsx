import { FormControlRadioChip, FormControlSelect, Button } from '@ulam/ube'
import { Check } from 'lucide-react'
import { useT } from '../hooks/useTranslate.js'
import { announce } from '@ulam/taho'
import { SETTINGS_FLASH_MS } from '../utils/constants.js'
import LANGUAGES from '../data/languages.js'

function PendingNote({ t }) {
  return (
    <p className="panel-pending-note">
      <strong>{t('settings.pending_save_note')}</strong>
    </p>
  )
}

export default function SettingsSectionAppearance({
  theme,
  pendingTheme,
  setPendingTheme,
  language,
  pendingLanguage,
  setPendingLanguage,
  fiestaUnlocked,
  setFiestaConfirmOpen,
  setLanguagePreviewed,
  languagePreviewed,
}) {
  const t = useT()

  const savedLanguageLabel = (() => {
    const entry = LANGUAGES.find(l => l.value === language)
    if (!entry) return LANGUAGES.find(l => l.value === language?.split('-')[0])?.label ?? language
    return language?.startsWith('en') && entry.en ? `${entry.label} (${entry.en})` : entry.label
  })()

  return (
    <section className="panel-section">
      <h3 className="panel-section-heading">{t('settings.appearance')}</h3>
      <div className="panel-group">
        <div className="panel-row">
          <div className="panel-row-label">
            <h3 className="panel-field-label">Theme</h3>
            <p className="panel-field-desc">The current theme is <strong>{theme}</strong>.</p>
          </div>
          {pendingTheme !== theme && <PendingNote t={t} />}
          <div className="panel-row-control">
            <fieldset>
              <legend className="sr-only">{t('settings.appearance')}</legend>
              <div className="radio-chip-group">
                {[
                  { value: 'light', labelKey: 'settings.theme_light', announceKey: 'settings.theme_light_announce' },
                  { value: 'auto', labelKey: 'settings.theme_auto', announceKey: 'settings.theme_auto_announce' },
                  { value: 'dark', labelKey: 'settings.theme_dark', announceKey: 'settings.theme_dark_announce' },
                  ...(fiestaUnlocked ? [{ value: 'fiesta', labelKey: 'settings.theme_party', announceKey: 'settings.theme_party_announce' }] : []),
                ].map(({ value, labelKey, announceKey }) => (
                  <FormControlRadioChip
                    key={value}
                    name="theme-setting"
                    value={value}
                    label={t(labelKey)}
                    current={pendingTheme}
                    onChange={(val) => {
                      if (val === 'fiesta') { setFiestaConfirmOpen(true); return }
                      setPendingTheme(val); announce(t(announceKey))
                    }}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="panel-group">
        <div className="panel-row">
          <div className="panel-row-label">
            <label htmlFor="language-select" className="panel-field-label">{t('settings.language_label')}</label>
            <p className="panel-field-desc">The current language is <strong>{savedLanguageLabel}</strong>.</p>
            {pendingLanguage !== language && <PendingNote t={t} />}
          </div>
          <div className="panel-row-control">
            <div className="settings-language-row">
              <FormControlSelect
                id="language-select"
                value={pendingLanguage === language ? '' : pendingLanguage}
                onChange={e => { setPendingLanguage(e.target.value || language); setLanguagePreviewed(false) }}
                wrapClass="select-wrap--language"
                aria-label={t('settings.language_label')}
              >
                <option value="">{t('settings.language_select_one')}</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {language?.startsWith('en') && lang.en ? `${lang.label} (${lang.en})` : lang.label}
                  </option>
                ))}
              </FormControlSelect>
              <Button
                variant="primary"
                active={languagePreviewed}
                activeIcon={<Check size={14} aria-hidden="true" />}
                className="btn-settings"
                disabled={!pendingLanguage || pendingLanguage === language}
                onClick={() => {
                  setLanguagePreviewed(true)
                  setTimeout(() => setLanguagePreviewed(false), SETTINGS_FLASH_MS)
                  announce(t('settings.language_changed_aria_live'))
                }}
              >
                {languagePreviewed ? t('settings.language_changed') : t('settings.language_change')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
