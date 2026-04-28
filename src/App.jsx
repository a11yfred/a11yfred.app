import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import { Settings, X, Info, ExternalLink, ChevronDown } from 'lucide-react'
import SearchBar from './components/SearchBar.jsx'
import ResultList, { ResultListSkeleton, DataError, PinnedSection } from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import AboutPanel from './components/AboutPanel.jsx'
import Confetti from './components/Confetti.jsx'
import PartySparkles from './components/PartySparkles.jsx'
import PartyMusicPlayer from './components/PartyMusicPlayer.jsx'
import useFindingSearch from './hooks/useFindingSearch.js'
import useFindingRatings from './hooks/useFindingRatings.js'
import {
  Router,
  useRouter,
  useRouteMatch,
  Drawer,
  BottomSheet,
  Modal,
  useMediaQuery,
} from './plugins/router/index.js'
import { Announcer, announce } from './plugins/announce/index.js'
import { FocusDebugger, NamesDebugger, DeployBanner, AiDebugToast, useAiDebugToast, DebugHelp, DebugLauncher } from './plugins/debug/index.js'
import { playPartySound, playSqueak } from './utils/partySounds.js'
import { I18nProvider, useT } from './i18n/index.jsx'
import useUserFindings from './hooks/useUserFindings.js'
import useUserOverrides from './hooks/useUserOverrides.js'
import useContributionQueue from './hooks/useContributionQueue.js'
import usePinnedFindings from './hooks/usePinnedFindings.js'

const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'))

// CSS custom properties overridden when party mode is active.
// Cleaned up when switching to any other theme.
const PARTY_KEYS = [
  '--bg', '--bg-subtle', '--border', '--border-control',
  '--text', '--text-muted', '--text-faint', '--text-disabled',
  '--accent', '--accent-bg', '--accent-text', '--focus', '--success', '--overlay-bg',
  '--priority-critical-text', '--priority-critical-bg',
  '--priority-high-text', '--priority-high-bg',
  '--priority-medium-text', '--priority-medium-bg',
  '--priority-low-text', '--priority-low-bg',
  '--party-grad-x', '--party-grad-y',
]

function generatePartyPalette() {
  const h = Math.floor(Math.random() * 360)
  const comp = (h + 180) % 360
  const tri = (h + 120) % 360
  return {
    '--bg':              `hsl(${h},    85%, 88%)`,
    '--bg-subtle':       `hsl(${h},    75%, 80%)`,
    '--border':          `hsl(${h},    50%, 68%)`,
    '--border-control':  `hsl(${comp}, 55%, 30%)`,
    '--text':            `hsl(${comp}, 70%,  8%)`,
    '--text-muted':      `hsl(${comp}, 45%, 22%)`,
    '--text-faint':      `hsl(${comp}, 35%, 32%)`,
    '--text-disabled':   `hsl(${comp}, 20%, 58%)`,
    '--accent':          `hsl(${tri},  85%, 38%)`,
    '--accent-bg':       `hsl(${tri},  75%, 88%)`,
    '--accent-text':     `hsl(${tri},  80%, 22%)`,
    '--focus':           `hsl(${tri},  85%, 38%)`,
    '--success':         'hsl(140, 60%, 30%)',
    '--overlay-bg':      `hsla(${h}, 40%, 15%, 0.55)`,
    // Priority badge colors stay fixed so they remain accessible
    '--priority-critical-text': '#a32d2d',
    '--priority-critical-bg':   '#fcebeb',
    '--priority-high-text':     '#854f0b',
    '--priority-high-bg':       '#faeeda',
    '--priority-medium-text':   '#185fa5',
    '--priority-medium-bg':     '#e6f1fb',
    '--priority-low-text':      '#3b6d11',
    '--priority-low-bg':        '#eaf3de',
    '--party-grad-x':    `${Math.floor(Math.random() * 80) + 10}%`,
    '--party-grad-y':    `${Math.floor(Math.random() * 80) + 10}%`,
  }
}

function findingSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Provider display names for the search hint
const PROVIDER_NAMES = {
  anthropic: 'Claude',
  openai: 'GPT',
  google: 'Gemini',
  microsoft: 'Copilot',
}

export default function App() {
  return (
    <Router appName="A11yTextHelper">
      <AppShell />
      {/* <KofiWidget /> — disabled: third-party script causing console errors */}
    </Router>
  )
}

// AppShell manages state and provides the i18n context.
// AppContent is the inner component that consumes it.
function AppShell() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    if (saved) return saved
    const lang = navigator.language || 'en'
    // Supported locale values — try exact match, then language prefix, then 'en'
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
    parseInt(localStorage.getItem('settingsSaveCount') || '0', 10)
  )
  const partyUnlocked = saveCount >= 2 || theme === 'party'
  const [liveSearch, setLiveSearch] = useState(() => localStorage.getItem('liveSearch') !== 'false')
  const [showVoting, setShowVoting] = useState(() => localStorage.getItem('showVoting') !== 'false')
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '')
  const [submittedQuery, setSubmittedQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '')
  const [searchKey, setSearchKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState(() => localStorage.getItem('platform') || 'web')
  const [panelFocusTrigger, setPanelFocusTrigger] = useState(0)
  const [wcagFilter, setWcagFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('wcagFilter')
      if (!saved) return { maxVersion: '2.2', maxLevel: 'AA' }
      const parsed = JSON.parse(saved)
      if ('show20' in parsed) return { maxVersion: '2.2', maxLevel: 'AA' }
      return parsed
    } catch { return { maxVersion: '2.2', maxLevel: 'AA' } }
  })

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
        platform={platform} setPlatform={setPlatform}
        wcagFilter={wcagFilter} setWcagFilter={setWcagFilter}
        panelFocusTrigger={panelFocusTrigger} setPanelFocusTrigger={setPanelFocusTrigger}
      />
    </I18nProvider>
  )
}

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
  platform, setPlatform,
  wcagFilter, setWcagFilter,
  panelFocusTrigger, setPanelFocusTrigger,
}) {
  const { route, navigate, appName } = useRouter()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()
  const settingsOpen = route === '/settings' || route === '/settings/privacy'
  const aboutOpen = route === '/about'
  const viewAll = route === '/results/all'
  const findingMatchSlug = useRouteMatch('/finding/:id/:slug')
  const findingMatchBare = useRouteMatch('/finding/:id')
  const findingMatch = findingMatchSlug ?? findingMatchBare
  const findingIdFromRoute = findingMatch?.id ?? null
  const KNOWN_ROUTES = new Set(['/', '/settings', '/settings/privacy', '/about', '/results/all'])
  const isNotFound = !KNOWN_ROUTES.has(route) && !findingMatch
  const h1Ref = useRef(null)
  const didMount = useRef(false)
  const aboutWasOpenRef = useRef(false)
  const settingsTriggerRef = useRef(null)
  const aboutTriggerRef = useRef(null)
  const [viewAllConfirmOpen, setViewAllConfirmOpen] = useState(false)
  const viewAllTriggerRef = useRef(null)
  const [badgeFilter, setBadgeFilter] = useState(null)
  const resultsCountRef = useRef(null)
  const { toast: aiDebugToast, fading: aiDebugToastFading, fire: fireAiDebugToast } = useAiDebugToast()
  const [devAllEnabled, setDevAllEnabled] = useState(true)
  const [namesEnabled, setNamesEnabled] = useState(false)
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
  const handleCloseAbout = () => {
    if (selected) {
      navigate(`/finding/${selected.id}/${findingSlug(selected.title)}`)
    } else if (returnViewAllRef.current) {
      returnViewAllRef.current = false
      navigate('/results/all')
    } else {
      navigate('/')
    }
  }
  const handleSelectFinding = (finding) => {
    if (finding) {
      if (!selected) findingTriggerRef.current = document.activeElement
      if (viewAll) returnViewAllRef.current = true
      sessionStorage.setItem('lastSelectedId', finding.id)
      try {
        const recent = JSON.parse(localStorage.getItem('recentFindings') || '[]')
        const deduped = recent.filter(id => id !== finding.id)
        deduped.unshift(finding.id)
        localStorage.setItem('recentFindings', JSON.stringify(deduped.slice(0, 10)))
      } catch { /* localStorage unavailable */ }
    } else {
      sessionStorage.removeItem('lastSelectedId')
      setFindingHistory([])
      const shouldReturn = returnViewAllRef.current
      returnViewAllRef.current = false
      if (shouldReturn) { navigate('/results/all'); return }
    }
    setSelected(finding)
    navigate(finding ? `/finding/${finding.id}/${findingSlug(finding.title)}` : '/')
  }
  const handleSelectRelated = (finding) => {
    if (!finding) return
    setFindingHistory(h => selected ? [...h, selected] : h)
    sessionStorage.setItem('lastSelectedId', finding.id)
    try {
      const recent = JSON.parse(localStorage.getItem('recentFindings') || '[]')
      const deduped = recent.filter(id => id !== finding.id)
      deduped.unshift(finding.id)
      localStorage.setItem('recentFindings', JSON.stringify(deduped.slice(0, 10)))
    } catch { /* localStorage unavailable */ }
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
  const returnViewAllRef = useRef(false)
  const [findingHistory, setFindingHistory] = useState([])
  const sessionRestoredRef = useRef(false)

  const { ratings, upvote, downvote, toggleStar, toggleArchive } = useFindingRatings()
  const { pinnedIds, togglePin, clearPins } = usePinnedFindings()
  const userFindingsHook = useUserFindings()
  const { userFindings } = userFindingsHook
  const userOverridesHook = useUserOverrides()
  const { overrides: userOverrides } = userOverridesHook
  const contributionQueueHook = useContributionQueue()
  const activeQuery = liveSearch ? query : submittedQuery
  const { results, allFindings, sortedFindings, dataLoading, dataError, retryData } = useFindingSearch(activeQuery, platform, language, searchKey, ratings, userFindings, wcagFilter, userOverrides)
  const [viewAllLoading, setViewAllLoading] = useState(false)

  const pinnedResults = useMemo(() =>
    allFindings.filter(f => pinnedIds.has(f.id)),
    [allFindings, pinnedIds]
  )

  const badgeResults = useMemo(() => {
    if (!badgeFilter) return []
    return sortedFindings.filter(f => {
      if (badgeFilter.type === 'priority') return f.priority === badgeFilter.value
      if (badgeFilter.type === 'source')   return f.source === badgeFilter.value
      if (badgeFilter.type === 'wcag')     return f.wcagVersion === badgeFilter.value
      return false
    })
  }, [sortedFindings, badgeFilter])

  const handleBadgeClick = (filter) => {
    setBadgeFilter(filter)
    setSelected(null)
    navigate('/')
    setTimeout(() => resultsCountRef.current?.focus(), 80)
  }

  // Announce result count after a non-live-search submission only.
  // Live search skips this — announcing on every keystroke would be unbearable.
  const lastAnnouncedQuery = useRef(null)
  useEffect(() => {
    if (liveSearch || submittedQuery.length < 2) return
    if (submittedQuery === lastAnnouncedQuery.current) return
    lastAnnouncedQuery.current = submittedQuery
    announce(t('results.count', { count: results.length }))
  }, [results, submittedQuery, liveSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live search: announce "Loading" when query changes and results were already showing.
  const liveSearchHadResultsRef = useRef(false)
  useEffect(() => {
    if (!liveSearch || query.length < 2) { liveSearchHadResultsRef.current = false; return }
    if (liveSearchHadResultsRef.current) announce(t('results.loading_announce'))
    if (results.length > 0) liveSearchHadResultsRef.current = true
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!viewAllLoading) return
    const id = setTimeout(() => setViewAllLoading(false), 400)
    return () => clearTimeout(id)
  }, [viewAllLoading])

  // Background is inert when an overlay panel is active.
  // When selected AND settings is open (mobile), the background is inert due
  // to the settings drawer — exclude the panel from triggering it separately.
  const backgroundInert = (!isDesktop && settingsOpen) || (!isDesktop && aboutOpen) || (!!selected && !settingsOpen && !aboutOpen)

  useEffect(() => {
    // Clean up any palette inline styles from a previous party activation
    PARTY_KEYS.forEach(k => document.documentElement.style.removeProperty(k))

    if (theme === 'party') {
      document.documentElement.setAttribute('data-theme', 'party')
      const palette = generatePartyPalette()
      Object.entries(palette).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, v)
      )
      localStorage.setItem('theme', theme)
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      announce(
        prefersReduced ? t('party.announce_reduced') : t('party.announce_full'),
        { priority: 'assertive' }
      )
      return
    }

    const apply = () => {
      const resolved = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme
      document.documentElement.setAttribute('data-theme', resolved)
    }
    apply()
    localStorage.setItem('theme', theme)
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps -- t is intentionally excluded; party announce on theme change only

  useEffect(() => {
    if (theme !== 'party') return
    function handleClick(e) {
      const el = e.target.closest('button, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select')
      if (el) playPartySound()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [theme])

  useEffect(() => {
    if (theme !== 'party') return
    const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'])
    let count = 0
    function handleKeyDown(e) {
      if (e.target.id === 'finding-search' && !IGNORED_KEYS.has(e.key)) {
        count++
        if (count % 3 === 0) playSqueak()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [theme])

  const EASTER_EGG_LOCALES = new Set(['pig', 'pir', 'tlh', 'val', 'blt', 'dot', 'tok', 'nav', 'qya', 'sjn', 'hod', 'dov', 'nds', 'nws', 'mnd', 'csp', 'sim', 'ali'])
  const RTL_LOCALES = new Set(['ar-PS', 'ug'])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = RTL_LOCALES.has(language) ? 'rtl' : 'ltr'
    if (!EASTER_EGG_LOCALES.has(language)) {
      localStorage.setItem('language', language)
    }
  }, [language]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { localStorage.setItem('liveSearch', liveSearch) }, [liveSearch])
  useEffect(() => { localStorage.setItem('showVoting', showVoting) }, [showVoting])
  useEffect(() => { localStorage.setItem('platform', platform) }, [platform])

  // WCAG 2.4.3: restore focus to the trigger button (or h1) when settings/about close.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) {
      if (returnToPanelRef.current) {
        setPanelFocusTrigger(n => n + 1)
        returnToPanelRef.current = false
      } else if (settingsTriggerRef.current) {
        settingsTriggerRef.current.focus()
        settingsTriggerRef.current = null
      } else if (isDesktop) {
        h1Ref.current?.focus()
      }
    }
  }, [settingsOpen, isDesktop]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (aboutOpen) { aboutWasOpenRef.current = true; return }
    if (aboutWasOpenRef.current) {
      if (aboutTriggerRef.current) {
        aboutTriggerRef.current.focus()
        aboutTriggerRef.current = null
      } else if (isDesktop) {
        h1Ref.current?.focus()
      }
      aboutWasOpenRef.current = false
    }
  }, [aboutOpen, isDesktop])

  useEffect(() => {
    if (!findingIdFromRoute || dataLoading || allFindings.length === 0) return
    if (selected?.id === findingIdFromRoute) return
    const found = allFindings.find(d => d.id === findingIdFromRoute)
    if (found) setSelected(found)
  }, [findingIdFromRoute, dataLoading]) // eslint-disable-line react-hooks/exhaustive-deps -- allFindings populated when dataLoading flips false

  // Restore last-selected finding from sessionStorage when the URL is bare (no finding in path).
  // Fires once per page load; URL-based routing always takes precedence.
  useEffect(() => {
    if (sessionRestoredRef.current || dataLoading || allFindings.length === 0) return
    sessionRestoredRef.current = true
    if (findingIdFromRoute) return
    const lastId = sessionStorage.getItem('lastSelectedId')
    if (!lastId) return
    const found = allFindings.find(d => d.id === lastId)
    if (found) {
      setSelected(found)
      navigate(`/finding/${found.id}/${findingSlug(found.title)}`)
    }
  }, [dataLoading, allFindings]) // eslint-disable-line react-hooks/exhaustive-deps -- fires once; findingIdFromRoute checked inline

  useEffect(() => {
    if (!selected || settingsOpen || aboutOpen) return
    document.title = appName ? `${appName} | ${selected.title}` : selected.title
  }, [selected, settingsOpen, aboutOpen, appName])

  const EASTER_EGGS = { 'pig latin': 'pig', pirate: 'pir', klingon: 'tlh', valyrian: 'val', belter: 'blt', dothraki: 'dot', 'toki pona': 'tok', navi: 'nav', quenya: 'qya', sindarin: 'sjn', hodor: 'hod', dovahzul: 'dov', nadsat: 'nds', newspeak: 'nws', mandoa: 'mnd', cityspeak: 'csp', simlish: 'sim', alienese: 'ali' }

  const activateEasterEgg = (egg) => {
    setLanguage(egg)
    setQuery(submittedQuery) // restore visible field to last submitted term; preserves non-live results
  }

  const DEPLOY_TARGETS = { 'debug deploy off': 'off', 'debug deploy on': 'netlify', 'debug deploy netlify': 'netlify', 'debug deploy pages': 'pages', 'debug deploy vercel': 'vercel' }

  const runCommand = (q) => {
    const lq = q.trim().toLowerCase()
    // Easter egg offs — any "X off" where X is a known egg command
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
    if (lq === 'debug ai assist' || lq === 'debug ai assist on')  { setAiEnabled(true);  fireAiDebugToast('on');  setQuery(''); return true }
    if (lq === 'debug ai assist off')                             { setAiEnabled(false); fireAiDebugToast('off'); setQuery(''); return true }
    // Detail Panel debug triggers — routed via prop; require a finding to be selected
    if (['debug ok', 'debug wrong', 'debug 401', 'debug 429', 'debug 503', 'debug network'].includes(lq)) {
      setDebugPanelCmd(lq); setQuery(submittedQuery); return true
    }
    return false
  }

  const syncSearchUrl = (q) => {
    const url = new URL(window.location.href)
    if (q) url.searchParams.set('q', q)
    else url.searchParams.delete('q')
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  }

  const handleQueryChange = (q) => {
    if (q) setBadgeFilter(null)
    if (liveSearch) {
      const egg = EASTER_EGGS[q.trim().toLowerCase()]
      if (egg) { activateEasterEgg(egg); return }
      // debug commands always require ENTER — never fire on each keystroke
      if (!q.trim().toLowerCase().startsWith('debug') && runCommand(q)) return
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
    const egg = EASTER_EGGS[query.trim().toLowerCase()]
    if (egg) { activateEasterEgg(egg); return }
    if (runCommand(query)) return
    if (viewAll) navigate('/')
    setSubmittedQuery(query)
    setSearchKey(k => k + 1)
    handleSelectFinding(null)
    syncSearchUrl(query)
  }

  const handleOpenSettings = () => {
    settingsTriggerRef.current = document.activeElement
    aboutWasOpenRef.current = false  // prevent about-close focus competing with settings-open focus
    returnToPanelRef.current = !!selected // eslint-disable-line react-hooks/immutability
    if (viewAll && !selected) returnViewAllRef.current = true
    navigate('/settings')
    // Do NOT clear selected here — keepMounted preserves the panel state
  }

  const settingsLanguage = EASTER_EGG_LOCALES.has(language) ? 'en' : language

  const handleResetAll = () => {
    const defaultLang = navigator.language || 'en'
    // Clear all persisted data
    localStorage.clear()
    // Reset React state to defaults
    setSaveCount(0)
    setTheme('auto')
    setLanguage(defaultLang)
    setPlatform('web')
    setWcagFilter({ show20: true, show21: true, show22: true })
    setLiveSearch(true)
    setShowVoting(true)
    setAiEnabled(false)
    setQuery('')
    setSubmittedQuery('')
    setSelected(null)
    setViewAllConfirmOpen(false)
    setViewAllLoading(false)
    clearPins()
    announce(t('settings.reset_all_announce'), { priority: 'assertive' })
  }

  function unlock() {
    setSaveCount(c => {
      const next = c + 1
      localStorage.setItem('settingsSaveCount', String(next))
      return next
    })
  }

  const settingsProps = {
    aiEnabled,
    onToggleAi: () => { setAiEnabled(a => !a) },
    liveSearch,
    onToggleLiveSearch: () => { setLiveSearch(s => !s) },
    showVoting,
    onToggleVoting: () => { setShowVoting(v => !v) },
    theme,
    onThemeChange: (t) => { setTheme(t) },
    language: settingsLanguage,
    onLanguageChange: (l) => { setLanguage(l) },
    platform,
    onPlatformChange: (p) => { setPlatform(p) },
    wcagFilter,
    onWcagFilterChange: (f) => { setWcagFilter(f); try { localStorage.setItem('wcagFilter', JSON.stringify(f)) } catch { /* localStorage unavailable */ } },
    partyUnlocked,
    onUnlock: unlock,
    onClose: () => {
      if (selected) navigate(`/finding/${selected.id}/${findingSlug(selected.title)}`)
      else handleCloseSettings()
    },
    onReset: handleResetAll,
    hasPins: pinnedIds.size > 0,
    onClearPins: clearPins,
  }

  // Provider name for the search hint (read from localStorage; updates on next render after save)
  const providerName = aiEnabled
    ? (PROVIDER_NAMES[localStorage.getItem('ai_provider')] || 'AI')
    : null

  const searchView = (
    <>
      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onSearch={handleSearch}
        liveSearch={liveSearch}
        platform={platform}
        aiEnabled={aiEnabled}
        providerName={providerName}
        showVoting={showVoting}
        hasPins={pinnedIds.size > 0}
      />
      {!dataError && !dataLoading && !viewAllLoading && pinnedIds.size > 0 && (
        <PinnedSection
          findings={pinnedResults}
          selected={selected}
          onSelect={handleSelectFinding}
          ratings={ratings}
          onUpvote={upvote}
          onDownvote={downvote}
          onStar={toggleStar}
          onArchive={toggleArchive}
          showVoting={showVoting}
          pinnedIds={pinnedIds}
          onPin={togglePin}
        />
      )}
      {dataError
        ? <DataError onRetry={retryData} />
        : dataLoading || viewAllLoading
          ? <ResultListSkeleton count={activeQuery === 'debug skeleton' ? sortedFindings.length : undefined} />
          : viewAll
            ? (
              <ResultList
                key="view-all"
                results={sortedFindings}
                selected={selected}
                onSelect={handleSelectFinding}
                query=""
                ratings={ratings}
                onUpvote={upvote}
                onDownvote={downvote}
                onStar={toggleStar}
                onArchive={toggleArchive}
                showVoting={showVoting}
                pinnedIds={pinnedIds}
                onPin={togglePin}
              />
            )
            : activeQuery.length >= 2
              ? (
                <ResultList
                  key="search"
                  results={results}
                  selected={selected}
                  onSelect={handleSelectFinding}
                  query={activeQuery}
                  ratings={ratings}
                  onUpvote={upvote}
                  onDownvote={downvote}
                  onStar={toggleStar}
                  onArchive={toggleArchive}
                  showVoting={showVoting}
                  onCopyLink={() => { syncSearchUrl(query); navigator.clipboard.writeText(window.location.href) }}
                  pinnedIds={pinnedIds}
                  onPin={togglePin}
                />
              )
              : badgeFilter
                ? (
                  <ResultList
                    key="badge"
                    results={badgeResults}
                    selected={selected}
                    onSelect={handleSelectFinding}
                    query=""
                    ratings={ratings}
                    onUpvote={upvote}
                    onDownvote={downvote}
                    onStar={toggleStar}
                    onArchive={toggleArchive}
                    showVoting={showVoting}
                    countRef={resultsCountRef}
                    pinnedIds={pinnedIds}
                    onPin={togglePin}
                  />
                )
              : (
                <div className="view-all-section">
                  <button
                    type="button"
                    className="btn-secondary view-all-btn"
                    onClick={() => { viewAllTriggerRef.current = document.activeElement; setViewAllConfirmOpen(true) }}
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
              announce(t('results.loading_announce'))
              setViewAllLoading(true)
              navigate('/results/all')
              setViewAllConfirmOpen(false)
            },
            className: 'btn-accent modal-ok-btn',
          },
          {
            label: t('search.view_all_confirm_no'),
            onClick: () => setViewAllConfirmOpen(false),
            className: 'btn-secondary modal-ok-btn',
          },
        ]}
      >
        <p>{t('search.view_all_confirm_body', { count: allFindings.length })}</p>
      </Modal>
    </>
  )

  return (
    <div className="app-container">
      <div className="dev-toast-stack" aria-hidden="true">
        <AiDebugToast state={aiDebugToast} fading={aiDebugToastFading} />
        <FocusDebugger enabled={devAllEnabled} />
      </div>
      <NamesDebugger enabled={namesEnabled} />
      <DeployBanner target={deployTarget} />
      <DebugLauncher enabled={false} onCommand={runCommand} />
      <DebugHelp
        open={debugHelpOpen}
        onClose={() => setDebugHelpOpen(false)}
        customCommands={[
          {
            heading: 'Custom — A11yTextHelper',
            note: <>Append <code>off</code> to disable (e.g. <code>debug ai assist off</code>).</>,
            rows: [
              { cmd: 'debug skeleton',   desc: 'Skeleton loading state' },
              { cmd: 'debug ai assist',  desc: 'AI Assist + debug toast' },
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
      <Confetti active={theme === 'party'} />
      <PartySparkles active={theme === 'party'} />
      <PartyMusicPlayer active={theme === 'party'} />
      {theme === 'party' && <PartyBanner />}

      <div className="app-background" inert={backgroundInert ? true : undefined} aria-hidden={backgroundInert ? true : undefined}>
        <nav aria-label="Skip navigation">
          <a
            href="#/"
            className="skip-link"
            onClick={(e) => { e.preventDefault(); document.getElementById('finding-search')?.focus() }}
          >
            {t('common.skip_to_main')}
            <ChevronDown size={14} aria-hidden="true" />
          </a>
        </nav>
        <Header
          h1Ref={h1Ref}
          settingsOpen={settingsOpen}
          aboutOpen={aboutOpen}
          onOpenSettings={handleOpenSettings}
          onCloseSettings={handleCloseSettings}
          onOpenAbout={handleOpenAbout}
          onCloseAbout={handleCloseAbout}
          isDesktop={isDesktop}
        />
        <main className="app-main">
          <Announcer devEnabled={devAllEnabled} />
          <Suspense fallback={null}>
            {isNotFound
              ? <NotFoundPage />
              : isDesktop && settingsOpen
                ? <SettingsPanel {...settingsProps} />
                : isDesktop && aboutOpen
                  ? <AboutPanel onClose={handleCloseAbout} />
                  : searchView}
          </Suspense>
        </main>
        <Footer />
      </div>

      {!isDesktop && (
        <Drawer open={settingsOpen} onClose={handleCloseSettings} label={t('settings.drawer_label')} focusOnClose={settingsTriggerRef}>
          <Suspense fallback={null}>
            <SettingsPanel {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={aboutOpen} onClose={handleCloseAbout} label={t('about.sheet_label')} focusOnClose={aboutTriggerRef}>
          <AboutPanel onClose={handleCloseAbout} />
        </Drawer>
      )}

      <BottomSheet
        open={!!selected && !settingsOpen && !aboutOpen}
        onClose={() => { handleSelectFinding(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
        keepMounted={(settingsOpen || aboutOpen) && !!selected}
        label={selected ? t('detail.sheet_label', { title: selected.title }) : t('detail.sheet_default')}
        closeLabel={t('common.close')}
        returnFocusRef={findingTriggerRef}
        onBack={findingHistory.length > 0 ? handleBack : undefined}
        backLabel={t('detail.back_aria')}
        hideCloseBottom
      >
        {selected && (
          <DetailPanel
            key={selected.id}
            finding={selected}
            aiEnabled={aiEnabled}
            focusTrigger={panelFocusTrigger}
            allFindings={allFindings}
            onSelect={handleSelectFinding}
            onSelectRelated={handleSelectRelated}
            onClose={() => { handleSelectFinding(null); returnToPanelRef.current = false }} // eslint-disable-line react-hooks/immutability
            onBadgeClick={handleBadgeClick}
            locale={language}
            userOverridesHook={userOverridesHook}
            contributionQueueHook={contributionQueueHook}
            debugPanelCmd={debugPanelCmd}
            onDebugPanelCmdHandled={() => setDebugPanelCmd(null)}
          />
        )}
      </BottomSheet>
    </div>
  )
}

function Header({ h1Ref, settingsOpen, aboutOpen, onOpenSettings, onCloseSettings, onOpenAbout, onCloseAbout, isDesktop }) {
  const t = useT()
  const compact = isDesktop && (settingsOpen || aboutOpen)
  return (
    <header className={`page-header${compact ? ' page-header--compact' : ''}`}>
      {!compact && (
        <a
          href="https://github.com/mikeyil/a11ytexthelper"
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
          {t('header.github')}<ExternalLink size={11} aria-hidden="true" className="external-link-icon" />
        </a>
      )}

      <div className="page-header__actions">
        {!compact && (
          <button
            onClick={aboutOpen ? onCloseAbout : onOpenAbout}
            aria-label={aboutOpen ? t('common.close') : t('header.open_about')}
            title={aboutOpen ? t('common.close') : t('header.open_about')}
            className="btn-icon btn-icon-accent page-header__about-btn"
          >
            {aboutOpen
              ? <X size={20} strokeWidth={2.5} aria-hidden="true" />
              : <Info size={20} strokeWidth={2} aria-hidden="true" />
            }
          </button>
        )}
        <button
          onClick={settingsOpen ? onCloseSettings : aboutOpen ? onCloseAbout : onOpenSettings}
          aria-label={settingsOpen ? t('header.close_settings') : aboutOpen ? t('common.close') : t('header.open_settings')}
          title={settingsOpen ? t('header.close_settings') : aboutOpen ? t('common.close') : t('header.open_settings')}
          className="btn-icon btn-icon-accent page-header__settings-btn"
        >
          {settingsOpen || aboutOpen
            ? <X size={20} strokeWidth={2.5} aria-hidden="true" />
            : <Settings size={20} strokeWidth={2} aria-hidden="true" />
          }
        </button>
      </div>

      <h1
        ref={h1Ref}
        tabIndex={-1}
        className={compact ? 'sr-only' : 'page-title'}
      >
        <a href="/" className="page-title-link">{t('app.name')}</a>
      </h1>

      {!compact && (
        <p className="page-tagline">{t('app.tagline')}</p>
      )}
    </header>
  )
}

function PartyBanner() {
  const t = useT()
  const [animating, setAnimating] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setAnimating(false), 5000)
    return () => clearTimeout(timerRef.current)
  }, [])

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    setAnimating(true)
    timerRef.current = setTimeout(() => setAnimating(false), 5000)
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
        className="btn-accent not-found__btn"
      >
        {t('notfound.button')}
      </button>
    </div>
  )
}

function Footer() {
  const t = useT()
  const credit = t('footer.credit')
  const nameIdx = credit.indexOf('Mikey Ilagan')
  return (
    <footer className="page-footer">
      <p className="footer-credit">
        {nameIdx >= 0 ? (
          <>
            {credit.slice(0, nameIdx)}
            <strong>Mikey Ilagan</strong>
            {credit.slice(nameIdx + 12)}
          </>
        ) : credit}
        {' · '}
        <a
          href="https://www.linkedin.com/in/mikeyil"
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
          {t('footer.linkedin')}<ExternalLink size={11} aria-hidden="true" className="external-link-icon" />
        </a>
      </p>
    </footer>
  )
}
