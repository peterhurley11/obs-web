/**
 * Google Sheet roster fetching for the Hold The Phone lower third.
 *
 * Reads a "Publish to web" CSV export URL and turns it into a list of
 * { name, title } rows. No npm dependency — the sheet is a simple two-column
 * table with no embedded newlines, so a per-line CSV parser is sufficient.
 * (A literal newline inside a quoted cell would break the per-line split —
 * acceptable given the known, simple content of this sheet.)
 */

// Splits one CSV line into fields, honoring double-quoted values and "" escapes.
function parseCsvLine (line) {
  const fields = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }

  fields.push(field)
  return fields
}

export function parseCsv (text) {
  return text
    .split(/\r\n|\r|\n/)
    .filter(line => line.length > 0)
    .map(parseCsvLine)
}

export function rowsToRoster (csvRows) {
  return csvRows
    .slice(1) // drop header row
    .map(([name = '', title = ''] = []) => ({ name: name.trim(), title: title.trim() }))
    .filter(row => row.name || row.title)
}

export async function fetchRoster (url, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Sheet fetch failed: HTTP ${res.status}`)
    const text = await res.text()
    return { rows: rowsToRoster(parseCsv(text)) }
  } finally {
    clearTimeout(timeout)
  }
}
