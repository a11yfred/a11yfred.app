import { useState, useRef, useEffect } from 'react'
import { getAiRefinement } from '../services/aiService.js'
import { useFocusOnMount, useMediaQuery } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'

// Derives the WAI WCAG 2.2 Understanding URL from a scLabel string
// e.g. "1.1.1 Non-text Content (Level A)" → ".../non-text-content.html"
function scToWaiUrl(scLabel) {
  const match = scLabel?.match(/^\d+\.\d+\.\d+\s+(.+?)\s+\(Level/)
  if (!match) return null
  const slug = match[1]
    .toLowerCase()
    .replace(/[,()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return `https://www.w3.org/WAI/WCAG22/Understanding/${slug}.html`
}

export default function DetailPanel({ defect, aiEnabled, onClose }) {
  // Move focus to the defect title when a result is selected so keyboard
  // and screen reader users don't have to navigate down manually.
  const titleRef = useFocusOnMount()
  const isDesktop = useMediaQuery('(width >= 768px)')

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(defect.desc)
  const [remText, setRemText] = useState(defect.rem)
  const [refineNote, setRefineNote] = useState('')
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedRem, setCopiedRem] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetRem, setResetRem] = useState(false)
  const [refining, setRefining] = useState(false)

  // State resets automatically when defect changes because App.jsx
  // passes key={defect.id}, which remounts this component.

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${defect.desc}`
    : descText

  const copy = (text, setCopied, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      announce(`${label}: Copied to clipboard`)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRefine = async () => {
    if (!refineNote.trim()) return
    if (aiEnabled) {
      setRefining(true)
      try {
        const result = await getAiRefinement({ defect, descText, remText, note: refineNote })
        if (result.desc) setDescText(result.desc)
        if (result.rem) setRemText(result.rem)
      } catch (e) {
        console.error('AI refinement failed:', e)
      }
      setRefining(false)
    }
  }

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      paddingTop: '1.5rem',
      marginTop: '0.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          aria-label="Close defect panel"
          className="btn-icon btn-icon-accent"
          style={{ fontSize: 'var(--fs-heading)' }}
        >
          ×
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2
          ref={titleRef}
          tabIndex={-1}
          style={{
            fontSize: 'var(--fs-heading)',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 6,
            outline: 'none',
          }}
        >
          {defect.title}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '2em' }}>
          <ScBadge label={defect.scLabel} primary />
          {defect.related.map(r => <ScBadge key={r} label={r} />)}
        </div>
      </div>

      {/* Location prefix */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="location-prefix"
          style={{ fontSize: 'var(--fs-body)', color: 'var(--text)', display: 'block', marginBottom: 4 }}
        >
          Location prefix <span style={{ color: 'var(--text-faint)' }}>(optional)</span>
        </label>
        <input
          id="location-prefix"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Global: / Cart: / Product details pages:"
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 'var(--fs-body)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-control)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Defect description */}
      <Field
        id="defect-desc"
        label="Defect description"
        value={location.trim() ? displayDesc : descText}
        onChange={setDescText}
        copied={copiedDesc}
        onCopy={() => copy(location.trim() ? displayDesc : descText, setCopiedDesc, 'Defect description')}
        reset={resetDesc}
        onReset={() => { setDescText(defect.desc); announce('Defect description: Reset to original'); setResetDesc(true); setTimeout(() => setResetDesc(false), 2000) }}
        isDesktop={isDesktop}
      />

      {/* Remediation */}
      <Field
        id="defect-rem"
        label="Possible remediation steps"
        value={remText}
        onChange={setRemText}
        copied={copiedRem}
        onCopy={() => copy(remText, setCopiedRem, 'Possible remediation steps')}
        reset={resetRem}
        onReset={() => { setRemText(defect.rem); announce('Possible remediation steps: Reset to original'); setResetRem(true); setTimeout(() => setResetRem(false), 2000) }}
        isDesktop={isDesktop}
      />

      {/* Refine */}
      <div style={{ marginTop: '1rem' }}>
        <label
          htmlFor="refine-note"
          style={{ fontSize: 'var(--fs-body)', color: 'var(--text)', display: 'block', marginBottom: 4 }}
        >
          Refine
          <span style={{ color: 'var(--text-faint)', fontWeight: 400, marginLeft: 6 }}>
            {aiEnabled
              ? 'describe what to change — AI will rewrite'
              : 'edit the fields above directly, or note changes here'}
          </span>
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="refine-note"
            type="text"
            value={refineNote}
            onChange={e => setRefineNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRefine()}
            placeholder={aiEnabled ? 'e.g. this is specific to mobile, element is a tooltip' : 'note for your own reference'}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: 'var(--fs-body)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-control)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
            }}
          />
          {aiEnabled && (
            <button
              onClick={handleRefine}
              disabled={refining || !refineNote.trim()}
              className="btn-accent"
              style={{
                padding: '7px 14px',
                fontSize: 'var(--fs-sub)',
                borderRadius: 'var(--radius)',
                opacity: (refining || !refineNote.trim()) ? 0.5 : 1,
                cursor: (refining || !refineNote.trim()) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {refining ? 'Rewriting…' : 'Rewrite ↗'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ id, label, value, onChange, copied, onCopy, reset, onReset, isDesktop }) {
  const taRef = useRef(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)
    const maxHeight = 5 * lineHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }, [value])

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label htmlFor={id} style={{ fontSize: 'var(--fs-body)', color: 'var(--text)' }}>{label}</label>
        <div style={{ display: 'flex', gap: 4, marginBottom: '0.5em' }}>
          <button
            onClick={onReset}
            aria-label={reset ? `${label} reset` : `Reset ${label.toLowerCase()}`}
            className="btn-accent"
            style={{
              fontSize: 'var(--fs-body)',
              padding: '2px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              ...(reset && { color: 'var(--success)', borderColor: 'var(--success)' }),
            }}
          >
            {reset
              ? (isDesktop ? '✓ Reset' : '✓')
              : (isDesktop ? '↺ Reset' : '↺')}
          </button>
          <button
            onClick={onCopy}
            aria-label={copied ? 'Copied to clipboard' : `Copy ${label.toLowerCase()}`}
            className="btn-accent"
            style={{
              fontSize: 'var(--fs-body)',
              padding: '2px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              ...(copied && { color: 'var(--success)', borderColor: 'var(--success)' }),
            }}
          >
            {copied
              ? (isDesktop ? '✓ Copied' : '✓')
              : (isDesktop ? '⎘ Copy' : '⎘')}
          </button>
        </div>
      </div>
      <textarea
        ref={taRef}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          fontSize: 'var(--fs-body)',
          lineHeight: 1.6,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-control)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          resize: 'none',
          overflowY: 'auto',
          fontFamily: 'ui-monospace, monospace',
        }}
      />
    </div>
  )
}

function ScBadge({ label, primary }) {
  const href = scToWaiUrl(label)
  const style = {
    fontSize: 'var(--fs-body)',
    padding: '2px 8px',
    borderRadius: 20,
    background: primary ? 'var(--accent-bg)' : 'var(--bg-subtle)',
    color: primary ? 'var(--accent-text)' : 'var(--text-muted)',
    border: `1px solid ${primary ? 'var(--accent-bg)' : 'var(--border)'}`,
    textDecoration: 'none',
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}>
        {label}
      </a>
    )
  }
  return <span style={style}>{label}</span>
}
