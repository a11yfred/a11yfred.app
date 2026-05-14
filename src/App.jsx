import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import { X, ChevronLeft, ChevronRight, ChevronsUp, RotateCcw } from 'lucide-react'
import A11yInputSearchHero from './components/A11yInputSearchHero.jsx'
import PageHeader from './components/PageHeader.jsx'
import PageFooter from './components/PageFooter.jsx'
import FiestaBanner from './components/FiestaBanner.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import A11yListResults, { A11yListResultSkeleton, DataError, PinnedSection } from './components/A11yListResults.jsx'
import A11yPanelDetail from './components/A11yPanelDetail.jsx'
import A11yPanelAbout from './components/A11yPanelAbout.jsx'
import A11yPanelHelp from './components/A11yPanelHelp.jsx'
import CarouselOnboarding from './components/CarouselOnboarding.jsx'
import ThemeEffectConfetti from './components/ThemeEffectConfetti.jsx'
import ThemeEffectFiestaSparkles from './components/ThemeEffectFiestaSparkles.jsx'
import ThemeWidgetFiestaMusicPlayer from './components/ThemeWidgetFiestaMusicPlayer.jsx'
import useEntrySearch from './hooks/useEntrySearch.js'
import useAppSettings from './hooks/useAppSettings.js'
import useAppSearch from './hooks/useAppSearch.js'
import useAppRatings from './hooks/useAppRatings.js'
import { RESULTS_COUNT_FOCUS_DELAY, VIEW_ALL_LOADING_DELAY, MS_PER_DAY, MAX_RECENT_ENTRIES, pluralResult, SMART_SCORE_STAR_BONUS, SMART_SCORE_RANK_WEIGHT, SMART_SCORE_POP_WEIGHT, SMART_SCORE_ARCHIVE_PENALTY, SMART_SCORE_INDEX_PENALTY, SEVERITY_SORT_ORDER, SEVERITY_SCORE, WCAG_VERSION_ORDER, WCAG_LEVEL_ORDER, LS_RECENT_ENTRIES, LS_LAST_SELECTED, LS_LANGUAGE, LS_SAVE_COUNT, LS_LIVE_SEARCH, LS_SHOW_RANKING, LS_SHOW_PERSONAL_CORPUS, LS_PLATFORM, LS_WCAG_FILTER, LS_ONBOARDING_SEEN, PLATFORM_ORDER, EASTER_EGG_LOCALES, SORT_MISSING_ORDER, VIEW_ALL_SKIP_FLAG, LS_VIEW_ALL_SKIP, DEFAULT_WCAG_FILTER } from './utils/constants.js'
import { getStorage, setStorage, setStorageJson, getStorageJson, getSession, setSession, removeSession, clearAllStorage } from './utils/storage.js'
import { getAiProvider, getProviderLabel, isAgenticModeEnabled, DEBUG_COMMANDS, DEBUG_COMMAND_VALUES } from '@ulam/halohalo'
import {
  Router,
  useRouter,
  useRouteMatch,
  Drawer,
  Sheet,
  Modal,
  useMediaQuery,
  returnFocus,
} from '@ulam/sili/react'
import { announce } from '@ulam/taho'
import { Announcer } from '@ulam/taho/react'
import { createComponents } from '@a11yfred/rogers/react'
const { FocusDebugger, NamesDebugger, DeployBanner, DebugHelp, DebugLauncher, TabStopsDebugger, HeadingMapDebugger } = createComponents({ useEffect, useRef })
import { A11yToastAiDebug, useAiDebugToast } from './components/A11yToastAiDebug.jsx'
import useThemeManager from './hooks/useThemeManager.js'
import { ContextSettings, useSettings } from './context/ContextSettings.js'
import { ContextSearch, useSearch } from './context/ContextSearch.js'
import { ContextRatings, useRatings } from './context/ContextRatings.js'
import { I18nProvider, useT } from '@ulam/calamansi/react'
import { initI18n } from '@ulam/calamansi'
import I18N_LOCALES from './i18n-locales.js'
import { initHalohalo } from '@ulam/halohalo'
import { buildPrompt, AGENTIC_SYSTEM_PROMPT } from './ai-config.js'
import RTL_LOCALES from './rtl-locales.js'
initI18n(I18N_LOCALES, RTL_LOCALES)
initHalohalo({ buildPrompt, systemPrompt: AGENTIC_SYSTEM_PROMPT })
import { useSawsawan } from './sawsawan/react.js'
import useUserEntries from './hooks/useUserEntries.js'
import useUserOverrides from './hooks/useUserOverrides.js'
import { SEVERITY_VARS } from './data/severityStyles.js'
import entrySlug from './utils/entrySlug.js'
import './components/ThemeFiestaMode.css'

const A11yPanelSettings = lazy(() => import('./components/A11yPanelSettings.jsx'))
const A11yPanelAdmin = import.meta.env.DEV
  ? lazy(() => import('./components/A11yPanelAdmin.jsx'))
  : () => null
const UlamMenu = import.meta.env.DEV
  ? lazy(() => import('./UlamMenu.jsx'))
  : () => null

const EASTER_EGGS = { 'pig latin': 'pig', pirate: 'pir', klingon: 'tlh', valyrian: 'val', belter: 'blt', dothraki: 'dot', 'toki pona': 'tok', navi: 'nav', quenya: 'qya', sindarin: 'sjn', hodor: 'hod', dovahzul: 'dov', nadsat: 'nds', newspeak: 'nws', mandoa: 'mnd', cityspeak: 'csp', simlish: 'sim', alienese: 'ali' }
const DEPLOY_TARGETS = { 'debug deploy off': 'off', 'debug deploy on': 'netlify', 'debug deploy netlify': 'netlify', 'debug deploy pages': 'pages', 'debug deploy vercel': 'vercel' }

// Redirect legacy /finding/ routes to /entry/ for backwards compatibility
if (window.location.hash.startsWith('#/finding/')) {
  window.location.replace(window.location.href.replace('#/finding/', '#/entry/'))
}

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

function AppContent() {
  const { theme, setTheme, language, setLanguage, aiEnabled, setAiEnabled, liveSearch, setLiveSearch, showVoting, setShowVoting, showPersonalCorpus, setShowPersonalCorpus, fiestaUnlocked, setSaveCount, platform, setPlatform, wcagFilter, setWcagFilter } = useSettings()
  const { query, setQuery, submittedQuery, setSubmittedQuery, searchKey, setSearchKey, selected, setSelected, sheetCollapsed, setSheetCollapsed, pendingEntry, setPendingEntry, pendingPrivacy, setPendingPrivacy, panelFocusTrigger, setPanelFocusTrigger, narrowMode, setNarrowMode, narrowQuery, setNarrowQuery, submittedNarrowQuery, setSubmittedNarrowQuery } = useSearch()
  const { ratings, rankUp, rankDown, toggleStar, toggleArchive, resetRankings, clearAllRatings, pinnedIds, togglePin, clearPins, getPairsFor, recordCopy, recordOpen } = useRatings()
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
  const h1Ref = useRef(null)
  const h1LinkRef = useRef(null)
  const didMount = useRef(false)
  const wasNotFoundRef = useRef(false)
  const aboutWasOpenRef = useRef(false)
  const settingsTriggerRef = useRef(null)
  const settingsPanelRef = useRef(null)
  const pinnedHeadingRef = useRef(null)
  const handleGuardedCloseSettings = () => {
    if (settingsPanelRef.current) { settingsPanelRef.current.guardedClose() }
    else { handleCloseSettings() }
  }
  const aboutTriggerRef = useRef(null)
  const helpTriggerRef = useRef(null)
  const onboardingTriggerRef = useRef(null)
  const [viewAllConfirmOpen, setViewAllConfirmOpen] = useState(false)
  const [viewAllDontAsk, setViewAllDontAsk] = useState(false)
  const viewAllTriggerRef = useRef(null)
  const [badgeFilter, setBadgeFilter] = useState(() => {
    const badge = new URLSearchParams(window.location.search).get('badge')
    if (!badge) return null
    const colonIdx = badge.indexOf(':')
    if (colonIdx < 0) return null
    const type = badge.slice(0, colonIdx)
    const rest = badge.slice(colonIdx + 1)
    if (!['severity', 'source', 'wcag'].includes(type) || !rest) return null
    if (type === 'wcag' && rest.includes('|')) {
      const [value, level] = rest.split('|')
      return { type, value, level }
    }
    return { type, value: rest }
  })
  const resultsCountRef = useRef(null)
  const searchInputRef = useRef(null)
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
  const handleCloseSettings = () => {
    if (returnViewAllRef.current && !returnToPanelRef.current) {
      returnViewAllRef.current = false
      navigate('/results/all')
    } else {
      navigate('/')
    }
  }
  const handleOpenAbout = () => {
    aboutTriggerRef.current = document.activeElement
    if (viewAll) returnViewAllRef.current = true
    navigate('/about')
  }
  const handleCloseOverlay = () => {
    if (selected) {
      navigate(`/entry/${selected.id}/${entrySlug(selected.title)}`)
    } else if (returnViewAllRef.current) {
      returnViewAllRef.current = false
      navigate('/results/all')
    } else {
      navigate('/')
    }
  }
  const handleOpenHelp = () => {
    helpTriggerRef.current = document.activeElement
    if (viewAll) returnViewAllRef.current = true
    navigate('/help')
  }
  const handleOpenOnboarding = () => {
    onboardingTriggerRef.current = document.activeElement
    navigate('/onboarding')
  }
  const handleCloseOnboarding = () => { navigate('/'); setTimeout(() => returnFocus(h1LinkRef.current ?? h1Ref.current), 0) }
  const handleSelectEntry = (entry, triggerEl) => {
    // If the sheet is collapsed and the user clicks a different entry,
    // warn before discarding the collapsed panel and its unsaved changes.
    if (entry && entry.id !== selected?.id && sheetCollapsed) {
      setPendingEntry(entry)
      return
    }
    applySelectEntry(entry, triggerEl)
  }

  const applySelectEntry = (entry, triggerEl) => {
    if (entry) {
      if (!selected) {
        entryTriggerRef.current = triggerEl ?? document.activeElement
        entryTriggerIdRef.current = triggerEl?.dataset?.entryId ?? null
        returnHashRef.current = window.location.hash || '#/'
      }
      if (viewAll) returnViewAllRef.current = true
      setSession(LS_LAST_SELECTED, entry.id)
      recordOpen(entry.id)
      recordRecentEntry(entry.id)
    } else {
      removeSession(LS_LAST_SELECTED)
      setEntryHistory([])
      setSheetCollapsed(false)
      setSelected(null)
      const triggerId = entryTriggerIdRef.current
      // If a panel is open on desktop, stay on it — don't navigate or steal focus.
      // Leave returnViewAllRef and returnHashRef intact so the panel's own close
      // handler can navigate back to the right results view.
      if (isDesktop && (settingsOpen || aboutOpen || helpOpen || onboardingOpen)) return
      const shouldReturn = returnViewAllRef.current
      returnViewAllRef.current = false
      const returnHash = returnHashRef.current
      returnHashRef.current = null
      const focusCard = () => {
        const isTouch = !window.matchMedia('(hover: hover)').matches
        const focus = (el) => isTouch ? el.focus({ preventScroll: false }) : returnFocus(el)
        if (triggerId) {
          const el = document.querySelector(`[data-entry-id="${triggerId}"]`)
          if (el) { focus(el); return }
          requestAnimationFrame(() => {
            const el2 = document.querySelector(`[data-entry-id="${triggerId}"]`)
            if (el2) { focus(el2); return }
            returnFocus(h1LinkRef.current ?? h1Ref.current)
          })
          return
        }
        returnFocus(h1LinkRef.current ?? h1Ref.current)
      }
      if (shouldReturn) { navigate('/results/all'); setTimeout(focusCard, 0); return }
      if (returnHash && returnHash !== '#/' && !returnHash.startsWith('#/entry/')) {
        navigate(returnHash.slice(1)); setTimeout(focusCard, 0); return
      }
      navigate('/')
      setTimeout(focusCard, 0)
      return
    }
    setSheetCollapsed(false)
    setSelected(entry)
    navigate(`/entry/${entry.id}/${entrySlug(entry.title)}`)
  }
  const handleSelectRelated = (entry) => {
    if (!entry) return
    setEntryHistory(h => selected ? [...h, selected] : h)
    setSession(LS_LAST_SELECTED, entry.id)
    recordOpen(entry.id)
    recordRecentEntry(entry.id)
    setSheetCollapsed(false)
    setSelected(entry)
    navigate(`/entry/${entry.id}/${entrySlug(entry.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }
  const handleBack = () => {
    const prev = entryHistory[entryHistory.length - 1]
    if (!prev) return
    setEntryHistory(h => h.slice(0, -1))
    setSelected(prev)
    navigate(`/entry/${prev.id}/${entrySlug(prev.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }
  // Tracks whether settings was opened while an entry panel was selected,
  // so the panel is restored (with edits) when settings closes.
  const returnToPanelRef = useRef(false)
  const entryTriggerRef = useRef(null)
  const entryTriggerIdRef = useRef(null)
  const returnViewAllRef = useRef(false)
  const returnHashRef = useRef(null)
  const [entryHistory, setEntryHistory] = useState([])
  const sessionRestoredRef = useRef(false)

  const { userEntries } = useUserEntries()
  const { overrides: userOverrides } = useUserOverrides()
  const activeQuery = liveSearch ? query : submittedQuery
  const { results, allEntries, sortedEntries, dataLoading, dataError, retryData } = useEntrySearch(activeQuery, platform, language, searchKey, ratings, showPersonalCorpus ? userEntries : [], wcagFilter, userOverrides)
  const [viewAllLoading, setViewAllLoading] = useState(false)
  const [sortBy, setSortBy] = useState(() => new URLSearchParams(window.location.search).get('sort') || 'smart')

  const smartScore = useCallback((f, index) => {
    const r = ratings[f.id]
    let score = SEVERITY_SCORE[f.severity] ?? 0
    if (r?.starred) {
      score += SMART_SCORE_STAR_BONUS
      if (r.starredAt) {
        const days = (Date.now() - r.starredAt) / MS_PER_DAY
        score += Math.log1p(days)
      }
    }
    if (r?.score)      score += r.score * SMART_SCORE_RANK_WEIGHT
    if (r?.popularity) score += (r.popularity ?? 0) * SMART_SCORE_POP_WEIGHT
    if (r?.archived)   score -= SMART_SCORE_ARCHIVE_PENALTY
    score -= index * SMART_SCORE_INDEX_PENALTY
    return score
  }, [ratings])

  const applySortBy = useCallback((arr) => {
    if (sortBy === 'smart') {
      const scores = new Map(arr.map((f, i) => [f.id, smartScore(f, i)]))
      return [...arr].sort((a, b) => scores.get(b.id) - scores.get(a.id))
    }
    if (sortBy === 'severity-desc') return [...arr].sort((a, b) => (SEVERITY_SORT_ORDER[a.severity] ?? SORT_MISSING_ORDER) - (SEVERITY_SORT_ORDER[b.severity] ?? SORT_MISSING_ORDER))
    if (sortBy === 'severity-asc')  return [...arr].sort((a, b) => (SEVERITY_SORT_ORDER[b.severity] ?? SORT_MISSING_ORDER) - (SEVERITY_SORT_ORDER[a.severity] ?? SORT_MISSING_ORDER))
    if (sortBy === 'title-az') return [...arr].sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'title-za') return [...arr].sort((a, b) => b.title.localeCompare(a.title))
    if (sortBy === 'sc')           return [...arr].sort((a, b) => (a.primarySC ?? '').localeCompare(b.primarySC ?? ''))
    if (sortBy === 'wcag-version') return [...arr].sort((a, b) => (WCAG_VERSION_ORDER[a.wcagVersion] ?? SORT_MISSING_ORDER) - (WCAG_VERSION_ORDER[b.wcagVersion] ?? SORT_MISSING_ORDER))
    if (sortBy === 'wcag-level')   return [...arr].sort((a, b) => (WCAG_LEVEL_ORDER[a.wcagLevel] ?? SORT_MISSING_ORDER) - (WCAG_LEVEL_ORDER[b.wcagLevel] ?? SORT_MISSING_ORDER))
    if (sortBy === 'platform')     return [...arr].sort((a, b) => (PLATFORM_ORDER[a.platform] ?? SORT_MISSING_ORDER) - (PLATFORM_ORDER[b.platform] ?? SORT_MISSING_ORDER))
    if (sortBy === 'popularity')   return [...arr].sort((a, b) => ((ratings[b.id]?.popularity ?? 0) - (ratings[a.id]?.popularity ?? 0)))
    if (sortBy === 'relevance')    return arr
    return arr
  }, [sortBy, ratings, smartScore])

  const pinnedResults = useMemo(() =>
    allEntries.filter(f => pinnedIds.has(f.id)),
    [allEntries, pinnedIds]
  )

  const unpinnedResults = useMemo(() =>
    applySortBy(results.filter(f => !pinnedIds.has(f.id))),
    [results, pinnedIds, applySortBy]
  )

  const pinnedSearchMatches = useMemo(() =>
    activeQuery.length >= 2 ? results.filter(f => pinnedIds.has(f.id)) : [],
    [results, pinnedIds, activeQuery]
  )

  const badgeFilterLabel = useMemo(() => {
    if (!badgeFilter) return null
    if (badgeFilter.type === 'severity') {
      const p = SEVERITY_VARS[badgeFilter.value]
      return p ? t(p.key) : badgeFilter.value
    }
    if (badgeFilter.type === 'wcag') return badgeFilter.level ? `WCAG ${badgeFilter.value}, Level ${badgeFilter.level}` : `WCAG ${badgeFilter.value}`
    return badgeFilter.value
  }, [badgeFilter, t])

  const badgeResults = useMemo(() => {
    if (!badgeFilter) return []
    return sortedEntries.filter(f => {
      if (pinnedIds.has(f.id)) return false
      if (badgeFilter.type === 'severity') return f.severity === badgeFilter.value
      if (badgeFilter.type === 'source')   return f.creditNames?.includes(badgeFilter.value)
      if (badgeFilter.type === 'wcag') {
        if (badgeFilter.value === 'N/A') {
          return !f.wcagVersion || f.wcagVersion === ''
        }
        const versionMatch = f.wcagVersion === badgeFilter.value
        return badgeFilter.level ? versionMatch && f.wcagLevel === badgeFilter.level : versionMatch
      }
      return false
    })
  }, [sortedEntries, badgeFilter, pinnedIds])

  // Narrow results filter: applies narrowQuery as a secondary filter within current results
  const activeNarrowQuery = liveSearch ? narrowQuery : submittedNarrowQuery
  const narrowedResults = useMemo(() => {
    if (!narrowMode || !activeNarrowQuery) return null
    const base = activeQuery.length >= 2 ? results : sortedEntries
    if (!base || base.length === 0) return null
    const lowerNarrow = activeNarrowQuery.toLowerCase()
    const narrowFiltered = base.filter(f =>
      f.title.toLowerCase().includes(lowerNarrow) ||
      f.desc.toLowerCase().includes(lowerNarrow) ||
      f.keywords?.some(k => k.toLowerCase().includes(lowerNarrow)) ||
      f.creditNames?.some(s => s.toLowerCase().includes(lowerNarrow))
    )
    const pinnedMatches = narrowFiltered.filter(f => pinnedIds.has(f.id))
    const unpinnedMatches = narrowFiltered.filter(f => !pinnedIds.has(f.id))
    return [...pinnedMatches, ...unpinnedMatches]
  }, [narrowMode, activeNarrowQuery, activeQuery, results, sortedEntries, pinnedIds])

  const handleAdminSearch = (q) => {
    setQuery(q)
    setSubmittedQuery(q)
    setBadgeFilter(null)
    syncSearchUrl(q)
    navigate('/')
  }

  const handleBadgeClick = (filter) => {
    setBadgeFilter(filter)
    setQuery('')
    setSubmittedQuery('')
    syncBadgeUrl(filter)
    setSelected(null)
    navigate('/')
    setTimeout(() => resultsCountRef.current?.focus(), RESULTS_COUNT_FOCUS_DELAY)
  }

  // Announce result count after a non-live-search submission only.
  // Live search skips this, announcing on every keystroke would be unbearable.
  const lastAnnouncedQuery = useRef(null)
  useEffect(() => {
    if (liveSearch || submittedQuery.length < 2) return
    if (submittedQuery === lastAnnouncedQuery.current) return
    lastAnnouncedQuery.current = submittedQuery
    announce(t('results.count', { count: results.length, result: pluralResult(results.length) }))
  }, [results, submittedQuery, liveSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live search: announce "Loading" when query changes and results were already showing.
  const liveSearchHadResultsRef = useRef(false)
  useEffect(() => {
    if (!liveSearch || query.length < 2) { liveSearchHadResultsRef.current = false; return }
    if (liveSearchHadResultsRef.current) announce(t('results.loading_announce'))
    if (results.length > 0) liveSearchHadResultsRef.current = true
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const lastAnnouncedPlatformRef = useRef(platform)
  useEffect(() => {
    if (platform === lastAnnouncedPlatformRef.current) return
    lastAnnouncedPlatformRef.current = platform
    if (!dataLoading && allEntries.length > 0) {
      const base = activeQuery.length >= 2 ? results.length : sortedEntries.length
      const platformLabel = { all: t('settings.platform_all'), web: t('settings.platform_web'), native: t('settings.platform_native'), document: t('settings.platform_document') }[platform] ?? t('settings.platform_all')
      if (narrowedResults !== null) {
        const count = narrowedResults.length
        const result = pluralResult(count)
        if (platform !== 'all') {
          announce(`${count} ${result} of ${base}; ${platformLabel} only.`)
        } else {
          announce(`${count} ${result} of ${base}.`)
        }
      } else {
        const result = pluralResult(base)
        if (platform !== 'all') {
          announce(`${base} ${result}; ${platformLabel} only.`)
        } else {
          announce(`${base} ${result}.`)
        }
      }
    }
  }, [platform, results, sortedEntries, narrowedResults]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNarrowMode(false)
    setNarrowQuery('')
    setSubmittedNarrowQuery('')
  }, [activeQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewAllLoading) return
    const id = setTimeout(() => setViewAllLoading(false), VIEW_ALL_LOADING_DELAY)
    return () => clearTimeout(id)
  }, [viewAllLoading])

  // Background is inert when an overlay panel is active.
  // When selected AND settings is open (mobile), the background is inert due
  // to the settings drawer, exclude the panel from triggering it separately.
  const backgroundInert = (!isDesktop && settingsOpen) || (!isDesktop && aboutOpen) || (!isDesktop && onboardingOpen) || (!!selected && !sheetCollapsed && !settingsOpen && !aboutOpen && !adminOpen)

  useThemeManager(theme, () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    announce(
      prefersReduced ? t('party.announce_reduced') : t('party.announce_full'),
      { priority: 'assertive' }
    )
  })

  useSawsawan(language, t)

  useEffect(() => {
    if (!EASTER_EGG_LOCALES.has(language)) {
      setStorage(LS_LANGUAGE, language)
    }
  }, [language])

  const syncSearchUrl = (q) => {
    const url = new URL(window.location.href)
    if (q) url.searchParams.set('q', q)
    else url.searchParams.delete('q')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  const syncBadgeUrl = (filter) => {
    const url = new URL(window.location.href)
    if (filter) {
      const badgeValue = filter.type === 'wcag' && filter.level
        ? `${filter.type}:${filter.value}|${filter.level}`
        : `${filter.type}:${filter.value}`
      url.searchParams.set('badge', badgeValue)
      url.searchParams.delete('q')
    } else {
      url.searchParams.delete('badge')
    }
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  const syncFiltersUrl = ({ platformVal, sortVal, narrowVal, wcagVal } = {}) => {
    const url = new URL(window.location.href)
    const p = platformVal ?? platform
    const s = sortVal ?? sortBy
    const n = narrowVal ?? narrowQuery
    const w = wcagVal ?? wcagFilter
    if (p && p !== 'all') url.searchParams.set('platform', p)
    else url.searchParams.delete('platform')
    if (s && s !== 'smart') url.searchParams.set('sort', s)
    else url.searchParams.delete('sort')
    if (n) url.searchParams.set('narrow', n)
    else url.searchParams.delete('narrow')
    const isDefaultWcag = w.maxVersion === '2.2' && w.maxLevel === 'AA'
    if (!isDefaultWcag) url.searchParams.set('wcag', `${w.maxVersion}|${w.maxLevel}`)
    else url.searchParams.delete('wcag')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  useEffect(() => { setStorage(LS_LIVE_SEARCH, String(liveSearch)) }, [liveSearch])
  useEffect(() => { setStorage(LS_SHOW_RANKING, String(showVoting)) }, [showVoting])
  useEffect(() => { setStorage(LS_SHOW_PERSONAL_CORPUS, String(showPersonalCorpus)) }, [showPersonalCorpus])
  useEffect(() => { setStorage(LS_PLATFORM, platform) }, [platform])
  useEffect(() => { syncFiltersUrl() }, [platform, sortBy, narrowQuery, wcagFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // WCAG 2.4.3: restore focus to the trigger button (or h1) when settings/about close.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) {
      if (returnToPanelRef.current) {
        setPanelFocusTrigger(n => n + 1)
        returnToPanelRef.current = false
      } else if (settingsTriggerRef.current) {
        returnFocus(settingsTriggerRef.current)
        settingsTriggerRef.current = null
      } else if (isDesktop) {
        returnFocus(h1Ref.current)
      }
    }
  }, [settingsOpen, isDesktop]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (aboutOpen) { aboutWasOpenRef.current = true; return }
    if (aboutWasOpenRef.current) {
      if (aboutTriggerRef.current) {
        returnFocus(aboutTriggerRef.current)
        aboutTriggerRef.current = null
      } else if (isDesktop) {
        returnFocus(h1Ref.current)
      }
      aboutWasOpenRef.current = false
    }
  }, [aboutOpen, isDesktop])

  useEffect(() => {
    if (isNotFound) { wasNotFoundRef.current = true; return }
    if (wasNotFoundRef.current) {
      wasNotFoundRef.current = false
      setTimeout(() => returnFocus(h1LinkRef.current ?? h1Ref.current), 0)
    }
  }, [isNotFound])

  useEffect(() => {
    if (!entryIdFromRoute || dataLoading || allEntries.length === 0) return
    if (sheetCollapsed) return
    if (selected?.id === entryIdFromRoute) return
    const found = allEntries.find(d => d.id === entryIdFromRoute)
    if (found) setSelected(found)
  }, [entryIdFromRoute, dataLoading, sheetCollapsed]) // eslint-disable-line react-hooks/exhaustive-deps -- allEntries populated when dataLoading flips false

  // Restore last-selected entry from sessionStorage when the URL is bare (no entry in path).
  // Fires once per page load; URL-based routing always takes precedence.
  useEffect(() => {
    if (sessionRestoredRef.current || dataLoading || allEntries.length === 0) return
    sessionRestoredRef.current = true
    if (entryIdFromRoute) return
    const lastId = getSession(LS_LAST_SELECTED)
    if (!lastId) return
    const found = allEntries.find(d => d.id === lastId)
    if (found) {
      setSelected(found)
      navigate(`/entry/${found.id}/${entrySlug(found.title)}`)
    }
  }, [dataLoading, allEntries]) // eslint-disable-line react-hooks/exhaustive-deps -- fires once; entryIdFromRoute checked inline

  useEffect(() => {
    if (!selected || settingsOpen || aboutOpen || adminOpen) return
    document.title = appName ? `${appName} | ${selected.title}` : selected.title
  }, [selected, settingsOpen, aboutOpen, adminOpen, appName])

  useEffect(() => {
    if (!getStorage(LS_ONBOARDING_SEEN) && route === '/') {
      navigate('/onboarding')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- fires once on mount

  const activateEasterEgg = (egg) => {
    setLanguage(egg)
    setQuery(submittedQuery) // restore visible field to last submitted term; preserves non-live results
  }

  const runCommand = (q) => {
    const lq = q.trim().toLowerCase()
    // Easter egg offs, any "X off" where X is a known egg command
    const eggOffBase = lq.endsWith(' off') ? lq.slice(0, -4) : null
    if (eggOffBase !== null && eggOffBase in EASTER_EGGS) { setLanguage('en'); setQuery(submittedQuery); return true }
    if (lq === 'fiesta mode off') { setTheme('auto'); setQuery(submittedQuery); return true }
    // Universal debug commands
    if (lq === 'debug all' || lq === 'debug all on')    { setDevAllEnabled(true);  setNamesEnabled(true);  setQuery(submittedQuery); return true }
    if (lq === 'debug all off')                         { setDevAllEnabled(false); setNamesEnabled(false); setQuery(submittedQuery); return true }
    if (lq === 'debug names' || lq === 'debug names on')  { setNamesEnabled(true);  setQuery(''); return true }
    if (lq === 'debug names off')                         { setNamesEnabled(false); setQuery(''); return true }
    const dt = DEPLOY_TARGETS[lq]
    if (dt !== undefined) { setDeployTarget(dt); setQuery(submittedQuery); return true }
    if (lq === 'debug help') { setDebugHelpOpen(true); setQuery(''); return true }
    // Custom debug commands
    if (lq === 'debug ai assist' || lq === DEBUG_COMMANDS.AI_ASSIST_ON)  { setAiEnabled(true);  fireAiDebugToast('on');  setQuery(''); return true }
    if (lq === DEBUG_COMMANDS.AI_ASSIST_OFF)                             { setAiEnabled(false); fireAiDebugToast('off'); setQuery(''); return true }
    if (lq === 'debug fab' || lq === 'debug fab on')  { setFabEnabled(true);  setQuery(''); return true }
    if (lq === 'debug fab off')                       { setFabEnabled(false); setQuery(''); return true }
    if (lq === 'debug admin')                         { navigate('/admin');   setQuery(''); return true }
    if (lq === 'debug tab stops' || lq === 'debug tab stops on')  { setTabStopsEnabled(true);  setQuery(''); return true }
    if (lq === 'debug tab stops off')                             { setTabStopsEnabled(false); setQuery(''); return true }
    if (lq === 'debug heading map' || lq === 'debug heading map on')  { setHeadingMapEnabled(true);  setQuery(''); return true }
    if (lq === 'debug heading map off')                               { setHeadingMapEnabled(false); setQuery(''); return true }
    // Detail Panel debug triggers, routed via prop; require a finding to be selected
    if (DEBUG_COMMAND_VALUES.includes(lq)) {
      setDebugPanelCmd(lq); setQuery(submittedQuery); return true
    }
    return false
  }

  const handleQueryChange = (q) => {
    if (q) { setBadgeFilter(null); syncBadgeUrl(null) }
    if (liveSearch) {
      const egg = EASTER_EGGS[q.trim().toLowerCase()]
      if (egg) { activateEasterEgg(egg); return }
      // debug commands always require ENTER, never fire on each keystroke
      if (!q.trim().toLowerCase().startsWith('debug') && runCommand(q)) return
      syncSearchUrl(q)
    }
    if (q && viewAll) navigate('/')
    setQuery(q)
    if (q === '') {
      handleSelectEntry(null)
      returnToPanelRef.current = false // eslint-disable-line react-hooks/immutability
      setSubmittedQuery('')
      syncSearchUrl('')
    }
  }

  const handleSearch = () => {
    setBadgeFilter(null)
    syncBadgeUrl(null)
    const egg = EASTER_EGGS[query.trim().toLowerCase()]
    if (egg) { activateEasterEgg(egg); return }
    if (runCommand(query)) return
    if (viewAll) navigate('/')
    setSubmittedQuery(query)
    setSearchKey(k => k + 1)
    handleSelectEntry(null)
    syncSearchUrl(query)
    setTimeout(() => resultsCountRef.current?.focus(), RESULTS_COUNT_FOCUS_DELAY)
  }

  const clearNarrowState = () => {
    setNarrowMode(false)
    setNarrowQuery('')
    setSubmittedNarrowQuery('')
  }

  const handleNarrow = () => setNarrowMode(true)
  const handleNarrowSearch = () => setSubmittedNarrowQuery(narrowQuery)

  const handleClearResults = () => {
    setPlatform('all')
    clearNarrowState()
    setSortBy('smart')
    setWcagFilter(DEFAULT_WCAG_FILTER)
    searchInputRef.current?.focus()
  }

  const handleOpenSettings = () => {
    settingsTriggerRef.current = document.activeElement
    aboutWasOpenRef.current = false  // prevent about-close focus competing with settings-open focus
    returnToPanelRef.current = !!selected // eslint-disable-line react-hooks/immutability
    if (viewAll && !selected) returnViewAllRef.current = true
    navigate('/settings')
    // Do NOT clear selected here, keepMounted preserves the panel state
  }

  const handleResetAll = () => {
    clearAllStorage()
    setSaveCount(0)
    setTheme('auto')
    setLanguage('en')
    setPlatform('all')
    setWcagFilter({ maxVersion: '2.2', maxLevel: 'AA' })
    setLiveSearch(true)
    setShowVoting(true)
    setAiEnabled(false)
    setQuery('')
    setSubmittedQuery('')
    setSelected(null)
    setViewAllConfirmOpen(false)
    setViewAllLoading(false)
    clearPins()
    clearAllRatings()
    announce(t('settings.reset_all_announce'), { priority: 'assertive' })
  }

  const clearRatingField = (field, toggle) => {
    Object.keys(ratings).forEach(id => { if (ratings[id]?.[field]) toggle(id) })
  }
  const handleClearStarred  = () => clearRatingField('starred',  toggleStar)
  const handleClearArchived = () => clearRatingField('archived', toggleArchive)

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

  const handleCopyLink = useCallback(() => {
    syncSearchUrl(query)
    const url = window.location.href
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
    } else {
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }, [query])

  // Provider name for the search hint (read from localStorage; updates on next render after save)
  const providerName = aiEnabled
    ? getProviderLabel(getAiProvider())
    : null

  const searchView = (
    <>
      <A11yInputSearchHero
        query={query}
        onChange={handleQueryChange}
        onSearch={handleSearch}
        onExampleSearch={q => { setQuery(q); setSubmittedQuery(q); setSearchKey(k => k + 1); syncSearchUrl(q) }}
        liveSearch={liveSearch}
        inputRef={searchInputRef}
        platform={platform}
        aiEnabled={aiEnabled}
        providerName={providerName}
        showRanking={showVoting}
        hasPins={pinnedIds.size > 0}
        narrowMode={narrowMode}
        narrowQuery={narrowQuery}
        onNarrowChange={setNarrowQuery}
        onNarrowToggle={() => {
          setNarrowMode(false)
          setNarrowQuery('')
          setQuery('')
          setSubmittedQuery('')
          syncSearchUrl('')
        }}
        resultsCount={narrowMode ? results.length : null}
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
        ? <DataError
            onRetry={retryData}
            ariaLabel={t('error.announce')}
            heading={t('error.heading')}
            body={t('error.body')}
            retryLabel={t('error.retry')}
            retryIcon={() => <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />}
            onMount={() => announce(t('error.announce'), { priority: 'assertive' })}
          />
        : dataLoading || viewAllLoading
          ? <A11yListResultSkeleton count={activeQuery === 'debug skeleton' ? sortedEntries.length : undefined} />
          : (viewAll || sheetCollapsed)
            ? (
              <A11yListResults
                key="view-all"
                results={applySortBy(sortedEntries.filter(f => !pinnedIds.has(f.id)))}
                selected={sheetCollapsed ? null : selected}
                onSelect={handleSelectEntry}
                query=""
                showRankingSort={showVoting}
                onCopyLink={handleCopyLink}
                narrowResults={narrowedResults}
                showAds={showAds}
                adFrequency={adFrequency}
                onClear={handleClearResults}
                hasPinnedItems={pinnedIds.size > 0}
                defaultWcagFilter={DEFAULT_WCAG_FILTER}
                onOpenSettings={handleOpenSettings}
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
                  <A11yListResults
                    key="search"
                    results={unpinnedResults}
                    selected={sheetCollapsed ? null : selected}
                    onSelect={handleSelectEntry}
                    query={activeQuery}
                    showRankingSort={showVoting}
                    onCopyLink={handleCopyLink}
                    narrowResults={narrowedResults}
                    showAds={showAds}
                    adFrequency={adFrequency}
                    onClear={handleClearResults}
                    hasPinnedItems={pinnedIds.size > 0}
                    defaultWcagFilter={DEFAULT_WCAG_FILTER}
                    onOpenSettings={handleOpenSettings}
                  />
                </>
              )
              : badgeFilter
                ? (
                  <A11yListResults
                    key="badge"
                    results={applySortBy(badgeResults)}
                    selected={sheetCollapsed ? null : selected}
                    onSelect={handleSelectEntry}
                    query=""
                    showRankingSort={showVoting}
                    countRef={resultsCountRef}
                    filterLabel={badgeFilterLabel}
                    narrowResults={narrowedResults}
                    showAds={showAds}
                    adFrequency={adFrequency}
                    onClear={handleClearResults}
                    hasPinnedItems={pinnedIds.size > 0}
                    defaultWcagFilter={DEFAULT_WCAG_FILTER}
                    onOpenSettings={handleOpenSettings}
                  />
                )
              : sortedEntries.length === 0
                ? (
                  <A11yListResults
                    key="no-results-home"
                    results={[]}
                    selected={null}
                    onSelect={handleSelectEntry}
                    query=""
                    onClear={handleClearResults}
                    defaultWcagFilter={DEFAULT_WCAG_FILTER}
                    onOpenSettings={handleOpenSettings}
                  />
                )
              : (
                <div className="view-all-section">
                  <button
                    type="button"
                    className="btn--secondary view-all-btn"
                    onClick={() => {
                      viewAllTriggerRef.current = document.activeElement
                      if (getStorage(LS_VIEW_ALL_SKIP) === VIEW_ALL_SKIP_FLAG) {
                        announce(t('results.loading_announce'))
                        setViewAllLoading(true)
                        navigate('/results/all')
                      } else {
                        setViewAllDontAsk(false)
                        setViewAllConfirmOpen(true)
                      }
                    }}
                  >
                    {t('search.view_all')}
                  </button>
                </div>
              )
      }
      <Modal
        open={viewAllConfirmOpen}
        onClose={() => setViewAllConfirmOpen(false)}
        returnFocusRef={viewAllTriggerRef}
        heading={t('search.view_all_confirm_heading')}
        actions={[
          {
            label: t('search.view_all_confirm_yes'),
            onClick: () => {
              if (viewAllDontAsk) setStorage(LS_VIEW_ALL_SKIP, VIEW_ALL_SKIP_FLAG)
              announce(t('results.loading_announce'))
              setViewAllLoading(true)
              navigate('/results/all')
              setViewAllConfirmOpen(false)
            },
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
          {t('search.view_all_confirm_filters', { platform: platform === 'web' ? t('search.view_all_platform_web') : platform === 'native' ? t('search.view_all_platform_native') : platform === 'document' ? t('search.view_all_platform_document') : t('search.view_all_platform_all'), version: wcagFilter.maxVersion, level: wcagFilter.maxLevel })}
          {'. '}
          {t('search.view_all_confirm_filters_change')}
          {' '}
          <a href="#/settings" className="view-all-confirm-settings-link" onClick={() => setViewAllConfirmOpen(false)}>
            {t('search.view_all_confirm_filters_link')}
          </a>.
        </p>
        {(() => {
          const pinnedCount = pinnedIds.size
          const starredCount = Object.values(ratings).filter(r => r.starred).length
          const archivedCount = Object.values(ratings).filter(r => r.archived).length
          if (!pinnedCount && !starredCount && !archivedCount) return null
          return (
            <ul className="view-all-confirm-stat-list">
              {pinnedCount > 0 && <li className="view-all-confirm-stat">{pinnedCount === 1 ? t('search.view_all_confirm_pinned_one') : t('search.view_all_confirm_pinned', { count: pinnedCount })}</li>}
              {starredCount > 0 && <li className="view-all-confirm-stat">{starredCount === 1 ? t('search.view_all_confirm_starred_one') : t('search.view_all_confirm_starred', { count: starredCount })}</li>}
              {archivedCount > 0 && <li className="view-all-confirm-stat">{archivedCount === 1 ? t('search.view_all_confirm_archived_one') : t('search.view_all_confirm_archived', { count: archivedCount })}</li>}
            </ul>
          )
        })()}
        <p className="view-all-confirm-body"><strong>{sortedEntries.length === 1 ? t('search.view_all_confirm_body_one') : t('search.view_all_confirm_body', { count: sortedEntries.length })}</strong></p>
        <label className="view-all-dont-ask-label">
          <input
            type="checkbox"
            className="app-checkbox"
            checked={viewAllDontAsk}
            onChange={e => setViewAllDontAsk(e.target.checked)}
          />
          {t('search.view_all_confirm_dont_ask')}
        </label>
      </Modal>
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
      <ThemeEffectConfetti active={theme === 'fiesta'} />
      <ThemeEffectFiestaSparkles active={theme === 'fiesta'} />
      <ThemeWidgetFiestaMusicPlayer active={theme === 'fiesta'} />
      {theme === 'fiesta' && <FiestaBanner />}

      <div className="app-background" data-sheet-collapsed={sheetCollapsed ? true : undefined} inert={backgroundInert ? true : undefined}>
        <PageHeader
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
          <Suspense fallback={null}>
            {isNotFound
              ? <NotFoundPage />
              : ulamOpen
                ? <UlamMenu />
                : adminOpen
                ? <A11yPanelAdmin {...adminProps} />
                : isDesktop && settingsOpen
                  ? <A11yPanelSettings ref={settingsPanelRef} {...settingsProps} />
                  : isDesktop && aboutOpen
                    ? <A11yPanelAbout onClose={handleCloseOverlay} allEntries={allEntries} />
                    : isDesktop && helpOpen
                      ? <A11yPanelHelp onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
                      : isDesktop && onboardingOpen
                        ? <CarouselOnboarding onClose={handleCloseOnboarding} />
                        : searchView}
          </Suspense>
        </main>
        <PageFooter />
      </div>

      {!isDesktop && (
        <Drawer open={settingsOpen} onClose={handleGuardedCloseSettings} label={t('settings.drawer_label')} focusOnClose={settingsTriggerRef}>
          <Suspense fallback={null}>
            <A11yPanelSettings ref={settingsPanelRef} {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={aboutOpen} onClose={handleCloseOverlay} label={t('about.sheet_label')} focusOnClose={aboutTriggerRef}>
          <A11yPanelAbout onClose={handleCloseOverlay} allEntries={allEntries} />
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={helpOpen} onClose={handleCloseOverlay} label={t('help.sheet_label')} focusOnClose={helpTriggerRef}>
          <A11yPanelHelp onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={onboardingOpen} onClose={handleCloseOnboarding} label={t('onboarding.heading')} focusOnClose={onboardingTriggerRef}>
          <CarouselOnboarding onClose={handleCloseOnboarding} />
        </Drawer>
      )}

      <Sheet
        open={!!selected && (isDesktop || (!settingsOpen && !aboutOpen && !helpOpen && !onboardingOpen && !adminOpen))}
        onClose={() => { applySelectEntry(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
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
          <A11yPanelDetail
            key={selected.id}
            entry={selected}
            agenticMode={isAgenticModeEnabled()}
            focusTrigger={panelFocusTrigger}
            allEntries={allEntries}
            onSelect={handleSelectEntry}
            onSelectRelated={handleSelectRelated}
            onClose={() => { applySelectEntry(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
            onBadgeClick={handleBadgeClick}
            onCopyEvent={recordCopy}
            debugPanelCmd={debugPanelCmd}
            onDebugPanelCmdHandled={() => setDebugPanelCmd(null)}
          />
        )}
      </Sheet>

      <Modal
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
      </Modal>

      <Modal
        open={pendingPrivacy}
        onClose={() => setPendingPrivacy(false)}
        heading={t('detail.discard_confirm_heading')}
        actions={[
          {
            label: t('detail.discard_confirm_yes'),
            onClick: () => { setPendingPrivacy(false); setSheetCollapsed(false); setSelected(null); navigate('/settings/privacy') },
            className: 'btn--warning modal-ok-btn',
          },
          {
            label: t('detail.discard_confirm_no'),
            onClick: () => setPendingPrivacy(false),
            className: 'btn--tertiary modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.discard_confirm_body')}</p>
      </Modal>
    </div>
  )
}

