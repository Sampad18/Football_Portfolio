import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import { Footballer } from './Footballer.jsx'
import { refs, useGame } from '../store.js'
import { lerpAngle } from './util.js'

const SQUAD = [
  { start: [-12, 6], jersey: '#e63946', shorts: '#ffffff', hair: '#111111', skin: '#c68642', number: 7, chases: true },
  { start: [14, -8], jersey: '#1c7ed6', shorts: '#ffffff', hair: '#d9a441', skin: '#f1c9a5', number: 9, chases: true },
  { start: [-16, -10], jersey: '#1c7ed6', shorts: '#ffffff', hair: '#3b2414', skin: '#8d5524', number: 4, chases: false },
  { start: [10, 11], jersey: '#e63946', shorts: '#ffffff', hair: '#6b3f1d', skin: '#e3a977', number: 8, chases: false },
]

function Npc({ start, chases, ...look }) {
  const body = useRef()
  const model = useRef()
  const motion = useMemo(() => ({ speed: 0, kick: 0 }), [])
  const state = useRef({ x: start[0], z: start[1], tx: start[0], tz: start[1], wait: Math.random() * 2, angle: 0 })

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = state.current
    let tx = s.tx
    let tz = s.tz
    let speed = 3.2

    // some players go after the ball when it is nearby and inside the pitch
    const ball = refs.ball
    let chasing = false
    if (chases && ball) {
      const b = ball.translation()
      const far = Math.hypot(b.x - s.x, b.z - s.z)
      const nearPlayer = Math.hypot(b.x - refs.playerPos.x, b.z - refs.playerPos.z) < 3
      if (far < 9 && far > 0.9 && !nearPlayer && Math.abs(b.x) < 26 && Math.abs(b.z) < 18) {
        tx = b.x
        tz = b.z
        speed = 4.6
        chasing = true
      }
    }

    const dx = tx - s.x
    const dz = tz - s.z
    const dist = Math.hypot(dx, dz)
    let moving = 0
    if (!chasing && dist < 0.4) {
      s.wait -= dt
      if (s.wait <= 0) {
        s.tx = (Math.random() * 2 - 1) * 24
        s.tz = (Math.random() * 2 - 1) * 16
        s.wait = 1 + Math.random() * 3
      }
    } else if (dist > 0.05) {
      const step = Math.min(dist, speed * dt)
      s.x += (dx / dist) * step
      s.z += (dz / dist) * step
      s.angle = Math.atan2(dx, dz)
      moving = speed
    }
    motion.speed = moving
    body.current?.setNextKinematicTranslation({ x: s.x, y: 0, z: s.z })
    model.current.rotation.y = lerpAngle(model.current.rotation.y, s.angle, 1 - Math.exp(-dt * 8))
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[start[0], 0, start[1]]}>
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} restitution={0.3} />
      <group ref={model}>
        <Footballer {...look} socks={look.jersey} motion={motion} />
      </group>
    </RigidBody>
  )
}

// The referee keeps a few steps away from the ball and follows play around the pitch.
function Referee() {
  const body = useRef()
  const model = useRef()
  const waves = useRef()
  const motion = useMemo(() => ({ speed: 0, kick: 0, whistle: 0 }), [])
  const state = useRef({ x: 6, z: -6, angle: 0 })

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = state.current

    // a goal: stop, face the centre spot and blow the whistle
    const blowing = useGame.getState().celebrating
    motion.whistle += ((blowing ? 1 : 0) - motion.whistle) * Math.min(1, dt * 12)
    waves.current.visible = motion.whistle > 0.5
    if (waves.current.visible) {
      waves.current.children.forEach((ring, i) => {
        const k = (clock.elapsedTime * 2.2 + i / 3) % 1
        ring.scale.setScalar(0.5 + k * 1.8)
        ring.material.opacity = 0.9 * (1 - k)
      })
    }
    if (blowing) {
      motion.speed = 0
      s.angle = Math.atan2(-s.x, -s.z)
      model.current.rotation.y = lerpAngle(model.current.rotation.y, s.angle, 1 - Math.exp(-dt * 10))
      return
    }
    const ball = refs.ball
    let bx = 0
    let bz = 0
    if (ball) {
      const b = ball.translation()
      bx = Math.max(-25, Math.min(25, b.x))
      bz = Math.max(-16, Math.min(16, b.z))
    }
    // stand about five steps from the ball, on the far side from the player
    let ox = bx - refs.playerPos.x
    let oz = bz - refs.playerPos.z
    const ol = Math.hypot(ox, oz) || 1
    const tx = Math.max(-26, Math.min(26, bx + (ox / ol) * 5 + 2))
    const tz = Math.max(-17, Math.min(17, bz + (oz / ol) * 5 - 2))

    const dx = tx - s.x
    const dz = tz - s.z
    const dist = Math.hypot(dx, dz)
    let moving = 0
    if (dist > 1.2) {
      const speed = dist > 8 ? 5.5 : 3.4
      const step = Math.min(dist, speed * dt)
      s.x += (dx / dist) * step
      s.z += (dz / dist) * step
      s.angle = Math.atan2(dx, dz)
      moving = speed
    } else {
      // when standing still, watch the ball
      s.angle = Math.atan2(bx - s.x, bz - s.z)
    }
    motion.speed = moving
    body.current?.setNextKinematicTranslation({ x: s.x, y: 0, z: s.z })
    model.current.rotation.y = lerpAngle(model.current.rotation.y, s.angle, 1 - Math.exp(-dt * 8))
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[6, 0, -6]}>
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} restitution={0.3} />
      <group ref={model}>
        <Footballer jersey="#212529" shorts="#212529" socks="#212529" hair="#adb5bd" skin="#f1c9a5" motion={motion} />
        {/* yellow card in the chest pocket and a whistle */}
        <mesh position={[0.16, 1.12, 0.2]}>
          <boxGeometry args={[0.14, 0.2, 0.02]} />
          <meshBasicMaterial color="#ffd43b" />
        </mesh>
        <mesh position={[0.06, 1.46, 0.34]}>
          <boxGeometry args={[0.14, 0.08, 0.1]} />
          <meshStandardMaterial color="#ced4da" />
        </mesh>
        {/* sound waves that puff out of the whistle */}
        <group ref={waves} position={[0.06, 1.5, 0.75]} visible={false}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <torusGeometry args={[0.3, 0.035, 6, 20]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
    </RigidBody>
  )
}

export function Npcs() {
  return (
    <>
      {SQUAD.map((p) => (
        <Npc key={p.number} {...p} />
      ))}
      <Referee />
    </>
  )
}
