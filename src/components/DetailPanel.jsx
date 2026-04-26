import { useState, useRef, useEffect, useMemo } from 'react'
import { Sparkles, RotateCcw, Clipboard, Check } from 'lucide-react'
import { getAiRefinement } from '../services/aiService.js'
import { useFocusOnMount, useMediaQuery, useRouter, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { PRIORITY_VARS } from '../data/priorityStyles.js'

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
  const [reviseNote, setReviseNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedRem, setCopiedRem] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetRem, setResetRem] = useState(false)
  const [refining, setRefining] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [confirmReset, setConfirmReset] = useState(null)
  const [nothingToCopy, setNothingToCopy] = useState(false)
  const [revisionFailed, setRevisionFailed] = useState(false)
  // Field-specific undo stacks — each entry is the text before that AI revision
  const [descHistory, setDescHistory] = useState([])
  const [remHistory, setRemHistory] = useState([])
  const [reviseDesc, setReviseDesc] = useState(true)
  const [reviseRem, setReviseRem] = useState(true)
  const typeTimerRef = useRef(null)
  const refineButtonRef = useRef(null)

  useEffect(() => () => clearTimeout(typeTimerRef.current), [])

  useEffect(() => {
    if (focusTrigger > 0) titleRef.current?.focus()
  }, [focusTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${defect.desc}`
    : descText

  const copy = (text, setCopied, label) => {
    if (!text?.trim()) { setNothingToCopy(true); return }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      announce(t('detail.copied_announce', { label }))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReset = (original, current, setText, setFlag, label) => {
    const doReset = () => {
      setText(original)
      announce(t('detail.reset_announce', { label }))
      setFlag(true)
      setTimeout(() => setFlag(false), 2000)
    }
    if (!current?.trim() || !isSignificantlyChanged(original, current)) {
      doReset()
    } else {
      setConfirmReset({ doReset })
    }
  }

  const handleUndoDesc = () => {
    const prev = descHistory[descHistory.length - 1]
    if (!prev) return
    setDescText(prev)
    setDescHistory(h => h.slice(0, -1))
    announce(t('detail.undo_last_announce'))
  }

  const handleUndoRem = () => {
    const prev = remHistory[remHistory.length - 1]
    if (!prev) return
    setRemText(prev)
    setRemHistory(h => h.slice(0, -1))
    announce(t('detail.undo_last_announce'))
  }

  function startTypewriter(newDesc, newRem, tFunc) {
    clearTimeout(typeTimerRef.current)
    const total = (newDesc?.length ?? 0) + (newRem?.length ?? 0)
    if (!total) { setAnimating(false); return }

    const charsPerTick = Math.max(2, Math.ceil(total / 40))
    if (newDesc) setDescText('')
    if (newRem) setRemText('')

    let descIdx = 0
    let remIdx = 0

    function tick() {
      if (newDesc && descIdx < newDesc.length) {
        descIdx = Math.min(descIdx + charsPerTick, newDesc.length)
        setDescText(newDesc.slice(0, descIdx))
      } else if (newRem && remIdx < newRem.length) {
        remIdx = Math.min(remIdx + charsPerTick, newRem.length)
        setRemText(newRem.slice(0, remIdx))
      }

      const descDone = !newDesc || descIdx >= newDesc.length
      const remDone = !newRem || remIdx >= newRem.length

      if (descDone && remDone) {
        setAnimating(false)
        announce(tFunc('detail.ai_updated_announce'))
      } else {
        typeTimerRef.current = setTimeout(tick, 33)
      }
    }

    typeTimerRef.current = setTimeout(tick, 33)
  }

  const handleRefine = async () => {
    if (!reviseNote.trim()) return

    if (aiEnabled && canRevise) {
      if (reviseNote.trim() === 'debug wrong') {
        setRevisionFailed(true)
        return
      }

      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })

      try {
        const result = await getAiRefinement({ defect, descText, remText, note: reviseNote })
        const newDesc = reviseDesc && result.desc ? result.desc : null
        const newRem = reviseRem && result.rem ? result.rem : null

        if (newDesc) setDescHistory(h => [...h, descText])
        if (newRem) setRemHistory(h => [...h, remText])

        setRefining(false)
        setAnimating(true)
        startTypewriter(newDesc, newRem, t)
      } catch (e) {
        console.error('AI refinement failed:', e)
        setRefining(false)
        setAnimating(false)
        setRevisionFailed(true)
      }
    } else {
      setNoteSaved(true)
      announce(t('detail.saved_note_aria'))
      setTimeout(() => setNoteSaved(false), 2000)
      setReviseNote('')
    }
  }

  const canRevise = reviseDesc || reviseRem
  const p = PRIORITY_VARS[defect.priority] || PRIORITY_VARS['Best Practice']
  const descLabel = t('detail.desc_label')
  const remLabel = t('detail.rem_label')
  const refineLabel = t(aiEnabled ? 'detail.refine_label_ai' : 'detail.refine_label_no_ai')

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
        undoable={descHistory.length > 0}
        onUndo={handleUndoDesc}
        selected={reviseDesc}
        onSelectChange={setReviseDesc}
        selectLabel={t('detail.revise_desc_checkbox')}
        animating={animating}
        wasUpdated={descHistory.length > 0}
        isDesktop={isDesktop}
        aiEnabled={aiEnabled}
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
        undoable={remHistory.length > 0}
        onUndo={handleUndoRem}
        selected={reviseRem}
        onSelectChange={setReviseRem}
        selectLabel={t('detail.revise_rem_checkbox')}
        animating={animating}
        wasUpdated={remHistory.length > 0}
        isDesktop={isDesktop}
        aiEnabled={aiEnabled}
      />

      <div className="detail-refine">
        <label htmlFor="revise-note" className="detail-label">{refineLabel}</label>
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
            id="revise-note"
            value={reviseNote}
            onChange={e => setReviseNote(e.target.value)}
            placeholder={aiEnabled ? t('detail.refine_placeholder_ai') : t('detail.refine_placeholder_no_ai')}
            className="detail-input detail-input--textarea"
            rows={3}
          />
          <button
            ref={refineButtonRef}
            onClick={handleRefine}
            disabled={refining || animating || !reviseNote.trim()}
            className={`btn-accent field-btn detail-revise-btn${noteSaved ? ' field-btn--success' : ''}`}
            aria-label={
              refining ? t('detail.rewriting_aria')
              : aiEnabled && canRevise ? t('detail.rewrite_aria')
              : noteSaved ? t('detail.saved_note_aria')
              : t('detail.save_note_aria')
            }
          >
            {refining
              ? <span className="detail-revising-text">{t('detail.rewriting_text')}</span>
              : aiEnabled && canRevise
                ? <span className="detail-revise-label" aria-hidden="true">
                    <Sparkles size={12} strokeWidth={2} className="detail-revise-icon" />
                    {' '}Save &<br />Revise Selected
                  </span>
                : noteSaved
                  ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.saved_note_text')}</>
                  : t('detail.save_note_text')}
          </button>
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
        open={revisionFailed}
        onClose={() => setRevisionFailed(false)}
        heading={t('detail.revise_error_heading')}
        returnFocusRef={refineButtonRef}
      >
        <p>{t('detail.revise_error_body')}</p>
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

function Field({
  id, label, value, onChange,
  copied, onCopy,
  reset, onReset,
  undoable, onUndo,
  selected, onSelectChange, selectLabel,
  animating, wasUpdated,
  isDesktop, aiEnabled,
}) {
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

  function handleResetOrUndo() {
    if (undoable) onUndo()
    else onReset()
  }

  const resetBtnLabel = reset
    ? t('detail.reset_done_aria', { label })
    : undoable
      ? t('detail.undo_last_aria', { label })
      : t('detail.reset_aria', { label })

  const resetBtnText = reset
    ? t('detail.reset_done_desktop')
    : undoable
      ? t('detail.undo_last_desktop')
      : t('detail.reset_desktop')

  return (
    <div className="field">
      <div className="field__header">
        <div className="field__label-row">
          {aiEnabled && (
            <input
              type="checkbox"
              className="field-select-checkbox"
              checked={selected}
              onChange={e => onSelectChange(e.target.checked)}
              aria-label={selectLabel}
              disabled={animating}
            />
          )}
          <label htmlFor={id} className="field__label">
            {label}
            {wasUpdated && (
              <span className="field__updated-badge">{t('detail.updated_label')}</span>
            )}
          </label>
        </div>
        <div className="field__actions">
          <button
            onClick={handleResetOrUndo}
            aria-label={resetBtnLabel}
            className={`btn-accent field-btn${reset ? ' field-btn--success' : ''}`}
            disabled={animating}
          >
            {reset ? <Check size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
            {isDesktop && <span>{resetBtnText}</span>}
          </button>
          <button
            onClick={onCopy}
            aria-label={copied ? t('detail.copied_aria') : t('detail.copy_aria', { label })}
            className={`btn-accent field-btn${copied ? ' field-btn--success' : ''}`}
            disabled={animating}
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
        readOnly={animating}
        className={`field__textarea${animating ? ' field__textarea--animating' : ''}`}
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
