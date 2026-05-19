import { IconExternalLink } from '@ulam/ube'

function isExternalLink(url) {
  try {
    const linkUrl = new URL(url)
    return linkUrl.protocol.startsWith('http') && linkUrl.hostname !== window.location.hostname
  } catch {
    return false
  }
}

export default function AppLinksSource({
  links,
  singleHeading = 'Source',
  multipleHeading = 'Sources'
}) {
  if (!links?.length) return null

  return (
    <section className="source-links" aria-label={singleHeading && multipleHeading ? (links.length === 1 ? singleHeading : multipleHeading) : undefined}>
      {links.length === 1 ? (
        <div className="source-links__single">
          <h3 className="source-links__heading" tabIndex={-1}>{singleHeading}</h3>
          {links[0].url ? (
            <a href={links[0].url} target="_blank" rel="noreferrer" className="source-links__link">
              {links[0].text}{isExternalLink(links[0].url) && <IconExternalLink />}<span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : (
            <span className="source-links__text">{links[0].text}</span>
          )}
        </div>
      ) : (
        <div className="source-links__multiple">
          <h3 className="source-links__heading" tabIndex={-1}>{multipleHeading}</h3>
          <ul className="source-links__list">
            {links.map(link => (
              <li key={link.url || link.text}>
                {link.url ? (
                  <a href={link.url} target="_blank" rel="noreferrer" className="source-links__link">
                    {link.text}{isExternalLink(link.url) && <IconExternalLink />}<span className="sr-only"> (opens in new tab)</span>
                  </a>
                ) : (
                  <span className="source-links__text">{link.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
