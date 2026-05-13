import { useState } from 'react'
import { announce } from '@ulam/taho'
import { NOTIFICATION_TIMEOUT } from '../utils/constants.js'

const resetAfterNotification = (setState) => setTimeout(() => setState(false), NOTIFICATION_TIMEOUT)

const writeToClipboard = (text) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return new Promise((resolve) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    resolve()
  })
}
import { isSignificantlyChanged } from '@ulam/calamansi'

/**
 * Manages clipboard copy state and reset confirmation flow for DetailSheet.
 *
 * @param {object} finding - the active finding object
 * @param {string} descText - current description text
 * @param {string} fixText - current suggested fix text
 * @param {string} displayDesc - description with optional location prefix applied
 * @param {Function} setDescText
 * @param {Function} setFixText
 * @param {Function} setDescHistory
 * @param {Function} setFixHistory
 * @param {Function|null} onCopyEvent - optional callback (findingId, type) => void
 * @param {Function} t - i18n translate function
 * @returns {{
 *   copiedTitle: boolean, copiedPrimarySc: boolean, copiedRelatedSc: boolean,
 *   copiedDesc: boolean, copiedFix: boolean, copiedAll: boolean,
 *   setCopiedDesc: Function, setCopiedFix: Function,
 *   resetDesc: boolean, resetFix: boolean, resetAllDone: boolean,
 *   nothingToCopy: boolean, setNothingToCopy: Function,
 *   confirmReset: object|null, setConfirmReset: Function,
 *   copy: Function, handleReset: Function,
 *   handleCopyAll: Function, handleResetAllFields: Function,
 *   handleUndoDesc: Function, handleUndoFix: Function,
 *   copyTitle: Function, copyPrimarySc: Function, copyRelatedSc: Function,
 * }}
 */
export default function useSheetDetailClipboard({
  finding,
  descText,
  fixText,
  displayDesc,
  setDescText,
  setFixText,
  setDescHistory,
  setFixHistory,
  descHistory,
  fixHistory,
  onCopyEvent,
  t,
}) {
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedPrimarySc, setCopiedPrimarySc] = useState(false)
  const [copiedRelatedSc, setCopiedRelatedSc] = useState(false)
  const [copiedDesc, setCopiedDesc] = useState(false)
  const [copiedFix, setCopiedFix] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [resetDesc, setResetDesc] = useState(false)
  const [resetFix, setResetFix] = useState(false)
  const [resetAllDone, setResetAllDone] = useState(false)
  const [nothingToCopy, setNothingToCopy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(null)

  const copy = (text, setCopied, label, prefix = null, includePrefix = false, type = null) => {
    if (!text?.trim()) { setNothingToCopy(true); return }
    const textToCopy = prefix && includePrefix ? `${prefix}\n${text}` : text
    writeToClipboard(textToCopy).then(() => {
      setCopied(true)
      announce(t('detail.copied_announce', { label }))
      resetAfterNotification(setCopied)
      onCopyEvent?.(finding.id, type)
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
      }, NOTIFICATION_TIMEOUT)
    }
    if (!current?.trim() || !isSignificantlyChanged(original, current)) {
      doReset()
    } else {
      setConfirmReset({ doReset })
    }
  }

  const handleCopyAll = () => {
    if (!displayDesc?.trim() && !fixText?.trim()) { setNothingToCopy(true); return }
    const text = `Description:\n${displayDesc}\n\nSuggested Fix:\n${fixText}`
    writeToClipboard(text).then(() => {
      setCopiedAll(true)
      announce(t('detail.copy_all_announce'))
      resetAfterNotification(setCopiedAll)
      onCopyEvent?.(finding.id, 'all')
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
      resetAfterNotification(setResetAllDone)
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

  const copyTitle = () => copy(finding.title, setCopiedTitle, t('detail.title_label'), null, false, 'title')
  const copyPrimarySc = () => copy(finding.primarySC, setCopiedPrimarySc, t('detail.sc_label'), null, false, 'primarySc')
  const copyRelatedSc = () => {
    if (!finding.relatedSC.length) return
    copy(finding.relatedSC.join(', '), setCopiedRelatedSc, t('detail.sc_label'), null, false, 'relatedSc')
  }

  return {
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
  }
}
