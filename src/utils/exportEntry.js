/**
 * exportEntry(entry, format)
 *
 * Triggers a browser download of the entry in the requested format.
 * Formats: 'text' (default) | 'markdown' | 'csv' | 'excel'
 *
 * No UI required, call from any button or action that has an Entry object.
 */
export function exportEntry(entry, format = 'text') {
  let content, filename, mimeType

  switch (format) {

    case 'csv': {
      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
      const header = ['id', 'title', 'sc', 'primarySC', 'severity', 'platform', 'desc', 'fix'].join(',')
      const row = [
        entry.id,
        entry.title,
        entry.sc,
        entry.primarySC,
        entry.severity,
        entry.platform,
        entry.desc,
        entry.fix,
      ].map(esc).join(',')
      content  = `${header}\n${row}`
      filename = `${entry.id}.csv`
      mimeType = 'text/csv;charset=utf-8;'
      break
    }

    case 'markdown': {
      const related = entry.relatedSC?.length
        ? `\n\n**Related SC:** ${entry.relatedSC.join(', ')}`
        : ''
      content = [
        `# ${entry.title}`,
        '',
        `**SC:** ${entry.primarySC}  `,
        `**Severity:** ${entry.severity}  `,
        `**Platform:** ${entry.platform}${related}`,
        '',
        '## Description',
        '',
        entry.desc,
        '',
        '## Suggested Fix',
        '',
        entry.fix,
      ].join('\n')
      filename = `${entry.id}.md`
      mimeType = 'text/markdown;charset=utf-8;'
      break
    }

    case 'excel': {
      const fields = ['id', 'title', 'sc', 'primarySC', 'severity', 'platform', 'desc', 'fix']
      import('exceljs').then(({ default: ExcelJS }) => {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Entry')
        ws.columns = fields.map(f => ({ header: f, key: f }))
        ws.addRow(Object.fromEntries(fields.map(f => [f, entry[f] ?? ''])))
        wb.xlsx.writeBuffer().then(buf => {
          const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${entry.id}.xlsx`
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        })
      })
      return
    }

    case 'text':
    default: {
      const bar = '─'.repeat(Math.min(entry.title.length, 60))
      content = [
        entry.title,
        bar,
        '',
        `SC: ${entry.primarySC}`,
        `Severity: ${entry.severity}`,
        `Platform: ${entry.platform}`,
        '',
        'Description:',
        entry.desc,
        '',
        'Suggested Fix:',
        entry.fix,
      ].join('\n')
      filename = `${entry.id}.txt`
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
