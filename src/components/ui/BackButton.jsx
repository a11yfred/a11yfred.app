export default function BackButton({ onClick, ariaLabel, className = 'btn--icon', dir = 'ltr' }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={className}>
      {dir === 'rtl' ? (
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ) : (
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      )}
    </button>
  )
}
