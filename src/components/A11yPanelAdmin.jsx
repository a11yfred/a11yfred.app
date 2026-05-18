import { FormControlToggle, ButtonIcon } from '@ulam/ube'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { X, Copy, Check } from 'lucide-react'
import './A11yPanelAdmin.css'
import publicCorpus from '../data/corpus.json'
import legacyCorpus from '../data/legacy-corpus.json'
import personalCorpus from '../data/personal-corpus.json'
import entrySlug from '../utils/entrySlug.js'


import { LS_ADMIN_DATASET } from '../utils/constants.js'
import { getStorage, setStorage } from '../utils/storage.js'
import { detectOverlays, WCAG_CRITERIA } from '@a11yfred/rogers'
import { checkConnectivity } from '@ulam/halohalo'

const IS_DEV = import.meta.env.DEV

const AI_PROBES = [
  { label: 'anthropic', url: 'https://api.anthropic.com' },
  { label: 'openai',    url: 'https://api.openai.com' },
  { label: 'google',    url: 'https://generativelanguage.googleapis.com' },
]

const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Best Practice']

const DEPLOY_OPTIONS = [
  { value: null,      label: 'Off' },
  { value: 'netlify', label: 'Netlify' },
  { value: 'pages',   label: 'Pages' },
  { value: 'vercel',  label: 'Vercel' },
]

const SC_FILTER_OPTIONS      = [['all', 'All'], ['0', 'Missing'], ['1+', 'Covered']]
const LEVEL_FILTER_OPTIONS   = [['all', 'All'], ['A', 'A'], ['AA', 'AA']]
const VERSION_FILTER_OPTIONS = [['all', 'All'], ['2.0', '2.0'], ['2.1', '2.1'], ['2.2', '2.2']]

function computeStats(corpus) {
  const bySC = {}
  const byVersion = {}
  const bySeverity = {}
  const bySource = {}

  // Handle both array and object formats
  const entries = Array.isArray(corpus) ? corpus : Object.values(corpus)
  const total = entries.length

  for (const entry of entries) {
    if (entry.sc && entry.sc !== 'N/A') {
      bySC[entry.sc] = (bySC[entry.sc] || 0) + 1
    }
    const v = entry.wcagVersion ?? 'N/A'
    byVersion[v] = (byVersion[v] || 0) + 1
    const s = entry.severity || 'Unknown'
    bySeverity[s] = (bySeverity[s] || 0) + 1
    const sources = entry.creditNames ?? []
    for (const src of sources) {
      bySource[src] = (bySource[src] || 0) + 1
    }
  }

  return { total, bySC, byVersion, bySeverity, bySource }
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function A11yPanelAdmin({
  devAllEnabled, setDevAllEnabled,
  namesEnabled, setNamesEnabled,
  fabEnabled, setFabEnabled,
  aiEnabled, onToggleAi,
  deployTarget, setDeployTarget,
  showAds, setShowAds,
  adFrequency, setAdFrequency,
  onSearch,
  onFilter,
  onClose,
}) {
  const [dataset, setDataset] = useState(() => getStorage(LS_ADMIN_DATASET, 'public'))
  const [scFilter, setScFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [versionFilter, setVersionFilter] = useState('all')
  const [copied, setCopied] = useState(null)
  const [connectivity, setConnectivity] = useState(null)
  const [connectivityChecking, setConnectivityChecking] = useState(false)
  const [overlays, setOverlays] = useState(null)

  const runConnectivityCheck = useCallback(async () => {
    setConnectivityChecking(true)
    const results = await checkConnectivity(AI_PROBES)
    setConnectivity(results)
    setConnectivityChecking(false)
  }, [])

  const runOverlayCheck = useCallback(() => {
    setOverlays(detectOverlays())
  }, [])

  useEffect(() => { setStorage(LS_ADMIN_DATASET, dataset) }, [dataset])

  const corpus = { public: publicCorpus, legacy: legacyCorpus, personal: personalCorpus }[dataset] ?? publicCorpus
  const stats = useMemo(() => computeStats(corpus), [corpus])

  if (!IS_DEV) return null

  const filtered = WCAG_CRITERIA.filter(c => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false
    if (versionFilter !== 'all' && c.version !== versionFilter) return false
    const n = stats.bySC[c.sc] || 0
    if (scFilter === '0' && n !== 0) return false
    if (scFilter === '1+' && n === 0) return false
    return true
  })

  const covered = filtered.filter(c => (stats.bySC[c.sc] || 0) > 0).length
  const missing = filtered.length - covered

  function handleCopy(sc) {
    copyText(sc)
    setCopied(sc)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__header panel-header">
        <div className="admin-panel__heading">
          <span className="admin-dev-badge">DEV</span>
          Admin
        </div>
        <ButtonIcon
          icon={<X size={18} aria-hidden="true" />}
          label="Close admin panel"
          onClick={onClose}
          variant="tertiary"
        />
      </div>

      <div className="admin-panel__body">

        {/* ── Debug Controls ──────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Debug Controls</h2>
          <div className="admin-toggles">
            {[
              { id: 'admin-all-debug', label: 'All Debug',  value: devAllEnabled,  toggle: () => setDevAllEnabled(v => !v) },
              { id: 'admin-names',     label: 'Names',      value: namesEnabled,   toggle: () => setNamesEnabled(v => !v) },
              { id: 'admin-fab',       label: 'FAB',        value: fabEnabled,     toggle: () => setFabEnabled(v => !v) },
              { id: 'admin-ai',        label: 'AI Assist',  value: aiEnabled,      toggle: onToggleAi },
            ].map(({ id, label, value, toggle }) => (
              <div key={id} className="panel-toggle-row panel-toggle-row--sm">
                <label htmlFor={id} className="panel-toggle-label">{label}</label>
                <FormControlToggle id={id} checked={!!value} onChange={toggle} />
              </div>
            ))}
          </div>

          <div className="admin-deploy-row">
            <span className="panel-toggle-label admin-deploy-label">Deploy Banner</span>
            <div className="admin-deploy-opts">
              {DEPLOY_OPTIONS.map(opt => (
                <button
                  key={String(opt.value)}
                  className={deployTarget === opt.value ? 'btn--primary' : 'btn--secondary'}
                  onClick={() => setDeployTarget(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ad Tiles ────────────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Ad Tiles</h2>
          <div className="panel-toggle-row panel-toggle-row--sm">
            <label htmlFor="admin-show-ads" className="panel-toggle-label">Show ads</label>
            <FormControlToggle id="admin-show-ads" checked={!!showAds} onChange={() => setShowAds(v => !v)} />
          </div>
          <div className="admin-deploy-row">
            <label htmlFor="admin-ad-freq" className="panel-toggle-label admin-deploy-label">
              Every N results
            </label>
            <input
              id="admin-ad-freq"
              type="number"
              min={1}
              max={50}
              value={adFrequency}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 1) setAdFrequency(v)
              }}
              className="admin-number-input"
              disabled={!showAds}
            />
          </div>
        </section>

        {/* ── Corpus ──────────────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Corpus</h2>
          <div className="admin-dataset-tabs">
            {[
              { key: 'public',   label: 'Public',   count: publicCorpus.length },
              { key: 'legacy',   label: 'Legacy',   count: legacyCorpus.length },
              { key: 'personal', label: 'Personal', count: personalCorpus.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                className={dataset === key ? 'btn--primary' : 'btn--secondary'}
                onClick={() => setDataset(key)}
              >
                {label} <span className="admin-tab-count">({count})</span>
              </button>
            ))}
          </div>

          <p className="admin-total">
            {stats.total} total entries
          </p>

          <div className="admin-stats-row">
            <div className="admin-stat-group">
              <h3 className="admin-stat-group__title">WCAG Version</h3>
              <ul className="admin-stat-list">
                {['2.0', '2.1', '2.2', 'N/A'].map(v => (
                  <li key={v}>
                    <button className="admin-stat-link" onClick={() => { onFilter({ type: 'wcag', value: v }) }}>
                      WCAG {v}
                    </button>
                    <span className="admin-count-badge">{stats.byVersion[v] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-stat-group">
              <h3 className="admin-stat-group__title">Priority</h3>
              <ul className="admin-stat-list">
                {PRIORITY_ORDER.map(p => (
                  <li key={p}>
                    <button className="admin-stat-link" onClick={() => { onFilter({ type: 'priority', value: p }) }}>
                      {p}
                    </button>
                    <span className="admin-count-badge">{stats.bySeverity[p] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>

            {Object.keys(stats.bySource).length > 0 && (
              <div className="admin-stat-group">
                <h3 className="admin-stat-group__title">Source</h3>
                <ul className="admin-stat-list">
                  {Object.entries(stats.bySource)
                    .sort(([, a], [, b]) => b - a)
                    .map(([src, count]) => (
                      <li key={src}>
                        <button className="admin-stat-link" onClick={() => { onFilter({ type: 'source', value: src }) }}>
                          {src}
                        </button>
                        <span className="admin-count-badge">{count}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ── WCAG SC Coverage ────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">
            WCAG 2.2 SC Coverage, A &amp; AA
          </h2>

          <div className="admin-sc-filters">
            <div className="admin-filter-group">
              <span className="admin-filter-label">Show</span>
              {SC_FILTER_OPTIONS.map(([v, l]) => (
                <button key={v} className={scFilter === v ? 'btn--primary' : 'btn--secondary'} onClick={() => setScFilter(v)}>{l}</button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Level</span>
              {LEVEL_FILTER_OPTIONS.map(([v, l]) => (
                <button key={v} className={levelFilter === v ? 'btn--primary' : 'btn--secondary'} onClick={() => setLevelFilter(v)}>{l}</button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Version</span>
              {VERSION_FILTER_OPTIONS.map(([v, l]) => (
                <button key={v} className={versionFilter === v ? 'btn--primary' : 'btn--secondary'} onClick={() => setVersionFilter(v)}>{l}</button>
              ))}
            </div>
          </div>

          <p className="admin-sc-summary">
            Showing {filtered.length} of {WCAG_CRITERIA.length} —{' '}
            <span className="admin-sc-summary__covered">{covered} covered</span>,{' '}
            <span className="admin-sc-summary__missing">{missing} missing</span>
          </p>

          <ul className="admin-sc-list">
            {filtered.map(c => {
              const count = stats.bySC[c.sc] || 0
              return (
                <li key={c.sc} className={`admin-sc-item ${count === 0 ? 'admin-sc-item--missing' : ''}`}>
                  <button
                    className="admin-sc-search"
                    onClick={() => onSearch(c.sc)}
                    title={`Search for ${c.sc}`}
                  >
                    {c.sc}
                  </button>
                  <span className="admin-sc-title">{c.title}</span>
                  <span className={`admin-sc-level admin-sc-level--${c.level.toLowerCase()}`}>{c.level}</span>
                  <span className="admin-sc-version">{c.version}</span>
                  <span className={`admin-sc-count ${count === 0 ? 'admin-sc-count--zero' : ''}`}>({count})</span>
                  {c.note && <span className="admin-sc-note">{c.note}</span>}
                  <button
                    className="admin-sc-copy"
                    onClick={() => handleCopy(c.sc)}
                    aria-label={`Copy ${c.sc}`}
                    title="Copy SC number"
                  >
                    {copied === c.sc
                      ? <Check size={13} aria-hidden="true" />
                      : <Copy size={13} aria-hidden="true" />
                    }
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ── Connectivity ────────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">AI Connectivity</h2>
          <button
            className="btn--secondary admin-check-btn"
            onClick={connectivityChecking ? undefined : runConnectivityCheck}
            aria-disabled={connectivityChecking || undefined}
          >
            {connectivityChecking ? 'Checking…' : 'Check providers'}
          </button>
          {connectivity && (
            <ul className="admin-stat-list admin-connectivity-list">
              {connectivity.map(({ label, ok }) => (
                <li key={label} className={`admin-connectivity-item ${ok ? 'admin-connectivity-item--ok' : 'admin-connectivity-item--fail'}`}>
                  <span className="admin-connectivity-dot" aria-hidden="true">{ok ? '●' : '○'}</span>
                  <span className="admin-connectivity-label">{label}</span>
                  <span className="admin-connectivity-status">{ok ? 'reachable' : 'blocked / offline'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Overlay Detector ─────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Overlay Detector</h2>
          <p className="admin-section__desc">
            Checks for known a11y overlay scripts (
            <a href="https://overlayfactsheet.com" target="_blank" rel="noreferrer" className="admin-section__link">
              overlayfactsheet.com<span className="sr-only"> (opens in new tab)</span>
            </a>
            ).
          </p>
          <button className="btn--secondary admin-check-btn" onClick={runOverlayCheck}>
            Scan page
          </button>
          {overlays !== null && (
            overlays.length === 0
              ? <p className="admin-overlay-clear">No overlays detected.</p>
              : (
                <ul className="admin-stat-list admin-overlay-list">
                  {overlays.map(name => (
                    <li key={name} className="admin-overlay-item">
                      <span className="admin-connectivity-dot admin-overlay-dot" aria-hidden="true">⚠</span>
                      {name}
                    </li>
                  ))}
                </ul>
              )
          )}
        </section>

        {/* ── Entry Lookup ────────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Entry Lookup</h2>
          <ul className="admin-entry-list">
            {corpus.map(entry => (
              <li key={entry.id}>
                <a
                  href={`#/entry/${entry.id}/${entrySlug(entry.title)}`}
                  className="admin-entry-link"
                  title={entry.title}
                >
                  {entry.id}
                </a>
                <span className="admin-entry-title">{entry.title}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  )
}
