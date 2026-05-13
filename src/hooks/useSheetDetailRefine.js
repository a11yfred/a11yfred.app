import { useState, useRef, useEffect } from 'react'
import { getAiRefinement, AiApiError, getAgenticRefinement, getAiProvider, getProviderLabel, DEBUG_COMMANDS, DEBUG_AI_DELAY_MS } from '../halohalo/index.js'
import { announce } from '@ulam/taho'
import { TYPEWRITER_TICK_MS, TYPEWRITER_MIN_CHARS_PER_TICK, TYPEWRITER_CHAR_DIVISOR } from '../utils/constants.js'

/**
 * Manages AI refinement state and the typewriter animation for DetailSheet.
 *
 * @param {object} finding - the active finding object
 * @param {string} descText - current description text
 * @param {string} fixText - current suggested fix text
 * @param {boolean} aiRevisedDesc - whether desc field is selected for AI revision
 * @param {boolean} aiRevisedFix - whether fix field is selected for AI revision
 * @param {boolean} useAgenticMode - whether agentic mode is active
 * @param {string} aiNote - the AI instruction text
 * @param {Array} allFindings - full corpus (used by agentic mode)
 * @param {Function} setDescText
 * @param {Function} setFixText
 * @param {Function} setDescHistory
 * @param {Function} setFixHistory
 * @param {Function} t - i18n translate function
 * @returns {{
 *   refining: boolean, animating: boolean,
 *   revisionFailed: string|null, setRevisionFailed: Function,
 *   aiRevisionButtonRef: React.MutableRefObject,
 *   startTypewriter: Function,
 *   handleRefine: Function,
 * }}
 */
export default function useSheetDetailRefine({
  finding,
  descText,
  fixText,
  aiRevisedDesc,
  aiRevisedFix,
  useAgenticMode,
  aiNote,
  allFindings,
  setDescText,
  setFixText,
  setDescHistory,
  setFixHistory,
  t,
}) {
  const [refining, setRefining] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [revisionFailed, setRevisionFailed] = useState(null)
  const typeTimerRef = useRef(null)
  const aiRevisionButtonRef = useRef(null)

  useEffect(() => () => clearTimeout(typeTimerRef.current), [])

  function startTypewriter(newDesc, newFix) {
    clearTimeout(typeTimerRef.current)
    const total = (newDesc?.length ?? 0) + (newFix?.length ?? 0)
    if (!total) { setAnimating(false); return }

    const charsPerTick = Math.max(TYPEWRITER_MIN_CHARS_PER_TICK, Math.ceil(total / TYPEWRITER_CHAR_DIVISOR))
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
        announce(t('detail.ai_updated_announce'))
      } else {
        typeTimerRef.current = setTimeout(tick, TYPEWRITER_TICK_MS)
      }
    }

    typeTimerRef.current = setTimeout(tick, TYPEWRITER_TICK_MS)
  }

  function applyRefinement(newDesc, newFix) {
    if (newDesc) setDescHistory(h => [...h, descText])
    if (newFix) setFixHistory(h => [...h, fixText])
    setRefining(false)
    setAnimating(true)
    startTypewriter(newDesc, newFix)
  }

  const handleRefine = async () => {
    const canAiRevise = aiRevisedDesc || aiRevisedFix
    if (!aiNote.trim() || !canAiRevise) return

    const note = aiNote.trim()
    const provider = getAiProvider()
    const providerLabel = getProviderLabel(provider)

    if (note === DEBUG_COMMANDS.WRONG)        { setRevisionFailed(t('detail.ai_revision_error_body')); return }
    if (note === DEBUG_COMMANDS.AUTH)         { setRevisionFailed(t('detail.ai_revision_error_invalid_key', { provider: providerLabel })); return }
    if (note === DEBUG_COMMANDS.RATE)         { setRevisionFailed(t('detail.ai_revision_error_rate_limit', { provider: providerLabel })); return }
    if (note === DEBUG_COMMANDS.SERVICE)      { setRevisionFailed(t('detail.ai_revision_error_service_error', { provider: providerLabel, status: 503 })); return }
    if (note === DEBUG_COMMANDS.NETWORK)      { setRevisionFailed(t('detail.ai_revision_error_network_error')); return }
    if (note === DEBUG_COMMANDS.AI_ASSIST_ON) {
      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })
      setTimeout(() => {
        const newDesc = aiRevisedDesc ? `${descText}\n\n[AI note: ${aiNote}]` : null
        const newFix = aiRevisedFix ? `${fixText}\n\n[AI note: ${aiNote}]` : null
        applyRefinement(newDesc, newFix)
      }, DEBUG_AI_DELAY_MS * 2)
      return
    }
    if (note === DEBUG_COMMANDS.OK) {
      setRefining(true)
      announce(t('detail.rewriting_text'), { priority: 'assertive' })
      setTimeout(() => {
        const fakeDesc = aiRevisedDesc ? '[Debug] Revised description: this is a placeholder written by the debug trigger, not a real AI response. The typewriter animation and undo flow are both fully exercised by this text.' : null
        const fakeFix = aiRevisedFix ? '[Debug] Revised suggested fix: verify the fix was applied, then remove this placeholder before sharing the report.' : null
        applyRefinement(fakeDesc, fakeFix)
      }, DEBUG_AI_DELAY_MS)
      return
    }

    setRefining(true)
    announce(t('detail.rewriting_text'), { priority: 'assertive' })

    try {
      const result = useAgenticMode && getAiProvider() === 'anthropic'
        ? await getAgenticRefinement({ finding, descText, fixText, note: aiNote, corpus: allFindings })
        : await getAiRefinement({ finding, descText, fixText, note: aiNote })
      const newDesc = aiRevisedDesc && result.desc ? result.desc : null
      const newFix = aiRevisedFix && result.fix ? result.fix : null

      applyRefinement(newDesc, newFix)
    } catch (e) {
      if (import.meta.env.DEV) console.error('AI revision failed:', e)
      setRefining(false)
      setAnimating(false)
      if (e instanceof AiApiError) {
        const label = getProviderLabel(e.provider || 'AI')
        setRevisionFailed(t(`detail.ai_revision_error_${e.type}`, { provider: label, status: e.status }))
      } else {
        setRevisionFailed(t('detail.ai_revision_error_body'))
      }
    }
  }

  return {
    refining, setRefining,
    animating, setAnimating,
    revisionFailed, setRevisionFailed,
    aiRevisionButtonRef,
    startTypewriter,
    handleRefine,
  }
}
