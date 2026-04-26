import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Settings, X, Info } from 'lucide-react'
import SearchBar from './components/SearchBar.jsx'
import ResultList from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import AboutPanel from './components/AboutPanel.jsx'
import Confetti from './components/Confetti.jsx'
import PartySparkles from './components/PartySparkles.jsx'
import PartyMusicPlayer from './components/PartyMusicPlayer.jsx'
import useDefectSearch from './hooks/useDefectSearch.js'
import useDefectRatings from './hooks/useDefectRatings.js'
import {
  Router,
  useRouter,
  Drawer,
  BottomSheet,
  useMediaQuery,
} from './plugins/router/index.js'
import { Announcer, announce } from './plugins/announce/index.js'
import { playPartySound, playSqueak } from './utils/partySounds.js'
import { I18nProvider, useT } from './i18n/index.jsx'

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
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searchKey, setSearchKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState(() => localStorage.getItem('platform') || 'web')
  const [panelFocusTrigger, setPanelFocusTrigger] = useState(0)

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
  panelFocusTrigger, setPanelFocusTrigger,
}) {
  const { route, navigate } = useRouter()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()
  const settingsOpen = route === '/settings'
  const isNotFound = route !== '/' && route !== '/settings'
  const h1Ref = useRef(null)
  const didMount = useRef(false)
  const aboutWasOpenRef = useRef(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const handleOpenAbout = () => { if (settingsOpen) navigate('/'); setAboutOpen(true) }
  const handleCloseAbout = () => setAboutOpen(false)
  // Tracks whether settings was opened while a defect panel was selected,
  // so the panel is restored (with edits) when settings closes.
  const returnToPanelRef = useRef(false)
  const pendingSearchAnnounce = useRef(false)
  const liveAnnounceTimer = useRef(null)

  const { ratings, upvote, downvote, toggleStar, toggleArchive } = useDefectRatings()
  const activeQuery = liveSearch ? query : submittedQuery
  const { results, allDefects } = useDefectSearch(activeQuery, platform, language, searchKey, ratings)

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
      if (e.target.id === 'defect-search' && !IGNORED_KEYS.has(e.key)) {
        count++
        if (count % 3 === 0) playSqueak()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [theme])

  const EASTER_EGG_LOCALES = new Set(['pig', 'pir', 'tlh', 'val'])
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

  // Announce result count: immediately on manual search, debounced 500ms on live search
  useEffect(() => {
    if (pendingSearchAnnounce.current) {
      pendingSearchAnnounce.current = false
      clearTimeout(liveAnnounceTimer.current)
      announce(t('results.count_announce', { count: results.length }))
      return
    }
    if (!liveSearch || query.trim().length < 2) {
      clearTimeout(liveAnnounceTimer.current)
      return
    }
    clearTimeout(liveAnnounceTimer.current)
    liveAnnounceTimer.current = setTimeout(() => {
      announce(t('results.count_announce', { count: results.length }))
    }, 500)
  }, [query, liveSearch, searchKey]) // eslint-disable-line react-hooks/exhaustive-deps -- t and results.length read from closure; refs not reactive

  // WCAG 2.4.3: focus h1 when returning from settings on desktop (page swap).
  // On mobile or when returning to a defect panel, restore panel focus instead.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) {
      if (returnToPanelRef.current) {
        setPanelFocusTrigger(n => n + 1)
        returnToPanelRef.current = false
      } else if (isDesktop) {
        h1Ref.current?.focus()
      }
    }
  }, [settingsOpen, isDesktop]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (aboutOpen) { aboutWasOpenRef.current = true; return }
    if (aboutWasOpenRef.current && isDesktop) {
      h1Ref.current?.focus()
      aboutWasOpenRef.current = false
    }
  }, [aboutOpen, isDesktop])

  const EASTER_EGGS = { 'pig latin': 'pig', pirate: 'pir', klingon: 'tlh', valyrian: 'val' }

  const activateEasterEgg = (egg) => {
    setLanguage(egg)
    setQuery('')
    setSelected(null)
    returnToPanelRef.current = false
    setSubmittedQuery('')
  }

  const handleQueryChange = (q) => {
    if (liveSearch) {
      const egg = EASTER_EGGS[q.trim().toLowerCase()]
      if (egg) { activateEasterEgg(egg); return }
    }
    setQuery(q)
    if (q === '') {
      setSelected(null)
      returnToPanelRef.current = false
      setSubmittedQuery('')
    }
  }

  const handleSearch = () => {
    const egg = EASTER_EGGS[query.trim().toLowerCase()]
    if (egg) { activateEasterEgg(egg); return }
    setSubmittedQuery(query)
    setSearchKey(k => k + 1)
    setSelected(null)
    pendingSearchAnnounce.current = true
  }

  const handleOpenSettings = () => {
    aboutWasOpenRef.current = false  // prevent about-close focus competing with settings-open focus
    setAboutOpen(false)
    returnToPanelRef.current = !!selected
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
    setLiveSearch(true)
    setShowVoting(true)
    setAiEnabled(false)
    setQuery('')
    setSubmittedQuery('')
    setSelected(null)
    navigate('/')
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
    partyUnlocked,
    onUnlock: unlock,
    onClose: () => navigate('/'),
    onReset: handleResetAll,
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
      />
      {activeQuery.length >= 2 && (
        <ResultList
          results={results}
          selected={selected}
          onSelect={setSelected}
          query={activeQuery}
          ratings={ratings}
          onUpvote={upvote}
          onDownvote={downvote}
          onStar={toggleStar}
          onArchive={toggleArchive}
          showVoting={showVoting}
        />
      )}
    </>
  )

  return (
    <div className="app-container">
      <Announcer />
      <Confetti active={theme === 'party'} />
      <PartySparkles active={theme === 'party'} />
      <PartyMusicPlayer active={theme === 'party'} />
      {theme === 'party' && <PartyBanner />}

      <div className="app-background" inert={backgroundInert ? '' : undefined} aria-hidden={backgroundInert ? true : undefined}>
        <Header
          h1Ref={h1Ref}
          settingsOpen={settingsOpen}
          aboutOpen={aboutOpen}
          onOpenSettings={handleOpenSettings}
          onCloseSettings={() => navigate('/')}
          onOpenAbout={handleOpenAbout}
          onCloseAbout={handleCloseAbout}
          isDesktop={isDesktop}
        />
        <main className="app-main">
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
        <Drawer open={settingsOpen} onClose={() => navigate('/')} label={t('settings.drawer_label')}>
          <Suspense fallback={null}>
            <SettingsPanel {...settingsProps} />
          </Suspense>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer open={aboutOpen} onClose={handleCloseAbout} label={t('about.sheet_label')}>
          <AboutPanel onClose={handleCloseAbout} />
        </Drawer>
      )}

      <BottomSheet
        open={!!selected && !settingsOpen && !aboutOpen}
        onClose={() => { setSelected(null); returnToPanelRef.current = false }}
        keepMounted={(settingsOpen || aboutOpen) && !!selected}
        label={selected ? t('detail.sheet_label', { title: selected.title }) : t('detail.sheet_default')}
        closeLabel={t('common.close')}
      >
        {selected && (
          <DetailPanel
            key={selected.id}
            defect={selected}
            aiEnabled={aiEnabled}
            focusTrigger={panelFocusTrigger}
            allDefects={allDefects}
            onSelect={setSelected}
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
          {t('header.github')}
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
          onClick={settingsOpen ? onCloseSettings : onOpenSettings}
          aria-label={settingsOpen ? t('header.close_settings') : t('header.open_settings')}
          title={settingsOpen ? t('header.close_settings') : t('header.open_settings')}
          className="btn-icon btn-icon-accent page-header__settings-btn"
        >
          {settingsOpen
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
          {t('footer.linkedin')}
        </a>
      </p>
    </footer>
  )
}
