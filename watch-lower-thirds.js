/**
 * Lower Thirds File Watcher
 * Watches lower-thirds.txt and pushes changes to the obs-web WebSocket server.
 *
 * Usage:
 *   node watch-lower-thirds.js
 *   node watch-lower-thirds.js /path/to/other-file.txt
 *
 * File format (lower-thirds.txt):
 *   NAME: Jalen Brunson
 *   TITLE: NYK · PG
 */

import { readFileSync, watch, existsSync, writeFileSync } from 'fs'
import { WebSocket } from 'ws'

const FILE = process.argv[2] || 'lower-thirds.txt'
const WS_URL = process.env.WS_URL || 'ws://localhost:8080/gs'
const DEBOUNCE_MS = 300

// Create the file with default content if it doesn't exist
if (!existsSync(FILE)) {
  writeFileSync(FILE, 'NAME: Player Name\nTITLE: Team · Position\n', 'utf8')
  console.log(`Created ${FILE}`)
}

let ws = null
let currentState = { overlays: [], version: 0 }
let debounceTimer = null
let reconnectTimer = null

// --- File parsing ---

function parseFile () {
  try {
    const text = readFileSync(FILE, 'utf8')
    const name = text.match(/^NAME:\s*(.+)$/im)?.[1]?.trim() ?? ''
    const title = text.match(/^TITLE:\s*(.+)$/im)?.[1]?.trim() ?? ''
    return { name, title }
  } catch {
    return null
  }
}

// --- Overlay helpers ---

function findWhoIsNextOverlay () {
  return currentState.overlays.find(o => o.templateId === 'whos-next-lower-third') ?? null
}

function send (msg) {
  if (ws?.readyState === 1) ws.send(JSON.stringify(msg))
}

function applyFile () {
  const parsed = parseFile()
  if (!parsed || (!parsed.name && !parsed.title)) return

  const overlay = findWhoIsNextOverlay()

  if (overlay) {
    send({
      type: 'PATCH_OVERLAY',
      id: overlay.id,
      patch: { fields: { ...overlay.fields, name: parsed.name, title: parsed.title } }
    })
    console.log(`  Updated → ${parsed.name} / ${parsed.title}`)
  } else {
    send({
      type: 'ADD_OVERLAY',
      overlay: {
        id: `ov_${Date.now()}`,
        templateId: 'whos-next-lower-third',
        fields: { name: parsed.name, title: parsed.title, color: '#ffffff', imageUrl: '' },
        visible: false,
        animation: { in: 'slide-up', out: 'slide-down', durationMs: 350 },
        layer: 0
      }
    })
    console.log(`  Created → ${parsed.name} / ${parsed.title}`)
  }
}

// --- File watcher ---

function onFileChange () {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    console.log(`[file changed] ${FILE}`)
    applyFile()
  }, DEBOUNCE_MS)
}

watch(FILE, { persistent: true }, (event) => {
  if (event === 'change') onFileChange()
})

// --- WebSocket connection ---

function connect () {
  clearTimeout(reconnectTimer)
  ws = new WebSocket(WS_URL)

  ws.on('open', () => {
    console.log(`[connected] ${WS_URL}`)
    ws.send(JSON.stringify({ type: 'REQUEST_STATE' }))
  })

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'STATE') {
        const wasEmpty = currentState.overlays.length === 0
        currentState = msg.state
        // On first state load, apply the current file contents
        if (wasEmpty) applyFile()
      }
    } catch { /* ignore malformed */ }
  })

  ws.on('close', () => {
    console.log('[disconnected] reconnecting in 2s...')
    reconnectTimer = setTimeout(connect, 2000)
  })

  ws.on('error', () => { /* close fires after error */ })
}

// --- Start ---

console.log(`Lower Thirds Watcher`)
console.log(`  File:   ${FILE}`)
console.log(`  Server: ${WS_URL}`)
console.log(`  Edit and save the file to update text in real-time.`)
console.log(`  Press Ctrl+C to stop.\n`)

connect()
