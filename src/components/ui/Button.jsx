import { forwardRef } from 'react'

const Button = forwardRef(function Button({
  children,
  label,
  activeLabel,
  icon,
  activeIcon,
  active,
  variant = 'primary',
  disabled,
  fullWidth,
  error,
  title,
  onClick,
  className = '',
  ...rest
}, ref) {
  const variantClass = `btn--${variant}`
  const baseClasses = `btn ${variantClass}`
  const stateClass = active ? ' btn__field--success' : ''
  const disabledClass = disabled ? ' btn--disabled' : ''
  const fullWidthClass = fullWidth ? ' btn--full-width' : ''
  const errorClass = error ? ' btn--error' : ''

  const displayIcon = active ? activeIcon : icon
  const displayLabel = active ? activeLabel : label
  const displayTitle = active && title ? title : title

  const finalClassName = `${baseClasses}${stateClass}${disabledClass}${fullWidthClass}${errorClass}${className ? ` ${className}` : ''}`

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={displayLabel}
      title={displayTitle}
      className={finalClassName}
      {...rest}
    >
      {displayIcon && (
        <span className="btn-icon">
          {displayIcon}
        </span>
      )}
      {children}
    </button>
  )
})

export default Button
