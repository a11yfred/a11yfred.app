import { useState, useMemo } from 'react'
import './admin-panel.css'
import publicCorpus from '../../data/corpus.json'
import personalCorpus from '../../data/personal-corpus.json'
import findingSlug from '../../utils/findingSlug.js'

const IS_DEV = import.meta.env.DEV

const WCAG_CRITERIA = [
  // 1.1 Text Alternatives
  { sc: '1.1.1', title: 'Non-text Content',                                          level: 'A',  version: '2.0' },
  // 1.2 Time-based Media
  { sc: '1.2.1', title: 'Audio-only and Video-only (Prerecorded)',                   level: 'A',  version: '2.0' },
  { sc: '1.2.2', title: 'Captions (Prerecorded)',                                    level: 'A',  version: '2.0' },
  { sc: '1.2.3', title: 'Audio Description or Media Alternative (Prerecorded)',      level: 'A',  version: '2.0' },
  { sc: '1.2.4', title: 'Captions (Live)',                                           level: 'AA', version: '2.0' },
  { sc: '1.2.5', title: 'Audio Description (Prerecorded)',                           level: 'AA', version: '2.0' },
  // 1.3 Adaptable
  { sc: '1.3.1', title: 'Info and Relationships',                                    level: 'A',  version: '2.0' },
  { sc: '1.3.2', title: 'Meaningful Sequence',                                       level: 'A',  version: '2.0' },
  { sc: '1.3.3', title: 'Sensory Characteristics',                                   level: 'A',  version: '2.0' },
  { sc: '1.3.4', title: 'Orientation',                                               level: 'A',  version: '2.1' },
  { sc: '1.3.5', title: 'Identify Input Purpose',                                    level: 'AA', version: '2.1' },
  // 1.4 Distinguishable
  { sc: '1.4.1', title: 'Use of Color',                                              level: 'A',  version: '2.0' },
  { sc: '1.4.2', title: 'Audio Control',                                             level: 'A',  version: '2.0' },
  { sc: '1.4.3', title: 'Contrast (Minimum)',                                        level: 'AA', version: '2.0' },
  { sc: '1.4.4', title: 'Resize Text',                                               level: 'AA', version: '2.0' },
  { sc: '1.4.5', title: 'Images of Text',                                            level: 'AA', version: '2.0' },
  { sc: '1.4.10', title: 'Reflow',                                                   level: 'AA', version: '2.1' },
  { sc: '1.4.11', title: 'Non-text Contrast',                                        level: 'AA', version: '2.1' },
  { sc: '1.4.12', title: 'Text Spacing',                                             level: 'AA', version: '2.1' },
  { sc: '1.4.13', title: 'Content on Hover or Focus',                                level: 'AA', version: '2.1' },
  // 2.1 Keyboard Accessible
  { sc: '2.1.1', title: 'Keyboard',                                                  level: 'A',  version: '2.0' },
  { sc: '2.1.2', title: 'No Keyboard Trap',                                          level: 'A',  version: '2.0' },
  { sc: '2.1.4', title: 'Character Key Shortcuts',                                   level: 'A',  version: '2.1' },
  // 2.2 Enough Time
  { sc: '2.2.1', title: 'Timing Adjustable',                                         level: 'A',  version: '2.0' },
  { sc: '2.2.2', title: 'Pause, Stop, Hide',                                         level: 'A',  version: '2.0' },
  // 2.3 Seizures and Physical Reactions
  { sc: '2.3.1', title: 'Three Flashes or Below Threshold',                          level: 'A',  version: '2.0' },
  // 2.4 Navigable
  { sc: '2.4.1', title: 'Bypass Blocks',                                             level: 'A',  version: '2.0' },
  { sc: '2.4.2', title: 'Page Titled',                                               level: 'A',  version: '2.0' },
  { sc: '2.4.3', title: 'Focus Order',                                               level: 'A',  version: '2.0' },
  { sc: '2.4.4', title: 'Link Purpose (In Context)',                                 level: 'A',  version: '2.0' },
  { sc: '2.4.5', title: 'Multiple Ways',                                             level: 'AA', version: '2.0' },
  { sc: '2.4.6', title: 'Headings and Labels',                                       level: 'AA', version: '2.0' },
  { sc: '2.4.7', title: 'Focus Visible',                                             level: 'AA', version: '2.0' },
  { sc: '2.4.11', title: 'Focus Not Obscured (Minimum)',                             level: 'AA', version: '2.2' },
  // 2.5 Input Modalities
  { sc: '2.5.1', title: 'Pointer Gestures',                                          level: 'A',  version: '2.1' },
  { sc: '2.5.2', title: 'Pointer Cancellation',                                      level: 'A',  version: '2.1' },
  { sc: '2.5.3', title: 'Label in Name',                                             level: 'A',  version: '2.1' },
  { sc: '2.5.4', title: 'Motion Actuation',                                          level: 'A',  version: '2.1' },
  { sc: '2.5.7', title: 'Dragging Movements',                                        level: 'AA', version: '2.2' },
  { sc: '2.5.8', title: 'Target Size (Minimum)',                                     level: 'AA', version: '2.2' },
  // 3.1 Readable
  { sc: '3.1.1', title: 'Language of Page',                                          level: 'A',  version: '2.0' },
  { sc: '3.1.2', title: 'Language of Parts',                                         level: 'AA', version: '2.0' },
  // 3.2 Predictable
  { sc: '3.2.1', title: 'On Focus',                                                  level: 'A',  version: '2.0' },
  { sc: '3.2.2', title: 'On Input',                                                  level: 'A',  version: '2.0' },
  { sc: '3.2.3', title: 'Consistent Navigation',                                     level: 'AA', version: '2.0' },
  { sc: '3.2.4', title: 'Consistent Identification',                                 level: 'AA', version: '2.0' },
  { sc: '3.2.6', title: 'Consistent Help',                                           level: 'A',  version: '2.2' },
  // 3.3 Input Assistance
  { sc: '3.3.1', title: 'Error Identification',                                      level: 'A',  version: '2.0' },
  { sc: '3.3.2', title: 'Labels or Instructions',                                    level: 'A',  version: '2.0' },
  { sc: '3.3.3', title: 'Error Suggestion',                                          level: 'AA', version: '2.0' },
  { sc: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)',                 level: 'AA', version: '2.0' },
  { sc: '3.3.7', title: 'Redundant Entry',                                           level: 'A',  version: '2.2' },
  { sc: '3.3.8', title: 'Accessible Authentication (Minimum)',                       level: 'AA', version: '2.2' },
  // 4.1 Compatible
  { sc: '4.1.1', title: 'Parsing',                                                   level: 'A',  version: '2.0', note: 'Obsolete in 2.2' },
  { sc: '4.1.2', title: 'Name, Role, Value',                                         level: 'A',  version: '2.0' },
  { sc: '4.1.3', title: 'Status Messages',                                           level: 'AA', version: '2.1' },
]

const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Best Practice']

const DEPLOY_OPTIONS = [
  { value: null,      label: 'Off' },
  { value: 'netlify', label: 'Netlify' },
  { value: 'pages',   label: 'Pages' },
  { value: 'vercel',  label: 'Vercel' },
]

function computeStats(corpus) {
  const bySC = {}
  const byVersion = {}
  const bySeverity = {}
  const bySource = {}

  for (const entry of corpus) {
    if (entry.sc && entry.sc !== 'N/A') {
      bySC[entry.sc] = (bySC[entry.sc] || 0) + 1
    }
    const v = entry.wcagVersion ?? 'N/A'
    byVersion[v] = (byVersion[v] || 0) + 1
    const s = entry.severity || 'Unknown'
    bySeverity[s] = (bySeverity[s] || 0) + 1
    // sourceCredits is string[] (author names); sources is object[] ({ name, url })
    const sources = entry.sourceCredits ?? []
    for (const src of sources) {
      bySource[src] = (bySource[src] || 0) + 1
    }
  }

  return { total: corpus.length, bySC, byVersion, bySeverity, bySource }
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

export default function AdminPanel({
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
  const [dataset, setDataset] = useState('public')
  const [scFilter, setScFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [versionFilter, setVersionFilter] = useState('all')
  const [copied, setCopied] = useState(null)

  const corpus = dataset === 'public' ? publicCorpus : personalCorpus
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

  const hasVersionData = true

  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div className="admin-panel__heading">
          <span className="admin-dev-badge">DEV</span>
          Admin
        </div>
        <button className="admin-close-btn" onClick={onClose} aria-label="Close admin panel">✕</button>
      </div>

      <div className="admin-panel__body">

        {/* ── Debug Controls ──────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Debug Controls</h2>
          <div className="admin-toggles">
            {[
              { label: 'All Debug',  value: devAllEnabled,  toggle: () => setDevAllEnabled(v => !v) },
              { label: 'Names',      value: namesEnabled,   toggle: () => setNamesEnabled(v => !v) },
              { label: 'FAB',        value: fabEnabled,     toggle: () => setFabEnabled(v => !v) },
              { label: 'AI Assist',  value: aiEnabled,      toggle: onToggleAi },
            ].map(({ label, value, toggle }) => (
              <div key={label} className="admin-toggle-row">
                <span className="admin-toggle-label">{label}</span>
                <button
                  className={`admin-toggle-btn ${value ? 'admin-toggle-btn--on' : ''}`}
                  onClick={toggle}
                >
                  {value ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>

          <div className="admin-deploy-row">
            <span className="admin-toggle-label">Deploy Banner</span>
            <div className="admin-deploy-opts">
              {DEPLOY_OPTIONS.map(opt => (
                <button
                  key={String(opt.value)}
                  className={`admin-deploy-btn ${deployTarget === opt.value ? 'admin-deploy-btn--active' : ''}`}
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
          <div className="admin-toggle-row">
            <span className="admin-toggle-label">Show ads</span>
            <button
              className={`admin-toggle-btn ${showAds ? 'admin-toggle-btn--on' : ''}`}
              onClick={() => setShowAds(v => !v)}
            >
              {showAds ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="admin-deploy-row">
            <label htmlFor="admin-ad-freq" className="admin-toggle-label">
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
            <button
              className={`admin-tab ${dataset === 'public' ? 'admin-tab--active' : ''}`}
              onClick={() => setDataset('public')}
            >
              Public <span className="admin-tab-count">({publicCorpus.length})</span>
            </button>
            <button
              className={`admin-tab ${dataset === 'personal' ? 'admin-tab--active' : ''}`}
              onClick={() => setDataset('personal')}
            >
              Personal <span className="admin-tab-count">({personalCorpus.length})</span>
            </button>
          </div>

          <p className="admin-total">
            {stats.total} total entries
          </p>

          <div className="admin-stats-row">
            {hasVersionData && (
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
            )}

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

            {hasVersionData && Object.keys(stats.bySource).length > 0 && (
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
              {[['all', 'All'], ['0', 'Missing'], ['1+', 'Covered']].map(([v, l]) => (
                <button key={v} className={`admin-filter-btn ${scFilter === v ? 'admin-filter-btn--on' : ''}`} onClick={() => setScFilter(v)}>{l}</button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Level</span>
              {[['all', 'All'], ['A', 'A'], ['AA', 'AA']].map(([v, l]) => (
                <button key={v} className={`admin-filter-btn ${levelFilter === v ? 'admin-filter-btn--on' : ''}`} onClick={() => setLevelFilter(v)}>{l}</button>
              ))}
            </div>
            <div className="admin-filter-group">
              <span className="admin-filter-label">Version</span>
              {[['all', 'All'], ['2.0', '2.0'], ['2.1', '2.1'], ['2.2', '2.2']].map(([v, l]) => (
                <button key={v} className={`admin-filter-btn ${versionFilter === v ? 'admin-filter-btn--on' : ''}`} onClick={() => setVersionFilter(v)}>{l}</button>
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
                    {copied === c.sc ? '✓' : '⎘'}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ── Entry Lookup ────────────────────────────────────── */}
        <section className="admin-section">
          <h2 className="admin-section__title">Entry Lookup</h2>
          <ul className="admin-entry-list">
            {corpus.map(entry => (
              <li key={entry.id}>
                <a
                  href={`#/finding/${entry.id}/${findingSlug(entry.title)}`}
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
