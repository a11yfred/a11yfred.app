import { forwardRef } from 'react'

const Radio = forwardRef(function Radio({
  name,
  value,
  checked,
  onChange,
  label,
  disabled,
  className = '',
  ...rest
}, ref) {
  return (
    <label className={`control__label${className ? ` ${className}` : ''}`}>
      <input
        ref={ref}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="control"
        {...rest}
      />
      {label}
    </label>
  )
})

export default Radio
