import { ExternalLink } from 'lucide-react'
import scToWaiUrl from '../../utils/scToWaiUrl.js'

export default function ScLink({ label }) {
  const href = scToWaiUrl(label)
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="detail-sc-link">
        {label}<ExternalLink size={11} aria-hidden="true" className="external-link-icon" />
      </a>
    )
  }
  return <span>{label}</span>
}
