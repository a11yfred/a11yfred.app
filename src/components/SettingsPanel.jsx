import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Check, Info } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useMediaQuery, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholderKey: 'settings.api_placeholder_anthropic' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholderKey: 'settings.api_placeholder_openai'    },
  { id: 'google',    label: 'Google (Gemini)',      placeholderKey: 'settings.api_placeholder_google'    },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholderKey: 'settings.api_placeholder_default'   },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'sv', label: 'Svenska' },
  { value: 'zh', label: '中文（简体）' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'tl', label: 'Filipino (Tagalog)' },
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
            onChange={e => onLanguageChange(e.target.value)}
            className="settings-select"
            aria-label={t('settings.language_aria')}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
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

      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        heading={t('settings.privacy_heading')}
      >
        <p>{t('settings.privacy_body_1')}</p>
        <p>{t('settings.privacy_body_2')}</p>
        <p>{t('settings.privacy_body_translations')}</p>
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
