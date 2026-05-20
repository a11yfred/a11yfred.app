import { FadeTransition, FormControlCheckbox, Screen } from '@ulam/ube'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { X, ChevronLeft, ChevronRight, ChevronsUp, RotateCcw } from 'lucide-react'
import AppInputSearchHero from './components/AppInputSearchHero.jsx'
import AppScreenHeader from './components/AppScreenHeader.jsx'
import A11yScreenFooter from './components/A11yScreenFooter.jsx'
import A11yScreenNotFound from './components/A11yScreenNotFound.jsx'
import AppScreenResults, { A11yResultSkeleton, PinnedSection } from './components/AppScreenResults.jsx'
import AppSheetDetail from './components/AppSheetDetail.jsx'

const A11yFiestaBanner = lazy(() => import('./components/A11yFiestaBanner.jsx'))
const AppDrawerPanelAbout = lazy(() => import('./components/AppDrawerPanelAbout.jsx'))
const AppDrawerPanelHelp = lazy(() => import('./components/AppDrawerPanelHelp.jsx'))
const AppCarouselOnboarding = lazy(() => import('./components/AppCarouselOnboarding.jsx'))
const A11yThemeEffectConfetti = lazy(() => import('./components/A11yThemeEffectConfetti.jsx'))
const A11yThemeEffectFiestaSparkles = lazy(() => import('./components/A11yThemeEffectFiestaSparkles.jsx'))
const A11yThemeWidgetFiestaMusicPlayer = lazy(() => import('./components/A11yThemeWidgetFiestaMusicPlayer.jsx'))
import useAppSettings from './hooks/useAppSettings.js'
import useAppSearch from './hooks/useAppSearch.js'
import useAppRatings from './hooks/useAppRatings.js'
import { MAX_RECENT_ENTRIES, LS_RECENT_ENTRIES, LS_LANGUAGE, LS_SAVE_COUNT, LS_LIVE_SEARCH, LS_SHOW_RANKING, LS_SHOW_PERSONAL_CORPUS, LS_PLATFORM, LS_WCAG_FILTER, EASTER_EGG_LOCALES, EASTER_EGGS, VIEW_ALL_SKIP_FLAG, LS_VIEW_ALL_SKIP, DEFAULT_WCAG_FILTER } from './utils/constants.js'
import { getViewAllPlatformLabel } from './utils/labelFormatters.js'
import { getStorage, setStorage, setStorageJson, getStorageJson } from './utils/storage.js'
import { getUnpinnedEntries, countRatingsByField } from './utils/entryFilters.js'
import { isAgenticModeEnabled, DEBUG_COMMANDS, DEBUG_COMMAND_VALUES } from '@ulam/halohalo'
import {
  Router,
  useRouter,
  useRouteMatch,
  Drawer,
  Sheet,
  Dialog,
  useMediaQuery,
  usePrefersReducedMotion,
} from '@ulam/sili/react'
import { announce } from '@ulam/taho'
import { Announcer } from '@ulam/taho/react'
import { createComponents } from '@a11yfred/rogers/react'
const { FocusDebugger, NamesDebugger, DeployBanner, DebugHelp, DebugLauncher, TabStopsDebugger, HeadingMapDebugger } = createComponents({ useEffect, useRef })
import { A11yToastAiDebug, useAiDebugToast } from './components/A11yToastAiDebug.jsx'
import useThemeManager from './hooks/useThemeManager.js'
import useRouteHandler from './hooks/useRouteHandler.js'
import useSearchManager from './hooks/useSearchManager.js'
import useStorageSync from './hooks/useStorageSync.js'
import { ContextSettings, useSettings } from './context/contextSettings.js'
import { ContextSearch, useSearch } from './context/contextSearch.js'
import { ContextRatings, useRatings } from './context/contextRatings.js'
import { I18nProvider } from '@ulam/calamansi/react'
import { initI18n } from '@ulam/calamansi'
import { useT } from './hooks/useTranslate.js'
import I18N_LOCALES from './locales-i18n.js'
import { initHalohalo } from '@ulam/halohalo'
import { buildPrompt, AGENTIC_SYSTEM_PROMPT } from './config-ai.js'
import RTL_LOCALES from './locales-rtl.js'
initI18n(I18N_LOCALES, RTL_LOCALES)
initHalohalo({ buildPrompt, systemPrompt: AGENTIC_SYSTEM_PROMPT })
import { useSawsawan } from './sawsawan/react.js'
import useUserEntries from './hooks/useUserEntries.js'
import useUserOverrides from './hooks/useUserOverrides.js'
import entrySlug from './utils/entrySlug.js'
import './components/a11y-theme-fiesta-mode.css'

const AppDrawerPanelSettings = lazy(() => import('./components/AppDrawerPanelSettings.jsx'))
const AppDrawerPanelAdmin = import.meta.env.DEV
  ? lazy(() => import('./components/AppDrawerPanelAdmin.jsx'))
  : () => null
const UlamMenu = import.meta.env.DEV
  ? lazy(() => import('./UlamMenu.jsx'))
  : () => null

const DEPLOY_TARGETS = { 'debug deploy off': 'off', 'debug deploy on': 'netlify', 'debug deploy netlify': 'netlify', 'debug deploy pages': 'pages', 'debug deploy vercel': 'vercel' }


function recordRecentEntry(id) {
  const recent = getStorageJson(LS_RECENT_ENTRIES, [])
  const deduped = recent.filter(r => r !== id)
  deduped.unshift(id)
  setStorageJson(LS_RECENT_ENTRIES, deduped.slice(0, MAX_RECENT_ENTRIES))
}

export default function App() {
  return (
    <Router appName="A11yFred">
      <AppShell />
    </Router>
  )
}

// AppShell manages state and provides the i18n context.
// AppContent is the inner component that consumes it.
function AppShell() {
  const settingsValue = useAppSettings()
  const searchValue = useAppSearch()
  const ratingsValue = useAppRatings()

  return (
    <I18nProvider locale={settingsValue.language}>
      <ContextSettings.Provider value={settingsValue}>
        <ContextSearch.Provider value={searchValue}>
          <ContextRatings.Provider value={ratingsValue}>
            <AppContent />
          </ContextRatings.Provider>
        </ContextSearch.Provider>
      </ContextSettings.Provider>
    </I18nProvider>
  )
}

const KNOWN_ROUTES = new Set(['/', '/settings', '/settings/privacy', '/about', '/help', '/onboarding', '/results/all', '/admin', '/ulam'])

const WORD_NUMBERS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

// Formats a count: 1-9 → "One (1)", "Two (2)", …; 10+ → "10", "11", …
function formatCount(n) {
  if (n >= 1 && n <= 9) return `${WORD_NUMBERS[n - 1]} (${n})`
  return String(n)
}

// Substitutes {count} in a stat string with the formatted count,
// then bolds the leading phrase up to " and ".
// e.g. (n=3, str="{count} results are pinned and always shown.")
//   => <strong>Three (3) results are pinned</strong> and always shown.
function boldStatPhrase(str, n) {
  const filled = str.replace('{count}', formatCount(n))
  const andIdx = filled.indexOf(' and ')
  if (andIdx === -1) return <strong>{filled}</strong>
  return <><strong>{filled.slice(0, andIdx)}</strong>{filled.slice(andIdx)}</>
}

// Formats template with {count} placeholder: splits on count and bolds the first word count.
// e.g. "{count} items loaded"  => <> <strong>X item(s)</strong> loaded</>
function formatCountTemplate(tmpl, count) {
  const parts = tmpl.split('{count}')
  if (parts.length !== 2) return tmpl
  const [before, after] = parts
  const spaceIdx = after.indexOf(' ', 1)
  const boldTail = spaceIdx === -1 ? after : after.slice(0, spaceIdx)
  const rest = spaceIdx === -1 ? '' : after.slice(spaceIdx)
  return <>{before}<strong style={{ color: 'var(--text-heading)' }}>{formatCount(count)}{boldTail}</strong>{rest}</>
}

function AppContent() {
  const { theme, setTheme, language, setLanguage, aiEnabled, setAiEnabled, liveSearch, setLiveSearch, showVoting, setShowVoting, showPersonalCorpus, setShowPersonalCorpus, setSaveCount, platform, setPlatform, wcagFilter, setWcagFilter } = useSettings()
  const { query, setQuery, submittedQuery, setSubmittedQuery, searchKey, setSearchKey, selected, setSelected, sheetCollapsed, setSheetCollapsed, pendingEntry, setPendingEntry, pendingPrivacy, setPendingPrivacy, panelFocusTrigger, setPanelFocusTrigger, narrowMode, setNarrowMode, narrowQuery, setNarrowQuery, submittedNarrowQuery, setSubmittedNarrowQuery, sortBy, setSortBy } = useSearch()
  const { ratings, toggleStar, toggleArchive, resetRankings, clearAllRatings, pinnedIds, togglePin, clearPins, recordCopy, recordOpen } = useRatings()
  const { route, navigate, appName } = useRouter()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()
  const settingsOpen = route === '/settings' || route === '/settings/privacy'
  const aboutOpen = route === '/about'
  const helpOpen = route === '/help'
  const onboardingOpen = route === '/onboarding'
  const adminOpen = route === '/admin'
  const ulamOpen = import.meta.env.DEV && route === '/ulam'
  const viewAll = route === '/results/all'
  const entryMatchSlug = useRouteMatch('/entry/:id/:slug')
  const entryMatchBare = useRouteMatch('/entry/:id')
  const entryMatch = entryMatchSlug ?? entryMatchBare
  const entryIdFromRoute = entryMatch?.id ?? null
  const isNotFound = !KNOWN_ROUTES.has(route) && !entryMatch

  const { userEntries } = useUserEntries()
  const { overrides: userOverrides } = useUserOverrides()

  const searchManager = useSearchManager({
    query, setQuery, submittedQuery, setSubmittedQuery,
    searchKey, setSearchKey, sortBy, setSortBy,
    narrowQuery, setNarrowQuery, submittedNarrowQuery, setSubmittedNarrowQuery,
    narrowMode, setNarrowMode,
    ratings, pinnedIds, togglePin, recordOpen,
    platform, setPlatform, language, setLanguage, wcagFilter, setWcagFilter,
    liveSearch, showPersonalCorpus, userEntries, userOverrides,
    t, navigate,
  })

  const {
    activeQuery, allEntries, sortedEntries,
    dataLoading, dataError, retryData,
    pinnedResults, unpinnedResults, pinnedSearchMatches,
    badgeFilter, badgeFilterLabel, badgeResults,
    narrowedResults, viewAllLoading, setViewAllLoading,
    applySortBy,
    resultsCountRef, searchInputRef,
    handleQueryChange, handleSearch, handleSearchFocus, handleSearchBlur,
    handleClearQuery, handleClearResults, handleBadgeClick,
    handleAdminSearch, handleCopyLink,
    syncSearchUrl,
  } = searchManager

  const routeHandler = useRouteHandler({
    route, navigate, isDesktop,
    selected, setSelected, settingsOpen, setSheetCollapsed,
    entryIdFromRoute, allEntries, dataLoading, sheetCollapsed,
    aboutOpen, helpOpen, onboardingOpen, adminOpen,
    recordOpen, recordRecentEntry, viewAll, appName,
    setPendingEntry, setPanelFocusTrigger,
  })

  const {
    entryHistory,
    h1Ref, h1LinkRef,
    settingsTriggerRef, settingsPanelRef,
    aboutTriggerRef, helpTriggerRef, onboardingTriggerRef,
    pinnedHeadingRef, viewAllTriggerRef,
    returnToPanelRef,
    handleOpenSettings, handleCloseSettings, handleGuardedCloseSettings,
    handleOpenAbout, handleCloseOverlay,
    handleOpenHelp, handleOpenOnboarding, handleCloseOnboarding,
    handleSelectEntry, applySelectEntry, handleSelectRelated, handleBack,
  } = routeHandler

  const [viewAllConfirmOpen, setViewAllConfirmOpen] = useState(false)
  const [viewAllDontAsk, setViewAllDontAsk] = useState(false)
  const { toast: aiDebugToast, fading: aiDebugToastFading, fire: fireAiDebugToast } = useAiDebugToast()
  const [devAllEnabled, setDevAllEnabled] = useState(false)
  const [namesEnabled, setNamesEnabled] = useState(false)
  const [fabEnabled, setFabEnabled] = useState(false)
  const [adFrequency, setAdFrequency] = useState(8)
  const [showAds, setShowAds] = useState(false)
  const [deployTarget, setDeployTarget] = useState(null)  // null | 'netlify' | 'pages' | 'vercel' | 'off'
  const [debugHelpOpen, setDebugHelpOpen] = useState(false)
  const [debugPanelCmd, setDebugPanelCmd] = useState(null)
  const [tabStopsEnabled, setTabStopsEnabled] = useState(false)
  const [headingMapEnabled, setHeadingMapEnabled] = useState(false)

  const mobileOverlayOpen = !isDesktop && (settingsOpen || aboutOpen || onboardingOpen)
  const backgroundInert = mobileOverlayOpen || (!!selected && !sheetCollapsed && !settingsOpen && !aboutOpen && !adminOpen)

  const prefersReducedMotion = usePrefersReducedMotion()

  useThemeManager(theme, () => {
    announce(
      prefersReducedMotion ? t('party.announce_reduced') : t('party.announce_full'),
      { priority: 'assertive' }
    )
  })

  useSawsawan(language, t)

  useEffect(() => {
    if (!EASTER_EGG_LOCALES.has(language)) {
      setStorage(LS_LANGUAGE, language)
    }
  }, [language])

  const prevViewAllRef = useRef(viewAll)
  useEffect(() => {
    if (prevViewAllRef.current && !viewAll && wcagFilter.maxLevel === 'AAA') {
      const saved = getStorageJson(LS_WCAG_FILTER, null)
      const defaultFilter = !saved || 'show20' in saved ? DEFAULT_WCAG_FILTER : saved
      setWcagFilter(defaultFilter)
    }
    prevViewAllRef.current = viewAll
  }, [viewAll, wcagFilter.maxLevel, setWcagFilter])

  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.key === '?' && !e.ctrlKey && !e.metaKey) || (e.key === '/' && (e.ctrlKey || e.metaKey))) {
        const searchInput = document.querySelector('input[type="search"]')
        if (searchInput !== document.activeElement) {
          e.preventDefault()
          handleOpenHelp()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleOpenHelp])

  useStorageSync(liveSearch, LS_LIVE_SEARCH)
  useStorageSync(showVoting, LS_SHOW_RANKING)
  useStorageSync(showPersonalCorpus, LS_SHOW_PERSONAL_CORPUS)
  useStorageSync(platform, LS_PLATFORM)

  const runCommand = (q) => {
    const lq = q.trim().toLowerCase()
    const eggOffBase = lq.endsWith(' off') ? lq.slice(0, -4) : null
    if (eggOffBase !== null && eggOffBase in EASTER_EGGS) { setLanguage('en'); setQuery(submittedQuery); return true }
    if (lq === 'fiesta mode off') { setTheme('auto'); setQuery(submittedQuery); return true }

    const COMMANDS = {
      'debug all': () => { setDevAllEnabled(true); setNamesEnabled(true); setQuery(submittedQuery) },
      'debug all on': () => { setDevAllEnabled(true); setNamesEnabled(true); setQuery(submittedQuery) },
      'debug all off': () => { setDevAllEnabled(false); setNamesEnabled(false); setQuery(submittedQuery) },
      'debug names': () => { setNamesEnabled(true); setQuery('') },
      'debug names on': () => { setNamesEnabled(true); setQuery('') },
      'debug names off': () => { setNamesEnabled(false); setQuery('') },
      'debug help': () => { setDebugHelpOpen(true); setQuery('') },
      'debug ai assist': () => { setAiEnabled(true); fireAiDebugToast('on'); setQuery('') },
      [DEBUG_COMMANDS.AI_ASSIST_ON]: () => { setAiEnabled(true); fireAiDebugToast('on'); setQuery('') },
      [DEBUG_COMMANDS.AI_ASSIST_OFF]: () => { setAiEnabled(false); fireAiDebugToast('off'); setQuery('') },
      'debug fab': () => { setFabEnabled(true); setQuery('') },
      'debug fab on': () => { setFabEnabled(true); setQuery('') },
      'debug fab off': () => { setFabEnabled(false); setQuery('') },
      'debug admin': () => { navigate('/admin'); setQuery('') },
      'debug tab stops': () => { setTabStopsEnabled(true); setQuery('') },
      'debug tab stops on': () => { setTabStopsEnabled(true); setQuery('') },
      'debug tab stops off': () => { setTabStopsEnabled(false); setQuery('') },
      'debug heading map': () => { setHeadingMapEnabled(true); setQuery('') },
      'debug heading map on': () => { setHeadingMapEnabled(true); setQuery('') },
      'debug heading map off': () => { setHeadingMapEnabled(false); setQuery('') },
    }

    if (COMMANDS[lq]) { COMMANDS[lq](); return true }
    const dt = DEPLOY_TARGETS[lq]
    if (dt !== undefined) { setDeployTarget(dt); setQuery(submittedQuery); return true }
    if (DEBUG_COMMAND_VALUES.includes(lq)) { setDebugPanelCmd(lq); setQuery(submittedQuery); return true }
    return false
  }


  const makeClearRatingHandler = (field, toggle) => () => {
    Object.keys(ratings).forEach(id => { if (ratings[id]?.[field]) toggle(id) })
  }
  const handleClearStarred  = makeClearRatingHandler('starred',  toggleStar)
  const handleClearArchived = makeClearRatingHandler('archived', toggleArchive)

  const handleResetAll = () => {
    setTheme('auto')
    setLanguage('en')
    setPlatform('all')
    setWcagFilter({ maxVersion: '2.2', maxLevel: 'AA' })
    setLiveSearch(true)
    setShowVoting(true)
    setAiEnabled(false)
    setSelected(null)
    setViewAllConfirmOpen(false)
    setSaveCount(0)
    clearPins()
    clearAllRatings()
    announce(t('settings.reset_all_announce'), { priority: 'assertive' })
  }

  function unlock() {
    setSaveCount(c => {
      const next = c + 1
      setStorage(LS_SAVE_COUNT, String(next))
      return next
    })
  }

  const handleSettingsSave = ({ theme: t, language: l, platform: p, liveSearch: ls, showVoting: sv, aiEnabled: ai, wcagFilter: wf, showPersonalCorpus: spc }) => {
    setTheme(t)
    setLanguage(l)
    setPlatform(p)
    setLiveSearch(ls)
    setShowVoting(sv)
    setAiEnabled(ai)
    setWcagFilter(wf)
    setStorageJson(LS_WCAG_FILTER, wf)
    setShowPersonalCorpus(spc)
  }

  const handleExampleSearch = (q) => {
    setQuery(q)
    setSubmittedQuery(q)
    setSearchKey(k => k + 1)
    syncSearchUrl(q)
  }

  const handleViewAllClick = () => {
    viewAllTriggerRef.current = document.activeElement
    if (getStorage(LS_VIEW_ALL_SKIP) === VIEW_ALL_SKIP_FLAG) {
      announce(t('results.loading_announce'))
      setViewAllLoading(true)
      setWcagFilter({ maxVersion: '2.2', maxLevel: 'AAA' })
      navigate('/results/all')
    } else {
      setViewAllDontAsk(false)
      setViewAllConfirmOpen(true)
    }
  }

  const handleViewAllConfirm = () => {
    if (viewAllDontAsk) setStorage(LS_VIEW_ALL_SKIP, VIEW_ALL_SKIP_FLAG)
    announce(t('results.loading_announce'))
    setViewAllLoading(true)
    setWcagFilter({ maxVersion: '2.2', maxLevel: 'AAA' })
    navigate('/results/all')
    setViewAllConfirmOpen(false)
  }

  const settingsProps = {
    onUnlock: unlock,
    onSave: handleSettingsSave,
    onClose: () => {
      if (selected) navigate(`/entry/${selected.id}/${entrySlug(selected.title)}`)
      else handleCloseSettings()
    },
    onReset: handleResetAll,
    h1Ref,
    onClearPins: clearPins,
    onClearStarred: handleClearStarred,
    onClearArchived: handleClearArchived,
    onResetRankings: resetRankings,
    onOpenPrivacy: () => {
      if (sheetCollapsed) { setPendingPrivacy(true); return }
      navigate('/settings/privacy')
    },
  }

  const adminProps = {
    devAllEnabled, setDevAllEnabled,
    namesEnabled, setNamesEnabled,
    fabEnabled, setFabEnabled,
    aiEnabled,
    onToggleAi: () => setAiEnabled(a => !a),
    deployTarget, setDeployTarget,
    showAds, setShowAds,
    adFrequency, setAdFrequency,
    onSearch: handleAdminSearch,
    onFilter: handleBadgeClick,
    onClose: () => navigate('/'),
  }



  const baseListProps = {
    showRankingSort: showVoting,
    onCopyLink: handleCopyLink,
    narrowResults: narrowedResults,
    showAds: showAds,
    adFrequency: adFrequency,
    onClear: handleClearResults,
    hasPinnedItems: pinnedIds.size > 0,
    defaultWcagFilter: DEFAULT_WCAG_FILTER,
    onOpenSettings: handleOpenSettings,
    onBadgeClick: handleBadgeClick,
    onSelect: handleSelectEntry,
    selected: sheetCollapsed ? null : selected,
  }

  const searchView = (
    <>
      <AppInputSearchHero
        query={query}
        onChange={handleQueryChange}
        onSearch={handleSearch}
        onExampleSearch={handleExampleSearch}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        liveSearch={liveSearch}
        inputRef={searchInputRef}
        narrowMode={narrowMode}
        onOpenSettings={handleOpenSettings}
      />
      {!dataError && !dataLoading && !viewAllLoading && pinnedIds.size > 0 && (
        <PinnedSection
          entries={pinnedResults}
          onSelect={handleSelectEntry}
          onClearPins={() => { clearPins(); setTimeout(() => resultsCountRef.current?.focus(), 0) }}
          headingRef={pinnedHeadingRef}
        />
      )}
      {dataError
        ? <Screen
            variant="error"
            ariaLabel={t('error.announce')}
            heading={t('error.heading')}
            body={t('error.body')}
            actionLabel={t('error.retry')}
            actionIcon={() => <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />}
            action={retryData}
            onMount={() => announce(t('error.announce'), { priority: 'assertive' })}
          />
        : dataLoading || viewAllLoading
          ? <A11yResultSkeleton count={activeQuery === 'debug skeleton' ? sortedEntries.length : undefined} />
          : (viewAll || sheetCollapsed)
            ? (
              <AppScreenResults
                key="view-all"
                {...baseListProps}
                results={applySortBy(getUnpinnedEntries(sortedEntries, pinnedIds))}
                query=""
              />
            )
            : activeQuery.length >= 2
              ? (
                <>
                  {pinnedSearchMatches.length > 0 && (
                    <div className="pinned-search-matches">
                      <h3 className="pinned-search-matches__heading">{t('results.pinned_in_search_heading')}</h3>
                      <ul className="pinned-search-matches__list">
                        {pinnedSearchMatches.map(entry => (
                          <li key={entry.id} className="pinned-search-match-item">
                            <span className="pinned-search-match-title">{entry.title}</span>
                            <button
                              type="button"
                              className="btn--secondary pinned-search-match-unpin"
                              onClick={() => togglePin(entry.id)}
                              aria-label={t('results.unpin_from_search', { title: entry.title })}
                            >
                              {t('results.unpin_from_search_btn')}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <AppScreenResults
                    key="search"
                    {...baseListProps}
                    results={unpinnedResults}
                    query={activeQuery}
                    onClearQuery={handleClearQuery}
                  />
                </>
              )
              : badgeFilter
                ? (
                  <AppScreenResults
                    key="badge"
                    {...baseListProps}
                    results={applySortBy(badgeResults)}
                    query=""
                    countRef={resultsCountRef}
                    filterLabel={badgeFilterLabel}
                    isBadgeFiltered={true}
                  />
                )
              : sortedEntries.length === 0
                ? (
                  <AppScreenResults
                    key="no-results-home"
                    {...baseListProps}
                    results={[]}
                    selected={null}
                    query=""
                  />
                )
              : (
                <div className="view-all-section">
                  <button
                    type="button"
                    className="btn--secondary view-all-btn"
                    onClick={handleViewAllClick}
                  >
                    {t('search.view_all')}
                  </button>
                </div>
              )
      }
      <Dialog
        open={viewAllConfirmOpen}
        onClose={() => setViewAllConfirmOpen(false)}
        returnFocusRef={viewAllTriggerRef}
        heading={t('search.view_all_confirm_heading')}
        actions={[
          {
            label: t('search.view_all_confirm_yes'),
            onClick: handleViewAllConfirm,
            className: 'btn--primary modal-ok-btn',
          },
          {
            label: t('search.view_all_confirm_no'),
            onClick: () => setViewAllConfirmOpen(false),
            className: 'btn--secondary modal-ok-btn',
          },
        ]}
      >
        <p className="view-all-confirm-filters">
          {t('search.view_all_confirm_filters_label')}
          {' '}
          {t('search.view_all_confirm_filters', { platform: getViewAllPlatformLabel(platform, t), version: wcagFilter.maxVersion, level: wcagFilter.maxLevel })}
          {'. '}
          {t('search.view_all_confirm_filters_change')}
          {' '}
          <a href="#/settings" className="view-all-confirm-settings-link" onClick={() => setViewAllConfirmOpen(false)}>
            {t('search.view_all_confirm_filters_link')}
          </a>.
        </p>
        {(() => {
          const pinnedCount = pinnedIds.size
          const starredCount = countRatingsByField(ratings, 'starred')
          const archivedCount = countRatingsByField(ratings, 'archived')
          if (!pinnedCount && !starredCount && !archivedCount) return null
          return (
            <ul className="view-all-confirm-stat-list">
              {pinnedCount > 0 && <li className="view-all-confirm-stat">{boldStatPhrase(pinnedCount === 1 ? t('search.view_all_confirm_pinned_one') : t('search.view_all_confirm_pinned'), pinnedCount)}</li>}
              {starredCount > 0 && <li className="view-all-confirm-stat">{boldStatPhrase(starredCount === 1 ? t('search.view_all_confirm_starred_one') : t('search.view_all_confirm_starred'), starredCount)}</li>}
              {archivedCount > 0 && <li className="view-all-confirm-stat">{boldStatPhrase(archivedCount === 1 ? t('search.view_all_confirm_archived_one') : t('search.view_all_confirm_archived'), archivedCount)}</li>}
            </ul>
          )
        })()}
        <p className="view-all-confirm-body">
          {formatCountTemplate(
            sortedEntries.length === 1 ? t('search.view_all_confirm_body_one') : t('search.view_all_confirm_body'),
            sortedEntries.length
          )}
        </p>
        <div className="view-all-dont-ask-label">
          <FormControlCheckbox
            label={t('search.view_all_confirm_dont_ask')}
            checked={viewAllDontAsk}
            onChange={e => setViewAllDontAsk(e.target.checked)}
          />
        </div>
      </Dialog>
    </>
  )

  return (
    <div className="app-container">
      {import.meta.env.DEV && <>
        <div className="dev-toast-stack" aria-hidden="true">
          <A11yToastAiDebug state={aiDebugToast} fading={aiDebugToastFading} />
          {devAllEnabled && <FocusDebugger />}
        </div>
        <NamesDebugger enabled={namesEnabled} />
        <TabStopsDebugger enabled={tabStopsEnabled} />
        <HeadingMapDebugger enabled={headingMapEnabled} />
        <DeployBanner target={deployTarget} />
      </>}
      {import.meta.env.DEV && <>
        <DebugLauncher
          enabled={fabEnabled}
          onCommand={runCommand}
          customSections={[
            {
              heading: 'Custom, A11yFred',
              rows: [
                { cmd: 'debug tab stops',   desc: 'Tab order overlay' },
                { cmd: 'debug heading map', desc: 'Heading hierarchy overlay' },
                { cmd: 'debug skeleton',    desc: 'Skeleton loading state' },
                { cmd: 'debug ai assist',   desc: 'AI Assist on' },
                { cmd: 'debug fab off',     desc: 'Hide this FAB' },
                { cmd: 'debug admin',       desc: 'Open Admin panel' },
              ],
            },
            {
              heading: 'Detail Panel (AI assist on)',
              rows: [
                { cmd: 'debug ok',      desc: 'Fake load + typewriter' },
                { cmd: 'debug wrong',   desc: 'Revision Failed error' },
                { cmd: 'debug 401',     desc: 'Invalid API key error' },
                { cmd: 'debug 429',     desc: 'Rate limit error' },
                { cmd: 'debug 503',     desc: 'Service unavailable' },
                { cmd: 'debug network', desc: 'Network error modal' },
              ],
            },
          ]}
        />
        <DebugHelp
          open={debugHelpOpen}
          onClose={() => setDebugHelpOpen(false)}
          customCommands={[
            {
              heading: 'Custom, A11yFred',
              note: <>Append <code>off</code> to disable (e.g. <code>debug ai assist off</code>).</>,
              rows: [
                { cmd: 'debug tab stops',    desc: 'Tab order overlay, records focus sequence as you Tab through the page' },
                { cmd: 'debug heading map',  desc: 'Heading hierarchy overlay + floating outline panel' },
                { cmd: 'debug skeleton',     desc: 'Skeleton loading state' },
                { cmd: 'debug ai assist',    desc: 'AI Assist + debug toast' },
                { cmd: 'debug fab',          desc: 'Floating debug button (DebugLauncher)' },
                { cmd: 'debug admin',        desc: 'Admin panel (corpus stats + debug controls)' },
              ],
            },
            {
              heading: 'Detail Panel (AI assist enabled)',
              rows: [
                { cmd: 'debug ai assist on',  desc: 'Same as above, typed in Revision Notes' },
                { cmd: 'debug ok',            desc: '1.2 s fake load, typewriter placeholder text' },
                { cmd: 'debug wrong',         desc: 'Trigger generic Revision Failed error' },
                { cmd: 'debug 401',           desc: 'Trigger invalid API key error' },
                { cmd: 'debug 429',           desc: 'Trigger rate limit error' },
                { cmd: 'debug 503',           desc: 'Trigger service unavailable error' },
                { cmd: 'debug network',       desc: 'Trigger network error modal' },
              ],
            },
          ]}
        />
      </>}
      <Suspense fallback={null}>
        <A11yThemeEffectConfetti active={theme === 'fiesta'} />
        <A11yThemeEffectFiestaSparkles active={theme === 'fiesta'} />
        <A11yThemeWidgetFiestaMusicPlayer active={theme === 'fiesta'} />
        {theme === 'fiesta' && <A11yFiestaBanner />}
      </Suspense>

      <div className="app-background" data-sheet-collapsed={sheetCollapsed ? true : undefined} inert={backgroundInert ? true : undefined}>
        <AppScreenHeader
          h1Ref={h1Ref}
          h1LinkRef={h1LinkRef}
          settingsOpen={settingsOpen}
          aboutOpen={aboutOpen}
          helpOpen={helpOpen}
          onboardingOpen={onboardingOpen}
          onOpenSettings={handleOpenSettings}
          onCloseSettings={handleGuardedCloseSettings}
          onOpenAbout={handleOpenAbout}
          onCloseAbout={handleCloseOverlay}
          onOpenHelp={handleOpenHelp}
          onCloseHelp={handleCloseOverlay}
          onCloseOnboarding={handleCloseOnboarding}
          isDesktop={isDesktop}
          skipTarget={onboardingOpen ? 'onboarding-title' : 'entry-search'}
        />
        <main className="app-main">
          <Announcer devEnabled={devAllEnabled} />
          <FadeTransition watchKey={isNotFound ? 'notfound' : ulamOpen ? 'ulam' : adminOpen ? 'admin' : settingsOpen ? 'settings' : aboutOpen ? 'about' : helpOpen ? 'help' : onboardingOpen ? 'onboarding' : 'search'}>
            <Suspense fallback={null}>
              {isNotFound
                ? <A11yScreenNotFound />
                : ulamOpen
                  ? <UlamMenu />
                  : adminOpen
                  ? <AppDrawerPanelAdmin {...adminProps} />
                  : isDesktop && settingsOpen
                    ? <AppDrawerPanelSettings ref={settingsPanelRef} {...settingsProps} />
                    : isDesktop && aboutOpen
                      ? <AppDrawerPanelAbout onClose={handleCloseOverlay} allEntries={allEntries} />
                      : isDesktop && helpOpen
                        ? <AppDrawerPanelHelp onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
                        : isDesktop && onboardingOpen
                          ? <AppCarouselOnboarding onClose={handleCloseOnboarding} />
                          : searchView}
            </Suspense>
          </FadeTransition>
        </main>
        <A11yScreenFooter />
      </div>

      {!isDesktop && (
        <Drawer open={settingsOpen} onClose={handleGuardedCloseSettings} label={t('settings.drawer_label')} focusOnClose={settingsTriggerRef}>
          <Suspense fallback={null}>
            <AppDrawerPanelSettings ref={settingsPanelRef} {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={aboutOpen} onClose={handleCloseOverlay} label={t('about.sheet_label')} focusOnClose={aboutTriggerRef}>
          <Suspense fallback={null}>
            <AppDrawerPanelAbout onClose={handleCloseOverlay} allEntries={allEntries} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={helpOpen} onClose={handleCloseOverlay} label={t('help.sheet_label')} focusOnClose={helpTriggerRef}>
          <Suspense fallback={null}>
            <AppDrawerPanelHelp onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={onboardingOpen} onClose={handleCloseOnboarding} label={t('onboarding.heading')} focusOnClose={onboardingTriggerRef}>
          <Suspense fallback={null}>
            <AppCarouselOnboarding onClose={handleCloseOnboarding} />
          </Suspense>
        </Drawer>
      )}

      <Sheet
        open={!!selected && (isDesktop || (!settingsOpen && !aboutOpen && !helpOpen && !onboardingOpen && !adminOpen))}
        onClose={() => { applySelectEntry(null); returnToPanelRef.current = false }}
        collapsed={sheetCollapsed}
        onCollapse={setSheetCollapsed}
        keepMounted={(settingsOpen || aboutOpen || helpOpen || onboardingOpen || adminOpen) && !!selected}
        label={selected ? t('detail.sheet_label', { title: selected.title }) : t('detail.sheet_default')}
        closeLabel={t('common.close')}
        onBack={entryHistory.length > 0 ? handleBack : undefined}
        backLabel={t('detail.back_aria')}
        hideCloseBottom
        closeIcon={() => <X size={20} strokeWidth={2.5} aria-hidden="true" />}
        backLtrIcon={() => <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />}
        backRtlIcon={() => <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />}
        collapseIcon={() => <ChevronsUp size={16} strokeWidth={2} aria-hidden="true" />}
      >
        {selected && (
          <AppSheetDetail
            key={selected.id}
            entry={selected}
            agenticMode={isAgenticModeEnabled()}
            focusTrigger={panelFocusTrigger}
            allEntries={allEntries}
            onSelect={handleSelectEntry}
            onSelectRelated={handleSelectRelated}
            onClose={() => { applySelectEntry(null); returnToPanelRef.current = false }}
            onBadgeClick={handleBadgeClick}
            onCopyEvent={recordCopy}
            debugPanelCmd={debugPanelCmd}
            onDebugPanelCmdHandled={() => setDebugPanelCmd(null)}
          />
        )}
      </Sheet>

      <Dialog
        open={!!pendingEntry}
        onClose={() => setPendingEntry(null)}
        heading={t('detail.discard_confirm_heading')}
        actions={[
          {
            label: t('detail.discard_confirm_yes'),
            onClick: () => {
              const f = pendingEntry
              setPendingEntry(null)
              applySelectEntry(f)
            },
            className: 'btn--warning modal-ok-btn',
          },
          {
            label: t('detail.discard_confirm_no'),
            onClick: () => setPendingEntry(null),
            className: 'btn--tertiary modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.discard_confirm_body')}</p>
      </Dialog>

      <Dialog
        open={pendingPrivacy}
        onClose={() => setPendingPrivacy(false)}
        heading={t('detail.discard_confirm_heading')}
        actions={[
          {
            label: t('detail.discard_nav_yes'),
            onClick: () => { setPendingPrivacy(false); setSheetCollapsed(false); setSelected(null); navigate('/settings/privacy') },
            className: 'btn--warning modal-ok-btn',
          },
          {
            label: t('detail.discard_nav_no'),
            onClick: () => setPendingPrivacy(false),
            className: 'btn--tertiary modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.discard_nav_body')}</p>
      </Dialog>
    </div>
  )
}

