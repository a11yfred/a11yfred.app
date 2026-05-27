/* eslint-env node */
/* jshint node: true, esversion: 11 */
/* globals console, process */
import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'

// Usage: node scripts/import-audit.mjs <input-file> <output-file>
const inputFile = process.argv[2]
const outputFile = process.argv[3]

if (!inputFile || !outputFile) {
  console.error('Usage: node import-audit.mjs <input-file> <output-file>')
  process.exit(1)
}

async function run() {
  try {
    const ext = path.extname(inputFile).toLowerCase()
    const workbook = new ExcelJS.Workbook()
    let worksheet

    if (ext === '.csv') {
      worksheet = await workbook.csv.readFile(inputFile)
    } else if (ext === '.xlsx') {
      await workbook.xlsx.readFile(inputFile)
      worksheet = workbook.worksheets[0]
    } else {
      throw new Error('Unsupported file type. Please provide a .csv or .xlsx file.')
    }

    if (!worksheet) {
      throw new Error('Could not read worksheet.')
    }

    const headers = []
    const results = []

    worksheet.eachRow((row, rowNumber) => {
      // Get array of cell values
      const values = row.values
      
      // Row 1 is headers
      if (rowNumber === 1) {
        // exceljs row.values is 1-indexed, so we slice(1)
        headers.push(...values.slice(1))
        return
      }

      const entry = {}
      headers.forEach((header, index) => {
        if (!header) return
        
        let val = values[index + 1]
        
        // Clean up rich text or object values from Excel
        if (val && typeof val === 'object' && val.richText) {
          val = val.richText.map(rt => rt.text).join('')
        }
        if (val && typeof val === 'object' && val.text) {
          val = val.text
        }

        if (val !== undefined && val !== null && val !== '') {
          // Attempt to convert delimited strings to arrays for known array fields
          if (['keywords', 'creditNames', 'relatedSC', 'component'].includes(header)) {
            val = String(val).split(',').map(s => s.trim()).filter(Boolean)
          } else {
            val = String(val).trim()
          }
          entry[header] = val
        }
      })

      if (Object.keys(entry).length > 0) {
        results.push(entry)
      }
    })

    await fs.writeFile(outputFile, JSON.stringify(results, null, 2), 'utf8')
    console.log(`Successfully imported ${results.length} entries to ${outputFile}`)

  } catch (err) {
    console.error('Error importing audit data:', err)
    process.exit(1)
  }
}

run()
