import { forwardRef } from 'react'

const IconStateButton = forwardRef(function IconStateButton({
  active,
  icon,
  activeIcon,
  label,
  activeLabel,
  title,
  activeTitle,
  onClick,
  disabled,
  className = '',
  variant = 'accent',
  ...rest
}, ref) {
  const variantClass = variant === 'accent' ? 'btn--icon-accent' : variant === 'tertiary' ? 'btn--icon-tertiary' : ''
  const displayIcon = active ? activeIcon : icon
  const displayLabel = active ? activeLabel : label
  const displayTitle = active ? activeTitle : title

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={displayLabel}
      title={displayTitle}
      className={`btn--icon${variantClass ? ` ${variantClass}` : ''}${active ? ' btn__field--success' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {displayIcon}
    </button>
  )
})

export default IconStateButton
