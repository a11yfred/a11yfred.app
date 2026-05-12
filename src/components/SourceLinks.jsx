import ExternalLinkIcon from './ui/ExternalLinkIcon.jsx'
import LinkTitle from './LinkTitle.jsx'

function isExternalLink(url) {
  try {
    const linkUrl = new URL(url)
    return linkUrl.protocol.startsWith('http') && linkUrl.hostname !== window.location.hostname
  } catch {
    return false
  }
}

export default function SourceLinks({
  links,
  singleHeading = 'Source',
  multipleHeading = 'Sources'
}) {
  if (!links?.length) return null

  return (
    <div className="source-links">
      {links.length === 1 ? (
        <p className="source-links__row source-links__row--single">
          <span className="source-links__heading">{singleHeading}</span>
          {links[0].url ? (
            <a href={links[0].url} target="_blank" rel="noreferrer" className="source-links__link">
              <LinkTitle url={links[0].url} fallback={links[0].text} />{isExternalLink(links[0].url) && <ExternalLinkIcon />}
            </a>
          ) : (
            <span>{links[0].text}</span>
          )}
        </p>
      ) : (
        <>
          <p className="source-links__row">
            <span className="source-links__heading">{multipleHeading}</span>
          </p>
          <ul className="source-links__list">
            {links.map(link => (
              <li key={link.url || link.text}>
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noreferrer" className="source-links__link">
                    <LinkTitle url={link.url} fallback={link.text} />{isExternalLink(link.url) && <ExternalLinkIcon />}
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
