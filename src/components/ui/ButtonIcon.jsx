import { forwardRef } from 'react'

const ButtonIcon = forwardRef(function ButtonIcon({
  icon,
  label,
  onClick,
  disabled,
  className = '',
  variant = 'accent',
  ...rest
}, ref) {
  const variantClass = variant === 'accent' ? 'btn--icon-accent' : variant === 'tertiary' ? 'btn--icon-tertiary' : ''

  return (
    <button
      ref={ref}
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      aria-label={label}
      className={`btn--icon${variantClass ? ` ${variantClass}` : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {icon}
    </button>
  )
})

export default ButtonIcon
