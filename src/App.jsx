import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import { Settings, X, Info, HelpCircle, ArrowDown, ClipboardPaste, Hand } from 'lucide-react'
import SearchBar from './components/SearchBar.jsx'
import ResultList, { ResultListSkeleton, DataError, PinnedSection } from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import AboutPanel from './components/AboutPanel.jsx'
import HelpPanel from './components/HelpPanel.jsx'
import OnboardingPanel from './components/OnboardingPanel.jsx'
import IconButton from './components/ui/IconButton.jsx'
import Confetti from './components/Confetti.jsx'
import PartySparkles from './components/PartySparkles.jsx'
import PartyMusicPlayer from './components/PartyMusicPlayer.jsx'
import useFindingSearch from './hooks/useFindingSearch.js'
import { useItemSignals, usePinnedItems, useCoSelection } from './calamansi/relevance.js'
import { RESULTS_COUNT_FOCUS_DELAY, VIEW_ALL_LOADING_DELAY, ANIMATION_COMPLETE_DELAY, MS_PER_DAY, MAX_RECENT_FINDINGS, pluralResult, SMART_SCORE_STAR_BONUS, SMART_SCORE_RANK_WEIGHT, SMART_SCORE_POP_WEIGHT, SMART_SCORE_ARCHIVE_PENALTY, SMART_SCORE_INDEX_PENALTY, SEVERITY_SORT_ORDER, SEVERITY_SCORE, WCAG_VERSION_ORDER, WCAG_LEVEL_ORDER, LS_RECENT_FINDINGS, LS_LAST_SELECTED, LS_THEME, LS_LANGUAGE, LS_SAVE_COUNT, LS_LIVE_SEARCH, LS_SHOW_RANKING, LS_PLATFORM, LS_WCAG_FILTER, LS_ONBOARDING_SEEN, PLATFORM_ORDER, EASTER_EGG_LOCALES, SORT_MISSING_ORDER, DEBUG_COMMANDS, DEBUG_COMMAND_VALUES, URL_GITHUB_REPO, URL_GITHUB_SPONSORS, URL_LINKEDIN, URL_PERSONAL_SITE, VIEW_ALL_SKIP_FLAG, FOOTER_CREDIT_NAME, LS_VIEW_ALL_SKIP } from './utils/constants.js'
import { getStorage, setStorage, setStorageJson, getStorageJson, getSession, setSession, removeSession, getAiProvider, getProviderLabel, isAgenticModeEnabled, clearAllStorage } from './utils/storage.js'
import {
  Router,
  useRouter,
  useRouteMatch,
  Drawer,
  BottomSheet,
  Modal,
  useMediaQuery,
  returnFocus,
} from './plugins/router/index.js'
import { Announcer, announce } from './plugins/announce/index.js'
import { FocusDebugger, NamesDebugger, DeployBanner, AiDebugToast, useAiDebugToast, DebugHelp, DebugLauncher } from './plugins/adobo/index.js'
import useThemeManager from './hooks/useThemeManager.js'
import { I18nProvider, useT } from './calamansi/index.jsx'
import { useSawsawan } from './sawsawan/index.js'
import useUserFindings from './hooks/useUserFindings.js'
import useUserOverrides from './hooks/useUserOverrides.js'
import useContributionQueue from './hooks/useContributionQueue.js'
import { SEVERITY_VARS } from './data/severityStyles.js'
import findingSlug from './utils/findingSlug.js'
import './components/PartyMode.css'

const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'))
const AdminPanel = import.meta.env.DEV
  ? lazy(() => import('./plugins/adobo/AdminPanel.jsx'))
  : () => null
const UlamMenu = import.meta.env.DEV
  ? lazy(() => import('./UlamMenu.jsx'))
  : () => null


const EASTER_EGGS = { 'pig latin': 'pig', pirate: 'pir', klingon: 'tlh', valyrian: 'val', belter: 'blt', dothraki: 'dot', 'toki pona': 'tok', navi: 'nav', quenya: 'qya', sindarin: 'sjn', hodor: 'hod', dovahzul: 'dov', nadsat: 'nds', newspeak: 'nws', mandoa: 'mnd', cityspeak: 'csp', simlish: 'sim', alienese: 'ali' }
const DEPLOY_TARGETS = { 'debug deploy off': 'off', 'debug deploy on': 'netlify', 'debug deploy netlify': 'netlify', 'debug deploy pages': 'pages', 'debug deploy vercel': 'vercel' }

function recordRecentFinding(id) {
  const recent = getStorageJson(LS_RECENT_FINDINGS, [])
  const deduped = recent.filter(r => r !== id)
  deduped.unshift(id)
  setStorageJson(LS_RECENT_FINDINGS, deduped.slice(0, MAX_RECENT_FINDINGS))
}

export default function App() {
  return (
    <Router appName="A11yHelper">
      <AppShell />
    </Router>
  )
}

// AppShell manages state and provides the i18n context.
// AppContent is the inner component that consumes it.
function AppShell() {
  const [theme, setTheme] = useState(() => getStorage(LS_THEME, 'auto'))
  const [language, setLanguage] = useState(() => {
    const saved = getStorage(LS_LANGUAGE)
    if (saved) return saved
    const lang = navigator.language || 'en'
    // Supported locale values, try exact match, then language prefix, then 'en'
    const supported = [
      'af','ar-PS','eu','yue','ceb','cbk','zh','cr','crh','nl',
      'en-AU','en-GB','en-IN','en-ZA','en','eo','tl','fr','fr-CA',
      'de','gn','ht','haw','hi','ilo','iu','ja','ko','mi','nah',
      'nv','oj','pjt','pt','pt-BR','qu','rhg','es','es-PH','es-ES',
      'sv','zgh','ta','bo','ug','vi',
    ]
    return supported.includes(lang)
      ? lang
      : (supported.find(s => s === lang.split('-')[0]) || 'en')
  })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [saveCount, setSaveCount] = useState(() =>
    parseInt(getStorage(LS_SAVE_COUNT, '0'), 10)
  )
  const partyUnlocked = saveCount >= 2 || theme === 'party'
  const [liveSearch, setLiveSearch] = useState(() => getStorage(LS_LIVE_SEARCH) !== 'false')
  const [showVoting, setShowVoting] = useState(() => getStorage(LS_SHOW_RANKING) !== 'false')

  // Parse URL params once for all initial state below
  const initParams = new URLSearchParams(window.location.search)
  const initQ = initParams.get('q') || ''
  const initNarrow = initParams.get('narrow') || ''

  const [query, setQuery] = useState(initQ)
  const [submittedQuery, setSubmittedQuery] = useState(initQ)
  const [searchKey, setSearchKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [sheetCollapsed, setSheetCollapsed] = useState(false)
  const [pendingFinding, setPendingFinding] = useState(null)
  const [platform, setPlatform] = useState(() => initParams.get('platform') || getStorage(LS_PLATFORM, 'all'))
  const [panelFocusTrigger, setPanelFocusTrigger] = useState(0)
  const [wcagFilter, setWcagFilter] = useState(() => {
    const urlWcag = initParams.get('wcag')
    if (urlWcag) {
      const [version, level] = urlWcag.split('|')
      if (version && level) return { maxVersion: version, maxLevel: level }
    }
    const saved = getStorageJson(LS_WCAG_FILTER, null)
    if (!saved || 'show20' in saved) return { maxVersion: '2.2', maxLevel: 'AA' }
    return saved
  })
  const [narrowMode, setNarrowMode] = useState(!!initNarrow)
  const [narrowQuery, setNarrowQuery] = useState(initNarrow)
  const [submittedNarrowQuery, setSubmittedNarrowQuery] = useState(initNarrow)

  return (
    <I18nProvider locale={language}>
      <AppContent
        theme={theme} setTheme={setTheme}
        language={language} setLanguage={setLanguage}
        aiEnabled={aiEnabled} setAiEnabled={setAiEnabled}
        liveSearch={liveSearch} setLiveSearch={setLiveSearch}
        showVoting={showVoting} setShowVoting={setShowVoting}
        partyUnlocked={partyUnlocked} setSaveCount={setSaveCount}
        query={query} setQuery={setQuery}
        submittedQuery={submittedQuery} setSubmittedQuery={setSubmittedQuery}
        searchKey={searchKey} setSearchKey={setSearchKey}
        selected={selected} setSelected={setSelected}
        sheetCollapsed={sheetCollapsed} setSheetCollapsed={setSheetCollapsed}
        pendingFinding={pendingFinding} setPendingFinding={setPendingFinding}
        platform={platform} setPlatform={setPlatform}
        wcagFilter={wcagFilter} setWcagFilter={setWcagFilter}
        panelFocusTrigger={panelFocusTrigger} setPanelFocusTrigger={setPanelFocusTrigger}
        narrowMode={narrowMode} setNarrowMode={setNarrowMode}
        narrowQuery={narrowQuery} setNarrowQuery={setNarrowQuery}
        submittedNarrowQuery={submittedNarrowQuery} setSubmittedNarrowQuery={setSubmittedNarrowQuery}
      />
    </I18nProvider>
  )
}

const KNOWN_ROUTES = new Set(['/', '/settings', '/settings/privacy', '/about', '/help', '/onboarding', '/results/all', '/admin', '/ulam'])

function AppContent({
  theme, setTheme,
  language, setLanguage,
  aiEnabled, setAiEnabled,
  liveSearch, setLiveSearch,
  showVoting, setShowVoting,
  partyUnlocked, setSaveCount,
  query, setQuery,
  submittedQuery, setSubmittedQuery,
  searchKey, setSearchKey,
  selected, setSelected,
  sheetCollapsed, setSheetCollapsed,
  pendingFinding, setPendingFinding,
  platform, setPlatform,
  wcagFilter, setWcagFilter,
  panelFocusTrigger, setPanelFocusTrigger,
  narrowMode, setNarrowMode,
  narrowQuery, setNarrowQuery,
  submittedNarrowQuery, setSubmittedNarrowQuery,
}) {
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
  const findingMatchSlug = useRouteMatch('/finding/:id/:slug')
  const findingMatchBare = useRouteMatch('/finding/:id')
  const findingMatch = findingMatchSlug ?? findingMatchBare
  const findingIdFromRoute = findingMatch?.id ?? null
  const isNotFound = !KNOWN_ROUTES.has(route) && !findingMatch
  const h1Ref = useRef(null)
  const didMount = useRef(false)
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
      navigate(`/finding/${selected.id}/${findingSlug(selected.title)}`)
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
  const handleCloseOnboarding = () => { navigate('/'); setTimeout(() => returnFocus(h1Ref.current), 0) }
  const handleSelectFinding = (finding, triggerEl) => {
    // If the sheet is collapsed and the user clicks a different finding,
    // warn before discarding the collapsed panel and its unsaved changes.
    if (finding && finding.id !== selected?.id && sheetCollapsed) {
      setPendingFinding(finding)
      return
    }
    applySelectFinding(finding, triggerEl)
  }

  const applySelectFinding = (finding, triggerEl) => {
    if (finding) {
      if (!selected) {
        findingTriggerRef.current = triggerEl ?? document.activeElement
        findingTriggerIdRef.current = triggerEl?.dataset?.findingId ?? null
        returnHashRef.current = window.location.hash || '#/'
      }
      if (viewAll) returnViewAllRef.current = true
      setSession(LS_LAST_SELECTED, finding.id)
      recordOpen(finding.id)
      recordRecentFinding(finding.id)
    } else {
      removeSession(LS_LAST_SELECTED)
      setFindingHistory([])
      setSheetCollapsed(false)
      setSelected(null)
      const triggerId = findingTriggerIdRef.current
      // If a panel is open on desktop, stay on it — don't navigate or steal focus.
      // Leave returnViewAllRef and returnHashRef intact so the panel's own close
      // handler can navigate back to the right results view.
      if (isDesktop && (settingsOpen || aboutOpen || helpOpen || onboardingOpen)) return
      const shouldReturn = returnViewAllRef.current
      returnViewAllRef.current = false
      const returnHash = returnHashRef.current
      returnHashRef.current = null
      const focusCard = () => {
        if (!triggerId) return
        const isTouch = !window.matchMedia('(hover: hover)').matches
        const focus = (el) => isTouch ? el.focus({ preventScroll: false }) : returnFocus(el)
        const el = document.querySelector(`[data-finding-id="${triggerId}"]`)
        if (el) { focus(el); return }
        requestAnimationFrame(() => {
          const el2 = document.querySelector(`[data-finding-id="${triggerId}"]`)
          if (el2) focus(el2)
        })
      }
      if (shouldReturn) { navigate('/results/all'); setTimeout(focusCard, 0); return }
      if (returnHash && returnHash !== '#/' && !returnHash.startsWith('#/finding/')) {
        navigate(returnHash.slice(1)); setTimeout(focusCard, 0); return
      }
      navigate('/')
      setTimeout(focusCard, 0)
      return
    }
    setSheetCollapsed(false)
    setSelected(finding)
    navigate(`/finding/${finding.id}/${findingSlug(finding.title)}`)
  }
  const handleSelectRelated = (finding) => {
    if (!finding) return
    setFindingHistory(h => selected ? [...h, selected] : h)
    setSession(LS_LAST_SELECTED, finding.id)
    recordOpen(finding.id)
    recordRecentFinding(finding.id)
    setSheetCollapsed(false)
    setSelected(finding)
    navigate(`/finding/${finding.id}/${findingSlug(finding.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }
  const handleBack = () => {
    const prev = findingHistory[findingHistory.length - 1]
    if (!prev) return
    setFindingHistory(h => h.slice(0, -1))
    setSelected(prev)
    navigate(`/finding/${prev.id}/${findingSlug(prev.title)}`)
    setPanelFocusTrigger(n => n + 1)
  }
  // Tracks whether settings was opened while a finding panel was selected,
  // so the panel is restored (with edits) when settings closes.
  const returnToPanelRef = useRef(false)
  const findingTriggerRef = useRef(null)
  const findingTriggerIdRef = useRef(null)
  const returnViewAllRef = useRef(false)
  const returnHashRef = useRef(null)
  const [findingHistory, setFindingHistory] = useState([])
  const sessionRestoredRef = useRef(false)

  const COPY_FIELD = { title: 'lifetimeCopiedTitle', primarySc: 'lifetimeCopiedPrimarySc', relatedSc: 'lifetimeCopiedRelatedSc', desc: 'lifetimeCopiedDesc', fix: 'lifetimeCopiedFix', all: 'lifetimeCopiedAll' }
  const { signals: ratings, rankUp, rankDown, toggleStar, toggleArchive, resetScores: resetRankings, clearAll: clearAllRatings, recordPin, recordOpen, recordCopy: _recordCopy } = useItemSignals('defect_ratings', { starBonus: 2, unstarPenalty: 1, archivePenalty: 1, openBoost: 0.5, copyBoost: 0.25 })
  const recordCopy = useCallback((id, type) => _recordCopy(id, COPY_FIELD[type]), [_recordCopy]) // eslint-disable-line react-hooks/exhaustive-deps -- COPY_FIELD is module-stable
  const { pinnedIds, togglePin: _togglePin, clearPins } = usePinnedItems('pinnedFindings')
  const togglePin = useCallback((id) => {
    const isPinning = !pinnedIds.has(id)
    if (isPinning && ratings[id]?.archived) toggleArchive(id)
    if (isPinning) recordPin(id)
    _togglePin(id)
  }, [pinnedIds, ratings, toggleArchive, recordPin, _togglePin])
  const { getPairsFor } = useCoSelection('coSelectionPairs', 'sessionCopiedIds')
  const userFindingsHook = useUserFindings()
  const { userFindings } = userFindingsHook
  const userOverridesHook = useUserOverrides()
  const { overrides: userOverrides } = userOverridesHook
  const contributionQueueHook = useContributionQueue()
  const activeQuery = liveSearch ? query : submittedQuery
  const { results, allFindings, sortedFindings, dataLoading, dataError, retryData } = useFindingSearch(activeQuery, platform, language, searchKey, ratings, userFindings, wcagFilter, userOverrides)
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
    allFindings.filter(f => pinnedIds.has(f.id)),
    [allFindings, pinnedIds]
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
    return sortedFindings.filter(f => {
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
  }, [sortedFindings, badgeFilter, pinnedIds])

  // Narrow results filter: applies narrowQuery as a secondary filter within current results
  const activeNarrowQuery = liveSearch ? narrowQuery : submittedNarrowQuery
  const narrowedResults = useMemo(() => {
    if (!narrowMode || !activeNarrowQuery) return null
    const base = activeQuery.length >= 2 ? results : sortedFindings
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
  }, [narrowMode, activeNarrowQuery, activeQuery, results, sortedFindings, pinnedIds])

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
    if (!dataLoading && allFindings.length > 0) {
      const base = activeQuery.length >= 2 ? results.length : sortedFindings.length
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
  }, [platform, results, sortedFindings, narrowedResults]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!findingIdFromRoute || dataLoading || allFindings.length === 0) return
    if (sheetCollapsed) return
    if (selected?.id === findingIdFromRoute) return
    const found = allFindings.find(d => d.id === findingIdFromRoute)
    if (found) setSelected(found)
  }, [findingIdFromRoute, dataLoading, sheetCollapsed]) // eslint-disable-line react-hooks/exhaustive-deps -- allFindings populated when dataLoading flips false

  // Restore last-selected finding from sessionStorage when the URL is bare (no finding in path).
  // Fires once per page load; URL-based routing always takes precedence.
  useEffect(() => {
    if (sessionRestoredRef.current || dataLoading || allFindings.length === 0) return
    sessionRestoredRef.current = true
    if (findingIdFromRoute) return
    const lastId = getSession(LS_LAST_SELECTED)
    if (!lastId) return
    const found = allFindings.find(d => d.id === lastId)
    if (found) {
      setSelected(found)
      navigate(`/finding/${found.id}/${findingSlug(found.title)}`)
    }
  }, [dataLoading, allFindings]) // eslint-disable-line react-hooks/exhaustive-deps -- fires once; findingIdFromRoute checked inline

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
    if (lq === 'party mode off') { setTheme('auto'); setQuery(submittedQuery); return true }
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
      handleSelectFinding(null)
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
    handleSelectFinding(null)
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

  const settingsLanguage = EASTER_EGG_LOCALES.has(language) ? 'en' : language

  const handleResetAll = () => {
    clearAllStorage()
    setSaveCount(0)
    setTheme('auto')
    setLanguage('en')
    setPlatform('web')
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

  const handleSettingsSave = ({ theme: t, language: l, platform: p, liveSearch: ls, showVoting: sv, aiEnabled: ai, wcagFilter: wf }) => {
    setTheme(t)
    setLanguage(l)
    setPlatform(p)
    setLiveSearch(ls)
    setShowVoting(sv)
    setAiEnabled(ai)
    setWcagFilter(wf)
    setStorageJson(LS_WCAG_FILTER, wf)
  }

  const settingsProps = {
    aiEnabled,
    liveSearch,
    showVoting,
    theme,
    language: settingsLanguage,
    platform,
    wcagFilter,
    partyUnlocked,
    onUnlock: unlock,
    onSave: handleSettingsSave,
    onClose: () => {
      if (selected) navigate(`/finding/${selected.id}/${findingSlug(selected.title)}`)
      else handleCloseSettings()
    },
    onReset: handleResetAll,
    hasPins: pinnedIds.size > 0,
    onClearPins: clearPins,
    hasStarred: Object.values(ratings).some(r => r.starred),
    onClearStarred: handleClearStarred,
    hasArchived: Object.values(ratings).some(r => r.archived),
    onClearArchived: handleClearArchived,
    hasRankings: Object.values(ratings).some(r => r.score !== 0),
    onResetRankings: resetRankings,
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
    navigator.clipboard.writeText(window.location.href)
  }, [query])

  // Provider name for the search hint (read from localStorage; updates on next render after save)
  const providerName = aiEnabled
    ? getProviderLabel(getAiProvider())
    : null

  const searchView = (
    <>
      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onSearch={handleSearch}
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
          findings={pinnedResults}
          onSelect={handleSelectFinding}
          ratings={ratings}
          onRankUp={rankUp}
          onRankDown={rankDown}
          onStar={toggleStar}
          onArchive={toggleArchive}
          showRanking={showVoting}
          pinnedIds={pinnedIds}
          onPin={togglePin}
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
            onMount={() => announce(t('error.announce'), { priority: 'assertive' })}
          />
        : dataLoading || viewAllLoading
          ? <ResultListSkeleton count={activeQuery === 'debug skeleton' ? sortedFindings.length : undefined} />
          : (viewAll || sheetCollapsed)
            ? (
              <ResultList
                key="view-all"
                results={applySortBy(sortedFindings.filter(f => !pinnedIds.has(f.id)))}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selected={sheetCollapsed ? null : selected}
                onSelect={handleSelectFinding}
                query=""
                ratings={ratings}
                onRankUp={rankUp}
                onRankDown={rankDown}
                onStar={toggleStar}
                onArchive={toggleArchive}
                showRanking={showVoting}
                showRankingSort={showVoting}
                onCopyLink={handleCopyLink}
                pinnedIds={pinnedIds}
                onPin={togglePin}
                narrowMode={narrowMode}
                narrowQuery={narrowQuery}
                narrowResults={narrowedResults}
                onNarrow={handleNarrow}
                onNarrowExit={clearNarrowState}
                onNarrowChange={setNarrowQuery}
                liveSearch={liveSearch}
                onNarrowSearch={handleNarrowSearch}
                platform={platform}
                onPlatformChange={setPlatform}
                showAds={showAds}
                adFrequency={adFrequency}
                onClear={handleClearResults}
                hasPinnedItems={pinnedIds.size > 0}
              />
            )
            : activeQuery.length >= 2
              ? (
                <>
                  {pinnedSearchMatches.length > 0 && (
                    <div className="pinned-search-matches">
                      <h3 className="pinned-search-matches__heading">{t('results.pinned_in_search_heading')}</h3>
                      <ul className="pinned-search-matches__list">
                        {pinnedSearchMatches.map(finding => (
                          <li key={finding.id} className="pinned-search-match-item">
                            <span className="pinned-search-match-title">{finding.title}</span>
                            <button
                              type="button"
                              className="btn--secondary pinned-search-match-unpin"
                              onClick={() => togglePin(finding.id)}
                              aria-label={t('results.unpin_from_search', { title: finding.title })}
                            >
                              {t('results.unpin_from_search_btn')}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ResultList
                    key="search"
                    results={unpinnedResults}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    selected={sheetCollapsed ? null : selected}
                    onSelect={handleSelectFinding}
                    query={activeQuery}
                    ratings={ratings}
                    onRankUp={rankUp}
                    onRankDown={rankDown}
                    onStar={toggleStar}
                    onArchive={toggleArchive}
                    showRanking={showVoting}
                    showRankingSort={showVoting}
                    onCopyLink={handleCopyLink}
                    pinnedIds={pinnedIds}
                    onPin={togglePin}
                    narrowMode={narrowMode}
                    narrowQuery={narrowQuery}
                    narrowResults={narrowedResults}
                    onNarrow={handleNarrow}
                    onNarrowExit={clearNarrowState}
                    onNarrowChange={setNarrowQuery}
                    liveSearch={liveSearch}
                    onNarrowSearch={handleNarrowSearch}
                    platform={platform}
                    onPlatformChange={setPlatform}
                    showAds={showAds}
                    adFrequency={adFrequency}
                    onClear={handleClearResults}
                    hasPinnedItems={pinnedIds.size > 0}
                  />
                </>
              )
              : badgeFilter
                ? (
                  <ResultList
                    key="badge"
                    results={applySortBy(badgeResults)}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    selected={sheetCollapsed ? null : selected}
                    onSelect={handleSelectFinding}
                    query=""
                    ratings={ratings}
                    onRankUp={rankUp}
                    onRankDown={rankDown}
                    onStar={toggleStar}
                    onArchive={toggleArchive}
                    showRanking={showVoting}
                    showRankingSort={showVoting}
                    countRef={resultsCountRef}
                    pinnedIds={pinnedIds}
                    onPin={(id) => { const wasPin = !pinnedIds.has(id); togglePin(id); if (wasPin) setTimeout(() => pinnedHeadingRef.current?.focus(), 0) }}
                    filterLabel={badgeFilterLabel}
                    narrowMode={narrowMode}
                    narrowQuery={narrowQuery}
                    narrowResults={narrowedResults}
                    onNarrow={handleNarrow}
                    onNarrowExit={clearNarrowState}
                    onNarrowChange={setNarrowQuery}
                    liveSearch={liveSearch}
                    onNarrowSearch={handleNarrowSearch}
                    platform={platform}
                    onPlatformChange={setPlatform}
                    showAds={showAds}
                    adFrequency={adFrequency}
                    onClear={handleClearResults}
                    hasPinnedItems={pinnedIds.size > 0}
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
        <p className="view-all-confirm-body"><strong>{sortedFindings.length === 1 ? t('search.view_all_confirm_body_one') : t('search.view_all_confirm_body', { count: sortedFindings.length })}</strong></p>
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
          <AiDebugToast state={aiDebugToast} fading={aiDebugToastFading} />
          {devAllEnabled && <FocusDebugger />}
        </div>
        <NamesDebugger enabled={namesEnabled} />
        <DeployBanner target={deployTarget} />
      </>}
      {import.meta.env.DEV && <>
        <DebugLauncher
          enabled={fabEnabled}
          onCommand={runCommand}
          customSections={[
            {
              heading: 'Custom, A11yHelper',
              rows: [
                { cmd: 'debug skeleton',  desc: 'Skeleton loading state' },
                { cmd: 'debug ai assist', desc: 'AI Assist on' },
                { cmd: 'debug fab off',   desc: 'Hide this FAB' },
                { cmd: 'debug admin',     desc: 'Open Admin panel' },
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
              heading: 'Custom, A11yHelper',
              note: <>Append <code>off</code> to disable (e.g. <code>debug ai assist off</code>).</>,
              rows: [
                { cmd: 'debug skeleton',   desc: 'Skeleton loading state' },
                { cmd: 'debug ai assist',  desc: 'AI Assist + debug toast' },
                { cmd: 'debug fab',        desc: 'Floating debug button (DebugLauncher)' },
                { cmd: 'debug admin',      desc: 'Admin panel (corpus stats + debug controls)' },
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
      <Confetti active={theme === 'party'} />
      <PartySparkles active={theme === 'party'} />
      <PartyMusicPlayer active={theme === 'party'} />
      {theme === 'party' && <PartyBanner />}

      <div className="app-background" data-sheet-collapsed={sheetCollapsed ? true : undefined} inert={backgroundInert ? true : undefined}>
        <Header
          h1Ref={h1Ref}
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
          skipTarget={onboardingOpen ? 'onboarding-title' : 'finding-search'}
        />
        <main className="app-main">
          <Announcer devEnabled={devAllEnabled} />
          <Suspense fallback={null}>
            {isNotFound
              ? <NotFoundPage />
              : ulamOpen
                ? <UlamMenu />
                : adminOpen
                ? <AdminPanel {...adminProps} />
                : isDesktop && settingsOpen
                  ? <SettingsPanel ref={settingsPanelRef} {...settingsProps} />
                  : isDesktop && aboutOpen
                    ? <AboutPanel onClose={handleCloseOverlay} allFindings={allFindings} />
                    : isDesktop && helpOpen
                      ? <HelpPanel onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
                      : isDesktop && onboardingOpen
                        ? <OnboardingPanel onClose={handleCloseOnboarding} />
                        : searchView}
          </Suspense>
        </main>
        <Footer />
      </div>

      {!isDesktop && (
        <Drawer open={settingsOpen} onClose={handleGuardedCloseSettings} label={t('settings.drawer_label')} focusOnClose={settingsTriggerRef}>
          <Suspense fallback={null}>
            <SettingsPanel ref={settingsPanelRef} {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={aboutOpen} onClose={handleCloseOverlay} label={t('about.sheet_label')} focusOnClose={aboutTriggerRef}>
          <AboutPanel onClose={handleCloseOverlay} allFindings={allFindings} />
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={helpOpen} onClose={handleCloseOverlay} label={t('help.sheet_label')} focusOnClose={helpTriggerRef}>
          <HelpPanel onClose={handleCloseOverlay} onStartTour={handleOpenOnboarding} />
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={onboardingOpen} onClose={handleCloseOnboarding} label={t('onboarding.heading')} focusOnClose={onboardingTriggerRef}>
          <OnboardingPanel onClose={handleCloseOnboarding} />
        </Drawer>
      )}

      <BottomSheet
        open={!!selected && (isDesktop || (!settingsOpen && !aboutOpen && !helpOpen && !onboardingOpen && !adminOpen))}
        onClose={() => { applySelectFinding(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
        collapsed={sheetCollapsed}
        onCollapse={setSheetCollapsed}
        keepMounted={(settingsOpen || aboutOpen || helpOpen || onboardingOpen || adminOpen) && !!selected}
        label={selected ? t('detail.sheet_label', { title: selected.title }) : t('detail.sheet_default')}
        closeLabel={t('common.close')}
        onBack={findingHistory.length > 0 ? handleBack : undefined}
        backLabel={t('detail.back_aria')}
        hideCloseBottom
      >
        {selected && (
          <DetailPanel
            key={selected.id}
            finding={selected}
            aiEnabled={aiEnabled}
            agenticMode={isAgenticModeEnabled()}
            focusTrigger={panelFocusTrigger}
            allFindings={allFindings}
            onSelect={handleSelectFinding}
            onSelectRelated={handleSelectRelated}
            onClose={() => { applySelectFinding(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
            onBadgeClick={handleBadgeClick}
            onCopyEvent={recordCopy}
            getPairsFor={getPairsFor}
            locale={language}
            userOverridesHook={userOverridesHook}
            contributionQueueHook={contributionQueueHook}
            debugPanelCmd={debugPanelCmd}
            onDebugPanelCmdHandled={() => setDebugPanelCmd(null)}
          />
        )}
      </BottomSheet>

      <Modal
        open={!!pendingFinding}
        onClose={() => setPendingFinding(null)}
        heading={t('detail.discard_confirm_heading')}
        actions={[
          {
            label: t('detail.discard_confirm_yes'),
            onClick: () => {
              const f = pendingFinding
              setPendingFinding(null)
              applySelectFinding(f)
            },
            className: 'btn--warning modal-ok-btn',
          },
          {
            label: t('detail.discard_confirm_no'),
            onClick: () => setPendingFinding(null),
            className: 'btn--secondary modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.discard_confirm_body')}</p>
      </Modal>
    </div>
  )
}

function AppTitle({ t }) {
  return <>{t('app.name')}<span className="page-title__icons" aria-hidden="true"><Hand size={28} /><ClipboardPaste size={28} /></span></>
}

function Header({ h1Ref, settingsOpen, aboutOpen, helpOpen, onboardingOpen, onOpenSettings, onCloseSettings, onOpenAbout, onCloseAbout, onOpenHelp, onCloseHelp, onCloseOnboarding, isDesktop, skipTarget }) {
  const t = useT()
  const compact = isDesktop && (settingsOpen || aboutOpen || helpOpen || onboardingOpen)
  return (
    <header className={`page-header${compact ? ' page-header--compact' : ''}`}>
      <a
        href="#/"
        className="skip-link"
        onClick={(e) => { e.preventDefault(); document.getElementById(skipTarget)?.focus() }}
      >
        {t('common.skip_to_main')}
        <ArrowDown size={14} aria-hidden="true" />
      </a>
      {!compact && (
        <a
          href={URL_GITHUB_REPO}
          target="_blank"
          rel="noreferrer"
          className="header-github-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
          </svg>
          {t('header.github')}<ExternalLinkIcon />
        </a>
      )}

      <div className="page-header__actions">
        {compact && !onboardingOpen ? (
          <IconButton
            onClick={settingsOpen ? onCloseSettings : aboutOpen ? onCloseAbout : helpOpen ? onCloseHelp : onCloseOnboarding}
            label={t('common.close')}
            icon={<X size={20} strokeWidth={2.5} aria-hidden="true" />}
            className="page-header__close-btn"
          />
        ) : !onboardingOpen && (
          <>
            <IconButton
              onClick={onOpenHelp}
              label={t('help.open_help')}
              icon={<HelpCircle size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__help-btn"
            />
            <IconButton
              onClick={onOpenAbout}
              label={t('header.open_about')}
              icon={<Info size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__about-btn"
            />
            <IconButton
              onClick={onOpenSettings}
              label={t('header.open_settings')}
              icon={<Settings size={20} strokeWidth={2} aria-hidden="true" />}
              className="page-header__settings-btn"
            />
          </>
        )}
      </div>

      {(onboardingOpen || settingsOpen || aboutOpen || helpOpen) ? (
        <h1 ref={h1Ref} tabIndex={-1} className={compact ? 'sr-only' : 'page-title'} aria-hidden={onboardingOpen ? 'true' : undefined}>
          <AppTitle t={t} />
        </h1>
      ) : (
        <a href="/" className={`page-title-link${compact ? ' sr-only' : ''}`}>
          <h1 ref={h1Ref} tabIndex={-1} className={compact ? 'sr-only' : 'page-title'}>
            <AppTitle t={t} />
          </h1>
        </a>
      )}

      {!compact && (
        <p className="page-tagline"><em>{t('app.tagline')}</em></p>
      )}
    </header>
  )
}

function PartyBanner() {
  const t = useT()
  const [animating, setAnimating] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setAnimating(false), ANIMATION_COMPLETE_DELAY)
    return () => clearTimeout(timerRef.current)
  }, [])

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    setAnimating(true)
    timerRef.current = setTimeout(() => setAnimating(false), ANIMATION_COMPLETE_DELAY)
  }

  return (
    <div
      className={`party-banner${animating ? '' : ' party-banner--still'}`}
      aria-live="off"
      aria-hidden="true"
      onMouseEnter={handleMouseEnter}
    >
      {t('party.banner')}
    </div>
  )
}

function NotFoundPage() {
  const t = useT()
  const { navigate } = useRouter()
  return (
    <div className="not-found">
      <h2 className="not-found__heading">{t('notfound.heading')}</h2>
      <p className="not-found__body">{t('notfound.body')}</p>
      <button
        onClick={() => navigate('/')}
        className="btn--primary not-found__btn"
      >
        {t('notfound.button')}
      </button>
    </div>
  )
}

function Footer() {
  const t = useT()
  const credit = t('footer.credit')
  const nameIdx = credit.indexOf(FOOTER_CREDIT_NAME)
  return (
    <footer className="page-footer">
      <p className="footer-credit">
        {nameIdx >= 0 ? (
          <>
            {credit.slice(0, nameIdx)}
            <a href={URL_PERSONAL_SITE} target="_blank" rel="noreferrer" className="footer-link"><strong className="footer-credit__name">Mikey Ilagan</strong></a>
            {credit.slice(nameIdx + FOOTER_CREDIT_NAME.length)}
          </>
        ) : credit}
        <br />
        <a
          href={URL_GITHUB_SPONSORS}
          target="_blank"
          rel="noreferrer"
          className="footer-link"
          title={t('footer.sponsor_title') || 'Support on GitHub Sponsors'}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M17.5 1.5a3.5 3.5 0 0 1 3.355 5.007l-4.862 7.293a2 2 0 0 1-3.286 0l-4.862-7.293A3.5 3.5 0 0 1 12 1.5a3.5 3.5 0 0 1 5.5 0Z" />
          </svg>
          {t('footer.sponsor')}<ExternalLinkIcon />
        </a>
        {'  ·  '}
        <a
          href={URL_LINKEDIN}
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="inline-icon"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          {t('footer.linkedin')}<ExternalLinkIcon />
        </a>
      </p>
    </footer>
  )
}
