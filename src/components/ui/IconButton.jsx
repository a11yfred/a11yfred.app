import { forwardRef } from 'react'

const IconButton = forwardRef(function IconButton({
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
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`btn--icon${variantClass ? ` ${variantClass}` : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {icon}
    </button>
  )
})

export default IconButton
