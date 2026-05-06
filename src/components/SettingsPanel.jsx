import { useState, useEffect, useRef } from 'react'
import { Check, Info, PinOff, Star, ArchiveRestore, AlertTriangle, Save } from 'lucide-react'
import { useFocusOnMount, usePageTitle, Modal, BottomSheet, useRouter } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import Toggle from './ui/Toggle.jsx'
import RadioChip from './ui/RadioChip.jsx'
import Select from './ui/Select.jsx'
import PanelShell from './ui/PanelShell.jsx'
import Button from './ui/Button.jsx'
import { PROVIDERS, PROVIDER_MODELS, MODEL_DEFAULTS, initModels } from '../utils/aiModels.js'

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
  wcagFilter, onWcagFilterChange,
  partyUnlocked,
  onUnlock,
  onClose,
  onReset,
  hasPins,
  onClearPins,
  hasStarred,
  onClearStarred,
  hasArchived,
  onClearArchived,
}) {
  const headingRef = useFocusOnMount()
  const saveButtonRef = useRef(null)
  const privacyButtonRef = useRef(null)
  const resetButtonRef = useRef(null)
  const t = useT()
  usePageTitle(t('settings.heading'))
  const { navigate, route } = useRouter()
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const settingsPanelRef = useRef(null)
  const [errors, setErrors] = useState({})

  const [keys, setKeys] = useState(() =>
    // Electron: keys live in safeStorage, loaded async in the useEffect below
    Object.fromEntries(PROVIDERS.map(p => [p.id, window.electronAPI ? '' : localStorage.getItem(`apikey_${p.id}`) || '']))
  )
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
  const [savedKeys, setSavedKeys] = useState(() =>
    Object.fromEntries(PROVIDERS.map(p => [p.id, window.electronAPI ? '' : localStorage.getItem(`apikey_${p.id}`) || '']))
  )
  const [savedProvider, setSavedProvider] = useState(
    () => localStorage.getItem('ai_provider') || 'anthropic'
  )
  const [models, setModels] = useState(initModels)
  const [savedModels, setSavedModels] = useState(initModels)
  const [savedPlatform, setSavedPlatform] = useState(platform)
  const [savedLiveSearch, setSavedLiveSearch] = useState(liveSearch)
  const [savedShowVoting, setSavedShowVoting] = useState(showVoting)
  const [savedAiEnabled, setSavedAiEnabled] = useState(aiEnabled)
  const [agenticMode, setAgenticMode] = useState(
    () => localStorage.getItem('agentic_mode') === 'true'
  )
  const [savedAgenticMode, setSavedAgenticMode] = useState(
    () => localStorage.getItem('agentic_mode') === 'true'
  )
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [noChangesOpen, setNoChangesOpen] = useState(false)
  const [unpinAllDone, setUnpinAllDone] = useState(false)
  const [unstarAllDone, setUnstarAllDone] = useState(false)
  const [unarchiveAllDone, setUnarchiveAllDone] = useState(false)
  const hasUnsaved = activeProvider !== savedProvider ||
    PROVIDERS.some(p => keys[p.id] !== savedKeys[p.id] || models[p.id] !== savedModels[p.id]) ||
    platform !== savedPlatform ||
    liveSearch !== savedLiveSearch ||
    showVoting !== savedShowVoting ||
    aiEnabled !== savedAiEnabled ||
    agenticMode !== savedAgenticMode ||
    (pendingLanguage !== '' && pendingLanguage !== savedLanguage)
  const didMountLang = useRef(false)

  // In Electron, load API keys from safeStorage after mount
  useEffect(() => {
    if (!window.electronAPI) return
    Promise.all(PROVIDERS.map(async p => [p.id, (await window.electronAPI.keys.get(`apikey_${p.id}`)) || '']))
      .then(entries => {
        const loaded = Object.fromEntries(entries)
        setKeys(loaded)
        setSavedKeys(loaded)
      })
  }, [])

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

  // Escape key, Drawer also listens on mobile; harmless double-fire
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
      onToggleAi() // revert toggle, no key means AI cannot work
      return
    }
    if (!hasUnsaved) {
      setNoChangesOpen(true)
      return
    }
    setErrors({})
    onUnlock?.()
    PROVIDERS.forEach(p => {
      if (window.electronAPI) {
        if (keys[p.id]) window.electronAPI.keys.set(`apikey_${p.id}`, keys[p.id])
        else window.electronAPI.keys.delete(`apikey_${p.id}`)
      } else {
        if (keys[p.id]) localStorage.setItem(`apikey_${p.id}`, keys[p.id])
        else localStorage.removeItem(`apikey_${p.id}`)
      }
    })
    localStorage.setItem('ai_provider', activeProvider)
    PROVIDERS.forEach(p => {
      if (models[p.id]) localStorage.setItem(`ai_model_${p.id}`, models[p.id])
    })
    setSavedKeys({ ...keys })
    setSavedModels({ ...models })
    setSavedProvider(activeProvider)
    setSavedPlatform(platform)
    setSavedLiveSearch(liveSearch)
    setSavedShowVoting(showVoting)
    setSavedAiEnabled(aiEnabled)
    localStorage.setItem('agentic_mode', agenticMode.toString())
    setSavedAgenticMode(agenticMode)
    if (pendingLanguage !== '') {
      setSavedLanguage(pendingLanguage)
      if (pendingLanguage !== language) onLanguageChange(pendingLanguage)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    announce(t('settings.saved_announce'))
  }

  const guardedClose = () => { if (hasUnsaved) { setUnsavedOpen(true) } else { onClose() } }

  return (
    <PanelShell
      ref={settingsPanelRef}
      panelClassName="settings-panel"
      headerClassName="settings-header"
      titleClassName="settings-title"
      heading={t('settings.heading')}
      headingRef={headingRef}
      onClose={guardedClose}
      closeAriaLabel={t('settings.back')}
    >

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
        <h3 className="settings-group__label">{t('settings.language_label')}</h3>
        {(() => {
          const entry = LANGUAGES.find(l => l.value === language)
          const label = entry
            ? (language?.startsWith('en') && entry.en ? `${entry.label} (${entry.en})` : entry.label)
            : LANGUAGES.find(l => l.value === language?.split('-')[0])?.label ?? language
          return <p className="settings-group__desc">{t('settings.language_current_is', { label })}</p>
        })()}
        <p className="settings-group__desc">{t('settings.language_desc')}</p>
        <div className="settings-language-row">
          <Select
            value={pendingLanguage}
            onChange={e => setPendingLanguage(e.target.value)}
            wrapClass="settings-select-wrap--language"
            aria-label={t('settings.language_aria')}
          >
            <option value="">{t('settings.language_select_one')}</option>
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {language?.startsWith('en') && lang.en ? `${lang.label} (${lang.en})` : lang.label}
              </option>
            ))}
          </Select>
          <Button
            variant="primary"
            active={changedLanguage}
            activeIcon={<Check size={14} aria-hidden="true" />}
            className="settings-language-change-btn"
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
              ? t('settings.language_changed')
              : t('settings.language_change')
            }
          </Button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">
        {t('settings.search_section')}
      </h3>

      {/* Platform */}
      <div className="settings-group">
        <h3 className="settings-group__label">{t('settings.platform_label')}</h3>
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
          <h3 className="settings-toggle-label">
            <label htmlFor="toggle-live-search">{t('settings.live_search_label')}</label>
          </h3>
          <p className="settings-toggle-desc">
            {liveSearch ? t('settings.live_search_on') : t('settings.live_search_off')}
          </p>
        </div>
        <Toggle id="toggle-live-search" checked={liveSearch} onChange={onToggleLiveSearch} />
      </div>

      {/* WCAG Version + Level Filter */}
      <div className="settings-group">
        <h3 className="settings-group__label">{t('settings.wcag_filter_label')}</h3>
        <p className="settings-group__desc">{t('settings.wcag_filter_desc')}</p>
        <div className="settings-wcag-filter-row">
          <fieldset className="settings-fieldset">
            <legend className="settings-radio-legend">{t('settings.wcag_filter_legend')}</legend>
            <div className="settings-radio-group">
              {[
                { value: '2.0', labelKey: 'settings.wcag_filter_20' },
                { value: '2.1', labelKey: 'settings.wcag_filter_21' },
                { value: '2.2', labelKey: 'settings.wcag_filter_22' },
              ].map(({ value, labelKey }) => (
                <label key={value} className="settings-checkbox-label">
                  <input
                    type="radio"
                    name="wcag-version"
                    value={value}
                    checked={(wcagFilter?.maxVersion ?? '2.2') === value}
                    onChange={() => onWcagFilterChange?.({ maxVersion: value, maxLevel: wcagFilter?.maxLevel ?? 'AA' })}
                    className="settings-checkbox"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="settings-fieldset">
            <legend className="settings-radio-legend">{t('settings.wcag_level_legend')}</legend>
            <div className="settings-radio-group">
              {[
                { value: 'A',  labelKey: 'settings.wcag_level_a'  },
                { value: 'AA', labelKey: 'settings.wcag_level_aa' },
              ].map(({ value, labelKey }) => (
                <label key={value} className="settings-checkbox-label">
                  <input
                    type="radio"
                    name="wcag-level"
                    value={value}
                    checked={(wcagFilter?.maxLevel ?? 'AA') === value}
                    onChange={() => onWcagFilterChange?.({ maxVersion: wcagFilter?.maxVersion ?? '2.2', maxLevel: value })}
                    className="settings-checkbox"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Result ranking */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">
            <label htmlFor="toggle-ranking">{t('settings.ranking_label')}</label>
          </h3>
          <p className="settings-toggle-desc">
            {showVoting ? t('settings.ranking_on') : t('settings.ranking_off')}
          </p>
        </div>
        <Toggle id="toggle-ranking" checked={showVoting} onChange={onToggleVoting} />
      </div>

      {/* Pinned Results */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">{t('settings.pinned_results_label')}</h3>
          <p className="settings-toggle-desc">
            {hasPins ? t('settings.pinned_results_desc') : t('settings.pinned_results_empty')}
          </p>
        </div>
        <Button
          active={unpinAllDone}
          icon={<PinOff size={14} aria-hidden="true" />}
          activeIcon={<Check size={14} aria-hidden="true" />}
          label={t('settings.unpin_all')}
          activeLabel={t('settings.unpin_all_done')}
          variant="primary"
          className="settings-unpin-all-btn"
          disabled={!hasPins}
          onClick={() => {
            onClearPins?.()
            setUnpinAllDone(true)
            setTimeout(() => setUnpinAllDone(false), 1500)
          }}
        >
          {unpinAllDone ? t('settings.unpin_all_done') : t('settings.unpin_all')}
        </Button>
      </div>

      {/* Starred Results */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">{t('settings.starred_results_label')}</h3>
          <p className="settings-toggle-desc">
            {hasStarred ? t('settings.starred_results_desc') : t('settings.starred_results_empty')}
          </p>
        </div>
        <Button
          active={unstarAllDone}
          icon={<Star size={14} aria-hidden="true" />}
          activeIcon={<Check size={14} aria-hidden="true" />}
          label={t('settings.unstar_all')}
          activeLabel={t('settings.unstar_all_done')}
          variant="primary"
          className="settings-unstar-all-btn"
          disabled={!hasStarred}
          onClick={() => {
            onClearStarred?.()
            setUnstarAllDone(true)
            setTimeout(() => setUnstarAllDone(false), 1500)
          }}
        >
          {unstarAllDone ? t('settings.unstar_all_done') : t('settings.unstar_all')}
        </Button>
      </div>

      {/* Archived Results */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">{t('settings.archived_results_label')}</h3>
          <p className="settings-toggle-desc">
            {hasArchived ? t('settings.archived_results_desc') : t('settings.archived_results_empty')}
          </p>
        </div>
        <Button
          active={unarchiveAllDone}
          icon={<ArchiveRestore size={14} aria-hidden="true" />}
          activeIcon={<Check size={14} aria-hidden="true" />}
          label={t('settings.unarchive_all')}
          activeLabel={t('settings.unarchive_all_done')}
          variant="primary"
          className="settings-unarchive-all-btn"
          disabled={!hasArchived}
          onClick={() => {
            onClearArchived?.()
            setUnarchiveAllDone(true)
            setTimeout(() => setUnarchiveAllDone(false), 1500)
          }}
        >
          {unarchiveAllDone ? t('settings.unarchive_all_done') : t('settings.unarchive_all')}
        </Button>
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
        <Select
          id="active-provider"
          value={activeProvider}
          onChange={e => setActiveProvider(e.target.value)}
          disabled={!aiEnabled}
        >
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </Select>
      </div>

      {PROVIDER_MODELS[activeProvider].length > 0 && (
        <div className="settings-provider-group">
          <label htmlFor="active-model" className="settings-field-label">
            {t('settings.model_label')}
          </label>
          <Select
            id="active-model"
            value={models[activeProvider]}
            onChange={e => setModels(prev => ({ ...prev, [activeProvider]: e.target.value }))}
            disabled={!aiEnabled}
          >
            {PROVIDER_MODELS[activeProvider].map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </Select>
        </div>
      )}

      {PROVIDERS.filter(p => p.id === activeProvider).map(p => (
        <div key={p.id} className="settings-key-group">
          <label htmlFor={`apikey-${p.id}`} className="settings-field-label">
            {t('settings.api_key_label_prefix')}, {p.label}
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

      {aiEnabled && activeProvider === 'anthropic' && (
        <div className="settings-toggle-row settings-toggle-row--sm">
          <div>
            <label htmlFor="toggle-agentic" className="settings-toggle-label">
              {t('settings.agentic_mode_label') || 'Match Existing Style (Agentic AI)'}
            </label>
            <p className="settings-toggle-desc">{t('settings.agentic_mode_desc') || 'AI will search past examples to match your style and technical depth when rewriting'}</p>
          </div>
          <Toggle id="toggle-agentic" checked={agenticMode} onChange={setAgenticMode} />
        </div>
      )}

      {/* ── Footer: privacy link above buttons on mobile; privacy left / buttons right on desktop ── */}
      <div className="settings-footer-row">
        <Button
          ref={privacyButtonRef}
          variant="tertiary"
          icon={<Info size={14} aria-hidden="true" />}
          className="settings-privacy-btn"
          onClick={() => navigate('/settings/privacy')}
        >
          {t('settings.privacy_button')}
        </Button>
        <div className="settings-footer-actions">
          <Button
            ref={resetButtonRef}
            variant="warning"
            className="settings-reset-btn"
            onClick={() => setResetConfirmOpen(true)}
          >
            {t('settings.reset_all')}
          </Button>
          <Button
            ref={saveButtonRef}
            active={saved}
            icon={<Save size={14} aria-hidden="true" />}
            activeIcon={<Check size={14} strokeWidth={2.5} aria-hidden="true" />}
            label={t('settings.save')}
            activeLabel={t('settings.saved')}
            variant="primary"
            className="settings-save-btn"
            onClick={handleSave}
          >
            {saved ? t('settings.saved') : t('settings.save')}
          </Button>
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
        returnFocusRef={privacyButtonRef}
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
          { label: 'Use anyway', onClick: () => { onLanguageChange(pendingLanguage); setRhgPending(false) }, className: 'btn--primary' },
          { label: 'Cancel',     onClick: () => setRhgPending(false),                              className: 'btn--tertiary'  },
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
            className: 'btn--primary',
          },
          {
            label: t('settings.unsaved_discard'),
            onClick: () => { setUnsavedOpen(false); onClose() },
            className: 'btn--secondary',
          },
          {
            label: t('settings.unsaved_cancel'),
            onClick: () => setUnsavedOpen(false),
            className: 'btn--tertiary',
          },
        ]}
      >
        <p>{t('settings.unsaved_body')}</p>
      </Modal>

      <BottomSheet
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        label={t('settings.confirm_reset_all_heading')}
        closeLabel={t('common.close')}
        hideCloseBottom={true}
      >
        <div className="settings-reset-sheet">
          <h2 className="sheet-heading">{t('settings.confirm_reset_all_heading')}</h2>

          <div className="settings-reset-warning">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>{t('settings.confirm_reset_all_intro')}</p>
          </div>

          <div className="settings-reset-section">
            <h3>{t('settings.confirm_reset_all_will_clear')}</h3>
            <ul className="settings-reset-list">
              <li>{t('settings.confirm_reset_all_item_api_keys')}</li>
              <li>{t('settings.confirm_reset_all_item_ratings')}</li>
              <li>{t('settings.confirm_reset_all_item_pins')}</li>
              <li>{t('settings.confirm_reset_all_item_frequency')}</li>
              <li>{t('settings.confirm_reset_all_item_recent')}</li>
            </ul>
          </div>

          <div className="settings-reset-section">
            <h3>{t('settings.confirm_reset_all_will_keep')}</h3>
            <ul className="settings-reset-list">
              <li>{t('settings.confirm_reset_all_keep_item_theme')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_language')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_platform')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_ai_enabled')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_live_search')}</li>
            </ul>
          </div>

          <div className="settings-reset-actions">
            <Button
              variant="primary"
              onClick={() => {
                setResetConfirmOpen(false)
                setSavedKeys(Object.fromEntries(PROVIDERS.map(p => [p.id, ''])))
                setSavedProvider('anthropic')
                setSavedModels(Object.fromEntries(PROVIDERS.map(p => [p.id, MODEL_DEFAULTS[p.id] || ''])))
                setSavedPlatform('web')
                setSavedLiveSearch(true)
                setSavedShowVoting(true)
                setSavedAiEnabled(false)
                onReset?.()
                announce(t('settings.reset_all_announce'))
                resetButtonRef.current?.setAttribute('disabled', '')
                saveButtonRef.current?.focus()
              }}
            >
              {t('settings.confirm_reset_all_yes')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setResetConfirmOpen(false); announce(t('settings.preserved_announce')) }}
            >
              {t('settings.confirm_reset_all_no')}
            </Button>
          </div>
        </div>
      </BottomSheet>

      <Modal
        open={noChangesOpen}
        onClose={() => setNoChangesOpen(false)}
        returnFocusRef={saveButtonRef}
        heading={t('settings.no_changes_heading')}
      >
        <p>{t('settings.no_changes_body')}</p>
      </Modal>
    </PanelShell>
  )
}

