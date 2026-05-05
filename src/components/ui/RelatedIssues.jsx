import { useMemo } from 'react'
import { useT } from '../../i18n/index.jsx'

function findingSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function RelatedIssues({ finding, allFindings, onSelect }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allFindings?.length || !finding.related?.length) return []
    return allFindings
      .filter(d => d.id !== finding.id && finding.related.includes(d.scLabel))
      .slice(0, 5)
  }, [allFindings, finding])

  if (!related.length || !onSelect) return null

  const headingKey = related.length === 1 ? 'detail.related_issue_heading' : 'detail.related_heading'

  return (
    <div className="detail-related">
      {related.length === 1 ? (
        <p className="detail-related__heading detail-related__heading--single">
          {t(headingKey)}{' '}
          <a
            href={`#/finding/${related[0].id}/${findingSlug(related[0].title)}`}
            className="detail-related__btn"
          >
            {related[0].title}
          </a>
        </p>
      ) : (
        <>
          <p className="detail-related__heading">{t(headingKey)}</p>
          <ul className="detail-related__list">
            {related.map(d => (
              <li key={d.id}>
                <a
                  href={`#/finding/${d.id}/${findingSlug(d.title)}`}
                  className="detail-related__btn"
                >
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
