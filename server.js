import { createServer } from 'http'
import { mkdirSync, createWriteStream, createReadStream, existsSync } from 'fs'
import { extname, basename, join } from 'path'
import { WebSocketServer } from 'ws'
import sirv from 'sirv'

const PORT = parseInt(process.env.PORT, 10) || 8080

// Ensure public/ and uploads/ exist
mkdirSync('public', { recursive: true })
mkdirSync('uploads', { recursive: true })

// In-memory graphics state
let graphicsState = { overlays: [], version: 0 }

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
        break

      case 'ADD_OVERLAY':
        if (!msg.overlay || typeof msg.overlay !== 'object') return
        graphicsState = {
          overlays: [...graphicsState.overlays, msg.overlay],
          version: graphicsState.version + 1
        }
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'REMOVE_OVERLAY':
        if (!msg.id || typeof msg.id !== 'string') return
        graphicsState.overlays = graphicsState.overlays.filter(o => o.id !== msg.id)
        graphicsState.version++
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'PATCH_OVERLAY':
        if (!msg.id || typeof msg.id !== 'string') return
        if (!msg.patch || typeof msg.patch !== 'object' || Array.isArray(msg.patch)) return
        graphicsState.overlays = graphicsState.overlays.map(o =>
          o.id === msg.id ? { ...o, ...msg.patch } : o
        )
        graphicsState.version++
        broadcast({ type: 'STATE', state: graphicsState }, ws)
        break

      case 'SET_STATE': {
        const s = msg.state
        if (s && typeof s === 'object' && Array.isArray(s.overlays) &&
            typeof s.version === 'number' && s.version > graphicsState.version) {
          graphicsState = s
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
