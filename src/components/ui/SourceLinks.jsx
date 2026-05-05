import { ExternalLink } from 'lucide-react'
import { useT } from '../../i18n/index.jsx'
import LinkTitle from './LinkTitle.jsx'

export default function SourceLinks({ links }) {
  const t = useT()
  if (!links?.length) return null

  const isExternalLink = (url) => {
    try {
      const linkUrl = new URL(url)
      const currentHost = window.location.hostname
      return linkUrl.protocol.startsWith('http') && linkUrl.hostname !== currentHost
    } catch {
      return false
    }
  }

  return (
    <div className="detail-sources-section">
      {links.length === 1 ? (
        <p className="detail-sources detail-sources--single">
          <span className="detail-sources__heading">{t('detail.source_heading')}</span>
          {links[0].url ? (
            <a href={links[0].url} target="_blank" rel="noreferrer" className="detail-links__link">
              <LinkTitle url={links[0].url} fallback={links[0].text} />{isExternalLink(links[0].url) && <ExternalLink size={11} aria-hidden="true" className="external-link-icon" />}
            </a>
          ) : (
            <span>{links[0].text}</span>
          )}
        </p>
      ) : (
        <>
          <p className="detail-sources">
            <span className="detail-sources__heading">{t('detail.sources_heading')}</span>
          </p>
          <ul className="detail-sources__list">
            {links.map(link => (
              <li key={link.url || link.text}>
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noreferrer" className="detail-links__link">
                    <LinkTitle url={link.url} fallback={link.text} />{isExternalLink(link.url) && <ExternalLink size={11} aria-hidden="true" className="external-link-icon" />}
                  </a>
                ) : (
                  <span>{link.text}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
