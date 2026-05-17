import { useState, useRef, useEffect } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertCircle, RotateCcw, Save } from 'lucide-react'
import { useMediaQuery, useFocusOnChange, Modal } from '@ulam/sili/react'
import { announce } from '@ulam/taho'
import { useT } from '@ulam/calamansi/react'
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
import { DEBUG_COMMANDS, DEBUG_AI_DELAY_MS, getAiProvider, getProviderLabel } from '@ulam/halohalo'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'
import { getStorage, setStorage, getEntryNoteKey } from '../utils/storage.js'
import useSheetDetailClipboard from '../hooks/useSheetDetailClipboard.js'
import useSheetDetailRefine from '../hooks/useSheetDetailRefine.js'
import { useSettings } from '../context/ContextSettings.js'
import { useRatings } from '../context/ContextRatings.js'
import './A11yPanelDetail.css'

const WCAG_BADGE_STYLE = { '--badge-bg': 'var(--wcag-bg)', '--badge-text': 'var(--wcag-text)' }
const WCAG_LEVEL_BADGE_STYLE = { '--badge-bg': 'var(--wcag-level-bg)', '--badge-text': 'var(--wcag-level-text)' }

function FieldCheckbox({ label, checked, onChange, disabled }) {
  return (
    <label className="panel-detail-ai-field-select-item">
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

export default function A11yPanelDetail({ entry, agenticMode = false, focusTrigger = 0, allEntries = [], onSelect, onSelectRelated, onClose, onBadgeClick, onCopyEvent, debugPanelCmd = null, onDebugPanelCmdHandled }) {
  const { aiEnabled } = useSettings()
  const { getPairsFor } = useRatings()
  const titleRef = useRef(null)
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()

  const handleBadgeClickAndClose = (filter) => {
    onBadgeClick?.(filter)
    onClose?.()
  }

  const [location, setLocation] = useState('')
  const [descText, setDescText] = useState(entry.desc)
  const [fixText, setFixText] = useState(entry.fix)
  const [aiNote, setAiNote] = useState('')
  const [entryNote, setEntryNote] = useState(() => getStorage(getEntryNoteKey(entry.id), ''))
  const [useAgenticMode, setUseAgenticMode] = useState(agenticMode)
  const [entryNoteSaved, setEntryNoteSaved] = useState(false)
  const [descHistory, setDescHistory] = useState([])
  const [fixHistory, setFixHistory] = useState([])
  const [aiRevisedDesc, setAiRevisedDesc] = useState(false)
  const [aiRevisedFix, setAiRevisedFix] = useState(false)
  const [includeDescTitle, setIncludeDescTitle] = useState(false)
  const [includeFixTitle, setIncludeFixTitle] = useState(false)
  const descCopyBtnRef = useRef(null)
  const fixCopyBtnRef = useRef(null)

  const displayDesc = location.trim()
    ? `${location.trim().replace(/:?\s*$/, ':')} ${entry.desc}`
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
  } = useSheetDetailClipboard({
    entry, descText, fixText, displayDesc,
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
  } = useSheetDetailRefine({
    entry, descText, fixText,
    aiRevisedDesc, aiRevisedFix, useAgenticMode, aiNote, allEntries,
    setDescText, setFixText, setDescHistory, setFixHistory, t,
  })

  useEffect(() => { titleRef.current?.focus() }, [])
  useFocusOnChange(titleRef, focusTrigger)

  useEffect(() => {
    setEntryNote(getStorage(getEntryNoteKey(entry.id), '')) // eslint-disable-line react-hooks/set-state-in-effect
    setAiNote('')
  }, [entry.id])

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

  const p = SEVERITY_VARS[entry.severity] || SEVERITY_VARS['Best Practice']
  const descLabel = t('detail.desc_label')
  const fixLabel = t('detail.fix_label')
  const aiRevisionLabel = t('detail.ai_revision_label')

  return (
    <div className="panel-detail-sheet">
      <div className="panel-detail-header">
        <div className="panel-detail-title-row">
          <h2 ref={titleRef} tabIndex={-1} className="panel-detail-title">
            {entry.title}
          </h2>
          <Button
            variant="tertiary"
            active={copiedTitle}
            icon={<Copy size={14} aria-hidden="true" />}
            activeIcon={<Check size={14} aria-hidden="true" />}
            label={t('detail.copy_title_aria')}
            activeLabel={t('detail.copied_aria')}
            className="panel-detail-copy-btn"
            onClick={copyTitle}
            title={copiedTitle ? t('detail.copied_aria') : t('detail.copy_title_aria')}
          />
        </div>
        <div className="panel-detail-badges">
          <Badge
            variant="severity"
            bg={p.bg}
            color={p.color}
            prefix={entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
            onClick={() => handleBadgeClickAndClose({ type: 'severity', value: entry.severity })}
            aria-label={`${entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : ''}${t(p.key)}, ${t('results.badge_filter_aria')}`}
          >
            {t(p.key)}
          </Badge>
          {(() => {
            const sources = entry.creditNames || []
            if (sources.length === 0) return null
            if (sources.length === 1) {
              const src = sources[0]
              return (
                <Badge
                  key={src}
                  variant="source"
                  prefix={t('detail.sources_badge_single_prefix')}
                  onClick={() => handleBadgeClickAndClose({ type: 'source', value: src })}
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
                onClick={() => {
                  const sourceLinksEl = document.querySelector('.source-links')
                  if (sourceLinksEl) {
                    const heading = sourceLinksEl.querySelector('.source-links__heading')
                    if (heading) {
                      heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      setTimeout(() => heading.focus(), 100)
                    }
                  }
                }}
                aria-label={t('detail.sources_badge_multiple_aria')}
              >
                {t('detail.sources_badge_multiple')}
              </Badge>
            )
          })()}
          {entry.wcagVersion && (
            <button
              type="button"
              className="badge--wcag"
              style={WCAG_BADGE_STYLE}
              onClick={() => handleBadgeClickAndClose({ type: 'wcag', value: entry.wcagVersion })}
              aria-label={`${t('badge.wcag_prefix')}${entry.wcagVersion}, ${t('results.badge_filter_aria')}`}
            >
              {t('badge.wcag_version_label')}{entry.wcagVersion}
            </button>
          )}
          {entry.wcagLevel && (
            <button
              type="button"
              className="badge--wcag-level"
              style={WCAG_LEVEL_BADGE_STYLE}
              onClick={() => handleBadgeClickAndClose({ type: 'wcag-level', value: entry.wcagLevel })}
              aria-label={`${t('badge.level_prefix')}${entry.wcagLevel}, ${t('results.badge_filter_aria')}`}
            >
              {t('badge.level_label')}{entry.wcagLevel}
            </button>
          )}
        </div>

        <div className="panel-detail-sc-group">
          <p className="panel-detail-sc-row">
            <span className="panel-detail-sc-label">{t('detail.sc_failed')}</span>{' '}
            {entry.primarySC
              ? <>
                  <A11yLinkSc label={entry.primarySC} />
                  <Button
                    variant="tertiary"
                    active={copiedPrimarySc}
                    icon={<Copy size={14} aria-hidden="true" />}
                    activeIcon={<Check size={14} aria-hidden="true" />}
                    label={t('detail.copy_sc_aria')}
                    activeLabel={t('detail.copied_aria')}
                    className="panel-detail-sc-copy-btn"
                    onClick={copyPrimarySc}
                    title={copiedPrimarySc ? t('detail.copied_aria') : t('detail.copy_sc_aria')}
                  />
                </>
              : <span className="panel-detail-sc-na">{t('common.na')}</span>
            }
          </p>
          {entry.relatedSC.length > 0 && (
            <p className="panel-detail-sc-row">
              <span className="panel-detail-sc-label">{t('detail.related_sc')}</span>{' '}
              <span className="panel-detail-sc-links">
                {entry.relatedSC.map((r, i) => (
                  <span key={r}>
                    <A11yLinkSc label={r} />{i < entry.relatedSC.length - 1 && ', '}
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
                className="panel-detail-sc-copy-btn"
                onClick={copyRelatedSc}
                title={copiedRelatedSc ? t('detail.copied_aria') : t('detail.copy_sc_aria')}
              />
            </p>
          )}
        </div>
      </div>

      {entry.note && (
        <InfoBox label={t('detail.note_label')} className="panel-detail-corpus-note">
          {entry.note}
        </InfoBox>
      )}

      <div className="panel-detail-section panel-detail-section--location">
        <label htmlFor="location-prefix" className="panel-detail-label">
          {t('detail.location_label')}
          {!location.trim() && <span className="panel-detail-optional">{' '}{t('common.optional')}</span>}
        </label>
        <InputWithClear
          id="location-prefix"
          type="text"
          value={location}
          onChange={setLocation}
          onClear={() => setLocation('')}
          placeholder={t('detail.location_placeholder')}
          clearAriaLabel={t('search.clear_aria')}
          wrapClassName="panel-detail-location-input-wrap"
          inputClassName="panel-detail-input"
          clearButtonClassName="btn--primary panel-detail-location-clear-btn"
          disabled={animating}
        />
      </div>

      <A11yTextareaCopyable
        ref={descCopyBtnRef}
        id="entry-desc"
        label={descLabel}
        value={location.trim() ? displayDesc : descText}
        onChange={setDescText}
        copied={copiedDesc}
        onCopy={() => copy(location.trim() ? displayDesc : descText, setCopiedDesc, descLabel, t('detail.desc_prefix'), includeDescTitle, 'desc')}
        reset={resetDesc}
        onReset={() => handleReset(entry.desc, descText, setDescText, setResetDesc, descLabel, descCopyBtnRef)}
        undoable={descHistory.length > 1}
        onUndo={handleUndoDesc}
        animating={animating}
        wasUpdated={descHistory.length > 0}
        isDesktop={isDesktop}
        hasChanged={descText !== entry.desc}
        includeTitle={includeDescTitle}
        onIncludeTitleChange={setIncludeDescTitle}
        includeTitleLabel={t('detail.include_desc_title_when_copied')}
      />

      <A11yTextareaCopyable
        ref={fixCopyBtnRef}
        id="entry-fix"
        label={fixLabel}
        value={fixText}
        onChange={setFixText}
        copied={copiedFix}
        onCopy={() => copy(fixText, setCopiedFix, fixLabel, t('detail.fix_prefix'), includeFixTitle, 'fix')}
        reset={resetFix}
        onReset={() => handleReset(entry.fix, fixText, setFixText, setResetFix, fixLabel, fixCopyBtnRef)}
        undoable={fixHistory.length > 1}
        onUndo={handleUndoFix}
        animating={animating}
        wasUpdated={fixHistory.length > 0}
        isDesktop={isDesktop}
        hasChanged={fixText !== entry.fix}
        includeTitle={includeFixTitle}
        onIncludeTitleChange={setIncludeFixTitle}
        includeTitleLabel={t('detail.include_fix_title_when_copied')}
      />

      <div className="panel-detail-section">
        <label htmlFor="entry-note" className="panel-detail-label">{t('detail.finding_note_label')}</label>
        <textarea
          id="entry-note"
          value={entryNote}
          onChange={e => setEntryNote(e.target.value)}
          placeholder={t('detail.finding_note_placeholder')}
          className="panel-detail-input panel-detail-input--textarea"
          rows={3}
        />
        <div className="panel-detail-section-controls">
          <button
            onClick={entryNote.trim() ? () => {
              setStorage(getEntryNoteKey(entry.id), entryNote)
              setEntryNoteSaved(true)
              announce(t('detail.saved_finding_note_aria'))
              setTimeout(() => setEntryNoteSaved(false), NOTIFICATION_TIMEOUT)
            } : undefined}
            aria-disabled={!entryNote.trim() || undefined}
            className={`btn--primary panel-detail-section-btn btn--height-standard${entryNoteSaved ? ' btn__field--success' : ''}`}
            aria-label={entryNoteSaved ? t('detail.saved_finding_note_aria') : t('detail.save_finding_note_aria')}
          >
            {entryNoteSaved
              ? <><Check size={14} aria-hidden="true" /><span>{t('detail.saved_finding_note_text')}</span></>
              : <><Save size={14} aria-hidden="true" /><span>{t('detail.save_finding_note_text')}</span></>}
          </button>
        </div>
      </div>

      {aiEnabled && (
        <div className="panel-detail-section">
          <label htmlFor="ai-note" className={`panel-detail-label${animating ? ' panel-detail-label--disabled' : ''}`}>{aiRevisionLabel}</label>
          <p className="panel-detail-ai-revision-hint">
            {t('detail.ai_revision_hint')}{' '}
            <a href="#/settings" className="panel-detail-settings-link">{t('common.settings')}</a>.
          </p>
          <textarea
            id="ai-note"
            value={aiNote}
            onChange={e => setAiNote(e.target.value)}
            placeholder={t('detail.ai_revision_placeholder')}
            className="panel-detail-input panel-detail-input--textarea"
            rows={3}
          />
          <div className="panel-detail-section-controls">
            <div className="panel-detail-ai-settings-group">
              {getAiProvider() === 'anthropic' && (
                <label className="panel-detail-ai-agentic-row" htmlFor="agentic-mode-toggle">
                  <span className="panel-detail-ai-agentic-label">{t('detail.agentic_mode_label') || 'Match Existing Style'}</span>
                  <Toggle
                    id="agentic-mode-toggle"
                    checked={useAgenticMode}
                    onChange={setUseAgenticMode}
                  />
                </label>
              )}
              <div className="panel-detail-ai-field-select">
                <FieldCheckbox label={descLabel} checked={aiRevisedDesc} onChange={setAiRevisedDesc} disabled={animating} />
                <FieldCheckbox label={fixLabel} checked={aiRevisedFix} onChange={setAiRevisedFix} disabled={animating} />
              </div>
            </div>
            <button
              ref={aiRevisionButtonRef}
              onClick={(refining || animating || !aiNote.trim()) ? undefined : handleRefine}
              aria-disabled={(refining || animating || !aiNote.trim()) || undefined}
              aria-busy={refining ? true : undefined}
              className="btn--primary panel-detail-section-btn btn--height-standard"
              aria-label={refining ? t('detail.rewriting_aria') : t('detail.ai_revision_aria')}
            >
              {refining
                ? <><span className="btn-icon"><Loader2 size={12} strokeWidth={2} className="panel-detail-revising-spinner" aria-hidden="true" /></span><span>{t('detail.rewriting_text')}</span></>
                : <><span className="btn-icon"><Sparkles size={12} strokeWidth={2} className="panel-detail-ai-revision-icon" aria-hidden="true" /></span><span>{t('detail.ai_revision_save_text')}</span></>}
            </button>
          </div>
          {(descText !== entry.desc || fixText !== entry.fix) && (
            <p className="panel-detail-edit-warning" role="status">
              <AlertCircle size={16} aria-hidden="true" className="panel-detail-edit-warning-icon" />
              {t('detail.edit_lang_warning')}
            </p>
          )}
        </div>
      )}

      <A11yListRelated entry={entry} allEntries={allEntries} onSelect={onSelectRelated ?? onSelect} getPairsFor={getPairsFor} />
      <A11yLinksSource
        links={entry.creditLinks}
        singleHeading={t('detail.source_heading')}
        multipleHeading={t('detail.sources_heading')}
      />

      <div className="panel-detail-actions-end">
        <button
          type="button"
          className={`btn--secondary panel-detail-action-btn btn--height-standard${resetAllDone ? ' btn__field--success' : ''}`}
          onClick={(descText === entry.desc && fixText === entry.fix) ? undefined : handleResetAllFields}
          aria-disabled={(descText === entry.desc && fixText === entry.fix) || undefined}
          aria-label={t('detail.reset_all_fields_aria')}
        >
          {resetAllDone
            ? <><Check size={14} aria-hidden="true" />{' '}{t('detail.reset_all_done_desktop')}</>
            : <><RotateCcw size={14} aria-hidden="true" />{' '}{t('detail.reset_all_fields_text')}</>
          }
        </button>
        <button
          type="button"
          className={`btn--primary panel-detail-action-btn btn--height-standard${copiedAll ? ' btn__field--success' : ''}`}
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
            className={`${isDesktop ? 'btn btn--primary' : 'btn--tertiary'} panel-detail-close-btn btn--height-standard`}
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
