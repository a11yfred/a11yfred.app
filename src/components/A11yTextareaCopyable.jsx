import { useRef, useEffect, forwardRef } from 'react'
import { RotateCcw, Copy, Check } from 'lucide-react'
import { useT } from '@ulam/calamansi/react'

const A11yTextareaCopyable = forwardRef(function A11yTextareaCopyable({
  id,
  label,
  value,
  onChange,
  copied,
  onCopy,
  reset,
  onReset,
  undoable,
  onUndo,
  animating,
  wasUpdated,
  isDesktop,
  hasChanged,
  includeTitle,
  onIncludeTitleChange,
  includeTitleLabel,
}, copyBtnRef) {
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
          <label htmlFor={id} className="field__label">
            {label}
            {wasUpdated && (
              <span className="field__updated-badge">{t('detail.updated_label')}</span>
            )}
          </label>
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
      <div className="field__footer">
        <div className="field__include-title">
          <label className="control__label" htmlFor={`${id}-include-title`}>
            <input
              id={`${id}-include-title`}
              type="checkbox"
              checked={includeTitle}
              onChange={e => onIncludeTitleChange(e.target.checked)}
              disabled={animating}
              className="control"
            />
            <span className="field-include-title-label">
              {includeTitleLabel}
              {includeTitle && isDesktop && <Copy size={14} aria-hidden="true" className="field-include-title-icon" />}
            </span>
          </label>
        </div>
        <div className="field__actions">
          <button
            onClick={(animating || (!undoable && !hasChanged)) ? undefined : handleResetOrUndo}
            aria-label={resetBtnLabel}
            aria-disabled={(animating || (!undoable && !hasChanged)) || undefined}
            className={`btn--secondary btn--field${reset ? ' btn__field--success' : ''}`}
          >
            {reset ? <Check size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
            <span>{resetBtnText}</span>
          </button>
          <button
            ref={copyBtnRef}
            onClick={animating ? undefined : onCopy}
            aria-label={copied ? t('detail.copied_aria') : t('detail.copy_aria', { label })}
            aria-disabled={animating || undefined}
            className={`btn--primary btn--field${copied ? ' btn__field--success' : ''}`}
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            <span>{copied ? t('detail.copied_desktop') : t('detail.copy_desktop')}</span>
          </button>
        </div>
      </div>
    </div>
  )
})

export default A11yTextareaCopyable
