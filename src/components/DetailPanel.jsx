import { useState, useRef, useEffect, useMemo } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { getAiRefinement, AiApiError } from '../services/aiService.js'
import { getAgenticRefinement } from '../services/agenticAiService.js'
import { useMediaQuery, useRouter, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { PRIORITY_VARS } from '../data/priorityStyles.js'
import { StateButton, InputWithClear, Badge, Field, ScLink, SourceLinks } from '../ui/index.js'

function findingSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

export default function DetailPanel({ finding, aiEnabled, agenticMode = false, focusTrigger = 0, allFindings = [], onSelect, onSelectRelated, onClose, onBadgeClick, debugPanelCmd = null, onDebugPanelCmdHandled }) {
  const titleRef = useRef(null)
  const isDesktop = useMediaQuery('(width >= 768px)')
  const { navigate } = useRouter()
  const t = useT()

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(finding.desc)
  const [remText, setRemText] = useState(finding.rem)
  const [reviseNote, setReviseNote] = useState('')
  const [useAgenticMode, setUseAgenticMode] = useState(agenticMode)
  const [noteSaved, setNoteSaved] = useState(false)
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedRem, setCopiedRem] = useState(false)
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedPrimarySc, setCopiedPrimarySc] = useState(false)
  const [copiedRelatedSc, setCopiedRelatedSc] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetRem, setResetRem] = useState(false)
  const [refining, setRefining] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [confirmReset, setConfirmReset] = useState(null)
  const [nothingToCopy, setNothingToCopy] = useState(false)
  const [revisionFailed, setRevisionFailed] = useState(null)
  // Field-specific undo stacks — each entry is the text before that AI revision
  const [descHistory, setDescHistory] = useState([])
  const [remHistory, setRemHistory] = useState([])
  const [reviseDesc, setReviseDesc] = useState(false)
  const [reviseRem, setReviseRem] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [resetAllDone, setResetAllDone] = useState(false)
  const [includeDescTitle, setIncludeDescTitle] = useState(false)
  const [includeRemTitle, setIncludeRemTitle] = useState(false)
  const typeTimerRef = useRef(null)
  const refineButtonRef = useRef(null)
  const descCopyBtnRef = useRef(null)
  const remCopyBtnRef = useRef(null)

  useEffect(() => () => clearTimeout(typeTimerRef.current), [])

  useEffect(() => {
    if (focusTrigger > 0) titleRef.current?.focus()
  }, [focusTrigger])

  useEffect(() => {
    titleRef.current?.focus()
  }, [finding.id])

  useEffect(() => {
    if (!debugPanelCmd) return
    const provider = localStorage.getItem('ai_provider') || 'anthropic'
    const PROVIDER_LABELS = { anthropic: 'Claude', openai: 'GPT', google: 'Gemini', microsoft: 'Copilot' }
    const providerLabel = PROVIDER_LABELS[provider] || provider
    if (debugPanelCmd === 'debug wrong')   { setRevisionFailed(t('detail.revise_error_body')); onDebugPanelCmdHandled?.(); return } // eslint-disable-line react-hooks/set-state-in-effect
    if (debugPanelCmd === 'debug 401')     { setRevisionFailed(t('detail.revise_error_invalid_key', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug 429')     { setRevisionFailed(t('detail.revise_error_rate_limit', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug 503')     { setRevisionFailed(t('detail.revise_error_service_error', { provider: providerLabel, status: 503 })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug network') { setRevisionFailed(t('detail.revise_error_network_error')); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug ok') {
      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })
      setTimeout(() => {
        const fakeDesc = reviseDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
        const fakeRem = reviseRem ? '[Debug] Revised remediation: verify the fix was applied, then remove this placeholder before sharing the report.' : null
        if (fakeDesc) setDescHistory(h => [...h, descText])
        if (fakeRem) setRemHistory(h => [...h, remText])
        setRefining(false)
        setAnimating(true)
        startTypewriter(fakeDesc, fakeRem, t)
      }, 1200)
      onDebugPanelCmdHandled?.()
    }
  }, [debugPanelCmd]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${finding.desc}`
    : descText

  const copy = (text, setCopied, label, prefix = null, includePrefix = false) => {
    if (!text?.trim()) { setNothingToCopy(true); return }
    const textToCopy = prefix && includePrefix ? `${prefix}\n${text}` : text
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      announce(t('detail.copied_announce', { label }))
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReset = (original, current, setText, setFlag, label, focusRef) => {
    const doReset = () => {
      setText(original)
      announce(t('detail.reset_announce', { label }))
      setFlag(true)
      setTimeout(() => {
        setFlag(false)
        focusRef?.current?.focus()
      }, 2000)
    }
    if (!current?.trim() || !isSignificantlyChanged(original, current)) {
      doReset()
    } else {
      setConfirmReset({ doReset })
    }
  }

  const handleCopyAll = () => {
    const descValue = location.trim() ? displayDesc : descText
    if (!descValue?.trim() && !remText?.trim()) { setNothingToCopy(true); return }
    const text = `Description:\n${descValue}\n\nRemediation:\n${remText}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      announce(t('detail.copy_all_announce'))
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  const handleResetAllFields = () => {
    const descChanged = isSignificantlyChanged(finding.desc, descText)
    const remChanged = isSignificantlyChanged(finding.rem, remText)
    const doReset = () => {
      setDescText(finding.desc)
      setRemText(finding.rem)
      setDescHistory([])
      setRemHistory([])
      announce(t('detail.reset_all_content_announce'))
      setResetAllDone(true)
      setTimeout(() => {
        setResetAllDone(false)
      }, 2000)
    }
    if (descChanged || remChanged) {
      setConfirmReset({ doReset })
    } else {
      doReset()
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

  const copyTitle = () => {
    copy(finding.title, setCopiedTitle, t('detail.title_label'))
  }

  const copyPrimarySc = () => {
    copy(finding.scLabel, setCopiedPrimarySc, t('detail.sc_label'))
  }

  const copyRelatedSc = () => {
    if (!finding.related.length) return
    copy(finding.related.join(', '), setCopiedRelatedSc, t('detail.sc_label'))
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
      const note = reviseNote.trim()
      const provider = localStorage.getItem('ai_provider') || 'anthropic'
      const PROVIDER_LABELS = { anthropic: 'Claude', openai: 'GPT', google: 'Gemini', microsoft: 'Copilot' }
      const providerLabel = PROVIDER_LABELS[provider] || provider

      if (note === 'debug wrong')   { setRevisionFailed(t('detail.revise_error_body')); return }
      if (note === 'debug 401')     { setRevisionFailed(t('detail.revise_error_invalid_key', { provider: providerLabel })); return }
      if (note === 'debug 429')     { setRevisionFailed(t('detail.revise_error_rate_limit', { provider: providerLabel })); return }
      if (note === 'debug 503')     { setRevisionFailed(t('detail.revise_error_service_error', { provider: providerLabel, status: 503 })); return }
      if (note === 'debug network') { setRevisionFailed(t('detail.revise_error_network_error')); return }
      if (note === 'debug ai assist on') {
        setRefining(true)
        announce(t('detail.rewriting_text'), { priority: 'assertive' })
        setTimeout(() => {
          const newDesc = reviseDesc ? `${descText}\n\n[Revision note: ${reviseNote}]` : null
          const newRem = reviseRem ? `${remText}\n\n[Revision note: ${reviseNote}]` : null
          if (newDesc) setDescHistory(h => [...h, descText])
          if (newRem) setRemHistory(h => [...h, remText])
          setRefining(false)
          setAnimating(true)
          startTypewriter(newDesc, newRem, t)
        }, 2000)
        return
      }
      if (note === 'debug ok') {
        setRefining(true)
        announce(t('detail.rewriting_text'), { priority: 'assertive' })
        setTimeout(() => {
          const fakeDesc = reviseDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
          const fakeRem = reviseRem ? '[Debug] Revised remediation: verify the fix was applied, then remove this placeholder before sharing the report.' : null
          if (fakeDesc) setDescHistory(h => [...h, descText])
          if (fakeRem) setRemHistory(h => [...h, remText])
          setRefining(false)
          setAnimating(true)
          startTypewriter(fakeDesc, fakeRem, t)
        }, 1200)
        return
      }

      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })

      try {
        const result = useAgenticMode && localStorage.getItem('ai_provider') === 'anthropic'
          ? await getAgenticRefinement({ finding, descText, remText, note: reviseNote, corpus: allFindings })
          : await getAiRefinement({ finding, descText, remText, note: reviseNote })
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
        if (e instanceof AiApiError) {
          const label = { anthropic: 'Claude', openai: 'GPT', google: 'Gemini', microsoft: 'Copilot' }[e.provider] || e.provider || 'AI'
          setRevisionFailed(t(`detail.revise_error_${e.type}`, { provider: label, status: e.status }))
        } else {
          setRevisionFailed(t('detail.revise_error_body'))
        }
      }
    } else {
      setNoteSaved(true)
      announce(t('detail.saved_note_aria'))
      setTimeout(() => setNoteSaved(false), 2000)
    }
  }

  const canRevise = reviseDesc || reviseRem
  const p = PRIORITY_VARS[finding.priority] || PRIORITY_VARS['Best Practice']
  const descLabel = t('detail.desc_label')
  const remLabel = t('detail.rem_label')
  const refineLabel = t(aiEnabled ? 'detail.refine_label_ai' : 'detail.refine_label_no_ai')

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 ref={titleRef} tabIndex={-1} className="detail-title">
            {finding.title}
          </h2>
          <StateButton
            active={copiedTitle}
            icon={<Copy size={14} aria-hidden="true" />}
            activeIcon={<Check size={14} aria-hidden="true" />}
            label={t('detail.copy_title_aria')}
            activeLabel={t('detail.copied_aria')}
            className="detail-copy-btn"
            onClick={copyTitle}
            title={copiedTitle ? t('detail.copied_aria') : t('detail.copy_title_aria')}
          />
        </div>
        <div className="detail-badges">
          <Badge
            variant="priority"
            bg={p.bg}
            color={p.color}
            prefix={finding.priority !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
            onClick={() => onBadgeClick?.({ type: 'priority', value: finding.priority })}
            aria-label={`${finding.priority !== 'Best Practice' ? t('badge.severity_prefix') : ''}${t(p.key)} — ${t('results.badge_filter_aria')}`}
          >
            {t(p.key)}
          </Badge>
          {(() => {
            const sources = finding.sourceCredits?.filter(src => src !== 'ATH') || []
            if (sources.length === 0) return null
            if (sources.length === 1) {
              const src = sources[0]
              return (
                <Badge
                  key={src}
                  variant="source"
                  prefix="Source:"
                  onClick={() => onBadgeClick?.({ type: 'source', value: src })}
                  aria-label={`Source: ${src} — ${t('results.badge_filter_aria')}`}
                >
                  {src}
                </Badge>
              )
            }
            return (
              <Badge
                key="sources-badge"
                variant="source"
                onClick={() => document.querySelector('.detail-sources-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-label="Sources: Multiple (See below)"
              >
                Sources: Multiple (See below)
              </Badge>
            )
          })()}
          {finding.wcagVersion && finding.wcagLevel && (
            <button
              type="button"
              className="wcag-badge"
              style={{ '--badge-bg': 'var(--wcag-bg)', '--badge-text': 'var(--wcag-text)' }}
              onClick={() => onBadgeClick?.({ type: 'wcag', value: finding.wcagVersion })}
              aria-label={`${t('badge.wcag_prefix')}${finding.wcagVersion}, ${t('badge.level_prefix')}${finding.wcagLevel} — ${t('results.badge_filter_aria')}`}
            >
              <span className="badge-prefix">{t('badge.wcag_prefix')}</span>
              {finding.wcagVersion},{' '}
              <span className="badge-prefix">{t('badge.level_prefix')}</span>
              {finding.wcagLevel}
            </button>
          )}
        </div>

        <ul className="detail-sc-list">
          <li className="detail-sc-item">
            <div className="detail-sc-item-row">
              <span>
                <span className="detail-sc-label">{t('detail.sc_failed')}</span>{' '}
                <ScLink label={finding.scLabel} />
              </span>
              <StateButton
                active={copiedPrimarySc}
                icon={<Copy size={14} aria-hidden="true" />}
                activeIcon={<Check size={14} aria-hidden="true" />}
                label={t('detail.copy_sc_aria')}
                activeLabel={t('detail.copied_aria')}
                className="detail-sc-copy-btn"
                onClick={copyPrimarySc}
                title={copiedPrimarySc ? t('detail.copied_aria') : t('detail.copy_sc_aria')}
              />
            </div>
          </li>
          {finding.related.length > 0 && (
            <li className="detail-sc-item">
              <div className="detail-sc-item-row">
                <span>
                  <span className="detail-sc-label">{t('detail.related_sc')}</span>{' '}
                  {finding.related.map((r, i) => (
                    <span key={r}>
                      {i > 0 && ', '}
                      <ScLink label={r} />
                    </span>
                  ))}
                </span>
                <StateButton
                  active={copiedRelatedSc}
                  icon={<Copy size={14} aria-hidden="true" />}
                  activeIcon={<Check size={14} aria-hidden="true" />}
                  label={t('detail.copy_sc_aria')}
                  activeLabel={t('detail.copied_aria')}
                  className="detail-sc-copy-btn"
                  onClick={copyRelatedSc}
                  title={copiedRelatedSc ? t('detail.copied_aria') : t('detail.copy_sc_aria')}
                />
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="detail-field-row">
        <label htmlFor="location-prefix" className="detail-label">
          {t('detail.location_label')}
          {!location.trim() && <span className="detail-optional">{' '}{t('detail.location_optional')}</span>}
        </label>
        <InputWithClear
          id="location-prefix"
          type="text"
          value={location}
          onChange={setLocation}
          onClear={() => setLocation('')}
          placeholder={t('detail.location_placeholder')}
          clearAriaLabel={t('search.clear_aria')}
          wrapClassName="detail-location-input-wrap"
          inputClassName="detail-input"
          clearButtonClassName="btn--primary detail-location-clear-btn"
        />
      </div>

      <Field
        ref={descCopyBtnRef}
        id="finding-desc"
        label={descLabel}
        value={location.trim() ? displayDesc : descText}
        onChange={setDescText}
        copied={copiedDesc}
        onCopy={() => copy(location.trim() ? displayDesc : descText, setCopiedDesc, descLabel, t('detail.desc_prefix'), includeDescTitle)}
        reset={resetDesc}
        onReset={() => handleReset(finding.desc, descText, setDescText, setResetDesc, descLabel, descCopyBtnRef)}
        undoable={descHistory.length > 1}
        onUndo={handleUndoDesc}
        selected={reviseDesc}
        onSelectChange={setReviseDesc}
        selectLabel={t('detail.revise_desc_checkbox')}
        animating={animating}
        wasUpdated={descHistory.length > 0}
        isDesktop={isDesktop}
        aiEnabled={aiEnabled}
        hasChanged={descText !== finding.desc}
        includeTitle={includeDescTitle}
        onIncludeTitleChange={setIncludeDescTitle}
        includeTitleLabel={t('detail.include_desc_title_when_copied')}
      />

      <Field
        ref={remCopyBtnRef}
        id="finding-rem"
        label={remLabel}
        value={remText}
        onChange={setRemText}
        copied={copiedRem}
        onCopy={() => copy(remText, setCopiedRem, remLabel, t('detail.rem_prefix'), includeRemTitle)}
        reset={resetRem}
        onReset={() => handleReset(finding.rem, remText, setRemText, setResetRem, remLabel, remCopyBtnRef)}
        undoable={remHistory.length > 1}
        onUndo={handleUndoRem}
        selected={reviseRem}
        onSelectChange={setReviseRem}
        selectLabel={t('detail.revise_rem_checkbox')}
        animating={animating}
        wasUpdated={remHistory.length > 0}
        isDesktop={isDesktop}
        aiEnabled={aiEnabled}
        hasChanged={remText !== finding.rem}
        includeTitle={includeRemTitle}
        onIncludeTitleChange={setIncludeRemTitle}
        includeTitleLabel={t('detail.include_rem_title_when_copied')}
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
        {aiEnabled && localStorage.getItem('ai_provider') === 'anthropic' && (
          <div className="detail-agentic-mode-row">
            <label htmlFor="agentic-toggle" className="detail-label detail-label--compact">
              {t('detail.agentic_mode_label') || 'Agentic Mode'}
            </label>
            <input
              id="agentic-toggle"
              type="checkbox"
              checked={useAgenticMode}
              onChange={e => setUseAgenticMode(e.target.checked)}
              className="detail-agentic-toggle"
              title={t('detail.agentic_mode_help') || 'Use AI with corpus search to write more accurate descriptions'}
            />
            <p className="detail-agentic-mode-hint">
              {t('detail.agentic_mode_hint') || 'AI searches the corpus to match your style and depth'}
            </p>
          </div>
        )}
        <div className="detail-refine-row">
          <textarea
            id="revise-note"
            value={reviseNote}
            onChange={e => setReviseNote(e.target.value)}
            placeholder={t('detail.refine_placeholder_no_ai')}
            className="detail-input detail-input--textarea"
            rows={3}
          />
          <button
            ref={refineButtonRef}
            onClick={handleRefine}
            disabled={refining || animating || !reviseNote.trim()}
            aria-busy={refining ? true : undefined}
            className={`btn--primary detail-revise-btn btn--height-standard${noteSaved ? ' btn__field--success' : ''}`}
            aria-label={
              refining ? t('detail.rewriting_aria')
              : aiEnabled && canRevise ? t('detail.rewrite_aria')
              : noteSaved ? t('detail.saved_note_aria')
              : t('detail.save_note_aria')
            }
          >
            {refining
              ? <span className="detail-revising-text">
                  <Loader2 size={12} strokeWidth={2} className="detail-revising-spinner" aria-hidden="true" />
                  {' '}{t('detail.rewriting_text')}
                </span>
              : aiEnabled && canRevise
                ? <span className="detail-revise-label" aria-hidden="true">
                    <Sparkles size={12} strokeWidth={2} className="detail-revise-icon" />
                    {' '}Save & Revise Selected
                  </span>
                : noteSaved
                  ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.saved_note_text')}</>
                  : t('detail.save_note_text')}
          </button>
        </div>
        {(descText !== finding.desc || remText !== finding.rem) && (
          <p className="detail-edit-warning" role="status">
            <AlertCircle size={16} aria-hidden="true" className="detail-edit-warning-icon" />
            {t('detail.edit_lang_warning')}
          </p>
        )}
      </div>

      <RelatedIssues finding={finding} allFindings={allFindings} onSelect={onSelectRelated ?? onSelect} />
      <SourceLinks links={finding.links} />

      <div className="detail-actions-end">
        <button
          type="button"
          className={`btn--secondary detail-action-btn btn--height-standard${resetAllDone ? ' btn__field--success' : ''}`}
          onClick={handleResetAllFields}
          aria-label={t('detail.reset_all_fields_aria')}
          disabled={descText === finding.desc && remText === finding.rem}
        >
          {resetAllDone
            ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.reset_all_done_desktop')}</>
            : <><RotateCcw size={14} aria-hidden="true" />{' '}{t('detail.reset_all_fields_text')}</>
          }
        </button>
        <button
          type="button"
          className={`btn--secondary detail-action-btn btn--height-standard${copiedAll ? ' btn__field--success' : ''}`}
          onClick={handleCopyAll}
          aria-label={t('detail.copy_all_aria')}
        >
          {copiedAll
            ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.copy_all_copied_text')}</>
            : <><Copy size={14} aria-hidden="true" />{' '}{t('detail.copy_all_text')}</>
          }
        </button>
        {onClose && (
          <button
            type="button"
            className="btn--primary detail-close-btn btn--height-standard"
            onClick={onClose}
          >
            {t('common.close')}
          </button>
        )}
      </div>

      <Modal
        open={nothingToCopy}
        onClose={() => setNothingToCopy(false)}
        heading={t('detail.nothing_to_copy_heading')}
      >
        <p>{t('detail.nothing_to_copy_body')}</p>
      </Modal>

      <Modal
        open={!!revisionFailed}
        onClose={() => setRevisionFailed(null)}
        heading={t('detail.revise_error_heading')}
        returnFocusRef={refineButtonRef}
      >
        <p>{revisionFailed}</p>
      </Modal>

      <Modal
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        heading={t('detail.confirm_reset_heading')}
        actions={[
          {
            label: t('detail.confirm_reset_yes'),
            onClick: () => { confirmReset?.doReset(); setConfirmReset(null) },
            className: 'btn--primary modal-ok-btn',
          },
          {
            label: t('detail.confirm_reset_no'),
            onClick: () => setConfirmReset(null),
            className: 'btn--tertiary modal-ok-btn',
          },
        ]}
      >
        <p>{t('detail.confirm_reset_body')}</p>
      </Modal>
    </div>
  )
}

function RelatedIssues({ finding, allFindings, onSelect }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allFindings?.length || !finding.related?.length) return []
    return allFindings
      .filter(d => d.id !== finding.id && finding.related.includes(d.scLabel))
      .slice(0, 5)
  }, [allFindings, finding])

  if (!related.length || !onSelect) return null

  const headingKey = related.length === 1 ? 'detail.related_issue_heading' : 'detail.related_heading'

  return (
    <div className="detail-related">
      {related.length === 1 ? (
        <p className="detail-related__heading detail-related__heading--single">
          {t(headingKey)}{' '}
          <a
            href={`#/finding/${related[0].id}/${findingSlug(related[0].title)}`}
            className="detail-related__btn"
          >
            {related[0].title}
          </a>
        </p>
      ) : (
        <>
          <p className="detail-related__heading">{t(headingKey)}</p>
          <ul className="detail-related__list">
            {related.map(d => (
              <li key={d.id}>
                <a
                  href={`#/finding/${d.id}/${findingSlug(d.title)}`}
                  className="detail-related__btn"
                >
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

