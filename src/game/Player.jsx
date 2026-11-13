import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Footballer } from './Footballer.jsx'
import { refs, useGame } from '../store.js'
import { ZONES } from '../content.js'
import { lerpAngle } from './util.js'

const WALK = 7
const SPRINT = 11
const KICK_REACH = 2.1
const CAM_OFFSET = new THREE.Vector3(0, 15, 17)

export function Player() {
  const body = useRef()
  const model = useRef()
  const keys = useRef({})
  const motion = useMemo(() => ({ speed: 0, kick: 0 }), [])
  const camTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const facing = useRef(0)

  useEffect(() => {
    const down = (e) => {
      const s = useGame.getState()
      // while someone is typing in the chat box, keys belong to the text field
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.code === 'Escape' && s.openZone) s.close()
        return
      }
      keys.current[e.code] = true
      if (!s.started) return
      if (e.code === 'Space' && !s.openZone && !s.menuOpen) {
        e.preventDefault()
        refs.kick = true
      }
      if ((e.code === 'KeyE' || e.code === 'Enter') && s.nearZone && !s.openZone) s.open(s.nearZone)
      if (e.code === 'Escape') {
        if (s.openZone) s.close()
        else if (s.menuOpen) s.toggleMenu()
      }
    }
    const up = (e) => {
      keys.current[e.code] = false
    }
    const blur = () => {
      keys.current = {}
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useFrame((state, dt) => {
    const rb = body.current
    if (!rb) return
    refs.player = rb
    const game = useGame.getState()
    if (!game.ready) game.setReady()
    const active = game.started && !game.openZone && !game.menuOpen
    const k = keys.current

    let x = 0
    let z = 0
    if (active) {
      if (k.KeyW || k.ArrowUp) z -= 1
      if (k.KeyS || k.ArrowDown) z += 1
      if (k.KeyA || k.ArrowLeft) x -= 1
      if (k.KeyD || k.ArrowRight) x += 1
      x += refs.joystick.x
      z += refs.joystick.z
    }
    const len = Math.hypot(x, z)
    if (len > 1) {
      x /= len
      z /= len
    }
    // sprint with Shift, or by pushing the touch joystick all the way
    const pushed = Math.hypot(refs.joystick.x, refs.joystick.z) > 0.92
    const top = k.ShiftLeft || k.ShiftRight || pushed ? SPRINT : WALK
    const vel = rb.linvel()
    rb.setLinvel({ x: x * top, y: vel.y, z: z * top }, true)

    const speed = Math.hypot(x, z) * top
    motion.speed = speed
    if (speed > 0.2) facing.current = Math.atan2(x, z)
    model.current.rotation.y = lerpAngle(model.current.rotation.y, facing.current, 1 - Math.exp(-dt * 14))

    const p = rb.translation()
    refs.playerPos.x = p.x
    refs.playerPos.z = p.z

    // kick the ball if it is close enough
    if (refs.kick) {
      refs.kick = false
      if (active) {
        motion.kick = 1
        const ball = refs.ball
        if (ball) {
          const b = ball.translation()
          const dx = b.x - p.x
          const dz = b.z - p.z
          const dist = Math.hypot(dx, dz)
          if (dist < KICK_REACH && b.y < 1.6) {
            // aim mostly where the player faces, nudged toward the ball
            const fx = Math.sin(facing.current) * 0.7 + (dx / (dist || 1)) * 0.3
            const fz = Math.cos(facing.current) * 0.7 + (dz / (dist || 1)) * 0.3
            const n = Math.hypot(fx, fz) || 1
            const power = 9 + Math.min(speed, SPRINT) * 0.35
            ball.applyImpulse({ x: (fx / n) * power * 0.45, y: 2.1, z: (fz / n) * power * 0.45 }, true)
          }
        }
      }
    }

    // camera follows from behind and above
    const follow = 1 - Math.exp(-dt * 4)
    camTarget.x += (THREE.MathUtils.clamp(p.x, -29, 29) - camTarget.x) * follow
    camTarget.z += (THREE.MathUtils.clamp(p.z, -18, 20) - camTarget.z) * follow
    // on tall phone screens, pull the camera back so more of the pitch fits across
    const aspect = state.size.width / state.size.height
    const zoom = aspect < 1 ? 1.45 : 1
    state.camera.position.set(camTarget.x + CAM_OFFSET.x, CAM_OFFSET.y * zoom, camTarget.z + CAM_OFFSET.z * zoom)
    state.camera.lookAt(camTarget.x, 1, camTarget.z)

    // which section ring is the player standing in?
    let near = null
    for (const zone of ZONES) {
      if (Math.hypot(p.x - zone.position[0], p.z - zone.position[1]) < zone.radius) {
        near = zone.id
        break
      }
    }
    game.setNearZone(near)
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[0, 0.2, 2.2]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      friction={0}
      name="player"
    >
      <CapsuleCollider args={[0.5, 0.42]} position={[0, 0.92, 0]} friction={0} />
      <group ref={model}>
        <Footballer jersey="#e63946" shorts="#ffffff" socks="#e63946" number={11} motion={motion} />
      </group>
    </RigidBody>
  )
}
