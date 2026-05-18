import { useState, useEffect, useRef, useImperativeHandle, useCallback, forwardRef } from 'react'
import { Check, Info, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from '@ulam/sili/react'
import { announce } from '@ulam/taho'
import { useT } from '@ulam/calamansi/react'
import Panel from './ui/PanelReact.jsx'
import Button from './ui/Button.jsx'
import SettingsSectionAppearance from './SettingsSectionAppearance.jsx'
import SettingsSectionSearch from './SettingsSectionSearch.jsx'
import SettingsSectionAi from './SettingsSectionAi.jsx'
import ManagerModalsSheets from './ManagerModalsSheets.jsx'
import { PROVIDERS, initModels, initApiKeys, getAiProvider, isAgenticModeEnabled, LS_AI_PROVIDER, LS_AGENTIC_MODE, LS_APIKEY_PREFIX, LS_AI_MODEL_PREFIX } from '@ulam/halohalo'
import { applyTheme } from '../hooks/useThemeManager.js'
import { TOAST_HIDE_DURATION, DEFAULT_WCAG_FILTER, EASTER_EGG_LOCALES, LS_WCAG_FILTER } from '../utils/constants.js'
import { setStorage, removeStorage, getStorageJson } from '../utils/storage.js'
import { useKeydown } from '../hooks/useKeydown.js'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'
import { useSettings } from '../context/ContextSettings.js'
import { useRatings } from '../context/ContextRatings.js'
import { version } from '../../package.json'
import './A11yPanelSettings.css'


const A11yPanelSettings = forwardRef(function A11yPanelSettings({
  onUnlock,
  onClose,
  onSave,
  onReset,
  onClearPins,
  onClearStarred,
  onClearArchived,
  onResetRankings,
  onOpenPrivacy,
  h1Ref,
}, ref) {
  const { aiEnabled, liveSearch, showVoting, showPersonalCorpus, theme, language: rawLanguage, platform, wcagFilter, fiestaUnlocked } = useSettings()
  const language = EASTER_EGG_LOCALES.has(rawLanguage) ? 'en' : rawLanguage
  const { ratings, pinnedIds } = useRatings()
  const hasPins = pinnedIds.size > 0
  const hasStarred = Object.values(ratings).some(r => r.starred)
  const hasArchived = Object.values(ratings).some(r => r.archived)
  const hasRankings = Object.values(ratings).some(r => r.score !== 0)
  const saveButtonRef = useRef(null)
  const privacyButtonRef = useRef(null)
  const resetButtonRef = useRef(null)
  const t = useT()
  const { navigate, route } = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()

  const settingsPanelRef = useRef(null)
  const [errors, setErrors] = useState({})

  // ── Pending state for all settings ─────────────────────────────────────────
  const [pendingTheme, setPendingTheme] = useState(theme)
  const [pendingLanguage, setPendingLanguage] = useState(language)
  const [pendingPlatform, setPendingPlatform] = useState(platform)
  const [pendingLiveSearch, setPendingLiveSearch] = useState(liveSearch)
  const [pendingShowVoting, setPendingShowVoting] = useState(showVoting)
  const [pendingShowPersonalCorpus, setPendingShowPersonalCorpus] = useState(showPersonalCorpus)
  const [pendingAiEnabled, setPendingAiEnabled] = useState(aiEnabled)
  const [pendingWcagFilter, setPendingWcagFilter] = useState(() => {
    const saved = getStorageJson(LS_WCAG_FILTER, null)
    return !saved || 'show20' in saved ? DEFAULT_WCAG_FILTER : saved
  })
  const [pendingAgenticMode, setPendingAgenticMode] = useState(false)

  // ── AI provider / key / model state ────────────────────────────────────────
  const [keys, setKeys] = useState(initApiKeys)
  const [activeProvider, setActiveProvider] = useState('')
  const [models, setModels] = useState(initModels)

  // Saved snapshots to diff against for hasUnsaved
  const [savedKeys] = useState(initApiKeys)
  const [savedProvider] = useState(getAiProvider)
  const [savedModels] = useState(initModels)

  const [saved, setSaved] = useState(false)
  const privacyOpen = route === '/settings/privacy'
  const [privacyCollapsed, setPrivacyCollapsed] = useState(false)
  const [rhgPending, setRhgPending] = useState(false)
  const [fiestaConfirmOpen, setFiestaConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetDisabled, setResetDisabled] = useState(false)
  const [saveAndClose, setSaveAndClose] = useState(false)
  const [unsavedOpen, setUnsavedOpen] = useState(false)
  const [noChangesOpen, setNoChangesOpen] = useState(false)
  const justResetRef = useRef(false)
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
    pendingShowPersonalCorpus !== showPersonalCorpus ||
    pendingAiEnabled !== aiEnabled ||
    pendingWcagFilter.maxVersion !== (wcagFilter?.maxVersion ?? DEFAULT_WCAG_FILTER.maxVersion) ||
    pendingWcagFilter.maxLevel !== (wcagFilter?.maxLevel ?? DEFAULT_WCAG_FILTER.maxLevel) ||
    pendingAgenticMode !== (isAgenticModeEnabled()) ||
    activeProvider !== savedProvider ||
    PROVIDERS.some(p => keys[p.id] !== savedKeys[p.id] || models[p.id] !== savedModels[p.id])

  // Announce whenever a setting changes and there are unsaved changes
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return }
    if (hasUnsaved) announce(t('settings.pending_save_note').replace('{unsaved}', 'Unsaved.').replace('{save}', 'Save'))
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
    setPendingShowPersonalCorpus(showPersonalCorpus)
    setPendingAiEnabled(aiEnabled)
  }, [theme, language, platform, liveSearch, showVoting, showPersonalCorpus, aiEnabled])

  // In Electron, load API keys from safeStorage after mount
  useEffect(() => {
    if (!window.electronAPI) return
    Promise.all(PROVIDERS.map(async p => [p.id, (await window.electronAPI.keys.get(`${LS_APIKEY_PREFIX}${p.id}`)) || '']))
      .then(entries => {
        const loaded = Object.fromEntries(entries)
        setKeys(loaded)
      })
  }, [])

  // Preview theme immediately (visual feedback), but only persists on Save
  useEffect(() => { applyTheme(pendingTheme) }, [pendingTheme])

  // Revert theme preview if panel closes without saving
  useEffect(() => {
    return () => { applyTheme(theme) }
  }, [theme]) // only run on mount/unmount

  // Scroll to and focus the first invalid field when errors change
  useEffect(() => {
    if (!errors.provider && !errors.apiKey) return
    const el = settingsPanelRef.current?.querySelector('[aria-invalid="true"]')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    el.focus({ preventScroll: true })
  }, [errors])

  // Escape key -- Drawer also listens on mobile; harmless double-fire
  useKeydown((e) => {
    if (e.key !== 'Escape') return
    if (unsavedOpen) return
    if (hasUnsaved) { setUnsavedOpen(true) } else { onClose() }
  })

  const handleSave = () => {
    if (pendingAiEnabled) {
      if (!activeProvider) {
        setErrors({ provider: true })
        announce(t('settings.provider_error'), { priority: 'assertive' })
        return
      }
      if (!keys[activeProvider]?.trim()) {
        setErrors({ apiKey: true })
        announce(t('settings.api_key_error'), { priority: 'assertive' })
        return
      }
    }
    if (!hasUnsaved && !justResetRef.current) {
      setNoChangesOpen(true)
      return
    }
    const shouldClose = saveAndClose
    justResetRef.current = false
    setResetDisabled(false)
    setSaveAndClose(false)
    setErrors({})
    onUnlock?.()

    // Persist AI keys
    PROVIDERS.forEach(p => {
      if (window.electronAPI) {
        if (keys[p.id]) window.electronAPI.keys.set(`${LS_APIKEY_PREFIX}${p.id}`, keys[p.id])
        else window.electronAPI.keys.delete(`${LS_APIKEY_PREFIX}${p.id}`)
      } else {
        if (keys[p.id]) setStorage(`${LS_APIKEY_PREFIX}${p.id}`, keys[p.id])
        else removeStorage(`${LS_APIKEY_PREFIX}${p.id}`)
      }
    })
    setStorage(LS_AI_PROVIDER, activeProvider)
    PROVIDERS.forEach(p => {
      if (models[p.id]) setStorage(`${LS_AI_MODEL_PREFIX}${p.id}`, models[p.id])
    })
    setStorage(LS_AGENTIC_MODE, pendingAgenticMode.toString())

    const langToSave = rhgPending ? language : pendingLanguage

    onSave({
      theme: pendingTheme,
      language: langToSave,
      platform: pendingPlatform,
      liveSearch: pendingLiveSearch,
      showVoting: pendingShowVoting,
      showPersonalCorpus: pendingShowPersonalCorpus,
      aiEnabled: pendingAiEnabled,
      wcagFilter: pendingWcagFilter,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), TOAST_HIDE_DURATION)
    if (shouldClose) {
      navigate('/onboarding')
      requestAnimationFrame(() => {
        h1Ref?.current?.focus()
      })
    }
  }

  const guardedClose = useCallback(
    () => { if (hasUnsaved && !justResetRef.current) { setUnsavedOpen(true) } else { onClose() } },
    [hasUnsaved, onClose]
  )

  useImperativeHandle(ref, () => ({ guardedClose }), [guardedClose])

  return (
    <Panel
      ref={settingsPanelRef}
      className="settings-panel page-panel"
      heading={t('settings.heading')}
      onClose={guardedClose}
      closeAriaLabel={t('settings.back')}
      pageTitle={t('settings.heading')}
    >
      <p className="panel-intro">Most settings require the <strong>Save</strong> button to take effect. <strong>Pinned</strong>, <strong>Starred</strong>, <strong>Ranking</strong>, and <strong>Archived</strong> changes apply immediately.</p>

      <SettingsSectionAppearance
        theme={theme}
        pendingTheme={pendingTheme}
        setPendingTheme={setPendingTheme}
        language={language}
        pendingLanguage={pendingLanguage}
        setPendingLanguage={setPendingLanguage}
        fiestaUnlocked={fiestaUnlocked}
        setFiestaConfirmOpen={setFiestaConfirmOpen}
        setLanguagePreviewed={setLanguagePreviewed}
        languagePreviewed={languagePreviewed}
      />

      <SettingsSectionSearch
        platform={platform}
        pendingPlatform={pendingPlatform}
        setPendingPlatform={setPendingPlatform}
        liveSearch={liveSearch}
        pendingLiveSearch={pendingLiveSearch}
        setPendingLiveSearch={setPendingLiveSearch}
        showPersonalCorpus={showPersonalCorpus}
        pendingShowPersonalCorpus={pendingShowPersonalCorpus}
        setPendingShowPersonalCorpus={setPendingShowPersonalCorpus}
        wcagFilter={wcagFilter}
        pendingWcagFilter={pendingWcagFilter}
        setPendingWcagFilter={setPendingWcagFilter}
        showVoting={showVoting}
        pendingShowVoting={pendingShowVoting}
        setPendingShowVoting={setPendingShowVoting}
        hasPins={hasPins}
        hasStarred={hasStarred}
        hasRankings={hasRankings}
        hasArchived={hasArchived}
        onClearPins={onClearPins}
        onClearStarred={onClearStarred}
        onResetRankings={onResetRankings}
        onClearArchived={onClearArchived}
        unpinAllDone={unpinAllDone}
        setUnpinAllDone={setUnpinAllDone}
        unstarAllDone={unstarAllDone}
        setUnstarAllDone={setUnstarAllDone}
        resetRankingsDone={resetRankingsDone}
        setResetRankingsDone={setResetRankingsDone}
        unarchiveAllDone={unarchiveAllDone}
        setUnarchiveAllDone={setUnarchiveAllDone}
      />

      <SettingsSectionAi
        aiEnabled={aiEnabled}
        pendingAiEnabled={pendingAiEnabled}
        setPendingAiEnabled={setPendingAiEnabled}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        models={models}
        setModels={setModels}
        keys={keys}
        setKeys={setKeys}
        errors={errors}
        setErrors={setErrors}
        pendingAgenticMode={pendingAgenticMode}
        setPendingAgenticMode={setPendingAgenticMode}
      />

      {/* ── Footer ──────────────────────────────────── */}
      <div className="settings-footer-row">
        <Button
          ref={privacyButtonRef}
          variant="tertiary"
          icon={<Info size={14} aria-hidden="true" />}
          className="settings-privacy-btn"
          onClick={() => onOpenPrivacy ? onOpenPrivacy() : navigate('/settings/privacy')}
        >
          {t('settings.privacy_button')}
        </Button>
        <div className="settings-footer-actions">
          <Button
            ref={resetButtonRef}
            variant="warning"
            className="settings-reset-btn"
            disabled={resetDisabled}
            onClick={() => setResetConfirmOpen(true)}
          >
            {t('settings.reset_all')}
          </Button>
          <Button
            ref={saveButtonRef}
            active={saved}
            icon={<Save size={14} aria-hidden="true" />}
            activeIcon={<Check size={14} strokeWidth={2.5} aria-hidden="true" />}
            label={saveAndClose ? t('settings.save_and_close') : t('settings.save')}
            activeLabel={t('settings.saved')}
            variant="primary"
            className="settings-save-btn"
            onClick={handleSave}
          >
            {saved ? t('settings.saved') : saveAndClose ? t('settings.save_and_close') : t('settings.save')}
          </Button>
        </div>
      </div>

      {prefersReducedMotion && (
        <p className="settings-reduced-motion-note">
          {t('settings.reduced_motion_note')}
        </p>
      )}

      <ManagerModalsSheets
        t={t}
        privacyOpen={privacyOpen}
        privacyCollapsed={privacyCollapsed}
        setPrivacyCollapsed={setPrivacyCollapsed}
        onPrivacyClose={() => navigate('/settings')}
        privacyButtonRef={privacyButtonRef}
        rhgPending={rhgPending}
        onRhgClose={() => setRhgPending(false)}
        onRhgUseAnyway={() => { setPendingLanguage('rhg'); setRhgPending(false) }}
        unsavedOpen={unsavedOpen}
        onUnsavedClose={() => setUnsavedOpen(false)}
        onUnsavedSaveAndClose={() => { handleSave(); setUnsavedOpen(false); onClose() }}
        onUnsavedDiscard={() => { setUnsavedOpen(false); onClose() }}
        resetConfirmOpen={resetConfirmOpen}
        onResetClose={() => setResetConfirmOpen(false)}
        onResetConfirm={() => {
          setResetConfirmOpen(false)
          onReset?.()
          justResetRef.current = true
          announce(t('settings.reset_all_announce'))
          setResetDisabled(true)
          setSaveAndClose(true)
          saveButtonRef.current?.focus()
        }}
        noChangesOpen={noChangesOpen}
        onNoChangesClose={() => setNoChangesOpen(false)}
        saveButtonRef={saveButtonRef}
        fiestaConfirmOpen={fiestaConfirmOpen}
        onFiestaClose={() => setFiestaConfirmOpen(false)}
        onFiestaConfirm={() => { setPendingTheme('fiesta'); announce(t('settings.theme_party_announce')); setFiestaConfirmOpen(false) }}
      />

      <div className="settings-footer">
        <small className="settings-version">
          A11yFred v{version}
        </small>
      </div>

      <div className="panel-mobile-back">
        <Button
          variant="tertiary"
          className="panel-mobile-back-btn"
          icon={<ArrowLeft size={16} aria-hidden="true" />}
          onClick={guardedClose}
          tabIndex={-1}
        >
          {t('settings.back')}
        </Button>
      </div>
    </Panel>
  )
})

export default A11yPanelSettings
