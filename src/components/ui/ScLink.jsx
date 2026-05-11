import ExternalLinkIcon from './ExternalLinkIcon.jsx'
import scToWaiUrl from '../../utils/scToWaiUrl.js'

export default function ScLink({ label }) {
  const href = scToWaiUrl(label)
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="detail-sc-link">
        {label}<ExternalLinkIcon />
      </a>
    )
  }
  return <span>{label}</span>
}
