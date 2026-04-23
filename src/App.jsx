import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ResultList from './components/ResultList.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import useDefectSearch from './hooks/useDefectSearch.js'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [typeahead, setTypeahead] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState('web') // 'web' | 'native'

  const activeQuery = typeahead ? query : submittedQuery
  const results = useDefectSearch(activeQuery, platform)

  // Apply theme to document root. 'auto' follows prefers-color-scheme
  // and listens for OS-level changes while active.
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

  const handleSelect = (defect) => setSelected(defect)

  const handleQueryChange = (q) => {
    setQuery(q)
    if (q === '') {
      setSelected(null)
      setSubmittedQuery('')
    }
  }

  const handleSearch = () => {
    setSubmittedQuery(query)
    setSelected(null)
  }

  return (
    <div className="app-container">
      <Header
        platform={platform}
        onPlatformChange={setPlatform}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main style={{ flex: 1 }}>
        <SearchBar
          query={query}
          onChange={handleQueryChange}
          onSearch={handleSearch}
          typeahead={typeahead}
        />

        {activeQuery.length >= 2 && (
          <ResultList
            results={results}
            selected={selected}
            onSelect={handleSelect}
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
      </main>

      <Footer />

      {showSettings && (
        <SettingsPanel
          aiEnabled={aiEnabled}
          onToggleAi={() => setAiEnabled(a => !a)}
          typeahead={typeahead}
          onToggleTypeahead={() => setTypeahead(t => !t)}
          theme={theme}
          onThemeChange={setTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

function Header({ platform, onPlatformChange, onOpenSettings }) {
  return (
    <header style={{ position: 'relative', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
      <button
        onClick={onOpenSettings}
        title="Settings"
        aria-label="Open settings"
        className="btn-icon"
        style={{ position: 'absolute', top: 0, right: 0, fontSize: 22 }}
      >
        ⚙
      </button>

      <h1 style={{
        fontSize: 'clamp(22px, 5vw, 32px)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        lineHeight: 1.2,
      }}>
        A11yTextHelper
      </h1>

      <p style={{
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-muted)',
        marginTop: 'var(--space-1)',
      }}>
        Audit defect descriptions, fast
      </p>

      <div style={{
        display: 'inline-flex',
        gap: 4,
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius)',
        padding: 3,
        marginTop: 'var(--space-4)',
      }}>
        {['web', 'native'].map(p => (
          <button
            key={p}
            onClick={() => onPlatformChange(p)}
            style={{
              fontSize: 'var(--fs-sm)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: platform === p ? 'var(--bg)' : 'transparent',
              color: platform === p ? 'var(--text)' : 'var(--text-muted)',
              border: platform === p ? '1px solid var(--border)' : '1px solid transparent',
              fontWeight: platform === p ? 500 : 400,
              transition: 'all 0.1s',
            }}
          >
            {p === 'web' ? 'Web' : 'Native'}
          </button>
        ))}
      </div>
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
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)' }}>
        Made by Mikey Ilagan
      </p>

      {/* TODO: update href once the GitHub repo is created */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 'var(--fs-xs)',
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
