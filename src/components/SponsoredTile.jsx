// TODO: Wire up EthicalAds network (https://www.ethicalads.io/)
// This is a placeholder tile. Replace with actual ad network integration after signing up.
// EthicalAds provides privacy-respecting, non-tracking ads targeted to developers.
import { useT } from '../calamansi/index.jsx'

export default function SponsoredTile() {
  const t = useT()

  return (
    <li className="result-row result-row--sponsored">
      <div className="result-card-wrap">
        <div
          className="result-item result-item--sponsored"
          role="region"
          aria-label={t('common.sponsored_label')}
        >
          <div className="result-item__header">
            <span className="result-item__title">
              {t('common.sponsored_title')}
            </span>
            <span className="result-item__badges">
              <span className="sponsored-badge">Ad</span>
            </span>
          </div>

          <div className="result-item__sc">{t('common.sponsored_network')}</div>

          <div className="result-item__desc">
            {t('common.sponsored_body')}
          </div>
        </div>
      </div>

      <div className="result-vote-col" />
    </li>
  )
}
