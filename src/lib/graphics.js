// src/lib/graphics.js
import { writable, get } from 'svelte/store'
import { getTemplate } from './templates.js'

export const graphicsState = writable({ overlays: [], version: 0, templateStyles: {} })
export const wsConnected = writable(false)
export const sheetRoster = writable({ rows: [], lastFetchedAt: null, error: null })

let ws = null
let reconnectTimer = null
let intentionalClose = false
const WS_PATH = '/gs'

function getWsUrl () {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}${WS_PATH}`
}

export function connectGraphicsWs () {
  if (ws && ws.readyState < 2) return // already open or connecting

  ws = new WebSocket(getWsUrl())

  ws.addEventListener('open', () => {
    wsConnected.set(true)
    ws.send(JSON.stringify({ type: 'REQUEST_STATE' }))
  })

  ws.addEventListener('message', (event) => {
    let msg
    try { msg = JSON.parse(event.data) } catch { return }
    if (msg.type === 'STATE') {
      graphicsState.set(msg.state)
    } else if (msg.type === 'ROSTER') {
      sheetRoster.set(msg.roster)
    }
  })

  ws.addEventListener('close', () => {
    wsConnected.set(false)
    ws = null
    if (!intentionalClose) {
      reconnectTimer = setTimeout(connectGraphicsWs, 2000)
    }
    intentionalClose = false
  })

  ws.addEventListener('error', () => {
    // close event fires after error; reconnect handled there
  })
}

export function disconnectGraphicsWs () {
  clearTimeout(reconnectTimer)
  intentionalClose = true
  if (ws) {
    ws.close()
    ws = null
  }
}

function send (msg) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(msg))
  }
}

export function addOverlay (overlay) {
  graphicsState.update(s => ({
    ...s,
    overlays: [...s.overlays, overlay],
    version: s.version + 1
  }))
  send({ type: 'ADD_OVERLAY', overlay })
}

export function removeOverlay (id) {
  graphicsState.update(s => ({
    ...s,
    overlays: s.overlays.filter(o => o.id !== id),
    version: s.version + 1
  }))
  send({ type: 'REMOVE_OVERLAY', id })
}

export function patchOverlay (id, patch) {
  // Optimistic local update
  graphicsState.update(s => ({
    ...s,
    overlays: s.overlays.map(o => o.id === id ? { ...o, ...patch } : o),
    version: s.version + 1
  }))
  send({ type: 'PATCH_OVERLAY', id, patch })
}

export function patchTemplateStyle (templateId, patch) {
  graphicsState.update(s => ({
    ...s,
    templateStyles: {
      ...s.templateStyles,
      [templateId]: { ...(s.templateStyles?.[templateId] || {}), ...patch }
    },
    version: s.version + 1
  }))
  send({ type: 'PATCH_TEMPLATE_STYLE', templateId, patch })
}

// Loads a roster row's text into the singleton overlay for its template,
// creating that overlay (hidden) if it doesn't exist yet. Does not force
// the overlay visible — "Take" cues the graphic, it doesn't put it on air.
export function takeRosterRow (row, templateId = 'hold-the-phone-lower-third') {
  const state = get(graphicsState)
  const existing = state.overlays.find(o => o.templateId === templateId)
  const fields = { name: row.name, title: row.title }

  if (existing) {
    patchOverlay(existing.id, { fields: { ...existing.fields, ...fields } })
    return
  }

  const tpl = getTemplate(templateId)
  if (!tpl) return

  addOverlay({
    id: makeOverlayId(),
    templateId,
    fields: { ...tpl.defaultFields, ...fields },
    visible: false,
    animation: { ...tpl.defaultAnimation },
    layer: state.overlays.length
  })
}

export function makeOverlayId () {
  return `ov_${crypto.randomUUID()}`
}
