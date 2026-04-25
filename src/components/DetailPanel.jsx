import { useState, useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { getAiRefinement } from '../services/aiService.js'
import { useFocusOnMount, useMediaQuery, useRouter, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'

const PRIORITY_VARS = {
  Critical:        { color: 'var(--priority-critical-text)', bg: 'var(--priority-critical-bg)' },
  High:            { color: 'var(--priority-high-text)',     bg: 'var(--priority-high-bg)'     },
  Medium:          { color: 'var(--priority-medium-text)',   bg: 'var(--priority-medium-bg)'   },
  Low:             { color: 'var(--priority-low-text)',      bg: 'var(--priority-low-bg)'      },
  'Best Practice': { color: 'var(--text-muted)',             bg: 'var(--bg-subtle)'            },
}

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

// Levenshtein edit distance for the reset-confirmation threshold check
function editDistance(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 1; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function isSignificantlyChanged(original, current, threshold = 0.7) {
  if (!original || original === current) return false
  return editDistance(original, current) / original.length > threshold
}

export default function DetailPanel({ defect, aiEnabled, focusTrigger = 0 }) {
  const titleRef = useFocusOnMount()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const { navigate } = useRouter()

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(defect.desc)
  const [remText, setRemText] = useState(defect.rem)
  const [refineNote, setRefineNote] = useState('')
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedRem, setCopiedRem] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetRem, setResetRem] = useState(false)
  const [refining, setRefining] = useState(false)
  const [confirmReset, setConfirmReset] = useState(null)
  const [nothingToCopy, setNothingToCopy] = useState(false)

  // Refocus the panel title when returning from settings (focusTrigger increments)
  useEffect(() => {
    if (focusTrigger > 0) titleRef.current?.focus()
  }, [focusTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${defect.desc}`
    : descText

  const copy = (text, setCopied, label) => {
    if (!text?.trim()) {
      setNothingToCopy(true)
      return
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      announce(`${label}: Copied to clipboard`)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // DRY reset handler — checks significance and either resets immediately or
  // opens the confirmation modal when the user has made substantial edits.
  const handleReset = (original, current, setText, setFlag, label) => {
    const doReset = () => {
      setText(original)
      announce(`${label}: Reset to original`)
      setFlag(true)
      setTimeout(() => setFlag(false), 2000)
    }
    if (isSignificantlyChanged(original, current)) {
      setConfirmReset({ doReset })
    } else {
      doReset()
    }
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

  const p = PRIORITY_VARS[defect.priority] || PRIORITY_VARS['Best Practice']

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 ref={titleRef} tabIndex={-1} className="detail-title">
            {defect.title}
          </h2>
          <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
            {defect.priority}
          </span>
        </div>

        <ul className="detail-sc-list">
          <li className="detail-sc-item">
            <span className="detail-sc-label">Fails:</span>{' '}
            <ScLink label={defect.scLabel} />
          </li>
          {defect.related.length > 0 && (
            <li className="detail-sc-item">
              <span className="detail-sc-label">Related:</span>{' '}
              {defect.related.map((r, i) => (
                <span key={r}>
                  {i > 0 && ', '}
                  <ScLink label={r} />
                </span>
              ))}
            </li>
          )}
        </ul>
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
        onReset={() => handleReset(defect.desc, descText, setDescText, setResetDesc, 'Defect description')}
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
        onReset={() => handleReset(defect.rem, remText, setRemText, setResetRem, 'Possible remediation steps')}
        isDesktop={isDesktop}
      />

      <div className="detail-refine">
        <label htmlFor="refine-note" className="detail-label">Refine</label>
        <p className="detail-refine-hint">
          {aiEnabled
            ? <>Describe what to change and AI will rewrite and incorporate your updates. Change your AI model in{' '}
                <button type="button" className="detail-settings-link" onClick={() => navigate('/settings')}>
                  Settings
                </button>.
              </>
            : <>Edit the fields above directly, or note changes here. Enable AI in{' '}
                <button type="button" className="detail-settings-link" onClick={() => navigate('/settings')}>
                  Settings
                </button>{' '}
                and it will rewrite based on your notes.
              </>}
        </p>
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
              className="btn-accent field-btn detail-rewrite-btn"
              aria-label={refining ? 'Rewriting with AI' : 'Rewrite with AI'}
            >
              {refining
                ? 'Rewriting…'
                : <><Sparkles size={12} aria-hidden="true" strokeWidth={2} />{' '}Rewrite</>}
            </button>
          )}
        </div>
      </div>

      <Modal
        open={nothingToCopy}
        onClose={() => setNothingToCopy(false)}
        heading="Nothing to copy"
      >
        <p>This field is empty. There is nothing to copy.</p>
      </Modal>

      <Modal
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        heading="Are you sure?"
        actions={[
          {
            label: 'Yes, reset',
            onClick: () => { confirmReset?.doReset(); setConfirmReset(null) },
            className: 'btn-accent modal-ok-btn',
          },
          {
            label: 'No, nevermind',
            onClick: () => setConfirmReset(null),
            className: 'btn-ghost modal-ok-btn',
          },
        ]}
      >
        <p>{"You've made significant changes to this text. Resetting will remove all of your edits."}</p>
      </Modal>
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

function ScLink({ label }) {
  const href = scToWaiUrl(label)
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="detail-sc-link">
        {label}
      </a>
    )
  }
  return <span>{label}</span>
}
