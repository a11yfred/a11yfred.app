export default function Badge({ variant, bg, color, prefix, onClick, className, children, ...rest }) {
  const cls = `badge--${variant}${className ? ` ${className}` : ''}`
  const style = (bg || color)
    ? { '--badge-bg': bg, '--badge-text': color }
    : undefined

  if (onClick) {
    return (
      <button type="button" className={cls} style={style} onClick={onClick} {...rest}>
        {prefix && <span className="badge-prefix">{prefix}</span>}
        {children}
      </button>
    )
  }
  return (
    <span className={cls} style={style} {...rest}>
      {prefix && <span className="badge-prefix">{prefix}</span>}
      {children}
    </span>
  )
}
