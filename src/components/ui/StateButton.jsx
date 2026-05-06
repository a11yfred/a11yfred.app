import { forwardRef } from 'react'

const StateButton = forwardRef(function StateButton({
  active,
  icon,
  activeIcon,
  label,
  activeLabel,
  showLabel = false,
  labelText,
  activeLabelText,
  className = '',
  onClick,
  disabled,
  children,
  ...rest
}, ref) {
  const displayIcon = active ? activeIcon : icon
  const hasIcon = displayIcon || activeIcon

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? activeLabel : label}
      className={`${className}${active ? ' btn__field--success' : ''}`}
      {...rest}
    >
      {hasIcon && (
        <span className="btn-icon">
          {displayIcon}
        </span>
      )}
      {showLabel && <span>{active ? activeLabelText : labelText}</span>}
      {children}
    </button>
  )
})

export default StateButton
