const ArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
)

export default function LinkSkipTo({ href, onClick, tabIndex, onFocus, onBlur, children, showIcon = true }) {
  const content = (
    <>
      {children}
      {showIcon && <ArrowDown />}
    </>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick} className="skip-link" tabIndex={tabIndex} onFocus={onFocus} onBlur={onBlur}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className="skip-link" tabIndex={tabIndex} onFocus={onFocus} onBlur={onBlur}>
      {content}
    </button>
  )
}
