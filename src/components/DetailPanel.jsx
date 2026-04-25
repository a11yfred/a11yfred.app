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
    <div className="detail-panel">
      <div className="detail-panel__close-row">
        <button
          onClick={onClose}
          aria-label="Close defect panel"
          className="btn-icon btn-icon-accent detail-panel__close-btn"
        >
          ×
        </button>
      </div>

      <div className="detail-header">
        <h2 ref={titleRef} tabIndex={-1} className="detail-title">
          {defect.title}
        </h2>
        <div className="badge-group">
          <ScBadge label={defect.scLabel} primary />
          {defect.related.map(r => <ScBadge key={r} label={r} />)}
        </div>
      </div>

      <div className="detail-field-row">
        <label htmlFor="location-prefix" className="detail-label">
          Location prefix <span className="detail-optional">(optional)</span>
        </label>
        <input
          id="location-prefix"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Global: / Cart: / Product details pages:"
          className="detail-input"
        />
      </div>

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

      <div className="detail-refine">
        <label htmlFor="refine-note" className="detail-label">
          Refine
          <span className="detail-label-hint">
            {aiEnabled
              ? 'describe what to change — AI will rewrite'
              : 'edit the fields above directly, or note changes here'}
          </span>
        </label>
        <div className="detail-refine-row">
          <input
            id="refine-note"
            type="text"
            value={refineNote}
            onChange={e => setRefineNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRefine()}
            placeholder={aiEnabled ? 'e.g. this is specific to mobile, element is a tooltip' : 'note for your own reference'}
            className="detail-input"
          />
          {aiEnabled && (
            <button
              onClick={handleRefine}
              disabled={refining || !refineNote.trim()}
              className="btn-accent detail-rewrite-btn"
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
    <div className="field">
      <div className="field__header">
        <label htmlFor={id} className="field__label">{label}</label>
        <div className="field__actions">
          <button
            onClick={onReset}
            aria-label={reset ? `${label} reset` : `Reset ${label.toLowerCase()}`}
            className={`btn-accent field-btn${reset ? ' field-btn--success' : ''}`}
          >
            {reset
              ? (isDesktop ? '✓ Reset' : '✓')
              : (isDesktop ? '↺ Reset' : '↺')}
          </button>
          <button
            onClick={onCopy}
            aria-label={copied ? 'Copied to clipboard' : `Copy ${label.toLowerCase()}`}
            className={`btn-accent field-btn${copied ? ' field-btn--success' : ''}`}
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
        className="field__textarea"
      />
    </div>
  )
}

function ScBadge({ label, primary }) {
  const href = scToWaiUrl(label)
  const cls = `sc-badge${primary ? ' sc-badge--primary' : ''}`
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {label}
      </a>
    )
  }
  return <span className={cls}>{label}</span>
}
