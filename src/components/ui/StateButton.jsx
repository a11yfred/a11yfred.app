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
      <span className="btn-icon">
        {active ? activeIcon : icon}
      </span>
      {showLabel && <span>{active ? activeLabelText : labelText}</span>}
      {children}
    </button>
  )
})

export default StateButton
