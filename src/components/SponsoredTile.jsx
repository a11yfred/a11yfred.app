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
              Accessibility Tools & Services
            </span>
            <span className="result-item__badges">
              <span className="sponsored-badge">Sponsored</span>
            </span>
          </div>

          <div className="result-item__sc">Discover tools to streamline your audits</div>

          <div className="result-item__desc">
            Find accessibility testing platforms, audit services, and training resources to enhance your accessibility practice.
          </div>
        </div>
      </div>

      <div className="result-vote-col" />
    </li>
  )
}
