/**
 * Generates an accessibility audit report in Markdown format.
 *
 * @param {Record<string, { count: number, overrideSeverity: string|null, note: string }>} reportDefects - Active report items
 * @param {Array<Object>} allEntries - Full list of available entries to pull data from
 * @returns {string} The formatted Markdown report
 */
export function generateMarkdownReport(reportDefects, allEntries) {
  const defectIds = Object.keys(reportDefects)
  if (defectIds.length === 0) return '# Accessibility Audit Report\n\nNo defects selected.'

  // Build a map of entries for quick lookup
  const entryMap = new Map()
  allEntries.forEach(e => entryMap.set(e.id, e))

  const selectedEntries = defectIds.map(id => ({
    entry: entryMap.get(id),
    meta: reportDefects[id]
  })).filter(item => item.entry !== undefined)

  // Sort by severity (Critical -> High -> Medium -> Low -> Best Practice)
  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, 'Best Practice': 4 }
  selectedEntries.sort((a, b) => {
    const sevA = a.meta.overrideSeverity || a.entry.severity
    const sevB = b.meta.overrideSeverity || b.entry.severity
    return (severityOrder[sevA] ?? 99) - (severityOrder[sevB] ?? 99)
  })

  let md = `# Accessibility Audit Report\n\n`
  md += `Generated on ${new Date().toLocaleDateString()}\n\n`

  md += `## Executive Summary\n\n`
  md += `Total Unique Defects: ${selectedEntries.length}\n\n`
  
  // Summary Table
  md += `| ID | SC | Severity | Occurrences | Issue |\n`
  md += `| :--- | :--- | :--- | :--- | :--- |\n`
  
  selectedEntries.forEach(({ entry, meta }) => {
    const activeSev = meta.overrideSeverity || entry.severity
    const count = meta.count || 1
    md += `| ${entry.id} | ${entry.sc} | ${activeSev} | ${count} | ${entry.title} |\n`
  })

  md += `\n## Detailed Findings\n\n`

  selectedEntries.forEach(({ entry, meta }) => {
    const activeSev = meta.overrideSeverity || entry.severity
    const count = meta.count || 1

    md += `### ${entry.id}: ${entry.title}\n\n`
    md += `- **WCAG SC**: ${entry.primarySC}\n`
    md += `- **Severity**: ${activeSev}\n`
    md += `- **Occurrences**: ${count}\n`
    if (meta.note) {
      md += `- **Auditor Note**: ${meta.note}\n`
    }
    md += `\n**Description**\n${entry.desc}\n\n`
    md += `**Remediation**\n${entry.fix}\n\n`
    md += `---\n\n`
  })

  return md
}
