import { useState, useRef, useEffect } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { getAiRefinement, AiApiError } from '../services/aiService.js'
import { getAgenticRefinement } from '../services/agenticAiService.js'
import { useMediaQuery, Modal } from '../plugins/router/index.js'
import { announce } from '../plugins/announce/index.js'
import { useT } from '../i18n/index.jsx'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import Button from './ui/Button.jsx'

import InputWithClear from './ui/InputWithClear.jsx'
import Badge from './ui/Badge.jsx'
import Field from './ui/Field.jsx'
import ScLink from './ui/ScLink.jsx'
import SourceLinks from './ui/SourceLinks.jsx'
import RelatedIssues from './ui/RelatedIssues.jsx'
import { isSignificantlyChanged } from '../utils/textComparison.js'
import { NOTIFICATION_TIMEOUT, PROVIDER_LABELS } from '../utils/constants.js'

export default function DetailPanel({ finding, aiEnabled, agenticMode = false, focusTrigger = 0, allFindings = [], onSelect, onSelectRelated, onClose, onBadgeClick, onCopyEvent, getPairsFor, debugPanelCmd = null, onDebugPanelCmdHandled }) {
  const titleRef = useRef(null)
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(finding.desc)
  const [fixText, setFixText] = useState(finding.fix)
  const [aiNote, setAiNote] = useState('')
  const [findingNote, setFindingNote] = useState(() => localStorage.getItem(`finding_note_${finding.id}`) || '')
  const [useAgenticMode, setUseAgenticMode] = useState(agenticMode)
  const [findingNoteSaved, setFindingNoteSaved] = useState(false)
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedFix, setCopiedFix] = useState(false)
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedPrimarySc, setCopiedPrimarySc] = useState(false)
  const [copiedRelatedSc, setCopiedRelatedSc] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetFix, setResetFix] = useState(false)
  const [refining, setRefining] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [confirmReset, setConfirmReset] = useState(null)
  const [nothingToCopy, setNothingToCopy] = useState(false)
  const [revisionFailed, setRevisionFailed] = useState(null)
  // Field-specific undo stacks, each entry is the text before that AI revision
  const [descHistory, setDescHistory] = useState([])
  const [fixHistory, setFixHistory] = useState([])
  const [aiRevisedDesc, setAiRevisedDesc] = useState(false)
  const [aiRevisedFix, setAiRevisedFix] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [resetAllDone, setResetAllDone] = useState(false)
  const [includeDescTitle, setIncludeDescTitle] = useState(false)
  const [includeFixTitle, setIncludeFixTitle] = useState(false)
  const typeTimerRef = useRef(null)
  const aiRevisionButtonRef = useRef(null)
  const descCopyBtnRef = useRef(null)
  const fixCopyBtnRef = useRef(null)

  useEffect(() => () => clearTimeout(typeTimerRef.current), [])

  useEffect(() => {
    if (focusTrigger > 0) titleRef.current?.focus()
  }, [focusTrigger])

  useEffect(() => {
    titleRef.current?.focus()
    setFindingNote(localStorage.getItem(`finding_note_${finding.id}`) || '')
    setAiNote('')
  }, [finding.id])

  useEffect(() => {
    if (!debugPanelCmd) return
    const provider = localStorage.getItem('ai_provider') || 'anthropic'
    const providerLabel = PROVIDER_LABELS[provider] || provider
    if (debugPanelCmd === 'debug wrong')   { setRevisionFailed(t('detail.ai_revision_error_body')); onDebugPanelCmdHandled?.(); return } // eslint-disable-line react-hooks/set-state-in-effect
    if (debugPanelCmd === 'debug 401')     { setRevisionFailed(t('detail.ai_revision_error_invalid_key', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug 429')     { setRevisionFailed(t('detail.ai_revision_error_rate_limit', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug 503')     { setRevisionFailed(t('detail.ai_revision_error_service_error', { provider: providerLabel, status: 503 })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug network') { setRevisionFailed(t('detail.ai_revision_error_network_error')); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === 'debug ok') {
      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })
      setTimeout(() => {
        const fakeDesc = aiRevisedDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
        const fakeFix = aiRevisedFix ? '[Debug] Revised suggested fix: verify the fix was applied, then remove this placeholder before sharing the report.' : null
        if (fakeDesc) setDescHistory(h => [...h, descText])
        if (fakeFix) setFixHistory(h => [...h, fixText])
        setRefining(false)
        setAnimating(true)
        startTypewriter(fakeDesc, fakeFix, t)
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
      setTimeout(() => setCopied(false), NOTIFICATION_TIMEOUT)
      onCopyEvent?.(finding.id)
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
    if (!descValue?.trim() && !fixText?.trim()) { setNothingToCopy(true); return }
    const text = `Description:\n${descValue}\n\nSuggested Fix:\n${fixText}`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      announce(t('detail.copy_all_announce'))
      setTimeout(() => setCopiedAll(false), 2000)
      onCopyEvent?.(finding.id)
    })
  }

  const handleResetAllFields = () => {
    const descChanged = isSignificantlyChanged(finding.desc, descText)
    const fixChanged = isSignificantlyChanged(finding.fix, fixText)
    const doReset = () => {
      setDescText(finding.desc)
      setFixText(finding.fix)
      setDescHistory([])
      setFixHistory([])
      announce(t('detail.reset_all_content_announce'))
      setResetAllDone(true)
      setTimeout(() => {
        setResetAllDone(false)
      }, 2000)
    }
    if (descChanged || fixChanged) {
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

  const handleUndoFix = () => {
    const prev = fixHistory[fixHistory.length - 1]
    if (!prev) return
    setFixText(prev)
    setFixHistory(h => h.slice(0, -1))
    announce(t('detail.undo_last_announce'))
  }

  const copyTitle = () => {
    copy(finding.title, setCopiedTitle, t('detail.title_label'))
  }

  const copyPrimarySc = () => {
    copy(finding.primarySC, setCopiedPrimarySc, t('detail.sc_label'))
  }

  const copyRelatedSc = () => {
    if (!finding.relatedSC.length) return
    copy(finding.relatedSC.join(', '), setCopiedRelatedSc, t('detail.sc_label'))
  }

  function startTypewriter(newDesc, newFix, tFunc) {
    clearTimeout(typeTimerRef.current)
    const total = (newDesc?.length ?? 0) + (newFix?.length ?? 0)
    if (!total) { setAnimating(false); return }

    const charsPerTick = Math.max(2, Math.ceil(total / 40))
    if (newDesc) setDescText('')
    if (newFix) setFixText('')

    let descIdx = 0
    let fixIdx = 0

    function tick() {
      if (newDesc && descIdx < newDesc.length) {
        descIdx = Math.min(descIdx + charsPerTick, newDesc.length)
        setDescText(newDesc.slice(0, descIdx))
      } else if (newFix && fixIdx < newFix.length) {
        fixIdx = Math.min(fixIdx + charsPerTick, newFix.length)
        setFixText(newFix.slice(0, fixIdx))
      }

      const descDone = !newDesc || descIdx >= newDesc.length
      const fixDone = !newFix || fixIdx >= newFix.length

      if (descDone && fixDone) {
        setAnimating(false)
        announce(tFunc('detail.ai_updated_announce'))
      } else {
        typeTimerRef.current = setTimeout(tick, 33)
      }
    }

    typeTimerRef.current = setTimeout(tick, 33)
  }

  const handleRefine = async () => {
    if (!aiNote.trim() || !canAiRevise) return

    {
      const note = aiNote.trim()
      const provider = localStorage.getItem('ai_provider') || 'anthropic'
      const PROVIDER_LABELS = { anthropic: 'Claude', openai: 'GPT', google: 'Gemini', microsoft: 'Copilot' }
      const providerLabel = PROVIDER_LABELS[provider] || provider

      if (note === 'debug wrong')   { setRevisionFailed(t('detail.ai_revision_error_body')); return }
      if (note === 'debug 401')     { setRevisionFailed(t('detail.ai_revision_error_invalid_key', { provider: providerLabel })); return }
      if (note === 'debug 429')     { setRevisionFailed(t('detail.ai_revision_error_rate_limit', { provider: providerLabel })); return }
      if (note === 'debug 503')     { setRevisionFailed(t('detail.ai_revision_error_service_error', { provider: providerLabel, status: 503 })); return }
      if (note === 'debug network') { setRevisionFailed(t('detail.ai_revision_error_network_error')); return }
      if (note === 'debug ai assist on') {
        setRefining(true)
        announce(t('detail.rewriting_text'), { priority: 'assertive' })
        setTimeout(() => {
          const newDesc = aiRevisedDesc ? `${descText}\n\n[AI note: ${aiNote}]` : null
          const newFix = aiRevisedFix ? `${fixText}\n\n[AI note: ${aiNote}]` : null
          if (newDesc) setDescHistory(h => [...h, descText])
          if (newFix) setFixHistory(h => [...h, fixText])
          setRefining(false)
          setAnimating(true)
          startTypewriter(newDesc, newFix, t)
        }, 2000)
        return
      }
      if (note === 'debug ok') {
        setRefining(true)
        announce(t('detail.rewriting_text'), { priority: 'assertive' })
        setTimeout(() => {
          const fakeDesc = aiRevisedDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
          const fakeFix = aiRevisedFix ? '[Debug] Revised suggested fix: verify the fix was applied, then remove this placeholder before sharing the report.' : null
          if (fakeDesc) setDescHistory(h => [...h, descText])
          if (fakeFix) setFixHistory(h => [...h, fixText])
          setRefining(false)
          setAnimating(true)
          startTypewriter(fakeDesc, fakeFix, t)
        }, 1200)
        return
      }

      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })

      try {
        const result = useAgenticMode && localStorage.getItem('ai_provider') === 'anthropic'
          ? await getAgenticRefinement({ finding, descText, fixText, note: aiNote, corpus: allFindings })
          : await getAiRefinement({ finding, descText, fixText, note: aiNote })
        const newDesc = aiRevisedDesc && result.desc ? result.desc : null
        const newFix = aiRevisedFix && result.fix ? result.fix : null

        if (newDesc) setDescHistory(h => [...h, descText])
        if (newFix) setFixHistory(h => [...h, fixText])

        setRefining(false)
        setAnimating(true)
        startTypewriter(newDesc, newFix, t)
      } catch (e) {
        if (import.meta.env.DEV) console.error('AI revision failed:', e)
        setRefining(false)
        setAnimating(false)
        if (e instanceof AiApiError) {
          const label = PROVIDER_LABELS[e.provider] || e.provider || 'AI'
          setRevisionFailed(t(`detail.ai_revision_error_${e.type}`, { provider: label, status: e.status }))
        } else {
          setRevisionFailed(t('detail.ai_revision_error_body'))
        }
      }
    }
  }

  const canAiRevise = aiRevisedDesc || aiRevisedFix
  const p = SEVERITY_VARS[finding.severity] || SEVERITY_VARS['Best Practice']
  const descLabel = t('detail.desc_label')
  const fixLabel = t('detail.fix_label')
  const aiRevisionLabel = t('detail.ai_revision_label')

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title-row">
          <h2 ref={titleRef} tabIndex={-1} className="detail-title">
            {finding.title}
          </h2>
          <Button
            variant="tertiary"
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
            variant="severity"
            bg={p.bg}
            color={p.color}
            prefix={finding.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
            onClick={() => onBadgeClick?.({ type: 'severity', value: finding.severity })}
            aria-label={`${finding.severity !== 'Best Practice' ? t('badge.severity_prefix') : ''}${t(p.key)}, ${t('results.badge_filter_aria')}`}
          >
            {t(p.key)}
          </Badge>
          {(() => {
            const sources = finding.creditNames?.filter(src => src !== 'ATH') || []
            if (sources.length === 0) return null
            if (sources.length === 1) {
              const src = sources[0]
              return (
                <Badge
                  key={src}
                  variant="source"
                  prefix={t('detail.sources_badge_single_prefix')}
                  onClick={() => onBadgeClick?.({ type: 'source', value: src })}
                  aria-label={`${t('detail.sources_badge_single_prefix')} ${src}, ${t('results.badge_filter_aria')}`}
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
                aria-label={t('detail.sources_badge_multiple_aria')}
              >
                {t('detail.sources_badge_multiple')}
              </Badge>
            )
          })()}
          {finding.wcagVersion && finding.wcagLevel && (
            <button
              type="button"
              className="wcag-badge"
              style={{ '--badge-bg': 'var(--wcag-bg)', '--badge-text': 'var(--wcag-text)' }}
              onClick={() => onBadgeClick?.({ type: 'wcag', value: finding.wcagVersion })}
              aria-label={`${t('badge.wcag_prefix')}${finding.wcagVersion}, ${t('badge.level_prefix')}${finding.wcagLevel}, ${t('results.badge_filter_aria')}`}
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
                <ScLink label={finding.primarySC} />
              </span>
              <Button
                variant="tertiary"
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
          {finding.relatedSC.length > 0 && (
            <li className="detail-sc-item">
              <div className="detail-sc-item-row">
                <span>
                  <span className="detail-sc-label">{t('detail.related_sc')}</span>{' '}
                  {finding.relatedSC.map((r, i) => (
                    <span key={r}>
                      {i > 0 && ', '}
                      <ScLink label={r} />
                    </span>
                  ))}
                </span>
                <Button
                  variant="tertiary"
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
          {!location.trim() && <span className="detail-optional">{' '}{t('common.optional')}</span>}
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
        animating={animating}
        wasUpdated={descHistory.length > 0}
        isDesktop={isDesktop}
        hasChanged={descText !== finding.desc}
        includeTitle={includeDescTitle}
        onIncludeTitleChange={setIncludeDescTitle}
        includeTitleLabel={t('detail.include_desc_title_when_copied')}
      />

      <Field
        ref={fixCopyBtnRef}
        id="finding-fix"
        label={fixLabel}
        value={fixText}
        onChange={setFixText}
        copied={copiedFix}
        onCopy={() => copy(fixText, setCopiedFix, fixLabel, t('detail.fix_prefix'), includeFixTitle)}
        reset={resetFix}
        onReset={() => handleReset(finding.fix, fixText, setFixText, setResetFix, fixLabel, fixCopyBtnRef)}
        undoable={fixHistory.length > 1}
        onUndo={handleUndoFix}
        animating={animating}
        wasUpdated={fixHistory.length > 0}
        isDesktop={isDesktop}
        hasChanged={fixText !== finding.fix}
        includeTitle={includeFixTitle}
        onIncludeTitleChange={setIncludeFixTitle}
        includeTitleLabel={t('detail.include_fix_title_when_copied')}
      />

      {finding.note && (
        <div className="detail-corpus-note">
          <h3 className="detail-corpus-note-label">{t('detail.note_label')}</h3>
          <p className="detail-corpus-note-body">{finding.note}</p>
        </div>
      )}

      <div className="detail-finding-note">
        <label htmlFor="finding-note" className="detail-label">{t('detail.finding_note_label')}</label>
        <div className="detail-finding-note-row">
          <textarea
            id="finding-note"
            value={findingNote}
            onChange={e => setFindingNote(e.target.value)}
            placeholder={t('detail.finding_note_placeholder')}
            className="detail-input detail-input--textarea"
            rows={3}
          />
          <button
            onClick={() => {
              localStorage.setItem(`finding_note_${finding.id}`, findingNote)
              setFindingNoteSaved(true)
              announce(t('detail.saved_finding_note_aria'))
              setTimeout(() => setFindingNoteSaved(false), NOTIFICATION_TIMEOUT)
            }}
            disabled={!findingNote.trim()}
            className={`btn--primary detail-finding-note-btn btn--height-standard${findingNoteSaved ? ' btn__field--success' : ''}`}
            aria-label={findingNoteSaved ? t('detail.saved_finding_note_aria') : t('detail.save_finding_note_aria')}
          >
            {findingNoteSaved
              ? <><span className="btn-icon"><Check size={14} aria-hidden="true" /></span><span>{t('detail.saved_finding_note_text')}</span></>
              : t('detail.save_finding_note_text')}
          </button>
        </div>
      </div>

      {aiEnabled && (
        <div className="detail-ai-revision">
          <label htmlFor="ai-note" className="detail-label">{aiRevisionLabel}</label>
          <p className="detail-ai-revision-hint">
            {t('detail.ai_revision_hint')}{' '}
            <a href="/settings" className="detail-settings-link">{t('common.settings')}</a>.
          </p>
          <div className="detail-ai-field-select">
            <label className="detail-ai-field-select-item">
              <input
                type="checkbox"
                className="app-checkbox"
                checked={aiRevisedDesc}
                onChange={e => setAiRevisedDesc(e.target.checked)}
                disabled={animating}
              />
              <span>{descLabel}</span>
            </label>
            <label className="detail-ai-field-select-item">
              <input
                type="checkbox"
                className="app-checkbox"
                checked={aiRevisedFix}
                onChange={e => setAiRevisedFix(e.target.checked)}
                disabled={animating}
              />
              <span>{fixLabel}</span>
            </label>
            {localStorage.getItem('ai_provider') === 'anthropic' && (
              <label className="detail-ai-field-select-item detail-ai-field-select-item--agentic">
                <input
                  type="checkbox"
                  className="app-checkbox"
                  checked={useAgenticMode}
                  onChange={e => setUseAgenticMode(e.target.checked)}
                  disabled={animating}
                />
                <span>{t('detail.agentic_mode_label') || 'Match Existing Style'}</span>
              </label>
            )}
          </div>
          <div className="detail-ai-revision-row">
            <textarea
              id="ai-note"
              value={aiNote}
              onChange={e => setAiNote(e.target.value)}
              placeholder={t('detail.ai_revision_placeholder')}
              className="detail-input detail-input--textarea"
              rows={3}
            />
            <button
              ref={aiRevisionButtonRef}
              onClick={handleRefine}
              disabled={refining || animating || !aiNote.trim()}
              aria-busy={refining ? true : undefined}
              className="btn--primary detail-ai-revision-btn btn--height-standard"
              aria-label={refining ? t('detail.rewriting_aria') : t('detail.ai_revision_aria')}
            >
              {refining
                ? <><span className="btn-icon"><Loader2 size={12} strokeWidth={2} className="detail-revising-spinner" aria-hidden="true" /></span><span>{t('detail.rewriting_text')}</span></>
                : <><span className="btn-icon"><Sparkles size={12} strokeWidth={2} className="detail-ai-revision-icon" aria-hidden="true" /></span><span>{t('detail.ai_revision_save_text')}</span></>}
            </button>
          </div>
          {(descText !== finding.desc || fixText !== finding.fix) && (
            <p className="detail-edit-warning" role="status">
              <AlertCircle size={16} aria-hidden="true" className="detail-edit-warning-icon" />
              {t('detail.edit_lang_warning')}
            </p>
          )}
        </div>
      )}

      <RelatedIssues finding={finding} allFindings={allFindings} onSelect={onSelectRelated ?? onSelect} getPairsFor={getPairsFor} />
      <SourceLinks
        links={finding.creditLinks}
        singleHeading={t('detail.source_heading')}
        multipleHeading={t('detail.sources_heading')}
      />

      <div className="detail-actions-end">
        <button
          type="button"
          className={`btn--secondary detail-action-btn btn--height-standard${resetAllDone ? ' btn__field--success' : ''}`}
          onClick={handleResetAllFields}
          aria-label={t('detail.reset_all_fields_aria')}
          disabled={descText === finding.desc && fixText === finding.fix}
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
        heading={t('detail.ai_revision_error_heading')}
        returnFocusRef={aiRevisionButtonRef}
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

