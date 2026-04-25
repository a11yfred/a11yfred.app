import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Check, Info } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useMediaQuery, Modal, BottomSheet } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholderKey: 'settings.api_placeholder_anthropic' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholderKey: 'settings.api_placeholder_openai'    },
  { id: 'google',    label: 'Google (Gemini)',      placeholderKey: 'settings.api_placeholder_google'    },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholderKey: 'settings.api_placeholder_default'   },
]

const LANGUAGES = [
  // A
  { value: 'af',    label: 'Afrikaans' },
  { value: 'ar-PS', label: 'العربية الفلسطينية',  en: 'Arabic (Palestinian)' },
  // B
  { value: 'eu',    label: 'Euskara',              en: 'Basque' },
  // C
  { value: 'yue',   label: '粵語（繁體）',           en: 'Cantonese' },
  { value: 'ceb',   label: 'Cebuano' },
  { value: 'cbk',   label: 'Chabacano' },
  { value: 'zh',    label: '中文（简体）',            en: 'Chinese (Simplified)' },
  { value: 'cr',    label: 'Nêhiyawêwin',          en: 'Cree (Plains)' },
  { value: 'crh',   label: 'Qırımtatarca',         en: 'Crimean Tatar' },
  // D
  { value: 'nl',    label: 'Nederlands',           en: 'Dutch' },
  // E
  { value: 'en-AU', label: 'English (Australian)' },
  { value: 'en-GB', label: 'English (British)' },
  { value: 'en-IN', label: 'English (Indian)' },
  { value: 'en-ZA', label: 'English (South African)' },
  { value: 'en',    label: 'English (US)' },
  { value: 'eo',    label: 'Esperanto' },
  // F
  { value: 'tl',    label: 'Filipino (Tagalog)' },
  { value: 'fr',    label: 'Français',             en: 'French' },
  { value: 'fr-CA', label: 'Français (Canada)',    en: 'French (Canada)' },
  // G
  { value: 'de',    label: 'Deutsch',              en: 'German' },
  { value: 'gn',    label: "Avañe'ẽ",              en: 'Guaraní' },
  // H
  { value: 'ht',    label: 'Kreyòl Ayisyen',       en: 'Haitian Creole' },
  { value: 'haw',   label: 'ʻŌlelo Hawaiʻi',       en: 'Hawaiian' },
  { value: 'hi',    label: 'हिन्दी',                en: 'Hindi' },
  // I
  { value: 'ilo',   label: 'Ilokano' },
  { value: 'iu',    label: 'Inuktitut' },
  // J
  { value: 'ja',    label: '日本語',                en: 'Japanese' },
  // K
  { value: 'ko',    label: '한국어',                en: 'Korean' },
  // M
  { value: 'mi',    label: 'Te Reo Māori',         en: 'Māori' },
  // N
  { value: 'nah',   label: 'Nāhuatlahtōlli',       en: 'Nahuatl' },
  { value: 'nv',    label: 'Diné bizaad',           en: 'Navajo' },
  // O
  { value: 'oj',    label: 'Anishinaabemowin',      en: 'Ojibwe' },
  // P
  { value: 'pjt',   label: 'Palawa kani' },
  { value: 'pt',    label: 'Português',             en: 'Portuguese' },
  { value: 'pt-BR', label: 'Português (Brasil)',    en: 'Portuguese (Brazil)' },
  // Q
  { value: 'qu',    label: 'Runasimi',              en: 'Quechua' },
  // R
  { value: 'rhg',   label: 'Ruáingga',             en: 'Rohingya' },
  // S
  { value: 'es',    label: 'Español (Latinoamérica)', en: 'Spanish (Latin America)' },
  { value: 'es-PH', label: 'Español (Filipinas)',      en: 'Spanish (Philippines)' },
  { value: 'es-ES', label: 'Español (España)',          en: 'Spanish (Spain)' },
  { value: 'sv',    label: 'Svenska',               en: 'Swedish' },
  // T
  { value: 'zgh',   label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ',            en: 'Tamazight (Standard Moroccan)' },
  { value: 'ta',    label: 'தமிழ்',                en: 'Tamil' },
  { value: 'bo',    label: 'བོད་སྐད།',              en: 'Tibetan' },
  // U
  { value: 'ug',    label: 'ئۇيغۇرچە',             en: 'Uyghur' },
  // V
  { value: 'vi',    label: 'Tiếng Việt',           en: 'Vietnamese' },
]

export default function SettingsPanel({
  aiEnabled, onToggleAi,
  liveSearch, onToggleLiveSearch,
  theme, onThemeChange,
  language, onLanguageChange,
  platform, onPlatformChange,
  onClose,
}) {
  const headingRef = useFocusOnMount()
  const t = useT()
  usePageTitle(t('settings.heading'))
  const isDesktop = useMediaQuery('(width >= 768px)')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [keys, setKeys] = useState(() => {
    const saved = {}
    PROVIDERS.forEach(p => {
      saved[p.id] = localStorage.getItem(`apikey_${p.id}`) || ''
    })
    return saved
  })
  const [activeProvider, setActiveProvider] = useState(
    () => localStorage.getItem('ai_provider') || 'anthropic'
  )
  const [saved, setSaved] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [rhgPending, setRhgPending] = useState(false)

  // Escape key — Drawer also listens on mobile; harmless double-fire
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    PROVIDERS.forEach(p => {
      if (keys[p.id]) {
        localStorage.setItem(`apikey_${p.id}`, keys[p.id])
      } else {
        localStorage.removeItem(`apikey_${p.id}`)
      }
    })
    localStorage.setItem('ai_provider', activeProvider)
    // Apply the displayed language — resets any active easter egg locale
    onLanguageChange(language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    announce(t('settings.saved_announce'))
  }

  return (
    <div>
      <div className="settings-header">
        <button
          onClick={onClose}
          aria-label={t('settings.back')}
          className="btn-icon btn-icon-accent"
        >
          <ChevronLeft size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="settings-title">
          {t('settings.heading')}
        </h2>
      </div>

      {/* ── Appearance ──────────────────────────────── */}
      <h3 className="settings-section-heading">{t('settings.appearance')}</h3>

      {/* Theme */}
      <fieldset className="settings-fieldset">
        <legend className="sr-only">{t('settings.theme_legend')}</legend>
        <div className="radio-chip-group">
          {[
            { value: 'light', labelKey: 'settings.theme_light' },
            { value: 'auto',  labelKey: 'settings.theme_auto'  },
            { value: 'dark',  labelKey: 'settings.theme_dark'  },
            { value: 'party', labelKey: 'settings.theme_party' },
          ].map(({ value, labelKey }) => (
            <RadioChip
              key={value}
              name="theme-setting"
              value={value}
              label={t(labelKey)}
              current={theme}
              onChange={onThemeChange}
            />
          ))}
        </div>
      </fieldset>

      {/* Language */}
      <div className="settings-group">
        <p className="settings-group__label">{t('settings.language_label')}</p>
        <p className="settings-group__desc">{t('settings.language_desc')}</p>
        <div className="settings-select-wrap">
          <select
            value={language}
            onChange={e => {
              if (e.target.value === 'rhg') { setRhgPending(true) }
              else { onLanguageChange(e.target.value) }
            }}
            className="settings-select"
            aria-label={t('settings.language_aria')}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {language?.startsWith('en') && lang.en ? `${lang.label} (${lang.en})` : lang.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
        </div>
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">
        {t('settings.search_section')}
      </h3>

      {/* Platform */}
      <div className="settings-group">
        <p className="settings-group__label">{t('settings.platform_label')}</p>
        <p className="settings-group__desc">
          {platform === 'web' ? t('settings.platform_web_desc') : t('settings.platform_native_desc')}
        </p>
        <fieldset className="settings-fieldset">
          <legend className="sr-only">{t('settings.platform_legend')}</legend>
          <div className="radio-chip-group">
            {[
              { value: 'web',    labelKey: 'settings.platform_web'    },
              { value: 'native', labelKey: 'settings.platform_native' },
            ].map(({ value, labelKey }) => (
              <RadioChip
                key={value}
                name="platform-setting"
                value={value}
                label={t(labelKey)}
                current={platform}
                onChange={(val) => {
                  onPlatformChange(val)
                  announce(t(val === 'web' ? 'settings.platform_web_announce' : 'settings.platform_native_announce'))
                }}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Live search */}
      <div className="settings-toggle-row">
        <div>
          <label htmlFor="toggle-live-search" className="settings-toggle-label">
            {t('settings.live_search_label')}
          </label>
          <p className="settings-toggle-desc">
            {liveSearch ? t('settings.live_search_on') : t('settings.live_search_off')}
          </p>
        </div>
        <Toggle id="toggle-live-search" checked={liveSearch} onChange={onToggleLiveSearch} />
      </div>

      {/* ── AI Assist ───────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">
        {t('settings.ai_heading')}
      </h3>

      <div className="settings-toggle-row settings-toggle-row--sm">
        <div>
          <label htmlFor="toggle-ai" className="settings-toggle-label">
            {t('settings.ai_enable_label')}
          </label>
          <p className="settings-toggle-desc">{t('settings.ai_enable_desc')}</p>
        </div>
        <Toggle id="toggle-ai" checked={aiEnabled} onChange={onToggleAi} />
      </div>

      <div className="settings-provider-group">
        <label htmlFor="active-provider" className="settings-field-label">
          {t('settings.provider_label')}
        </label>
        <div className="settings-select-wrap">
          <select
            id="active-provider"
            value={activeProvider}
            onChange={e => setActiveProvider(e.target.value)}
            disabled={!aiEnabled}
            className="settings-select"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
        </div>
      </div>

      {PROVIDERS.filter(p => p.id === activeProvider).map(p => (
        <div key={p.id} className="settings-key-group">
          <label htmlFor={`apikey-${p.id}`} className="settings-field-label">
            {p.label}
          </label>
          <input
            id={`apikey-${p.id}`}
            type="password"
            value={keys[p.id]}
            onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
            placeholder={t(p.placeholderKey)}
            disabled={!aiEnabled}
            className="settings-key-input"
          />
        </div>
      ))}

      {/* ── Footer row: privacy (left) + save (right) on desktop; save then privacy on mobile ── */}
      <div className="settings-footer-row">
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="settings-privacy-btn"
        >
          <Info size={14} aria-hidden="true" />
          {t('settings.privacy_button')}
        </button>
        <button onClick={handleSave} className="btn-accent settings-save-btn">
          {saved
            ? <><Check size={14} strokeWidth={2.5} aria-hidden="true" className="inline-icon" />{t('settings.saved')}</>
            : t('settings.save')
          }
        </button>
      </div>

      {prefersReducedMotion && (
        <p className="settings-reduced-motion-note">
          {t('settings.reduced_motion_note')}
        </p>
      )}

      <BottomSheet
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        label={t('settings.privacy_heading')}
      >
        <h3 className="settings-modal-subhead">{t('settings.privacy_subhead_storage')}</h3>
        <p>{t('settings.privacy_body_1')}</p>
        <p>{t('settings.privacy_body_2')}</p>
        <h3 className="settings-modal-subhead">{t('settings.privacy_subhead_translations')}</h3>
        <p>{t('settings.privacy_body_translations')}</p>
      </BottomSheet>

      <Modal
        open={rhgPending}
        onClose={() => setRhgPending(false)}
        heading="Rohingya (Ruáingga)"
        actions={[
          { label: 'Cancel',     onClick: () => setRhgPending(false),                                       className: 'btn-ghost' },
          { label: 'Use anyway', onClick: () => { onLanguageChange('rhg'); setRhgPending(false) }, className: 'btn-accent' },
        ]}
      >
        <p>This translation was AI-generated and has not been reviewed by native Rohingya speakers.</p>
        <p>The Rohingya people have endured genocide and forced displacement. Please use this translation with care, and consider contributing corrections if you are able.</p>
      </Modal>
    </div>
  )
}

function RadioChip({ name, value, label, current, onChange }) {
  const isActive = current === value
  return (
    <label className={`radio-chip${isActive ? ' radio-chip--active' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="radio-chip__input"
      />
      <span className="radio-chip__indicator" aria-hidden="true" />
      {label}
    </label>
  )
}

function Toggle({ id, checked, onChange }) {
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onChange(e) } }}
        className="toggle__input"
      />
      <span aria-hidden="true" className="toggle__track">
        <span className="toggle__thumb">
          {checked
            ? <span className="toggle__check" />
            : <span className="toggle__ring" />
          }
        </span>
      </span>
    </span>
  )
}
