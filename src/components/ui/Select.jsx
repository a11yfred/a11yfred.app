import { useAriaDisabledKeydown } from './useAriaDisabled.js'

export default function Select({ id, value, onChange, disabled, wrapClass, children, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedby, 'aria-disabled': ariaDisabled, ...rest }) {
  const isDisabled = disabled || ariaDisabled === 'true'
  const handleKeyDown = useAriaDisabledKeydown(isDisabled)
  return (
    <div className={`select-wrap${wrapClass ? ` ${wrapClass}` : ''}`}>
      <select
        id={id}
        value={value}
        onChange={e => !isDisabled && onChange(e)}
        onKeyDown={handleKeyDown}
        onMouseDown={e => isDisabled && e.preventDefault()}
        className="select"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        aria-disabled={ariaDisabled}
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
