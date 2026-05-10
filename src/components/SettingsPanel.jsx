import { useState, useEffect, useRef, useImperativeHandle, useCallback, forwardRef } from 'react'
import { Check, Info, PinOff, Star, ArchiveRestore, AlertTriangle, Save, RotateCcw } from 'lucide-react'
import { Modal, BottomSheet, useRouter } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import Toggle from './ui/Toggle.jsx'
import RadioChip from './ui/RadioChip.jsx'
import Select from './ui/Select.jsx'
import Panel from './ui/Panel.jsx'
import Button from './ui/Button.jsx'
import { PROVIDERS, PROVIDER_MODELS, initModels } from '../utils/aiModels.js'

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

const SettingsPanel = forwardRef(function SettingsPanel({
  aiEnabled,
  liveSearch,
  showVoting,
  theme,
  language,
  platform,
  wcagFilter,
  partyUnlocked,
  onUnlock,
  onClose,
  onSave,
  onReset,
  hasPins,
  onClearPins,
  hasStarred,
  onClearStarred,
  hasArchived,
  onClearArchived,
  hasRankings,
  onResetRankings,
}, ref) {
  const saveButtonRef = useRef(null)
  const privacyButtonRef = useRef(null)
  const resetButtonRef = useRef(null)
  const t = useT()
  const { navigate, route } = useRouter()
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const settingsPanelRef = useRef(null)
  const [errors, setErrors] = useState({})

  // ── Pending state for all settings ─────────────────────────────────────────
  const [pendingTheme, setPendingTheme] = useState(theme)
  const [pendingLanguage, setPendingLanguage] = useState(language)
  const [pendingPlatform, setPendingPlatform] = useState(platform)
  const [pendingLiveSearch, setPendingLiveSearch] = useState(liveSearch)
  const [pendingShowVoting, setPendingShowVoting] = useState(showVoting)
  const [pendingAiEnabled, setPendingAiEnabled] = useState(aiEnabled)
  const [pendingWcagFilter, setPendingWcagFilter] = useState(wcagFilter ?? { maxVersion: '2.2', maxLevel: 'AA' })
  const [pendingAgenticMode, setPendingAgenticMode] = useState(
    () => localStorage.getItem('agentic_mode') === 'true'
  )

  // ── AI provider / key / model state ────────────────────────────────────────
  const [keys, setKeys] = useState(() =>
    Object.fromEntries(PROVIDERS.map(p => [p.id, window.electronAPI ? '' : localStorage.getItem(`apikey_${p.id}`) || '']))
  )
  const [activeProvider, setActiveProvider] = useState(
    () => localStorage.getItem('ai_provider') || 'anthropic'
  )
  const [models, setModels] = useState(initModels)

  // Saved snapshots to diff against for hasUnsaved
  const [savedKeys] = useState(() =>
    Object.fromEntries(PROVIDERS.map(p => [p.id, window.electronAPI ? '' : localStorage.getItem(`apikey_${p.id}`) || '']))
  )
  const [savedProvider] = useState(() => localStorage.getItem('ai_provider') || 'anthropic')
  const [savedModels] = useState(initModels)

  const [saved, setSaved] = useState(false)
  const privacyOpen = route === '/settings/privacy'
  const [privacyCollapsed, setPrivacyCollapsed] = useState(false)
  const [rhgPending, setRhgPending] = useState(false)
  const [partyConfirmOpen, setPartyConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [noChangesOpen, setNoChangesOpen] = useState(false)
  const [unpinAllDone, setUnpinAllDone] = useState(false)
  const [unstarAllDone, setUnstarAllDone] = useState(false)
  const [unarchiveAllDone, setUnarchiveAllDone] = useState(false)
  const [resetRankingsDone, setResetRankingsDone] = useState(false)
  const [languagePreviewed, setLanguagePreviewed] = useState(false)

  const hasUnsaved =
    pendingTheme !== theme ||
    pendingLanguage !== language ||
    pendingPlatform !== platform ||
    pendingLiveSearch !== liveSearch ||
    pendingShowVoting !== showVoting ||
    pendingAiEnabled !== aiEnabled ||
    pendingWcagFilter.maxVersion !== (wcagFilter?.maxVersion ?? '2.2') ||
    pendingWcagFilter.maxLevel !== (wcagFilter?.maxLevel ?? 'AA') ||
    pendingAgenticMode !== (localStorage.getItem('agentic_mode') === 'true') ||
    activeProvider !== savedProvider ||
    PROVIDERS.some(p => keys[p.id] !== savedKeys[p.id] || models[p.id] !== savedModels[p.id])

  // Announce whenever a setting changes and there are unsaved changes
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return }
    if (hasUnsaved) announce(t('settings.pending_save_note'))
  }, [pendingTheme, pendingLanguage, pendingPlatform, pendingLiveSearch, pendingShowVoting, pendingAiEnabled, pendingWcagFilter, pendingAgenticMode, activeProvider]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync pending state when props change externally (e.g. Reset All)
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return }
    setPendingTheme(theme)
    setPendingLanguage(language)
    setPendingPlatform(platform)
    setPendingLiveSearch(liveSearch)
    setPendingShowVoting(showVoting)
    setPendingAiEnabled(aiEnabled)
    setPendingWcagFilter(wcagFilter ?? { maxVersion: '2.2', maxLevel: 'AA' })
  }, [theme, language, platform, liveSearch, showVoting, aiEnabled, wcagFilter])

  // In Electron, load API keys from safeStorage after mount
  useEffect(() => {
    if (!window.electronAPI) return
    Promise.all(PROVIDERS.map(async p => [p.id, (await window.electronAPI.keys.get(`apikey_${p.id}`)) || '']))
      .then(entries => {
        const loaded = Object.fromEntries(entries)
        setKeys(loaded)
      })
  }, [])

  // Preview theme immediately (visual feedback), but only persists on Save
  useEffect(() => {
    const el = document.documentElement
    if (pendingTheme === 'party') {
      el.setAttribute('data-theme', 'party')
    } else {
      const resolved = pendingTheme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : pendingTheme
      el.setAttribute('data-theme', resolved)
    }
  }, [pendingTheme])

  // Revert theme preview if panel closes without saving
  useEffect(() => {
    return () => {
      // Restore the committed theme on unmount if there were unsaved changes
      const committed = theme
      if (committed === 'party') {
        document.documentElement.setAttribute('data-theme', 'party')
      } else {
        const resolved = committed === 'auto'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : committed
        document.documentElement.setAttribute('data-theme', resolved)
      }
    }
  }, [theme]) // only run on mount/unmount

  // Scroll to and focus the first invalid field when errors change
  useEffect(() => {
    if (!errors.apiKey) return
    const el = settingsPanelRef.current?.querySelector('[aria-invalid="true"]')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    el.focus({ preventScroll: true })
  }, [errors])

  // Escape key -- Drawer also listens on mobile; harmless double-fire
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
    if (pendingAiEnabled && !keys[activeProvider].trim() && !isLocalhost) {
      setErrors({ apiKey: true })
      setPendingAiEnabled(false)
      return
    }
    if (!hasUnsaved) {
      setNoChangesOpen(true)
      return
    }
    setErrors({})
    onUnlock?.()

    // Persist AI keys
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
    localStorage.setItem('agentic_mode', pendingAgenticMode.toString())

    const langToSave = rhgPending ? language : pendingLanguage

    onSave({
      theme: pendingTheme,
      language: langToSave,
      platform: pendingPlatform,
      liveSearch: pendingLiveSearch,
      showVoting: pendingShowVoting,
      aiEnabled: pendingAiEnabled,
      wcagFilter: pendingWcagFilter,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const guardedClose = useCallback(
    () => { if (hasUnsaved) { setUnsavedOpen(true) } else { onClose() } },
    [hasUnsaved, onClose]
  )

  useImperativeHandle(ref, () => ({ guardedClose }), [guardedClose])

  const savedLanguageLabel = (() => {
    const entry = LANGUAGES.find(l => l.value === language)
    if (!entry) return LANGUAGES.find(l => l.value === language?.split('-')[0])?.label ?? language
    return language?.startsWith('en') && entry.en ? `${entry.label} (${entry.en})` : entry.label
  })()

  return (
    <Panel
      ref={settingsPanelRef}
      className="settings-panel"
      heading={t('settings.heading')}
      onClose={guardedClose}
      closeAriaLabel={t('settings.back')}
      pageTitle={t('settings.heading')}
    >

      <p className="settings-panel-intro">Most settings require the <strong>Save</strong> button to take effect. <strong>Pinned</strong>, <strong>Starred</strong>, <strong>Ranking</strong>, and <strong>Archived</strong> changes apply immediately.</p>

      {/* ── Appearance ──────────────────────────────── */}
      <h3 className="settings-section-heading">{t('settings.appearance')}</h3>

      {/* Theme */}
      {pendingTheme !== theme && (
        <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
      )}
      <fieldset className="settings-fieldset">
        <legend className="sr-only">{t('settings.appearance')}</legend>
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
              current={pendingTheme}
              onChange={(val) => {
                if (val === 'party') { setPartyConfirmOpen(true); return }
                setPendingTheme(val); announce(t(announceKey))
              }}
            />
          ))}
        </div>
      </fieldset>

      {/* Language */}
      <div className="settings-group">
        <h3 className="settings-group__label">{t('settings.language_label')}</h3>
        <p className="settings-group__desc">The current language is <strong>{savedLanguageLabel}</strong>.</p>
        <p className="settings-group__desc">Select a language and press <strong>Save</strong> at the bottom of this panel to apply it.</p>
        <div className="settings-language-row">
          <Select
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
          </Select>
          <Button
            variant="primary"
            active={languagePreviewed}
            activeIcon={<Check size={14} aria-hidden="true" />}
            className="settings-language-change-btn"
            disabled={!pendingLanguage || pendingLanguage === language}
            onClick={() => {
              if (pendingLanguage === 'rhg') { setRhgPending(true) }
              else {
                setLanguagePreviewed(true)
                setTimeout(() => setLanguagePreviewed(false), 1500)
                announce(t('settings.language_changed_announce'))
              }
            }}
          >
            {languagePreviewed ? t('settings.language_changed') : t('settings.language_change')}
          </Button>
        </div>
        {pendingLanguage !== language && (
          <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
        )}
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">
        {t('settings.search_section')}
      </h3>

      {/* Platform */}
      <div className="settings-group">
        <h3 className="settings-group__label">{t('settings.platform_label')}</h3>
        <p className="settings-group__desc">
          {pendingPlatform === 'all'
            ? <>Show <strong>all results</strong> across web, native apps, and documents.</>
            : pendingPlatform === 'web'
              ? <>Show <strong>web-oriented</strong> results.</>
              : pendingPlatform === 'native'
                ? <>Show <strong>native app-oriented</strong> results.</>
                : <>Show <strong>document-oriented</strong> results.</>}
        </p>
        {pendingPlatform !== platform && (
          <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
        )}
        <fieldset className="settings-fieldset">
          <legend className="sr-only">{t('settings.platform_label')}</legend>
          <div className="radio-chip-group">
            {[
              { value: 'all',      labelKey: 'settings.platform_all',      announceKey: 'settings.platform_all_announce'      },
              { value: 'web',      labelKey: 'settings.platform_web',      announceKey: 'settings.platform_web_announce'      },
              { value: 'native',   labelKey: 'settings.platform_native',   announceKey: 'settings.platform_native_announce'   },
              { value: 'document', labelKey: 'settings.platform_document', announceKey: 'settings.platform_document_announce' },
            ].map(({ value, labelKey, announceKey }) => (
              <RadioChip
                key={value}
                name="platform-setting"
                value={value}
                label={t(labelKey)}
                current={pendingPlatform}
                onChange={(val) => {
                  setPendingPlatform(val)
                  announce(t(announceKey))
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
            {pendingLiveSearch ? <>Results appear <strong>as you type</strong>.</> : <>Results appear on <strong>Search</strong> button press or <strong>Enter</strong> key.</>}
          </p>
          {pendingLiveSearch !== liveSearch && (
            <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
          )}
        </div>
        <Toggle id="toggle-live-search" checked={pendingLiveSearch} onChange={() => setPendingLiveSearch(v => !v)} />
      </div>

      {/* WCAG Version + Level Filter */}
      <div className="settings-group">
        <h3 className="settings-group__label">{t('settings.wcag_filter_label')}</h3>
        <p className="settings-group__desc">Filter findings by <strong>WCAG Version</strong> and <strong>Conformance Level</strong>. Each version includes all findings from previous versions.</p>
        {(pendingWcagFilter.maxVersion !== (wcagFilter?.maxVersion ?? '2.2') ||
          pendingWcagFilter.maxLevel !== (wcagFilter?.maxLevel ?? 'AA')) && (
          <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
        )}
        <div className="settings-wcag-filter-row">
          <fieldset className="settings-fieldset">
            <legend className="settings-radio-legend">{t('settings.wcag_filter_legend')}</legend>
            <div className="settings-radio-group">
              {[
                { value: '2.0', labelKey: 'settings.wcag_filter_20' },
                { value: '2.1', labelKey: 'settings.wcag_filter_21' },
                { value: '2.2', labelKey: 'settings.wcag_filter_22' },
              ].map(({ value, labelKey }) => (
                <label key={value} className="control__label">
                  <input
                    type="radio"
                    name="wcag-version"
                    value={value}
                    checked={(pendingWcagFilter?.maxVersion ?? '2.2') === value}
                    onChange={() => setPendingWcagFilter(f => ({ ...f, maxVersion: value }))}
                    className="control"
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
                <label key={value} className="control__label">
                  <input
                    type="radio"
                    name="wcag-level"
                    value={value}
                    checked={(pendingWcagFilter?.maxLevel ?? 'AA') === value}
                    onChange={() => setPendingWcagFilter(f => ({ ...f, maxLevel: value }))}
                    className="control"
                  />
                  {t(labelKey)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
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

      {/* Result ranking */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">
            <label htmlFor="toggle-ranking">{t('settings.ranking_label')}</label>
          </h3>
          <p className="settings-toggle-desc">
            {pendingShowVoting
              ? <>Ranking controls <strong>are visible on each result</strong>.</>
              : <>Ranking controls <strong>are hidden</strong>.</>}
          </p>
          {pendingShowVoting !== showVoting && (
            <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
          )}
        </div>
        <Toggle id="toggle-ranking" checked={pendingShowVoting} onChange={() => setPendingShowVoting(v => !v)} />
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
            announce(t('settings.unstar_all_done'))
            setTimeout(() => setUnstarAllDone(false), 1500)
          }}
        >
          {unstarAllDone ? t('settings.unstar_all_done') : t('settings.unstar_all')}
        </Button>
      </div>

      {/* Ranking Data */}
      <div className="settings-toggle-row">
        <div>
          <h3 className="settings-toggle-label">{t('settings.rankings_label')}</h3>
          <p className="settings-toggle-desc">
            {hasRankings ? t('settings.rankings_desc') : t('settings.rankings_empty')}
          </p>
        </div>
        <Button
          active={resetRankingsDone}
          icon={<RotateCcw size={14} aria-hidden="true" />}
          activeIcon={<Check size={14} aria-hidden="true" />}
          label={t('settings.reset_rankings')}
          activeLabel={t('settings.reset_rankings_done')}
          variant="primary"
          className="settings-reset-rankings-btn"
          disabled={!hasRankings}
          onClick={() => {
            onResetRankings?.()
            setResetRankingsDone(true)
            announce(t('settings.reset_rankings_done'))
            setTimeout(() => setResetRankingsDone(false), 1500)
          }}
        >
          {resetRankingsDone ? t('settings.reset_rankings_done') : t('settings.reset_rankings')}
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
            announce(t('settings.unarchive_all_done'))
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
          <p className="settings-toggle-desc">Revises <strong>Descriptions</strong> and/or <strong>Suggested Fix</strong> based on your <strong>AI Instructions</strong>.</p>
          {pendingAiEnabled !== aiEnabled && (
            <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
          )}
        </div>
        <Toggle id="toggle-ai" checked={pendingAiEnabled} onChange={() => setPendingAiEnabled(v => !v)} />
      </div>

      <div className="settings-provider-group">
        <label htmlFor="active-provider" className="settings-field-label">
          {t('settings.provider_label')}
        </label>
        <Select
          id="active-provider"
          value={activeProvider}
          onChange={e => setActiveProvider(e.target.value)}
          disabled={!pendingAiEnabled}
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
            disabled={!pendingAiEnabled}
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
            {pendingAiEnabled && <span className="settings-field-required"> {t('settings.api_key_required')}</span>}
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
            disabled={!pendingAiEnabled}
            className="settings-key-input"
            aria-invalid={errors.apiKey && pendingAiEnabled ? 'true' : undefined}
            aria-describedby={errors.apiKey && pendingAiEnabled ? 'api-key-error' : undefined}
          />
          {errors.apiKey && pendingAiEnabled && (
            <p id="api-key-error" className="settings-field-error">
              {t('settings.api_key_error')}
            </p>
          )}
        </div>
      ))}

      <div className={`settings-toggle-row settings-toggle-row--sm${!pendingAiEnabled || activeProvider !== 'anthropic' ? ' settings-toggle-row--disabled' : ''}`}>
        <div>
          <label htmlFor="toggle-agentic" className="settings-toggle-label">
            {t('settings.agentic_mode_label') || 'Match Existing Style (Agentic AI)'}
          </label>
          <p className="settings-toggle-desc">Only available with <strong>Claude (Anthropic)</strong>. Searches past revision examples to write in your established tone and technical depth.</p>
          {pendingAgenticMode !== (localStorage.getItem('agentic_mode') === 'true') && (
            <p className="settings-pending-note">{t('settings.pending_save_note')}</p>
          )}
        </div>
        <Toggle id="toggle-agentic" checked={pendingAgenticMode} onChange={() => setPendingAgenticMode(v => !v)} disabled={!pendingAiEnabled || activeProvider !== 'anthropic'} />
      </div>

      {/* ── Footer ──────────────────────────────────── */}
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
        collapsed={privacyCollapsed}
        onCollapse={setPrivacyCollapsed}
        label={t('settings.privacy_heading')}
        heading={t('settings.privacy_heading')}
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
        heading={t('settings.language_rhg_heading')}
        actions={[
          { label: t('settings.language_rhg_use_anyway'), onClick: () => { setPendingLanguage('rhg'); setRhgPending(false) }, className: 'btn--primary' },
          { label: t('common.cancel'),                    onClick: () => setRhgPending(false),                                 className: 'btn--tertiary' },
        ]}
      >
        <p>{t('settings.language_rhg_body_1')}</p>
        <p>{t('settings.language_rhg_body_2')}</p>
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

          <div className="alert-banner alert-banner--warning">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>{t('settings.confirm_reset_all_intro')}</p>
          </div>

          <div className="settings-reset-section">
            <h3>{t('settings.confirm_reset_all_will_clear')}</h3>
            <ul className="settings-reset-list">
              <li>{t('settings.confirm_reset_all_item_api_keys')}</li>
              <li>{t('settings.confirm_reset_all_item_frequency')}</li>
              <li>{t('settings.confirm_reset_all_item_recent')}</li>
            </ul>
          </div>

          <div className="settings-reset-section">
            <h3>{t('settings.confirm_reset_all_will_reset')}</h3>
            <ul className="settings-reset-list">
              <li>{t('settings.confirm_reset_all_keep_item_theme')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_language')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_platform')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_live_search')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_wcag_filter')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_pins')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_ranking_controls')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_starred')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_ranking_data')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_archived')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_ai_enabled')}</li>
            </ul>
          </div>

          <div className="settings-reset-section">
            <h3>{t('settings.confirm_reset_all_will_keep')}</h3>
            <ul className="settings-reset-list">
              <li>{t('settings.confirm_reset_all_keep_item_corpus')}</li>
              <li>{t('settings.confirm_reset_all_keep_item_contributions')}</li>
            </ul>
          </div>

          <div className="settings-reset-actions">
            <Button
              variant="primary"
              onClick={() => {
                setResetConfirmOpen(false)
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

      <Modal
        open={partyConfirmOpen}
        onClose={() => setPartyConfirmOpen(false)}
        heading={t('settings.party_confirm_heading')}
        actions={[
          { label: t('settings.party_confirm_yes'), onClick: () => { setPendingTheme('party'); announce(t('settings.theme_party_announce')); setPartyConfirmOpen(false) }, className: 'btn--primary' },
          { label: t('settings.party_confirm_no'),  onClick: () => setPartyConfirmOpen(false), className: 'btn--tertiary' },
        ]}
      >
        <p>{t('settings.party_confirm_body')}</p>
      </Modal>
    </Panel>
  )
})

export default SettingsPanel
