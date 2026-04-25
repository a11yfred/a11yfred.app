import { useState, useEffect, useRef } from 'react'
import { Settings, X } from 'lucide-react'
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
  const [typeahead, setTypeahead] = useState(() => localStorage.getItem('typeahead') !== 'false')
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState(() => localStorage.getItem('platform') || 'web')

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

  useEffect(() => { localStorage.setItem('typeahead', typeahead) }, [typeahead])
  useEffect(() => { localStorage.setItem('platform', platform) }, [platform])

  // WCAG 2.4.3: focus h1 when returning from settings on desktop (page swap).
  // Mobile focus return is handled by OffCanvas. Skip on initial mount.
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
        isDesktop={isDesktop}
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

function Header({ h1Ref, settingsOpen, onOpenSettings, onCloseSettings, isDesktop }) {
  return (
    <header style={{
      position: 'relative',
      textAlign: 'center',
      marginBottom: isDesktop && settingsOpen ? 'var(--space-2)' : 'var(--space-8)',
      paddingTop: isDesktop && settingsOpen ? 0 : 48,
    }}>
      <button
        onClick={settingsOpen ? onCloseSettings : onOpenSettings}
        aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
        title={settingsOpen ? 'Close settings' : 'Open settings'}
        className="btn-icon btn-icon-accent"
        style={{ position: 'absolute', top: 0, right: 0, fontSize: 22 }}
      >
        {settingsOpen
          ? <X size={20} strokeWidth={2.5} aria-hidden="true" />
          : <Settings size={20} strokeWidth={2} aria-hidden="true" />
        }
      </button>

      <h1
        ref={h1Ref}
        tabIndex={-1}
        style={{
          fontSize: 'var(--fs-h1)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          lineHeight: 1.15,
          outline: 'none',
          ...(isDesktop && settingsOpen && { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }),
        }}
      >
        A11yTextHelper
      </h1>

      {!(isDesktop && settingsOpen) && (
        <p style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-1)',
        }}>
          Audit defect descriptions, fast
        </p>
      )}
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
        Made by <strong>Mikey Ilagan</strong> —{' '}
        <a
          href="https://bsky.app/profile/mikeyil.bsky.social"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent-text)', textDecoration: 'underline' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-text)'}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            style={{ display: 'inline-block', verticalAlign: '-0.15em', marginRight: '0.25em' }}
          >
            <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
          </svg>
          @mikeyil.bsky.social
        </a>
      </p>
      <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
        <a
          href="https://github.com/mikeyil/a11ytexthelper"
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'var(--accent-text)',
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-text)'}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            style={{ display: 'inline-block', verticalAlign: '-0.15em', marginRight: '0.25em' }}
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
          </svg>
          Fork on GitHub
        </a>
      </p>
    </footer>
  )
}
