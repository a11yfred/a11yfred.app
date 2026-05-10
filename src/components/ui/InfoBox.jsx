import { Info } from 'lucide-react'

export default function InfoBox({ label, children, className = '' }) {
  return (
    <div className={`info-box${className ? ` ${className}` : ''}`} role="note">
      <Info size={13} className="info-box__icon" aria-hidden="true" />
      <div className="info-box__body">
        {label && <p className="info-box__label">{label}</p>}
        <p className="info-box__text">{children}</p>
      </div>
    </div>
  )
}
