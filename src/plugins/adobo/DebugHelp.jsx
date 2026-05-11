
const IS_DEV = import.meta.env.DEV

/**
 * Dev-only command reference panel. Triggered by "debug help" in the search bar.
 * Shows all available debug commands grouped by category.
 * Accepts a `customCommands` prop for project-specific additions.
 *
 * Props:
 *   open            boolean
 *   onClose         fn
 *   customCommands  [{ heading, note?, rows: [{ cmd, desc }] }]
 */
export function DebugHelp({ open, onClose, customCommands = [] }) {
  if (!IS_DEV || !open) return null

  /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
  return (
    <div className="debug-help-overlay" aria-hidden="true" onClick={onClose}>
      <div className="debug-help-panel" onClick={e => e.stopPropagation()}>
        <div className="debug-help-header">
          <span className="debug-help-title">Debug Commands</span>
          <button className="debug-help-close" onClick={onClose} aria-label="Close debug help">✕</button>
        </div>

        <div className="debug-help-body">

          <section className="debug-help-section">
            <h3 className="debug-help-section-title">A11y Testing</h3>
            <p className="debug-help-note">Append <code>off</code> to disable any toggle (e.g. <code>debug all off</code>).</p>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>debug all</code></td><td>All debug tools (KB focus, announce, names)</td></tr>
                <tr><td><code>debug names</code></td><td>Accessible name tooltip on hover</td></tr>
              </tbody>
            </table>
          </section>

          <section className="debug-help-section">
            <h3 className="debug-help-section-title">Deployment</h3>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>debug deploy off</code></td><td>Off (no banner)</td></tr>
                <tr><td><code>debug deploy on</code></td><td>Netlify, active target</td></tr>
                <tr><td><code>debug deploy netlify</code></td><td>Netlify banner</td></tr>
                <tr><td><code>debug deploy pages</code></td><td>GitHub Pages</td></tr>
                <tr><td><code>debug deploy vercel</code></td><td>Vercel</td></tr>
              </tbody>
            </table>
          </section>

          {customCommands.map(section => (
            <section key={section.heading} className="debug-help-section">
              <h3 className="debug-help-section-title">{section.heading}</h3>
              {section.note && <p className="debug-help-note">{section.note}</p>}
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

            <h4 className="debug-help-subsection-title">Hidden Languages</h4>
            <p className="debug-help-note">Append <code> off</code> to any command to restore English (e.g. <code>klingon off</code>).</p>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>pig latin</code></td><td>Pig Latin</td></tr>
                <tr><td><code>pirate</code></td><td>Pirate English</td></tr>
                <tr><td><code>klingon</code></td><td>tlhIngan Hol (Klingon)</td></tr>
                <tr><td><code>valyrian</code></td><td>High Valyrian</td></tr>
                <tr><td><code>belter</code></td><td>Lang Belta (The Expanse)</td></tr>
                <tr><td><code>dothraki</code></td><td>Dothraki (Game of Thrones)</td></tr>
                <tr><td><code>toki pona</code></td><td>Toki Pona (minimalist conlang)</td></tr>
                <tr><td><code>navi</code></td><td>Na&apos;vi (Avatar)</td></tr>
                <tr><td><code>quenya</code></td><td>Quenya (Tolkien High Elvish)</td></tr>
                <tr><td><code>sindarin</code></td><td>Sindarin (Tolkien Grey Elvish)</td></tr>
                <tr><td><code>hodor</code></td><td>Hodor (Game of Thrones)</td></tr>
                <tr><td><code>dovahzul</code></td><td>Dovahzul (Skyrim Dragon Language)</td></tr>
                <tr><td><code>nadsat</code></td><td>Nadsat (A Clockwork Orange)</td></tr>
                <tr><td><code>newspeak</code></td><td>Newspeak (1984)</td></tr>
                <tr><td><code>mandoa</code></td><td>Mando&apos;a (Star Wars)</td></tr>
                <tr><td><code>cityspeak</code></td><td>Cityspeak (Blade Runner polyglot)</td></tr>
                <tr><td><code>simlish</code></td><td>Simlish (The Sims)</td></tr>
                <tr><td><code>alienese</code></td><td>Alienese / Futurama English</td></tr>
              </tbody>
            </table>

            <h4 className="debug-help-subsection-title">Secret Settings</h4>
            <table className="debug-help-table">
              <tbody>
                <tr><td><code>party mode off</code></td><td>Restore appearance to Auto</td></tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  )
}
