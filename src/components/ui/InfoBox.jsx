export default function InfoBox({ label, children, className = '' }) {
  return (
    <div className={`info-box${className ? ` ${className}` : ''}`} role="note">
      <svg className="info-box__icon" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <div className="info-box__body">
        {label && <p className="info-box__label">{label}</p>}
        <p className="info-box__text">{children}</p>
      </div>
    </div>
  )
}
