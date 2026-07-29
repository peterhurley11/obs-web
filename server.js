import { createServer } from 'http'
import { mkdirSync, createWriteStream, createReadStream, existsSync, readFileSync, writeFileSync, renameSync } from 'fs'
import { extname, basename, join } from 'path'
import { WebSocketServer } from 'ws'
import sirv from 'sirv'
import { fetchRoster } from './sheet-roster.js'
import { TEMPLATES, getTemplate } from './src/lib/templates.js'

const PORT = parseInt(process.env.PORT, 10) || 8080
const STATE_FILE = 'data/state.json'
const SHEET_CSV_URL = process.env.SHEET_CSV_URL || null
const SHEET_POLL_MS = parseInt(process.env.SHEET_POLL_MS, 10) || 20000

// Ensure public/, uploads/ and data/ exist
mkdirSync('public', { recursive: true })
mkdirSync('uploads', { recursive: true })
mkdirSync('data', { recursive: true })

// --- Graphics state persistence ---

function loadState () {
  let state = { overlays: [], version: 0, templateStyles: {} }

  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
    if (parsed && Array.isArray(parsed.overlays) && typeof parsed.version === 'number') {
      state = { overlays: parsed.overlays, version: parsed.version, templateStyles: parsed.templateStyles || {} }
    } else {
      console.warn(`${STATE_FILE} has an unexpected shape, starting fresh`)
    }
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`Could not read ${STATE_FILE}, starting fresh:`, err.message)
  }

  // Backfill default styles for any template that defines one, without
  // clobbering values an operator has already set.
  for (const tpl of TEMPLATES) {
    if (tpl.defaultStyle) {
      state.templateStyles[tpl.id] = { ...tpl.defaultStyle, ...(state.templateStyles[tpl.id] || {}) }
    }
  }

  return state
}

let persistTimer = null
function schedulePersist () {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      const tmpFile = `${STATE_FILE}.tmp`
      writeFileSync(tmpFile, JSON.stringify(graphicsState, null, 2))
      renameSync(tmpFile, STATE_FILE)
    } catch (err) {
      console.error(`Failed to persist ${STATE_FILE}:`, err.message)
    }
  }, 300)
}

// In-memory graphics state (loaded from disk, persisted on every mutation)
let graphicsState = loadState()

// --- Google Sheet roster polling ---

let sheetRoster = {
  rows: [],
  lastFetchedAt: null,
  error: SHEET_CSV_URL ? null : 'SHEET_CSV_URL is not configured'
}
let rosterPollInFlight = false

async function pollSheet () {
  if (!SHEET_CSV_URL || rosterPollInFlight) return
  rosterPollInFlight = true
  try {
    const { rows } = await fetchRoster(SHEET_CSV_URL)
    sheetRoster = { rows, lastFetchedAt: Date.now(), error: null }
  } catch (err) {
    // Keep any previously-fetched rows visible; only surface the error.
    sheetRoster = { ...sheetRoster, error: err.message }
  } finally {
    rosterPollInFlight = false
    broadcast({ type: 'ROSTER', roster: sheetRoster })
  }
}

if (SHEET_CSV_URL) {
  pollSheet()
  setInterval(pollSheet, SHEET_POLL_MS)
}

// Static file server for the SvelteKit build
const assets = sirv('public', { single: true })

const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' }

// HTTP server
const server = createServer((req, res) => {
  // File upload endpoint
  if (req.method === 'POST' && req.url === '/upload') {
    const rawName = req.headers['x-filename'] || 'upload'
    const ext = extname(rawName).toLowerCase()
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'unsupported file type' }))
      return
    }
    const filename = `${Date.now()}-${basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const dest = createWriteStream(`uploads/${filename}`)
    req.pipe(dest)
    dest.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ url: `/uploads/${filename}` }))
    })
    dest.on('error', () => {
      res.writeHead(500); res.end()
    })
    return
  }

  // Serve uploaded player images
  if (req.url.startsWith('/uploads/')) {
    const filename = req.url.slice('/uploads/'.length)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      res.writeHead(400); res.end(); return
    }
    const filepath = join('uploads', filename)
    if (!existsSync(filepath)) { res.writeHead(404); res.end(); return }
    const ext = extname(filename).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' })
    createReadStream(filepath).pipe(res)
    return
  }

  // Serve SvelteKit static build
  assets(req, res, () => {
    res.statusCode = 404
    res.end('Not found')
  })
})

// WebSocket server scoped to /gs
const wss = new WebSocketServer({ server, path: '/gs' })

function broadcast (data, exclude) {
  const msg = JSON.stringify(data)
  for (const client of wss.clients) {
    if (client !== exclude && client.readyState === 1 /* OPEN */) {
      client.send(msg)
    }
  }
}

wss.on('error', (err) => { console.error('wss error:', err); process.exit(1) })

wss.on('connection', (ws) => {
  // Send current state to the newly connected client
  ws.send(JSON.stringify({ type: 'STATE', state: graphicsState }))
  ws.send(JSON.stringify({ type: 'ROSTER', roster: sheetRoster }))

  ws.on('error', (err) => console.error('ws client error:', err.message))

  ws.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    switch (msg.type) {
      case 'REQUEST_STATE':
        ws.send(JSON.stringify({ type: 'STATE', state: graphicsState }))
        ws.send(JSON.stringify({ type: 'ROSTER', roster: sheetRoster }))
        break

      case 'ADD_OVERLAY':
        if (!msg.overlay || typeof msg.overlay !== 'object') return
        graphicsState = {
          ...graphicsState,
          overlays: [...graphicsState.overlays, msg.overlay],
          version: graphicsState.version + 1
        }
        schedulePersist()
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'REMOVE_OVERLAY':
        if (!msg.id || typeof msg.id !== 'string') return
        graphicsState.overlays = graphicsState.overlays.filter(o => o.id !== msg.id)
        graphicsState.version++
        schedulePersist()
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'PATCH_OVERLAY':
        if (!msg.id || typeof msg.id !== 'string') return
        if (!msg.patch || typeof msg.patch !== 'object' || Array.isArray(msg.patch)) return
        graphicsState.overlays = graphicsState.overlays.map(o =>
          o.id === msg.id ? { ...o, ...msg.patch } : o
        )
        graphicsState.version++
        schedulePersist()
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'PATCH_TEMPLATE_STYLE': {
        if (!msg.templateId || typeof msg.templateId !== 'string') return
        if (!msg.patch || typeof msg.patch !== 'object' || Array.isArray(msg.patch)) return
        const base = graphicsState.templateStyles[msg.templateId] ?? getTemplate(msg.templateId)?.defaultStyle ?? {}
        graphicsState = {
          ...graphicsState,
          templateStyles: { ...graphicsState.templateStyles, [msg.templateId]: { ...base, ...msg.patch } },
          version: graphicsState.version + 1
        }
        schedulePersist()
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break
      }

      case 'SET_STATE': {
        const s = msg.state
        if (s && typeof s === 'object' && Array.isArray(s.overlays) &&
            typeof s.version === 'number' && s.version > graphicsState.version) {
          graphicsState = s
          schedulePersist()
          broadcast({ type: 'STATE', state: graphicsState }, ws)
        }
        break
      }
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`obs-web server listening on http://0.0.0.0:${PORT}`)
  console.log(`WebSocket graphics sync at ws://0.0.0.0:${PORT}/gs`)
})
