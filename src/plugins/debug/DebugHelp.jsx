
const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

/**
 * Dev-only command reference panel. Triggered by "debug help" in the search bar.
 * Shows all available debug commands grouped by category.
 * Accepts a `customCommands` prop for project-specific additions.
 *
 * Props:
 *   open            boolean
 *   onClose         fn
 *   customCommands  [{ heading, rows: [{ cmd, desc }] }]  — project-specific sections
 */
export function DebugHelp({ open, onClose, customCommands = [] }) {
  if (!IS_DEV || !open) return null

  return (
    <div className="debug-help-overlay" aria-hidden="true">
      <div className="debug-help-panel">
        <div className="debug-help-header">
          <span className="debug-help-title">Debug Commands</span>
          <button className="debug-help-close" onClick={onClose} aria-label="Close debug help">✕</button>
        </div>

        <div className="debug-help-body">

          <section className="debug-help-section">
            <h3 className="debug-help-section-title">A11y Testing</h3>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>debug all on</code></td><td>Enable all dev toasts (KB focus + announce)</td></tr>
                <tr><td><code>debug all off</code></td><td>Disable all dev toasts</td></tr>
                <tr><td><code>debug names on</code></td><td>Show accessible name tooltip on hover</td></tr>
                <tr><td><code>debug names off</code></td><td>Hide accessible name tooltip</td></tr>
              </tbody>
            </table>
          </section>

          <section className="debug-help-section">
            <h3 className="debug-help-section-title">Deployment</h3>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>debug deploy off</code></td><td>Show "Deploying OFF" banner</td></tr>
                <tr><td><code>debug deploy on</code></td><td>Show "Deploying to Netlify" (active target)</td></tr>
                <tr><td><code>debug deploy netlify</code></td><td>Show Netlify banner</td></tr>
                <tr><td><code>debug deploy pages</code></td><td>Show GitHub Pages banner</td></tr>
                <tr><td><code>debug deploy vercel</code></td><td>Show Vercel banner</td></tr>
              </tbody>
            </table>
          </section>

          {customCommands.map(section => (
            <section key={section.heading} className="debug-help-section">
              <h3 className="debug-help-section-title">{section.heading}</h3>
              <table className="debug-help-table">
                <tbody>
                  {section.rows.map(row => (
                    <tr key={row.cmd}>
                      <td><code>{row.cmd}</code></td>
                      <td>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          <section className="debug-help-section">
            <h3 className="debug-help-section-title">Easter Eggs</h3>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>pig latin</code></td><td>Switch UI to Pig Latin</td></tr>
                <tr><td><code>pig latin off</code></td><td>Restore language to English</td></tr>
                <tr><td><code>pirate</code></td><td>Switch UI to Pirate English</td></tr>
                <tr><td><code>pirate off</code></td><td>Restore language to English</td></tr>
                <tr><td><code>klingon</code></td><td>Switch UI to tlhIngan Hol (Klingon)</td></tr>
                <tr><td><code>klingon off</code></td><td>Restore language to English</td></tr>
                <tr><td><code>valyrian</code></td><td>Switch UI to High Valyrian</td></tr>
                <tr><td><code>valyrian off</code></td><td>Restore language to English</td></tr>
                <tr><td><code>party mode off</code></td><td>Restore appearance to Auto</td></tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  )
}
