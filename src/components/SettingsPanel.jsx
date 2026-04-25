import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronDown, Check, Info } from 'lucide-react'
import { useFocusOnMount, usePageTitle, useMediaQuery, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'

const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { id: 'openai',    label: 'OpenAI (GPT)',        placeholder: 'sk-...' },
  { id: 'google',    label: 'Google (Gemini)',      placeholder: 'AIza...' },
  { id: 'microsoft', label: 'Microsoft (Copilot)', placeholder: 'Paste API key' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'ja', label: '日本語' },
  { value: 'tl', label: 'Filipino' },
]

export default function SettingsPanel({
  aiEnabled, onToggleAi,
  liveSearch, onToggleLiveSearch,
  theme, onThemeChange,
  language, onLanguageChange,
  platform, onPlatformChange,
  onClose,
}) {
  const headingRef = useFocusOnMount()
  usePageTitle('Settings')
  const isDesktop = useMediaQuery('(width >= 768px)')
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Escape key — Drawer also listens on mobile; harmless double-fire
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
      <div className="settings-header">
        <button
          onClick={onClose}
          aria-label="Back to search"
          className="btn-icon btn-icon-accent"
        >
          <ChevronLeft size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="settings-title">
          Settings
        </h2>
      </div>

      {/* ── Appearance ──────────────────────────────── */}
      <h3 className="settings-section-heading">Appearance</h3>

      {/* Theme */}
      <fieldset className="settings-fieldset">
        <legend className="sr-only">Theme</legend>
        <div className="radio-chip-group">
          {[
            { value: 'light', label: 'Light'       },
            { value: 'auto',  label: 'Auto'        },
            { value: 'dark',  label: 'Dark'        },
            { value: 'party', label: 'Party Mode?' },
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

      {/* Language */}
      <div className="settings-group">
        <p className="settings-group__label">Language</p>
        <p className="settings-group__desc">
          Defaults to your browser&rsquo;s language. Full translations are in progress.
        </p>
        <div className="settings-select-wrap">
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            className="settings-select"
            aria-label="Language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
        </div>
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">Search</h3>

      {/* Platform */}
      <div className="settings-group">
        <p className="settings-group__label">Platform</p>
        <p className="settings-group__desc">
          {platform === 'web' ? 'Show web-oriented results' : 'Show native-oriented results'}
        </p>
        <fieldset className="settings-fieldset">
          <legend className="sr-only">Platform</legend>
          <div className="radio-chip-group">
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

      {/* Live search */}
      <div className="settings-toggle-row">
        <div>
          <label htmlFor="toggle-live-search" className="settings-toggle-label">Live search</label>
          <p className="settings-toggle-desc">
            {liveSearch ? 'Results appear as you type' : 'Results appear on Search / Enter'}
          </p>
        </div>
        <Toggle id="toggle-live-search" checked={liveSearch} onChange={onToggleLiveSearch} />
      </div>

      {/* ── AI Assist ───────────────────────────────── */}
      <h3 className="settings-section-heading settings-section-heading--divided">AI Assist</h3>

      <div className="settings-toggle-row settings-toggle-row--sm">
        <div>
          <label htmlFor="toggle-ai" className="settings-toggle-label">Enable AI assist</label>
          <p className="settings-toggle-desc">Rewrites text based on your refinement notes</p>
        </div>
        <Toggle id="toggle-ai" checked={aiEnabled} onChange={onToggleAi} />
      </div>

      <button
        type="button"
        onClick={() => setPrivacyOpen(true)}
        className="settings-privacy-btn"
      >
        <Info size={14} aria-hidden="true" />
        Privacy &amp; storage information
      </button>

      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        heading="Privacy & Storage"
      >
        <p>
          API keys are stored locally in your browser (<code>localStorage</code>) and sent only to
          the AI provider&rsquo;s own API — never to any intermediate server.
          You supply your own key; usage is billed directly to your account.
        </p>
        <p>
          This app stores six things in <code>localStorage</code>: your theme preference,
          your language preference, your platform filter (Web/Native), your live search setting,
          your active AI provider, and your API key(s).
          No personal data, usage data, or corpus content is collected or transmitted by this app.
        </p>
      </Modal>

      <div className="settings-provider-group">
        <label htmlFor="active-provider" className="settings-field-label">
          Active provider
        </label>
        <div className="settings-select-wrap">
          <select
            id="active-provider"
            value={activeProvider}
            onChange={e => setActiveProvider(e.target.value)}
            disabled={!aiEnabled}
            className="settings-select"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" className="settings-select-chevron" />
        </div>
      </div>

      {PROVIDERS.filter(p => p.id === activeProvider).map(p => (
        <div key={p.id} className="settings-key-group">
          <label htmlFor={`apikey-${p.id}`} className="settings-field-label">
            {p.label}
          </label>
          <input
            id={`apikey-${p.id}`}
            type="password"
            value={keys[p.id]}
            onChange={e => setKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
            placeholder={p.placeholder}
            disabled={!aiEnabled}
            className="settings-key-input"
          />
        </div>
      ))}

      <div className="settings-save-row">
        <button onClick={handleSave} className="btn-accent settings-save-btn">
          {saved
            ? <><Check size={14} strokeWidth={2.5} aria-hidden="true" className="inline-icon" />Saved</>
            : 'Save'
          }
        </button>
      </div>

      {prefersReducedMotion && (
        <p className="settings-reduced-motion-note">
          You have reduced motion turned on, and we are actively acknowledging
          that system setting. Animations like confetti will be skipped until
          you change it in your OS accessibility settings.
        </p>
      )}
    </div>
  )
}

function RadioChip({ name, value, label, current, onChange }) {
  const isActive = current === value
  return (
    <label className={`radio-chip${isActive ? ' radio-chip--active' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isActive}
        onChange={() => onChange(value)}
        className="radio-chip__input"
      />
      <span className="radio-chip__indicator" aria-hidden="true" />
      {label}
    </label>
  )
}

function Toggle({ id, checked, onChange }) {
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        onChange={onChange}
        className="toggle__input"
      />
      <span aria-hidden="true" className="toggle__track">
        <span className="toggle__thumb">
          {checked
            ? <span className="toggle__check" />
            : <span className="toggle__ring" />
          }
        </span>
      </span>
    </span>
  )
}
