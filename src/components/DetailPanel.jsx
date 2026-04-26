import { useState, useRef, useEffect, useMemo } from 'react'
import { Sparkles, RotateCcw, Clipboard, Check } from 'lucide-react'
import { getAiRefinement } from '../services/aiService.js'
import { useFocusOnMount, useMediaQuery, useRouter, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'

const PRIORITY_VARS = {
  Critical:        { color: 'var(--priority-critical-text)', bg: 'var(--priority-critical-bg)', key: 'priority.critical'      },
  High:            { color: 'var(--priority-high-text)',     bg: 'var(--priority-high-bg)',     key: 'priority.high'           },
  Medium:          { color: 'var(--priority-medium-text)',   bg: 'var(--priority-medium-bg)',   key: 'priority.medium'         },
  Low:             { color: 'var(--priority-low-text)',      bg: 'var(--priority-low-bg)',      key: 'priority.low'            },
  'Best Practice': { color: 'var(--text-muted)',             bg: 'var(--bg-subtle)',            key: 'priority.best_practice'  },
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

export default function DetailPanel({ defect, aiEnabled, focusTrigger = 0, allDefects = [], onSelect }) {
  const titleRef = useFocusOnMount()
  const isDesktop = useMediaQuery('(width >= 768px)')
  const { navigate } = useRouter()
  const t = useT()

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
      announce(t('detail.copied_announce', { label }))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // DRY reset handler — checks significance and either resets immediately or
  // opens the confirmation modal when the user has made substantial edits.
  const handleReset = (original, current, setText, setFlag, label) => {
    const doReset = () => {
      setText(original)
      announce(t('detail.reset_announce', { label }))
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
  const descLabel = t('detail.desc_label')
  const remLabel = t('detail.rem_label')

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 ref={titleRef} tabIndex={-1} className="detail-title">
            {defect.title}
          </h2>
          <span className="priority-badge" style={{ background: p.bg, color: p.color }}>
            {t(p.key)}
          </span>
        </div>

        <ul className="detail-sc-list">
          <li className="detail-sc-item">
            <span className="detail-sc-label">{t('detail.fails')}</span>{' '}
            <ScLink label={defect.scLabel} />
          </li>
          {defect.related.length > 0 && (
            <li className="detail-sc-item">
              <span className="detail-sc-label">{t('detail.related')}</span>{' '}
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
          {t('detail.location_label')}{' '}
          <span className="detail-optional">{t('detail.location_optional')}</span>
        </label>
        <input
          id="location-prefix"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder={t('detail.location_placeholder')}
          className="detail-input"
        />
      </div>

      <Field
        id="defect-desc"
        label={descLabel}
        value={location.trim() ? displayDesc : descText}
        onChange={setDescText}
        copied={copiedDesc}
        onCopy={() => copy(location.trim() ? displayDesc : descText, setCopiedDesc, descLabel)}
        reset={resetDesc}
        onReset={() => handleReset(defect.desc, descText, setDescText, setResetDesc, descLabel)}
        isDesktop={isDesktop}
      />

      <Field
        id="defect-rem"
        label={remLabel}
        value={remText}
        onChange={setRemText}
        copied={copiedRem}
        onCopy={() => copy(remText, setCopiedRem, remLabel)}
        reset={resetRem}
        onReset={() => handleReset(defect.rem, remText, setRemText, setResetRem, remLabel)}
        isDesktop={isDesktop}
      />

      <div className="detail-refine">
        <label htmlFor="refine-note" className="detail-label">{t('detail.refine_label')}</label>
        <p className="detail-refine-hint">
          {aiEnabled
            ? <>{t('detail.refine_hint_ai')}{' '}
                <button type="button" className="detail-settings-link" onClick={() => navigate('/settings')}>
                  {t('detail.refine_hint_ai_settings')}
                </button>.
              </>
            : <>{t('detail.refine_hint_no_ai')}{' '}
                <button type="button" className="detail-settings-link" onClick={() => navigate('/settings')}>
                  {t('detail.refine_hint_no_ai_settings')}
                </button>{' '}
                {t('detail.refine_hint_no_ai_suffix')}
              </>}
        </p>
        <div className="detail-refine-row">
          <textarea
            id="refine-note"
            value={refineNote}
            onChange={e => setRefineNote(e.target.value)}
            placeholder={aiEnabled ? t('detail.refine_placeholder_ai') : t('detail.refine_placeholder_no_ai')}
            className="detail-input detail-input--textarea"
            rows={3}
          />
          {aiEnabled && (
            <button
              onClick={handleRefine}
              disabled={refining || !refineNote.trim()}
              className="btn-accent field-btn detail-rewrite-btn"
              aria-label={refining ? t('detail.rewriting_aria') : t('detail.rewrite_aria')}
            >
              {refining
                ? t('detail.rewriting_text')
                : <><Sparkles size={12} aria-hidden="true" strokeWidth={2} />{' '}{t('detail.rewrite_text')}</>}
            </button>
          )}
        </div>
      </div>

      <RelatedIssues defect={defect} allDefects={allDefects} onSelect={onSelect} />

      <Modal
        open={nothingToCopy}
        onClose={() => setNothingToCopy(false)}
        heading={t('detail.nothing_to_copy_heading')}
      >
        <p>{t('detail.nothing_to_copy_body')}</p>
      </Modal>

      <Modal
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        heading={t('detail.confirm_reset_heading')}
        actions={[
          {
            label: t('detail.confirm_reset_yes'),
            onClick: () => { confirmReset?.doReset(); setConfirmReset(null) },
            className: 'btn-accent modal-ok-btn',
          },
          {
            label: t('detail.confirm_reset_no'),
            onClick: () => setConfirmReset(null),
            className: 'btn-ghost modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.confirm_reset_body')}</p>
      </Modal>
    </div>
  )
}

function RelatedIssues({ defect, allDefects, onSelect }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allDefects?.length || !defect.related?.length) return []
    return allDefects
      .filter(d => d.id !== defect.id && defect.related.includes(d.scLabel))
      .slice(0, 5)
  }, [allDefects, defect])

  if (!related.length || !onSelect) return null

  return (
    <div className="detail-related">
      <p className="detail-related__heading">{t('detail.related_heading')}</p>
      <ul className="detail-related__list">
        {related.map(d => (
          <li key={d.id}>
            <button
              type="button"
              className="detail-related__btn"
              onClick={() => onSelect(d)}
            >
              {d.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Field({ id, label, value, onChange, copied, onCopy, reset, onReset, isDesktop }) {
  const t = useT()
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
            aria-label={reset ? t('detail.reset_done_aria', { label }) : t('detail.reset_aria', { label })}
            className={`btn-accent field-btn${reset ? ' field-btn--success' : ''}`}
          >
            {reset ? <Check size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
            {isDesktop && <span>{reset ? t('detail.reset_done_desktop') : t('detail.reset_desktop')}</span>}
          </button>
          <button
            onClick={onCopy}
            aria-label={copied ? t('detail.copied_aria') : t('detail.copy_aria', { label })}
            className={`btn-accent field-btn${copied ? ' field-btn--success' : ''}`}
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Clipboard size={14} aria-hidden="true" />}
            {isDesktop && <span>{copied ? t('detail.copied_desktop') : t('detail.copy_desktop')}</span>}
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
