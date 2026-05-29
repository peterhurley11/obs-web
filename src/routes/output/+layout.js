// src/routes/output/+layout.js
import '$lib/animations.scss'
import { connectGraphicsWs } from '$lib/graphics.js'

export const ssr = false
export const prerender = false

if (typeof window !== 'undefined') {
  connectGraphicsWs()
}
