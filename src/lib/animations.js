// src/lib/animations.js

// Animates a DOM element in or out. Returns a Promise that resolves when done.
// element: HTMLElement
// direction: 'in' | 'out'
// animName: one of ANIMATIONS (e.g. 'fade', 'slide-up')
// durationMs: number
export function animate (element, direction, animName, durationMs) {
  return new Promise((resolve) => {
    const className = `anim-${animName}-${direction}`
    element.style.setProperty('--anim-duration', `${durationMs}ms`)
    element.classList.add('animating', className)
    const onEnd = () => {
      clearTimeout(timeoutId)
      element.classList.remove('animating', className)
      element.removeEventListener('animationend', onEnd)
      resolve()
    }
    element.addEventListener('animationend', onEnd)
    // Safety timeout in case animationend never fires
    const timeoutId = setTimeout(() => {
      element.classList.remove('animating', className)
      element.removeEventListener('animationend', onEnd)
      resolve()
    }, durationMs + 100)
  })
}
