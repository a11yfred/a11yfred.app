import { useState, useEffect } from 'react'

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholder: 'sk-...' },
  { id: 'google',    label: 'Google (Gemini)',      placeholder: 'AIza...' },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholder: 'Paste API key' },
]

const SECTION = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 'var(--space-3)',
}

export default function SettingsPanel({
  aiEnabled, onToggleAi,
  typeahead, onToggleTypeahead,
  theme, onThemeChange,
  onClose,
}) {
  const [keys, setKeys] = useState(() => {
    const saved = {}
    PROVIDERS.forEach(p => {
      saved[p.id] = localStorage.getItem(`apikey_${p.id}`) || ''
    })
    return saved
  })
  const [activeProvider, setActiveProvider] = useState(
    () => localStorage.getItem('ai_provider') || 'anthropic'
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = () => {
    PROVIDERS.forEach(p => {
      if (keys[p.id]) {
        localStorage.setItem(`apikey_${p.id}`, keys[p.id])
      } else {
        localStorage.removeItem(`apikey_${p.id}`)
      }
    })
    localStorage.setItem('ai_provider', activeProvider)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Dialog header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 id="settings-title" style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="btn-icon"
            style={{ fontSize: 24, color: 'var(--text-faint)' }}
          >
            ×
          </button>
        </div>

        {/* ── Search ─────────────────────────────────── */}
        <h3 style={SECTION}>Search</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <div>
            <p style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>Typeahead</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
              {typeahead ? 'Results appear as you type' : 'Results appear on Search / Enter'}
            </p>
          </div>
          <Toggle checked={typeahead} onChange={onToggleTypeahead} label="Toggle typeahead search" />
        </div>

        {/* ── Appearance ──────────────────────────────── */}
        <h3 style={{ ...SECTION, borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>Appearance</h3>
        <fieldset style={{ border: 'none', padding: 0, marginBottom: 'var(--space-5)' }}>
          <legend className="sr-only">Theme</legend>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { value: 'light', label: 'Light' },
              { value: 'auto',  label: 'Auto'  },
              { value: 'dark',  label: 'Dark'  },
            ].map(({ value, label }) => (
              <ThemeChip
                key={value}
                value={value}
                label={label}
                current={theme}
                onChange={onThemeChange}
              />
            ))}
          </div>
        </fieldset>

        {/* ── AI Assist ───────────────────────────────── */}
        <h3 style={{ ...SECTION, borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>AI Assist</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>Enable AI assist</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
              Rewrites text based on your refinement notes
            </p>
          </div>
          <Toggle checked={aiEnabled} onChange={onToggleAi} label="Toggle AI assist" />
        </div>

        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
          API keys are stored locally in your browser and never sent to any server.
          You supply your own key — usage is billed to your account.
        </p>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label
            htmlFor="active-provider"
            style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}
          >
            Active provider
          </label>
          <select
            id="active-provider"
            value={activeProvider}
            onChange={e => setActiveProvider(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 'var(--fs-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
            }}
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {PROVIDERS.map(p => (
          <div key={p.id} style={{ marginBottom: 'var(--space-2)' }}>
            <label
              htmlFor={`apikey-${p.id}`}
              style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}
            >
              {p.label}
            </label>
            <input
              id={`apikey-${p.id}`}
              type="password"
              value={keys[p.id]}
              onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
              placeholder={p.placeholder}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 'var(--fs-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px',
              fontSize: 'var(--fs-sm)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--accent)',
              background: 'var(--accent-bg)',
              color: 'var(--accent-text)',
              fontWeight: 500,
            }}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ThemeChip({ value, label, current, onChange }) {
  const isActive = current === value
  return (
    <label style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      padding: '7px 0',
      borderRadius: 'var(--radius)',
      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
      background: isActive ? 'var(--accent-bg)' : 'var(--bg-subtle)',
      color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 'var(--fs-sm)',
      fontWeight: isActive ? 500 : 400,
      transition: 'all 0.1s',
    }}>
      <input
        type="radio"
        name="theme-setting"
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {label}
    </label>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      style={{
        width: 40, height: 22,
        borderRadius: 11,
        background: checked ? 'var(--accent)' : 'var(--border)',
        border: 'none',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        display: 'block',
        width: 16, height: 16,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: checked ? 21 : 3,
        transition: 'left 0.2s',
      }} />
    </button>
  )
}
