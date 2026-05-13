import { useMemo } from 'react'
import { useT } from '@ulam/calamansi/react'
import { relatedItems } from '../hooks/relevance.js'
import findingSlug from '../utils/findingSlug.js'

// WCAG AAA/enhanced SC pairings — app-specific, both directions
const AAA_PAIRS = {
  '2.4.11': '2.4.12',
  '2.4.12': '2.4.11',
  '2.4.7':  '2.4.13',
  '2.4.13': '2.4.7',
  '2.2.1':  ['2.2.5', '2.2.6'],
  '2.2.5':  '2.2.1',
  '2.2.6':  '2.2.1',
}

// App-supplied rank function: WCAG SC tiering + co-selection boost
function wcagRankTier(candidate, current, coSelectionPairs) {
  if (!candidate.sc) return { tier: 7, boost: 0 }

  const coBoost = coSelectionPairs?.[candidate.id] || 0
  const sameSc = candidate.sc === current.sc
  const aaaPair = [].concat(AAA_PAIRS[current.sc] ?? []).includes(candidate.sc)
  const currentScInCandidateRelated = candidate.relatedSC?.some(r => r.startsWith(current.sc + ' '))
  const sharedRelated = current.relatedSC?.some(r => candidate.relatedSC?.includes(r))
  const keywordOverlap = current.keywords?.filter(k => candidate.keywords?.includes(k)).length || 0

  if (sameSc)                      return { tier: 1, boost: coBoost }
  if (aaaPair)                     return { tier: 2, boost: coBoost }
  if (currentScInCandidateRelated) return { tier: 3, boost: coBoost }
  if (sharedRelated)               return { tier: 4, boost: coBoost }
  if (keywordOverlap > 0)          return { tier: 5, boost: coBoost + keywordOverlap }
  return                                  { tier: 6, boost: coBoost }
}

export default function A11yListRelated({ finding, allFindings, onSelect, getPairsFor }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allFindings?.length) return []
    return relatedItems(finding, allFindings, wcagRankTier, getPairsFor)
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
