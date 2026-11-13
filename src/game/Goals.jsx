import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import { Footballer } from './Footballer.jsx'
import { useGame } from '../store.js'

const HALF_W = 4 // half the goal mouth width
const H = 3
const DEPTH = 2.6

function Goal({ side, zoneId }) {
  // side: -1 for the west goal, +1 for the east goal
  const scoreGoal = useGame((s) => s.scoreGoal)
  const d = side * DEPTH
  return (
    <group position={[side * 30, 0, 0]}>
      <RigidBody type="fixed" colliders={false}>
        {/* posts and crossbar */}
        <CuboidCollider args={[0.12, H / 2, 0.12]} position={[0, H / 2, HALF_W]} restitution={0.6} />
        <CuboidCollider args={[0.12, H / 2, 0.12]} position={[0, H / 2, -HALF_W]} restitution={0.6} />
        <CuboidCollider args={[0.12, 0.12, HALF_W]} position={[0, H, 0]} restitution={0.6} />
        {/* net: back, sides and roof */}
        <CuboidCollider args={[0.1, H / 2, HALF_W]} position={[d, H / 2, 0]} restitution={0.05} />
        <CuboidCollider args={[DEPTH / 2, H / 2, 0.1]} position={[d / 2, H / 2, HALF_W]} restitution={0.05} />
        <CuboidCollider args={[DEPTH / 2, H / 2, 0.1]} position={[d / 2, H / 2, -HALF_W]} restitution={0.05} />
        <CuboidCollider args={[DEPTH / 2, 0.1, HALF_W]} position={[d / 2, H, 0]} restitution={0.05} />
        {/* goal detector */}
        <CuboidCollider
          sensor
          args={[0.8, 1.3, HALF_W - 0.5]}
          position={[side * 1.5, 1.35, 0]}
          onIntersectionEnter={(e) => {
            if (e.other.rigidBodyObject?.name === 'ball') scoreGoal(zoneId)
          }}
        />
      </RigidBody>

      {/* frame */}
      {[HALF_W, -HALF_W].map((z) => (
        <mesh key={z} castShadow position={[0, H / 2, z]}>
          <boxGeometry args={[0.24, H, 0.24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      <mesh castShadow position={[0, H, 0]}>
        <boxGeometry args={[0.24, 0.24, HALF_W * 2 + 0.24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* net */}
      <mesh position={[d, H / 2, 0]}>
        <boxGeometry args={[0.05, H, HALF_W * 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {[HALF_W, -HALF_W].map((z) => (
        <mesh key={z} position={[d / 2, H / 2, z]}>
          <boxGeometry args={[DEPTH, H, 0.05]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
      <mesh position={[d / 2, H, 0]}>
        <boxGeometry args={[DEPTH, 0.05, HALF_W * 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function Keeper({ side, jersey }) {
  const body = useRef()
  const motion = useMemo(() => ({ speed: 0, kick: 0 }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.1 + (side > 0 ? 1.7 : 0)
    body.current?.setNextKinematicTranslation({ x: side * 28.6, y: 0, z: Math.sin(t) * 2.7 })
    motion.speed = Math.abs(Math.cos(t)) * 3
  })
  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[side * 28.6, 0, 0]}>
      <CapsuleCollider args={[0.5, 0.45]} position={[0, 0.95, 0]} restitution={0.4} />
      <group rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <Footballer jersey={jersey} shorts="#22252b" socks={jersey} hair="#5c3b1e" number={1} motion={motion} />
      </group>
    </RigidBody>
  )
}

export function Goals() {
  return (
    <>
      <Goal side={-1} zoneId="projects" />
      <Goal side={1} zoneId="experience" />
      <Keeper side={-1} jersey="#f59f00" />
      <Keeper side={1} jersey="#37b24d" />
    </>
  )
}
