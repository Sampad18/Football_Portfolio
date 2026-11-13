import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ZONES } from '../content.js'
import { useGame } from '../store.js'

// Rounded pill label drawn to a canvas, used as a sprite above each ring.
function pill(text, bg) {
  const font = '800 54px ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif'
  const canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + 84
  const h = 104
  canvas.width = w
  canvas.height = h
  ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(23, 34, 59, 0.28)'
  ctx.beginPath()
  ctx.roundRect(2, 10, w - 4, h - 12, 46)
  ctx.fill()
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(2, 2, w - 4, h - 14, 46)
  ctx.fill()
  ctx.font = font
  ctx.fillStyle = '#17223b'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, (h - 12) / 2 + 3)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return { tex, aspect: w / h }
}

function Zone({ zone }) {
  const active = useGame((s) => s.nearZone === zone.id)
  const ring = useRef()
  const gem = useRef()
  const glow = useRef()
  const label = useRef()
  const labelTex = useMemo(() => {
    const off = pill(zone.label, '#fffdf7')
    const on = pill(zone.label, zone.color)
    return { off: off.tex, on: on.tex, aspect: off.aspect }
  }, [zone])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const pulse = 1 + Math.sin(t * 3) * 0.03
    const target = active ? 1.08 : 1
    const s = ring.current.scale.x + (target * pulse - ring.current.scale.x) * Math.min(1, dt * 8)
    ring.current.scale.set(s, s, s)
    glow.current.material.opacity = (active ? 0.38 : 0.16) + Math.sin(t * 3) * 0.04
    gem.current.rotation.y += dt * (active ? 3 : 1.2)
    const ls = label.current.scale.y + ((active ? 0.07 : 0.055) - label.current.scale.y) * Math.min(1, dt * 10)
    label.current.scale.set(labelTex.aspect * ls, ls, 1)
    gem.current.position.y = 3.3 + Math.sin(t * 2 + zone.position[0]) * 0.25
  })

  return (
    <group position={[zone.position[0], 0, zone.position[1]]}>
      <group ref={ring}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[zone.radius - 0.32, zone.radius, 40]} />
          <meshBasicMaterial color={zone.color} />
        </mesh>
        <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[zone.radius - 0.32, 40]} />
          <meshBasicMaterial color={zone.color} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={gem} position={[0, 3.3, 0]} castShadow>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={zone.color} flatShading emissive={zone.color} emissiveIntensity={0.35} />
      </mesh>
      <sprite ref={label} position={[0, 4.7, 0]} scale={[labelTex.aspect * 0.055, 0.055, 1]}>
        <spriteMaterial map={active ? labelTex.on : labelTex.off} depthWrite={false} sizeAttenuation={false} />
      </sprite>
    </group>
  )
}

export function Zones() {
  return ZONES.map((zone) => <Zone key={zone.id} zone={zone} />)
}
