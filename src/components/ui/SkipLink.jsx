const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function SkipLink({ href, onClick, tabIndex, onFocus, onBlur, children, showIcon = true }) {
  const content = (
    <>
      {children}
      {showIcon && <ChevronDown />}
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
