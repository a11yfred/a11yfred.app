// TODO: Wire up EthicalAds network (https://www.ethicalads.io/)
// This is a placeholder tile. Replace with actual ad network integration after signing up.
// EthicalAds provides privacy-respecting, non-tracking ads targeted to developers.
export default function SponsoredTile() {
  return (
    <li className="result-row result-row--sponsored">
      <div className="result-card-wrap">
        <div
          className="result-item result-item--sponsored"
          role="region"
          aria-label="Sponsored content"
        >
          <div className="result-item__header">
            <span className="result-item__title">
              Support this project
            </span>
            <span className="result-item__badges">
              <span className="sponsored-badge">Ad</span>
            </span>
          </div>

          <div className="result-item__sc">Ethical Ads</div>

          <div className="result-item__desc">
            Receive ads from companies in the accessibility and developer communities. Your privacy is respected — no tracking, no profiles, no algorithms.
          </div>
        </div>
      </div>

      <div className="result-vote-col" />
    </li>
  )
}
