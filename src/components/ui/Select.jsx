import { useAriaDisabledKeydown } from './useAriaDisabled.js'

export default function Select({ id, value, onChange, disabled, wrapClass, children, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedby, ...rest }) {
  const handleKeyDown = useAriaDisabledKeydown(disabled)
  return (
    <div className={`select-wrap${wrapClass ? ` ${wrapClass}` : ''}`}>
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={e => !disabled && onChange(e)}
        onKeyDown={handleKeyDown}
        onMouseDown={e => disabled && e.preventDefault()}
        className="select"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        {...rest}
      >
        {children}
      </select>
      <svg className="select__chevron" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}
