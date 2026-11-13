import * as THREE from 'three'

// Draws lines of text onto a canvas and returns it as a texture.
export function makeTextTexture(lines, { width = 512, height = 128, bg = '#1c2541', fg = '#ffffff', font = 64 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (bg) {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const list = Array.isArray(lines) ? lines : [lines]
  list.forEach((line, i) => {
    const item = typeof line === 'string' ? { text: line } : line
    ctx.fillStyle = item.color || fg
    ctx.font = `800 ${item.size || font}px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif`
    ctx.fillText(item.text, width / 2, (height / (list.length + 1)) * (i + 1), width - 24)
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function lerpAngle(current, target, t) {
  const diff = ((((target - current + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
  return current + diff * t
}

// Small deterministic random generator so the scenery is the same on every load.
export function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
