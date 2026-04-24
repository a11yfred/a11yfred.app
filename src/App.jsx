import { useState, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ResultList from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import useDefectSearch from './hooks/useDefectSearch.js'
import {
  Router,
  useRouter,
  OffCanvas,
  useMediaQuery,
} from './plugins/router/index.js'
import { Announcer } from './plugins/announce/index.js'

export default function App() {
  return (
    <Router appName="A11yTextHelper">
      <AppShell />
    </Router>
  )
}

function AppShell() {
  const { route, navigate } = useRouter()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const settingsOpen = route === '/settings'
  const h1Ref = useRef(null)
  const didMount = useRef(false)

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [typeahead, setTypeahead] = useState(true)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState('web')

  const activeQuery = typeahead ? query : submittedQuery
  const results = useDefectSearch(activeQuery, platform)

  useEffect(() => {
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
  }, [theme])

  // When navigating home from settings, focus the page h1 so keyboard and
  // screen reader users land at the top of the new content (WCAG 2.4.3).
  // Skip on initial mount — focus should not move on first load.
  // Desktop only: settings is a page swap, so focus the h1 of the newly
  // shown content on close. On mobile settings is an OffCanvas overlay and
  // focus returns to the trigger via OffCanvas's built-in behavior.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen && isDesktop) h1Ref.current?.focus()
  }, [settingsOpen, isDesktop])

  const handleQueryChange = (q) => {
    setQuery(q)
    if (q === '') {
      setSelected(null)
      setSubmittedQuery('')
    }
  }

  const settingsProps = {
    aiEnabled,
    onToggleAi: () => setAiEnabled(a => !a),
    typeahead,
    onToggleTypeahead: () => setTypeahead(t => !t),
    theme,
    onThemeChange: setTheme,
    platform,
    onPlatformChange: setPlatform,
    onClose: () => navigate('/'),
  }

  const searchView = (
    <>
      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onSearch={() => { setSubmittedQuery(query); setSelected(null) }}
        typeahead={typeahead}
      />
      {activeQuery.length >= 2 && (
        <ResultList
          results={results}
          selected={selected}
          onSelect={setSelected}
          query={activeQuery}
        />
      )}
      {selected && (
        <DetailPanel
          key={selected.id}
          defect={selected}
          aiEnabled={aiEnabled}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )

  return (
    <div className="app-container">
      <Announcer />
      <Header
        h1Ref={h1Ref}
        settingsOpen={settingsOpen}
        onOpenSettings={() => navigate('/settings')}
        onCloseSettings={() => navigate('/')}
      />

      {isDesktop ? (
        <main style={{ flex: 1 }}>
          {settingsOpen ? <SettingsPanel {...settingsProps} /> : searchView}
        </main>
      ) : (
        <>
          <main style={{ flex: 1 }}>{searchView}</main>
          <OffCanvas open={settingsOpen} onClose={() => navigate('/')} label="Settings">
            <SettingsPanel {...settingsProps} />
          </OffCanvas>
        </>
      )}

      <Footer />
    </div>
  )
}

function Header({ h1Ref, settingsOpen, onOpenSettings, onCloseSettings }) {
  return (
    <header style={{ position: 'relative', textAlign: 'center', marginBottom: 'var(--space-8)', paddingTop: 36 }}>
      <button
        onClick={settingsOpen ? onCloseSettings : onOpenSettings}
        aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
        title={settingsOpen ? 'Close settings' : 'Open settings'}
        className="btn-icon"
        style={{ position: 'absolute', top: 0, right: 0, fontSize: 22 }}
      >
        {settingsOpen ? '✕' : '⚙️'}
      </button>

      {/*
        clamp: min 1.75rem (28px) on tiny screens,
               scales at 10.5vw to fill ~85% of a 390px mobile screen,
               max 2.667rem ≈ 32pt on desktop.
      */}
      <h1
        ref={h1Ref}
        tabIndex={-1}
        style={{
          fontSize: 'clamp(1.75rem, 10.5vw, 2.667rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          lineHeight: 1.15,
        }}
      >
        A11yTextHelper
      </h1>

      <p style={{
        fontSize: 'var(--fs-body)',
        color: 'var(--text-muted)',
        marginTop: 'var(--space-1)',
      }}>
        Audit defect descriptions, fast
      </p>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      marginTop: 'var(--space-8)',
      paddingTop: 'var(--space-4)',
      paddingBottom: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
    }}>
      <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-faint)' }}>
        Made by Mikey Ilagan
      </p>
      {/* TODO: update href once the GitHub repo is created */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Fork on GitHub ↗
      </a>
    </footer>
  )
}
