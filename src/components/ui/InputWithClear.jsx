import { useRef } from 'react'

export default function InputWithClear({
  id,
  type = 'text',
  value,
  onChange,
  onClear,
  clearAriaLabel,
  wrapClassName = '',
  inputClassName = '',
  clearButtonClassName = '',
  clearIcon = '↺',
  inputRef: externalRef,
  ...rest
}) {
  const internalRef = useRef(null)
  const ref = externalRef || internalRef

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
    ref.current?.focus()
  }

  return (
    <div className={wrapClassName}>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputClassName}
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={clearAriaLabel}
          className={clearButtonClassName}
        >
          {clearIcon}
        </button>
      )}
    </div>
  )
}
