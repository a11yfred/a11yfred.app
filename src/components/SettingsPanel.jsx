import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Check, Info } from 'lucide-react'
import { useFocusOnMount, usePageTitle, Modal, BottomSheet, useDir, useRouter } from '../plugins/router/index.js'
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
  showVoting, onToggleVoting,
  theme, onThemeChange,
  language, onLanguageChange,
  platform, onPlatformChange,
  partyUnlocked,
  onUnlock,
  onClose,
  onReset,
}) {
  const headingRef = useFocusOnMount()
  const t = useT()
  usePageTitle(t('settings.heading'))
  const dir = useDir()
  const { navigate, route } = useRouter()
  const BackChevron = dir === 'rtl' ? ChevronRight : ChevronLeft
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const settingsPanelRef = useRef(null)
  const [errors, setErrors] = useState({})

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
  const privacyOpen = route === '/settings/privacy'
  const [rhgPending, setRhgPending] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [pendingLanguage, setPendingLanguage] = useState('')
  const [savedLanguage, setSavedLanguage] = useState(language)
  const [changedLanguage, setChangedLanguage] = useState(false)
  const [savedKeys, setSavedKeys] = useState(() => {
    const saved = {}
    PROVIDERS.forEach(p => {
      saved[p.id] = localStorage.getItem(`apikey_${p.id}`) || ''
    })
    return saved
  })
  const [savedProvider, setSavedProvider] = useState(
    () => localStorage.getItem('ai_provider') || 'anthropic'
  )
  const [savedPlatform, setSavedPlatform] = useState(platform)
  const [savedLiveSearch, setSavedLiveSearch] = useState(liveSearch)
  const [savedShowVoting, setSavedShowVoting] = useState(showVoting)
  const [savedAiEnabled, setSavedAiEnabled] = useState(aiEnabled)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [noChangesOpen, setNoChangesOpen] = useState(false)
  const hasUnsaved = activeProvider !== savedProvider ||
    PROVIDERS.some(p => keys[p.id] !== savedKeys[p.id]) ||
    platform !== savedPlatform ||
    liveSearch !== savedLiveSearch ||
    showVoting !== savedShowVoting ||
    aiEnabled !== savedAiEnabled ||
    (pendingLanguage !== '' && pendingLanguage !== savedLanguage)
  const didMountLang = useRef(false)

  // Sync when language prop changes externally (e.g. Reset All)
  useEffect(() => {
    if (!didMountLang.current) { didMountLang.current = true; return }
    setPendingLanguage('')
    setSavedLanguage(language)
  }, [language])

  // Scroll to and focus the first invalid field when errors change
  useEffect(() => {
    if (!errors.apiKey) return
    const el = settingsPanelRef.current?.querySelector('[aria-invalid="true"]')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    el.focus({ preventScroll: true })
  }, [errors])

  // Escape key — Drawer also listens on mobile; harmless double-fire
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return
      if (unsavedOpen) return
      if (hasUnsaved) { setUnsavedOpen(true) } else { onClose() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, hasUnsaved, unsavedOpen])

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  const handleSave = () => {
    if (aiEnabled && !keys[activeProvider].trim() && !isLocalhost) {
      setErrors({ apiKey: true })
      onToggleAi() // revert toggle — no key means AI can't work
      return
    }
    if (!hasUnsaved) {
      setNoChangesOpen(true)
      return
    }
    setErrors({})
    onUnlock?.()
    PROVIDERS.forEach(p => {
      if (keys[p.id]) {
        localStorage.setItem(`apikey_${p.id}`, keys[p.id])
      } else {
        localStorage.removeItem(`apikey_${p.id}`)
      }
    })
    localStorage.setItem('ai_provider', activeProvider)
    setSavedKeys({ ...keys })
    setSavedProvider(activeProvider)
    setSavedPlatform(platform)
    setSavedLiveSearch(liveSearch)
    setSavedShowVoting(showVoting)
    setSavedAiEnabled(aiEnabled)
    if (pendingLanguage !== '') {
      setSavedLanguage(pendingLanguage)
      if (pendingLanguage !== language) onLanguageChange(pendingLanguage)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    announce(t('settings.saved_announce'))
  }

  return (
    <div ref={settingsPanelRef}>
      <div className="settings-header">
        <button
          onClick={() => { if (hasUnsaved) { setUnsavedOpen(true) } else { onClose() } }}
          aria-label={t('settings.back')}
          className="btn-icon btn-icon-accent"
        >
          <BackChevron size={20} strokeWidth={2.5} aria-hidden="true" />
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
            { value: 'light', labelKey: 'settings.theme_light', announceKey: 'settings.theme_light_announce' },
            { value: 'auto',  labelKey: 'settings.theme_auto',  announceKey: 'settings.theme_auto_announce'  },
            { value: 'dark',  labelKey: 'settings.theme_dark',  announceKey: 'settings.theme_dark_announce'  },
            ...(partyUnlocked ? [{ value: 'party', labelKey: 'settings.theme_party', announceKey: 'settings.theme_party_announce' }] : []),
          ].map(({ value, labelKey, announceKey }) => (
            <RadioChip
              key={value}
              name="theme-setting"
              value={value}
              label={t(labelKey)}
              current={theme}
              onChange={(val) => { onThemeChange(val); announce(t(announceKey)) }}
            />
          ))}
        </div>
      </fieldset>

      {/* Language */}
      <div className="settings-group">
        <p className="settings-group__label">{t('settings.language_label')}</p>
        {(() => {
          const entry = LANGUAGES.find(l => l.value === language)
          const label = entry
            ? (language?.startsWith('en') && entry.en ? `${entry.label} (${entry.en})` : entry.label)
            : LANGUAGES.find(l => l.value === language?.split('-')[0])?.label ?? language
          return <p className="settings-group__desc">{t('settings.language_current_is', { label })}</p>
        })()}
        <p className="settings-group__desc">{t('settings.language_desc')}</p>
        <div className="settings-language-row">
          <div className="settings-select-wrap settings-select-wrap--language">
            <select
              value={pendingLanguage}
              onChange={e => setPendingLanguage(e.target.value)}
              className="settings-select"
              aria-label={t('settings.language_aria')}
            >
              <option value="">{t('settings.language_select_one')}</option>
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {language?.startsWith('en') && lang.en ? `${lang.label} (${lang.en})` : lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
          </div>
          <button
            type="button"
            className={`btn-accent settings-language-change-btn${changedLanguage ? ' field-btn--success' : ''}`}
            disabled={!pendingLanguage}
            onClick={() => {
              if (pendingLanguage === 'rhg') { setRhgPending(true) }
              else {
                onLanguageChange(pendingLanguage)
                setChangedLanguage(true)
                setTimeout(() => setChangedLanguage(false), 1500)
                announce(t('settings.language_changed_announce'))
              }
            }}
          >
            {changedLanguage
              ? <><Check size={14} aria-hidden="true" />{' '}{t('settings.language_changed')}</>
              : t('settings.language_change')
            }
          </button>
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

      {/* Result voting */}
      <div className="settings-toggle-row">
        <div>
          <label htmlFor="toggle-voting" className="settings-toggle-label">
            {t('settings.voting_label')}
          </label>
          <p className="settings-toggle-desc">
            {showVoting ? t('settings.voting_on') : t('settings.voting_off')}
          </p>
        </div>
        <Toggle id="toggle-voting" checked={showVoting} onChange={onToggleVoting} />
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
            {t('settings.api_key_label_prefix')} — {p.label}
            {aiEnabled && <span className="settings-field-required"> {t('settings.api_key_required')}</span>}
          </label>
          <textarea
            id={`apikey-${p.id}`}
            autoComplete="off"
            value={keys[p.id]}
            onChange={e => {
              setKeys(prev => ({ ...prev, [p.id]: e.target.value }))
              if (errors.apiKey) setErrors({})
            }}
            placeholder={t(p.placeholderKey)}
            disabled={!aiEnabled}
            className="settings-key-input"
            aria-invalid={errors.apiKey && aiEnabled ? 'true' : undefined}
            aria-describedby={errors.apiKey && aiEnabled ? 'api-key-error' : undefined}
          />
          {errors.apiKey && aiEnabled && (
            <p id="api-key-error" className="settings-field-error">
              {t('settings.api_key_error')}
            </p>
          )}
        </div>
      ))}

      {/* ── Footer: privacy link above buttons on mobile; privacy left / buttons right on desktop ── */}
      <div className="settings-footer-row">
        <button
          type="button"
          onClick={() => navigate('/settings/privacy')}
          className="settings-privacy-btn"
        >
          <Info size={14} aria-hidden="true" style={{ flexShrink: 0 }} />
          {t('settings.privacy_button')}
        </button>
        <div className="settings-footer-actions">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="btn-secondary settings-reset-btn"
          >
            {t('settings.reset_all')}
          </button>
          <button onClick={handleSave} className={`btn-accent settings-save-btn${saved ? ' field-btn--success' : ''}`}>
            {saved
              ? <><Check size={14} strokeWidth={2.5} aria-hidden="true" className="inline-icon" />{t('settings.saved')}</>
              : t('settings.save')
            }
          </button>
        </div>
      </div>

      {prefersReducedMotion && (
        <p className="settings-reduced-motion-note">
          {t('settings.reduced_motion_note')}
        </p>
      )}

      <BottomSheet
        open={privacyOpen}
        onClose={() => navigate('/settings')}
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

      <Modal
        open={rhgPending}
        onClose={() => setRhgPending(false)}
        heading="Rohingya (Ruáingga)"
        actions={[
          { label: 'Use anyway', onClick: () => { onLanguageChange(pendingLanguage); setRhgPending(false) }, className: 'btn-accent' },
          { label: 'Cancel',     onClick: () => setRhgPending(false),                              className: 'btn-tertiary'  },
        ]}
      >
        <p>This translation was AI-generated and has not been reviewed by native Rohingya speakers.</p>
        <p>The Rohingya people have endured genocide and forced displacement. Please use this translation with care, and consider contributing corrections if you are able.</p>
      </Modal>

      <Modal
        open={unsavedOpen}
        onClose={() => setUnsavedOpen(false)}
        heading={t('settings.unsaved_heading')}
        actions={[
          {
            label: t('settings.unsaved_save_close'),
            onClick: () => { handleSave(); setUnsavedOpen(false); onClose() },
            className: 'btn-accent',
          },
          {
            label: t('settings.unsaved_discard'),
            onClick: () => { setUnsavedOpen(false); onClose() },
            className: 'btn-secondary',
          },
          {
            label: t('settings.unsaved_cancel'),
            onClick: () => setUnsavedOpen(false),
            className: 'btn-tertiary',
          },
        ]}
      >
        <p>{t('settings.unsaved_body')}</p>
      </Modal>

      <Modal
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        heading={t('settings.confirm_reset_all_heading')}
        actions={[
          {
            label: t('settings.confirm_reset_all_yes'),
            onClick: () => {
              setResetConfirmOpen(false)
              setSavedKeys(Object.fromEntries(PROVIDERS.map(p => [p.id, ''])))
              setSavedProvider('anthropic')
              setSavedPlatform('web')
              setSavedLiveSearch(true)
              setSavedShowVoting(true)
              setSavedAiEnabled(false)
              onReset?.()
            },
            className: 'btn-accent',
          },
          {
            label: t('settings.confirm_reset_all_no'),
            onClick: () => { setResetConfirmOpen(false); announce(t('settings.preserved_announce')) },
            className: 'btn-tertiary',
          },
        ]}
      >
        <p>{t('settings.confirm_reset_all_body')}</p>
      </Modal>

      <Modal
        open={noChangesOpen}
        onClose={() => setNoChangesOpen(false)}
        heading={t('settings.no_changes_heading')}
      >
        <p>{t('settings.no_changes_body')}</p>
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
        aria-label={label.replace(/\n/g, ' ')}
      />
      <span className="radio-chip__indicator" aria-hidden="true" role="presentation" />
      <span aria-hidden="true">
        {label.split('\n').flatMap((part, i) => i === 0 ? [part] : [<br key={i} />, part])}
      </span>
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
      <span aria-hidden="true" role="presentation" className="toggle__track">
        <span role="presentation" className="toggle__thumb">
          {checked
            ? <span role="presentation" className="toggle__check" />
            : <span role="presentation" className="toggle__ring" />
          }
        </span>
      </span>
    </span>
  )
}
