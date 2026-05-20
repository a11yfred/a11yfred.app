import { Button, InfoBox, FormControlToggle, FormInputText, Badge, FormControlCheckbox } from '@ulam/ube'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Copy, Check, Loader2, AlertCircle, RotateCcw, Save, Mail } from 'lucide-react'
import { useMediaQuery, useFocusOnChange, Dialog } from '@ulam/sili/react'
import { announce } from '@ulam/taho'
import { useT } from '../hooks/useTranslate.js'
import { SEVERITY_VARS } from '../data/severityStyles.js'
import A11yTextareaCopyable from './A11yTextareaCopyable.jsx'
import A11yLinkSc from './AppLinkSc.jsx'
import A11yLinksSource from './AppLinksSource.jsx'
import A11yResultRelated from './A11yResultRelated.jsx'
import { DEBUG_COMMANDS, DEBUG_AI_DELAY_MS, getAiProvider, getProviderLabel } from '@ulam/halohalo'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'
import { getStorage, setStorage, getEntryNoteKey } from '../utils/storage.js'
import useSheetDetailClipboard from '../hooks/useSheetDetailClipboard.js'
import useSheetDetailRefine from '../hooks/useSheetDetailRefine.js'
import { useSettings } from '../context/contextSettings.js'
import { useRatings } from '../context/contextRatings.js'
import './app-sheet.css'

const createBadgeStyle = (bgVar, textVar) => ({ '--badge-bg': `var(${bgVar})`, '--badge-text': `var(${textVar})` })
const WCAG_BADGE_STYLE = createBadgeStyle('--wcag-bg', '--wcag-text')
const WCAG_LEVEL_BADGE_STYLE = createBadgeStyle('--wcag-level-bg', '--wcag-level-text')

export default function AppSheetDetail({ entry, agenticMode = false, focusTrigger = 0, allEntries = [], onSelect, onSelectRelated, onClose, onBadgeClick, onCopyEvent, debugPanelCmd = null, onDebugPanelCmdHandled }) {
  const { aiEnabled } = useSettings()
  const { getPairsFor } = useRatings()
  const titleRef = useRef(null)
  const isDesktop = useMediaQuery('(width >= 768px)')
  const t = useT()

  const handleBadgeClickAndClose = (filter) => {
    onBadgeClick?.(filter)
    setTimeout(() => onClose?.(), 0)
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

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Accessibility Defect: ${entry.title}`)
    const bodyLines = [
      `Title: ${entry.title}`,
      `Severity: ${entry.severity}`,
      `WCAG: ${entry.sc}`,
      '',
      `Description:`,
      displayDesc,
      '',
      `Suggested Fix:`,
      fixText,
      '',
      `Source: A11yFred (a11yfred.app)`,
    ]
    const body = encodeURIComponent(bodyLines.join('\n'))
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

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
            label={t('detail.copy_title_aria_label')}
            activeLabel={t('detail.copied_aria_live')}
            className="btn-panel--copy"
            onClick={copyTitle}
            title={copiedTitle ? t('detail.copied_aria_live') : t('detail.copy_title_aria_label')}
          />
        </div>
        <div className="panel-detail-badges">
          <Badge
            variant="severity"
            bg={p.bg}
            color={p.color}
            prefix={entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : undefined}
            onClick={() => handleBadgeClickAndClose({ type: 'severity', value: entry.severity })}
            aria-label={`${entry.severity !== 'Best Practice' ? t('badge.severity_prefix') : ''}${t(p.key)}, ${t('results.badge_filter_aria_label')}`}
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
                  aria-label={`${t('detail.sources_badge_single_prefix')} ${src}, ${t('results.badge_filter_aria_label')}`}
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
                  const heading = document.querySelector('.source-links__heading')
                  if (heading) {
                    heading.focus()
                    heading.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }
                }}
                aria-label={t('detail.sources_badge_multiple_aria_label')}
              >
                {t('detail.sources_badge_multiple')}
              </Badge>
            )
          })()}
          {entry.wcagVersion && (
            <Badge
              variant="wcag"
              bg={WCAG_BADGE_STYLE['--badge-bg']}
              color={WCAG_BADGE_STYLE['--badge-text']}
              onClick={() => handleBadgeClickAndClose({ type: 'wcag', value: entry.wcagVersion })}
              aria-label={`${t('badge.wcag_prefix')}${entry.wcagVersion}, ${t('results.badge_filter_aria_label')}`}
            >
              {t('badge.wcag_version_label')}{entry.wcagVersion}
            </Badge>
          )}
          {entry.wcagLevel && (
            <Badge
              variant="wcag-level"
              bg={WCAG_LEVEL_BADGE_STYLE['--badge-bg']}
              color={WCAG_LEVEL_BADGE_STYLE['--badge-text']}
              onClick={() => handleBadgeClickAndClose({ type: 'wcag-level', value: entry.wcagLevel })}
              aria-label={`${t('badge.level_prefix')}${entry.wcagLevel}, ${t('results.badge_filter_aria_label')}`}
            >
              {t('badge.level_label')}{entry.wcagLevel}
            </Badge>
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
                    label={t('detail.copy_sc_aria_label')}
                    activeLabel={t('detail.copied_aria_live')}
                    className="btn-panel--copy"
                    onClick={copyPrimarySc}
                    title={copiedPrimarySc ? t('detail.copied_aria_live') : t('detail.copy_sc_aria_label')}
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
                label={t('detail.copy_sc_aria_label')}
                activeLabel={t('detail.copied_aria_live')}
                className="btn-panel--copy"
                onClick={copyRelatedSc}
                title={copiedRelatedSc ? t('detail.copied_aria_live') : t('detail.copy_sc_aria_label')}
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
        <FormInputText
          id="location-prefix"
          type="text"
          value={location}
          onChange={setLocation}
          onClear={() => setLocation('')}
          placeholder={t('detail.location_placeholder')}
          clearAriaLabel={t('search.clear_aria_label')}
          wrapClassName="panel-detail-location-input-wrap"
          inputClassName="panel-detail-input"
          clearButtonClassName="btn--primary btn-panel--clear-input"
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
        <label htmlFor="entry-note" className="panel-detail-label">{t('detail.entry_note_label')}</label>
        <textarea
          id="entry-note"
          value={entryNote}
          onChange={e => setEntryNote(e.target.value)}
          placeholder={t('detail.entry_note_placeholder')}
          className="panel-detail-input panel-detail-input--textarea"
          rows={3}
        />
        <div className="panel-detail-section-controls">
          <Button
            variant="primary"
            disabled={!entryNote.trim()}
            active={entryNoteSaved}
            icon={entryNoteSaved ? <Check size={14} aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
            label={entryNoteSaved ? t('detail.saved_entry_note_aria_live') : t('detail.save_entry_note_aria_label')}
            onClick={() => {
              setStorage(getEntryNoteKey(entry.id), entryNote)
              setEntryNoteSaved(true)
              announce(t('detail.saved_entry_note_aria_live'))
              setTimeout(() => setEntryNoteSaved(false), NOTIFICATION_TIMEOUT)
            }}
          >
            {entryNoteSaved ? t('detail.saved_entry_note_text') : t('detail.save_entry_note_text')}
          </Button>
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
                  <FormControlToggle
                    id="agentic-mode-toggle"
                    checked={useAgenticMode}
                    onChange={setUseAgenticMode}
                  />
                </label>
              )}
              <div className="panel-detail-ai-field-select">
                <div className="panel-detail-ai-field-select-item">
                  <FormControlCheckbox id="field-desc-checkbox" label={descLabel} checked={aiRevisedDesc} onChange={e => setAiRevisedDesc(e.target.checked)} disabled={animating} />
                </div>
                <div className="panel-detail-ai-field-select-item">
                  <FormControlCheckbox id="field-fix-checkbox" label={fixLabel} checked={aiRevisedFix} onChange={e => setAiRevisedFix(e.target.checked)} disabled={animating} />
                </div>
              </div>
            </div>
            <Button
              ref={aiRevisionButtonRef}
              variant="primary"
              disabled={refining || animating || !aiNote.trim()}
              busy={refining}
              icon={refining
                ? <Loader2 size={12} strokeWidth={2} className="panel-detail-revising-spinner" aria-hidden="true" />
                : <Sparkles size={12} strokeWidth={2} className="panel-detail-ai-revision-icon" aria-hidden="true" />
              }
              label={refining ? t('detail.rewriting_aria_live') : t('detail.ai_revision_aria_label')}
              onClick={handleRefine}
            >
              {refining ? t('detail.rewriting_text') : t('detail.ai_revision_save_text')}
            </Button>
          </div>
          {(descText !== entry.desc || fixText !== entry.fix) && (
            <p className="panel-detail-edit-warning" role="status">
              <AlertCircle size={16} aria-hidden="true" className="panel-detail-edit-warning-icon" />
              {t('detail.edit_lang_warning')}
            </p>
          )}
        </div>
      )}

      <A11yResultRelated entry={entry} allEntries={allEntries} onSelect={onSelectRelated ?? onSelect} getPairsFor={getPairsFor} />
      <A11yLinksSource
        links={entry.creditLinks}
        singleHeading={t('detail.source_heading')}
        multipleHeading={t('detail.sources_heading')}
      />

      <div className="panel-detail-actions-end">
        <Button
          variant="secondary"
          disabled={descText === entry.desc && fixText === entry.fix}
          active={resetAllDone}
          icon={resetAllDone
            ? <Check size={14} aria-hidden="true" />
            : <RotateCcw size={14} aria-hidden="true" />
          }
          label={t('detail.reset_all_fields_aria_label')}
          onClick={handleResetAllFields}
        >
          {resetAllDone ? t('detail.reset_all_done_desktop') : t('detail.reset_all_fields_text')}
        </Button>
        <Button
          variant="primary"
          active={copiedAll}
          icon={copiedAll
            ? <Check size={14} aria-hidden="true" />
            : <Copy size={14} aria-hidden="true" />
          }
          label={t('detail.copy_all_aria_label')}
          onClick={handleCopyAll}
        >
          {copiedAll ? t('detail.copy_all_copied_text') : t('detail.copy_all_text')}
        </Button>
        {/* <Button
          variant="primary"
          icon={<Mail size={14} aria-hidden="true" />}
          label={t('detail.email_share_aria', 'Email this defect')}
          title={t('detail.email_share_aria', 'Email this defect')}
          onClick={handleEmailShare}
        >
          Email
        </Button> */}
        {onClose && (
          <Button
            variant={isDesktop ? 'primary' : 'tertiary'}
            label={t('common.close')}
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
        )}
      </div>

      <Dialog
        open={nothingToCopy}
        onClose={() => setNothingToCopy(false)}
        heading={t('detail.nothing_to_copy_heading')}
      >
        <p>{t('detail.nothing_to_copy_body')}</p>
      </Dialog>

      <Dialog
        open={!!revisionFailed}
        onClose={() => setRevisionFailed(null)}
        heading={t('detail.ai_revision_error_heading')}
        returnFocusRef={aiRevisionButtonRef}
      >
        <p>{revisionFailed}</p>
      </Dialog>

      <Dialog
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
      </Dialog>
    </div>
  )
}
