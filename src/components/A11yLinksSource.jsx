import IconExternalLink from './ui/IconExternalLink.jsx'
import A11yLinkTitle from './A11yLinkTitle.jsx'

function isExternalLink(url) {
  try {
    const linkUrl = new URL(url)
    return linkUrl.protocol.startsWith('http') && linkUrl.hostname !== window.location.hostname
  } catch {
    return false
  }
}

export default function A11yLinksSource({
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
              <A11yLinkTitle url={links[0].url} fallback={links[0].text} />{isExternalLink(links[0].url) && <IconExternalLink />}
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
                    <A11yLinkTitle url={link.url} fallback={link.text} />{isExternalLink(link.url) && <IconExternalLink />}
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
