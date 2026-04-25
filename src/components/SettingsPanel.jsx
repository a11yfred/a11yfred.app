import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Check } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useMediaQuery } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholder: 'sk-...' },
  { id: 'google',    label: 'Google (Gemini)',      placeholder: 'AIza...' },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholder: 'Paste API key' },
]

const SECTION = {
  fontSize: 'var(--fs-body)',
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
  platform, onPlatformChange,
  onClose,
}) {
  const headingRef = useFocusOnMount()
  usePageTitle('Settings')
  const isDesktop = useMediaQuery('(width >= 768px)')

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

  // Escape key — OffCanvas also listens on mobile; harmless double-fire
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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
    announce('Settings: Saved')
  }

  return (
    <div>
      {/* Page / panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        <button
          onClick={onClose}
          aria-label="Back to search"
          className="btn-icon btn-icon-accent"
          style={{ flexShrink: 0 }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
        {/* tabIndex={-1} allows programmatic focus without joining tab order */}
        <h2
          ref={headingRef}
          tabIndex={-1}
          style={{
            fontSize: 'var(--fs-heading)',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          Settings
        </h2>
      </div>

      {/* ── Search ─────────────────────────────────── */}
      <h3 style={SECTION}>Search</h3>

      {/* Platform */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <p style={{ fontSize: 'var(--fs-sub)', fontWeight: 500, marginBottom: 0 }}>Platform</p>
        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)', marginTop: 2, marginBottom: 'var(--space-3)' }}>
          {platform === 'web' ? 'Show web-oriented results' : 'Show native-oriented results'}
        </p>
        <fieldset style={{ border: 'none', padding: 0 }}>
          <legend className="sr-only">Platform</legend>
          <div style={{ display: 'flex', gap: 6, marginBottom: '2em' }}>
            {[
              { value: 'web',    label: 'Web'    },
              { value: 'native', label: 'Native' },
            ].map(({ value, label }) => (
              <RadioChip
                key={value}
                name="platform-setting"
                value={value}
                label={label}
                current={platform}
                onChange={(val) => {
                  onPlatformChange(val)
                  announce(val === 'web' ? 'Platform: Show web-oriented results' : 'Platform: Show native-oriented results')
                }}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Typeahead */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-5)',
      }}>
        <div>
          <label htmlFor="toggle-typeahead" style={{ fontSize: 'var(--fs-sub)', fontWeight: 500, marginBottom: 0, display: 'block' }}>Typeahead</label>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)', marginTop: 2 }}>
            {typeahead ? 'Results appear as you type' : 'Results appear on Search / Enter'}
          </p>
        </div>
        <Toggle id="toggle-typeahead" checked={typeahead} onChange={onToggleTypeahead} />
      </div>

      {/* ── Appearance ──────────────────────────────── */}
      <h3 style={{ ...SECTION, borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        Appearance
      </h3>
      <fieldset style={{ border: 'none', padding: 0 }}>
        <legend className="sr-only">Theme</legend>
        <div style={{ display: 'flex', gap: 6, marginBottom: '2em' }}>
          {[
            { value: 'light', label: 'Light' },
            { value: 'auto',  label: 'Auto'  },
            { value: 'dark',  label: 'Dark'  },
          ].map(({ value, label }) => (
            <RadioChip
              key={value}
              name="theme-setting"
              value={value}
              label={label}
              current={theme}
              onChange={onThemeChange}
            />
          ))}
        </div>
      </fieldset>

      {/* ── AI Assist ───────────────────────────────── */}
      <h3 style={{ ...SECTION, borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        AI Assist
      </h3>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
      }}>
        <div>
          <label htmlFor="toggle-ai" style={{ fontSize: 'var(--fs-sub)', fontWeight: 500, marginBottom: 0, display: 'block' }}>Enable AI assist</label>
          <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)', marginTop: 2 }}>
            Rewrites text based on your refinement notes
          </p>
        </div>
        <Toggle id="toggle-ai" checked={aiEnabled} onChange={onToggleAi} />
      </div>

      <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
        API keys are stored locally in your browser (<code>localStorage</code>) and sent only to
        the AI provider&rsquo;s own API — never to any intermediate server.
        You supply your own key; usage is billed directly to your account.
      </p>
      <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-faint)' }}>
        This app stores five things in <code>localStorage</code>: your theme preference,
        your platform filter (Web/Native), your search mode (typeahead on/off),
        your active AI provider, and your API key(s).
        No personal data, usage data, or corpus content is collected or transmitted by this app.
      </p>

      <div style={{ marginBottom: '2em' }}>
        <label
          htmlFor="active-provider"
          style={{ fontSize: 'var(--fs-body)', color: 'var(--text)', display: 'block', marginBottom: 4 }}
        >
          Active provider
        </label>
        <div style={{ position: 'relative' }}>
          <select
            id="active-provider"
            value={activeProvider}
            onChange={e => setActiveProvider(e.target.value)}
            disabled={!aiEnabled}
            style={{
              width: '100%',
              padding: '6px 30px 6px 10px',
              fontSize: 'var(--fs-body)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-control)',
              borderRadius: 'var(--radius)',
              color: aiEnabled ? 'var(--text)' : 'var(--text-disabled)',
              cursor: aiEnabled ? 'default' : 'not-allowed',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: aiEnabled ? 'var(--text-faint)' : 'var(--text-faint)',
            }}
          />
        </div>
      </div>

      {PROVIDERS.filter(p => p.id === activeProvider).map(p => (
        <div key={p.id} style={{ marginBottom: 'var(--space-2)' }}>
          <label
            htmlFor={`apikey-${p.id}`}
            style={{ fontSize: 'var(--fs-body)', color: 'var(--text)', display: 'block', marginBottom: 3 }}
          >
            {p.label}
          </label>
          <input
            id={`apikey-${p.id}`}
            type="password"
            value={keys[p.id]}
            onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
            placeholder={p.placeholder}
            disabled={!aiEnabled}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 'var(--fs-body)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-control)',
              borderRadius: 'var(--radius)',
              color: aiEnabled ? 'var(--text)' : 'var(--text-disabled)',
              cursor: aiEnabled ? 'text' : 'not-allowed',
            }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button
          onClick={handleSave}
          className="btn-accent"
          style={{
            padding: '7px 16px',
            fontSize: 'var(--fs-body)',
            borderRadius: 'var(--radius)',
            width: isDesktop ? 'auto' : '100%',
          }}
        >
          {saved
            ? <><Check size={14} strokeWidth={2.5} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-0.15em', marginRight: 4 }} />Saved</>
            : 'Save'
          }
        </button>
      </div>
    </div>
  )
}

function RadioChip({ name, value, label, current, onChange }) {
  const isActive = current === value
  const [focused, setFocused] = useState(false)
  return (
    <label
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '7px 0',
        borderRadius: 'var(--radius)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-control)'}`,
        background: isActive ? 'var(--accent-bg)' : 'var(--bg-subtle)',
        color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: 'var(--fs-body)',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.1s',
        outline: focused ? '2px solid var(--focus)' : 'none',
        outlineOffset: focused ? 2 : 0,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isActive ? 'var(--accent-text)' : 'transparent',
        border: isActive ? 'none' : '1.5px solid var(--text-muted)',
        flexShrink: 0,
        transition: 'all 0.1s',
      }} aria-hidden="true" />
      {label}
    </label>
  )
}

function Toggle({ id, checked, onChange }) {
  const [hovered, setHovered] = useState(false)
  const trackBg = checked
    ? (hovered ? 'var(--accent-text)' : 'var(--accent-bg)')
    : 'var(--border)'
  const trackBorder = checked
    ? (hovered ? 'var(--accent-text)' : 'var(--accent)')
    : 'var(--border-control)'

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', width: 40, height: 22, flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          margin: 0,
          cursor: 'pointer',
          zIndex: 1,
        }}
      />
      <span aria-hidden="true" style={{
        width: 40, height: 22,
        borderRadius: 11,
        background: trackBg,
        border: `1px solid ${trackBorder}`,
        position: 'relative',
        transition: 'background 0.15s, border-color 0.15s',
        pointerEvents: 'none',
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16, height: 16,
          borderRadius: '50%',
          background: '#fff',
          outline: checked ? '1.5px solid var(--accent)' : '1.5px solid var(--border-control)',
          outlineOffset: 0,
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          transition: 'left 0.2s, outline 0.2s',
        }}>
          {checked ? (
            <span style={{
              display: 'block',
              width: 2, height: 8,
              borderRadius: 1,
              background: hovered ? 'var(--accent-bg)' : 'var(--accent)',
            }} />
          ) : (
            <span style={{
              display: 'block',
              width: 8, height: 8,
              borderRadius: '50%',
              border: '1.5px solid var(--border-control)',
              background: 'transparent',
            }} />
          )}
        </span>
      </span>
    </span>
  )
}
