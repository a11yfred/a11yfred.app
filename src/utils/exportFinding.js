/**
 * exportFinding(finding, format)
 *
 * Triggers a browser download of the finding in the requested format.
 * Formats: 'text' (default) | 'markdown' | 'csv'
 *
 * No UI required, call from any button or action that has a Finding object.
 */
export function exportFinding(finding, format = 'text') {
  let content, filename, mimeType

  switch (format) {

    case 'csv': {
      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
      const header = ['id', 'title', 'sc', 'primarySC', 'severity', 'platform', 'desc', 'fix'].join(',')
      const row = [
        finding.id,
        finding.title,
        finding.sc,
        finding.primarySC,
        finding.severity,
        finding.platform,
        finding.desc,
        finding.fix,
      ].map(esc).join(',')
      content  = `${header}\n${row}`
      filename = `${finding.id}.csv`
      mimeType = 'text/csv;charset=utf-8;'
      break
    }

    case 'markdown': {
      const related = finding.relatedSC?.length
        ? `\n\n**Related:** ${finding.relatedSC.join(', ')}`
        : ''
      content = [
        `# ${finding.title}`,
        '',
        `**SC:** ${finding.primarySC}  `,
        `**Severity:** ${finding.severity}  `,
        `**Platform:** ${finding.platform}${related}`,
        '',
        '## Description',
        '',
        finding.desc,
        '',
        '## Suggested Fix',
        '',
        finding.fix,
      ].join('\n')
      filename = `${finding.id}.md`
      mimeType = 'text/markdown;charset=utf-8;'
      break
    }

    case 'text':
    default: {
      const bar = '─'.repeat(Math.min(finding.title.length, 60))
      content = [
        finding.title,
        bar,
        '',
        `SC: ${finding.primarySC}`,
        `Severity: ${finding.severity}`,
        `Platform: ${finding.platform}`,
        '',
        'Description:',
        finding.desc,
        '',
        'Suggested Fix:',
        finding.fix,
      ].join('\n')
      filename = `${finding.id}.txt`
      mimeType = 'text/plain;charset=utf-8;'
      break
    }
  }

  const blob = new Blob([content], { type: mimeType })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
