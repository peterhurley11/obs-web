// src/lib/graphics.js
import { writable } from 'svelte/store'

export const graphicsState = writable({ overlays: [], version: 0 })
export const wsConnected = writable(false)

let ws = null
let reconnectTimer = null
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
    }
  })

  ws.addEventListener('close', () => {
    wsConnected.set(false)
    ws = null
    reconnectTimer = setTimeout(connectGraphicsWs, 2000)
  })

  ws.addEventListener('error', () => {
    // close event fires after error; reconnect handled there
  })
}

export function disconnectGraphicsWs () {
  clearTimeout(reconnectTimer)
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
  send({ type: 'ADD_OVERLAY', overlay })
}

export function removeOverlay (id) {
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

export function makeOverlayId () {
  return `ov_${Date.now()}`
}
