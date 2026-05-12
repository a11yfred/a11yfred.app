import { useState, useRef, useEffect } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertCircle, RotateCcw, Save } from 'lucide-react'
import { useMediaQuery, useFocusOnChange, Modal } from '../siling-labuyo/index.js'
import { announce } from '../taho/index.js'
import { useT } from '../calamansi/react.js'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import Button from './ui/Button.jsx'
import InfoBox from './ui/InfoBox.jsx'
import Toggle from './ui/Toggle.jsx'
import InputWithClear from './ui/InputWithClear.jsx'
import Badge from './ui/Badge.jsx'
import A11yTextareaCopyable from './A11yTextareaCopyable.jsx'
import A11yLinkSc from './A11yLinkSc.jsx'
import A11yLinksSource from './A11yLinksSource.jsx'
import A11yListRelated from './A11yListRelated.jsx'
import { DEBUG_COMMANDS, DEBUG_AI_DELAY_MS, getAiProvider, getProviderLabel } from '../halohalo/index.js'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'
import { getStorage, setStorage, getFindingNoteKey } from '../utils/storage.js'
import useDetailSheetClipboard from '../hooks/useDetailSheetClipboard.js'
import useDetailSheetRefine from '../hooks/useDetailSheetRefine.js'
import './SheetDetail.css'

function FieldCheckbox({ label, checked, onChange, disabled }) {
  return (
    <label className="detail-ai-field-select-item">
      <input
        type="checkbox"
        className="app-checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  )
}

export default function SheetDetail({ finding, aiEnabled, agenticMode = false, focusTrigger = 0, allFindings = [], onSelect, onSelectRelated, onClose, onBadgeClick, onCopyEvent, getPairsFor, debugPanelCmd = null, onDebugPanelCmdHandled }) {
  const titleRef = useRef(null)
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(finding.desc)
  const [fixText, setFixText] = useState(finding.fix)
  const [aiNote, setAiNote] = useState('')
  const [findingNote, setFindingNote] = useState(() => getStorage(getFindingNoteKey(finding.id), ''))
  const [useAgenticMode, setUseAgenticMode] = useState(agenticMode)
  const [findingNoteSaved, setFindingNoteSaved] = useState(false)
  const [descHistory, setDescHistory] = useState([])
  const [fixHistory, setFixHistory] = useState([])
  const [aiRevisedDesc, setAiRevisedDesc] = useState(false)
  const [aiRevisedFix, setAiRevisedFix] = useState(false)
  const [includeDescTitle, setIncludeDescTitle] = useState(false)
  const [includeFixTitle, setIncludeFixTitle] = useState(false)
  const descCopyBtnRef = useRef(null)
  const fixCopyBtnRef = useRef(null)

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${finding.desc}`
    : descText

  const {
    copiedTitle, copiedPrimarySc, copiedRelatedSc,
    copiedDesc, setCopiedDesc,
    copiedFix, setCopiedFix,
    copiedAll,
    resetDesc, setResetDesc,
    resetFix, setResetFix,
    resetAllDone,
    nothingToCopy, setNothingToCopy,
    confirmReset, setConfirmReset,
    copy, handleReset,
    handleCopyAll, handleResetAllFields,
    handleUndoDesc, handleUndoFix,
    copyTitle, copyPrimarySc, copyRelatedSc,
  } = useDetailSheetClipboard({
    finding, descText, fixText, displayDesc,
    setDescText, setFixText, setDescHistory, setFixHistory,
    descHistory, fixHistory, onCopyEvent, t,
  })

  const {
    refining, setRefining,
    animating, setAnimating,
    revisionFailed, setRevisionFailed,
    aiRevisionButtonRef,
    startTypewriter,
    handleRefine,
  } = useDetailSheetRefine({
    finding, descText, fixText,
    aiRevisedDesc, aiRevisedFix, useAgenticMode, aiNote, allFindings,
    setDescText, setFixText, setDescHistory, setFixHistory, t,
  })

  useFocusOnChange(titleRef, focusTrigger)
  useFocusOnChange(titleRef, finding.id)

  useEffect(() => {
    setFindingNote(getStorage(getFindingNoteKey(finding.id), '')) // eslint-disable-line react-hooks/set-state-in-effect
    setAiNote('')
  }, [finding.id])

  useEffect(() => {
    if (!debugPanelCmd) return
    const provider = getAiProvider()
    const providerLabel = getProviderLabel(provider)
    if (debugPanelCmd === DEBUG_COMMANDS.WRONG)   { setRevisionFailed(t('detail.ai_revision_error_body')); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === DEBUG_COMMANDS.AUTH)     { setRevisionFailed(t('detail.ai_revision_error_invalid_key', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === DEBUG_COMMANDS.RATE)     { setRevisionFailed(t('detail.ai_revision_error_rate_limit', { provider: providerLabel })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === DEBUG_COMMANDS.SERVICE)  { setRevisionFailed(t('detail.ai_revision_error_service_error', { provider: providerLabel, status: 503 })); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === DEBUG_COMMANDS.NETWORK)  { setRevisionFailed(t('detail.ai_revision_error_network_error')); onDebugPanelCmdHandled?.(); return }
    if (debugPanelCmd === DEBUG_COMMANDS.OK) {
      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })
      setTimeout(() => {
        const fakeDesc = aiRevisedDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
        const fakeFix = aiRevisedFix ? '[Debug] Revised suggested fix: verify the fix was applied, then remove this placeholder before sharing the report.' : null
        if (fakeDesc) setDescHistory(h => [...h, descText])
        if (fakeFix) setFixHistory(h => [...h, fixText])
        setRefining(false)
        setAnimating(true)
        startTypewriter(fakeDesc, fakeFix)
      }, DEBUG_AI_DELAY_MS)
      onDebugPanelCmdHandled?.()
    }
  }, [debugPanelCmd]) // eslint-disable-line react-hooks/exhaustive-deps

  const p = SEVERITY_VARS[finding.severity] || SEVERITY_VARS['Best Practice']
  const descLabel = t('detail.desc_label')
  const fixLabel = t('detail.fix_label')
  const aiRevisionLabel = t('detail.ai_revision_label')

  return (
    <div className="detail-sheet">
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
            const sources = finding.creditNames || []
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
                onClick={() => document.querySelector('.source-links')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-label={t('detail.sources_badge_multiple_aria')}
              >
                {t('detail.sources_badge_multiple')}
              </Badge>
            )
          })()}
          {finding.wcagVersion && finding.wcagLevel && (
            <button
              type="button"
              className="badge--wcag"
              style={{ '--badge-bg': 'var(--wcag-bg)', '--badge-text': 'var(--wcag-text)' }}
              onClick={() => onBadgeClick?.({ type: 'wcag', value: finding.wcagVersion, level: finding.wcagLevel })}
              aria-label={`${t('badge.wcag_prefix')}${finding.wcagVersion}, ${t('badge.level_prefix')}${finding.wcagLevel}, ${t('results.badge_filter_aria')}`}
            >
              <span className="badge-prefix">{t('badge.wcag_prefix')}</span>
              {finding.wcagVersion},{' '}
              <span className="badge-prefix">{t('badge.level_prefix')}</span>
              {finding.wcagLevel}
            </button>
          )}
        </div>

        <div className="detail-sc-group">
          <p className="detail-sc-row">
            <span className="detail-sc-label">{t('detail.sc_failed')}</span>{' '}
            {finding.primarySC
              ? <>
                  <A11yLinkSc label={finding.primarySC} />
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
                </>
              : <span className="detail-sc-na">{t('common.na')}</span>
            }
          </p>
          {finding.relatedSC.length > 0 && (
            <p className="detail-sc-row">
              <span className="detail-sc-label">{t('detail.related_sc')}</span>{' '}
              <span className="detail-sc-links">
                {finding.relatedSC.map((r, i) => (
                  <span key={r}>
                    <A11yLinkSc label={r} />{i < finding.relatedSC.length - 1 && ', '}
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
            </p>
          )}
        </div>
      </div>

      {finding.note && (
        <InfoBox label={t('detail.note_label')} className="detail-corpus-note">
          {finding.note}
        </InfoBox>
      )}

      <div className="detail-section detail-section--location">
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
          disabled={animating}
        />
      </div>

      <A11yTextareaCopyable
        ref={descCopyBtnRef}
        id="finding-desc"
        label={descLabel}
        value={location.trim() ? displayDesc : descText}
        onChange={setDescText}
        copied={copiedDesc}
        onCopy={() => copy(location.trim() ? displayDesc : descText, setCopiedDesc, descLabel, t('detail.desc_prefix'), includeDescTitle, 'desc')}
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

      <A11yTextareaCopyable
        ref={fixCopyBtnRef}
        id="finding-fix"
        label={fixLabel}
        value={fixText}
        onChange={setFixText}
        copied={copiedFix}
        onCopy={() => copy(fixText, setCopiedFix, fixLabel, t('detail.fix_prefix'), includeFixTitle, 'fix')}
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

      <div className="detail-section">
        <label htmlFor="finding-note" className="detail-label">{t('detail.finding_note_label')}</label>
        <textarea
          id="finding-note"
          value={findingNote}
          onChange={e => setFindingNote(e.target.value)}
          placeholder={t('detail.finding_note_placeholder')}
          className="detail-input detail-input--textarea"
          rows={3}
        />
        <div className="detail-section-controls">
          <button
            onClick={findingNote.trim() ? () => {
              setStorage(getFindingNoteKey(finding.id), findingNote)
              setFindingNoteSaved(true)
              announce(t('detail.saved_finding_note_aria'))
              setTimeout(() => setFindingNoteSaved(false), NOTIFICATION_TIMEOUT)
            } : undefined}
            aria-disabled={!findingNote.trim() || undefined}
            className={`btn--primary detail-section-btn btn--height-standard${findingNoteSaved ? ' btn__field--success' : ''}`}
            aria-label={findingNoteSaved ? t('detail.saved_finding_note_aria') : t('detail.save_finding_note_aria')}
          >
            {findingNoteSaved
              ? <><Check size={14} aria-hidden="true" /><span>{t('detail.saved_finding_note_text')}</span></>
              : <><Save size={14} aria-hidden="true" /><span>{t('detail.save_finding_note_text')}</span></>}
          </button>
        </div>
      </div>

      {aiEnabled && (
        <div className="detail-section">
          <label htmlFor="ai-note" className={`detail-label${animating ? ' detail-label--disabled' : ''}`}>{aiRevisionLabel}</label>
          <p className="detail-ai-revision-hint">
            {t('detail.ai_revision_hint')}{' '}
            <a href="#/settings" className="detail-settings-link">{t('common.settings')}</a>.
          </p>
          <textarea
            id="ai-note"
            value={aiNote}
            onChange={e => setAiNote(e.target.value)}
            placeholder={t('detail.ai_revision_placeholder')}
            className="detail-input detail-input--textarea"
            rows={3}
          />
          <div className="detail-section-controls">
            <div className="detail-ai-settings-group">
              {getAiProvider() === 'anthropic' && (
                <label className="detail-ai-agentic-row" htmlFor="agentic-mode-toggle">
                  <span className="detail-ai-agentic-label">{t('detail.agentic_mode_label') || 'Match Existing Style'}</span>
                  <Toggle
                    id="agentic-mode-toggle"
                    checked={useAgenticMode}
                    onChange={setUseAgenticMode}
                  />
                </label>
              )}
              <div className="detail-ai-field-select">
                <FieldCheckbox label={descLabel} checked={aiRevisedDesc} onChange={setAiRevisedDesc} disabled={animating} />
                <FieldCheckbox label={fixLabel} checked={aiRevisedFix} onChange={setAiRevisedFix} disabled={animating} />
              </div>
            </div>
            <button
              ref={aiRevisionButtonRef}
              onClick={(refining || animating || !aiNote.trim()) ? undefined : handleRefine}
              aria-disabled={(refining || animating || !aiNote.trim()) || undefined}
              aria-busy={refining ? true : undefined}
              className="btn--primary detail-section-btn btn--height-standard"
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

      <A11yListRelated finding={finding} allFindings={allFindings} onSelect={onSelectRelated ?? onSelect} getPairsFor={getPairsFor} />
      <A11yLinksSource
        links={finding.creditLinks}
        singleHeading={t('detail.source_heading')}
        multipleHeading={t('detail.sources_heading')}
      />

      <div className="detail-actions-end">
        <button
          type="button"
          className={`btn--secondary detail-action-btn btn--height-standard${resetAllDone ? ' btn__field--success' : ''}`}
          onClick={(descText === finding.desc && fixText === finding.fix) ? undefined : handleResetAllFields}
          aria-disabled={(descText === finding.desc && fixText === finding.fix) || undefined}
          aria-label={t('detail.reset_all_fields_aria')}
        >
          {resetAllDone
            ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.reset_all_done_desktop')}</>
            : <><RotateCcw size={14} aria-hidden="true" />{' '}{t('detail.reset_all_fields_text')}</>
          }
        </button>
        <button
          type="button"
          className={`btn--primary detail-action-btn btn--height-standard${copiedAll ? ' btn__field--success' : ''}`}
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
            className={`${isDesktop ? 'btn btn--primary' : 'btn--tertiary'} detail-close-btn btn--height-standard`}
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
