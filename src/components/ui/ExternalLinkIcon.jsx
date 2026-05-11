import { ExternalLink } from 'lucide-react'
import './ExternalLinkIcon.css'

export default function ExternalLinkIcon({ size = 11, className = '' }) {
  return (
    <ExternalLink
      size={size}
      aria-hidden="true"
      className={['external-link-icon', className].filter(Boolean).join(' ')}
    />
  )
}
