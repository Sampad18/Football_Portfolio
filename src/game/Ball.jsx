import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BallCollider, RigidBody } from '@react-three/rapier'
import { refs } from '../store.js'

const SPOTS = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
]

export function Ball() {
  const body = useRef()

  useFrame(() => {
    const rb = body.current
    if (!rb) return
    refs.ball = rb
    // safety net: if the ball ever escapes the stadium, bring it back
    const p = rb.translation()
    if (p.y < -5 || Math.abs(p.x) > 45 || Math.abs(p.z) > 35) {
      rb.setTranslation({ x: 0, y: 2, z: 3 }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <RigidBody ref={body} name="ball" colliders={false} position={[2.5, 0.6, 3.5]} linearDamping={0.35} angularDamping={0.6} ccd>
      <BallCollider args={[0.36]} mass={0.45} restitution={0.65} friction={0.7} />
      <mesh castShadow>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      {SPOTS.map((s, i) => (
        <mesh key={i} position={[s[0] * 0.3, s[1] * 0.3, s[2] * 0.3]}>
          <icosahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color="#22252b" flatShading />
        </mesh>
      ))}
    </RigidBody>
  )
}
