import { useMemo } from 'react'
import { useT } from '../hooks/useTranslate.js'
import { relatedItems } from '../hooks/useRelevance.js'
import entrySlug from '../utils/entrySlug.js'

const defaultHeadingClasses = 'panel-detail-related__heading'

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

export default function A11yResultRelated({ entry, allEntries, onSelect, getPairsFor }) {
  const t = useT()

  const related = useMemo(() => {
    if (!allEntries?.length) return []
    return relatedItems(entry, allEntries, wcagRankTier, getPairsFor)
  }, [allEntries, entry, getPairsFor])

  if (!related.length || !onSelect) return null

  const headingKey = related.length === 1 ? 'detail.related_issue_heading' : 'detail.related_heading'

  return (
    <section className="panel-detail-related" aria-label={t(headingKey)}>
      {related.length === 1 ? (
        <div className="panel-detail-related__single">
          <h3 className={`${defaultHeadingClasses} ${defaultHeadingClasses}--single`}>
            {t(headingKey)}{' '}
            <a
              href={`#/entry/${related[0].id}/${entrySlug(related[0].title)}`}
              className="panel-detail-related__btn"
            >
              {related[0].title}
            </a>
          </h3>
        </div>
      ) : (
        <div className="panel-detail-related__multiple">
          <h3 className={defaultHeadingClasses}>{t(headingKey)}</h3>
          <ul className="panel-detail-related__list">
            {related.map(d => (
              <li key={d.id}>
                <a
                  href={`#/entry/${d.id}/${entrySlug(d.title)}`}
                  className="panel-detail-related__btn"
                >
                  {d.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
