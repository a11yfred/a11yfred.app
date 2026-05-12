import IconExternalLink from './ui/IconExternalLink.jsx'
import scToWaiUrl from '../utils/scToWaiUrl.js'

export default function A11yLinkSc({ label }) {
  const href = scToWaiUrl(label)
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="detail-sc-link">
        {label}<IconExternalLink />
      </a>
    )
  }
  return <span>{label}</span>
}
