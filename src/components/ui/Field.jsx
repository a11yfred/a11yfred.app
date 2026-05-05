import { useRef, useEffect, forwardRef } from 'react'
import { RotateCcw, Copy, Check, Edit } from 'lucide-react'
import { useT } from '../../i18n/index.jsx'

const Field = forwardRef(function Field({
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
  selected,
  onSelectChange,
  selectLabel,
  animating,
  wasUpdated,
  isDesktop,
  aiEnabled,
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
            {selected && <Edit size={14} aria-hidden="true" className="field__label-icon" />}
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
          <input
            type="checkbox"
            id={`${id}-include-title`}
            checked={includeTitle}
            onChange={e => onIncludeTitleChange(e.target.checked)}
            disabled={animating}
            className="field-include-title-checkbox"
          />
          <label htmlFor={`${id}-include-title`} className="field-include-title-label">
            {includeTitle && <Copy size={14} aria-hidden="true" className="field-include-title-icon" />}
            {includeTitleLabel}
          </label>
        </div>
        <div className="field__actions">
          <button
            onClick={handleResetOrUndo}
            aria-label={resetBtnLabel}
            className={`btn--primary btn--field${reset ? ' btn__field--success' : ''}`}
            disabled={animating || (!undoable && !hasChanged)}
          >
            {reset ? <Check size={14} aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
            {isDesktop && <span>{resetBtnText}</span>}
          </button>
          <button
            ref={copyBtnRef}
            onClick={onCopy}
            aria-label={copied ? t('detail.copied_aria') : t('detail.copy_aria', { label })}
            className={`btn--primary btn--field${copied ? ' btn__field--success' : ''}`}
            disabled={animating}
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {isDesktop && <span>{copied ? t('detail.copied_desktop') : t('detail.copy_desktop')}</span>}
          </button>
        </div>
      </div>
    </div>
  )
})

export default Field
