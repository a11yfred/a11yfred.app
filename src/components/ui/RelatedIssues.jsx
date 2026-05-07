import { useMemo } from 'react'
import { useT } from '../../i18n/index.jsx'
import findingSlug from '../../utils/findingSlug.js'

// AAA/enhanced SC pairings — both directions
const AAA_PAIRS = {
  '2.4.11': '2.4.12',
  '2.4.12': '2.4.11',
  '2.4.7':  '2.4.13',
  '2.4.13': '2.4.7',
  '2.2.1':  '2.2.5',
  '2.2.5':  '2.2.1',
  '2.2.1':  '2.2.6',
  '2.2.6':  '2.2.1',
}

function rankTier(candidate, current, coSelectionPairs) {
  const cid = candidate.id
  const hasSc = !!candidate.sc

  // Tier 1: Best Practice (no sc) — deprioritized, score 0
  if (!hasSc) return { tier: 7, boost: 0 }

  const sameSc = candidate.sc === current.sc
  const aaaPair = AAA_PAIRS[current.sc] === candidate.sc
  const currentScInCandidateRelated = candidate.related?.some(r => r.startsWith(current.sc + ' '))
  const sharedRelated = current.related?.some(r => candidate.related?.includes(r))
  const keywordOverlap = current.keywords?.filter(k => candidate.keywords?.includes(k)).length || 0

  // Behavioral boost from co-selection pairs
  const coBoost = coSelectionPairs?.[cid] || 0

  if (sameSc)                      return { tier: 1, boost: coBoost }
  if (aaaPair)                     return { tier: 2, boost: coBoost }
  if (currentScInCandidateRelated) return { tier: 3, boost: coBoost }
  if (sharedRelated)               return { tier: 4, boost: coBoost }
  if (keywordOverlap > 0)          return { tier: 5, boost: coBoost + keywordOverlap }
  return                                  { tier: 6, boost: coBoost }
}

export default function RelatedIssues({ finding, allFindings, onSelect, getPairsFor }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allFindings?.length) return []

    const coSelectionPairs = getPairsFor?.(finding.id) || {}

    return allFindings
      .filter(d => d.id !== finding.id)
      .map(d => ({ finding: d, ...rankTier(d, finding, coSelectionPairs) }))
      .filter(({ tier }) => tier <= 5) // only show through keyword tier by default
      .sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : b.boost - a.boost)
      .slice(0, 5)
      .map(({ finding: d }) => d)
  }, [allFindings, finding, getPairsFor])

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
