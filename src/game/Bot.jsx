import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { BOT_POSITION } from '../content.js'
import { refs, useGame } from '../store.js'
import { lerpAngle } from './util.js'

const WHITE = '#f8f9fa'
const PINK = '#f783ac'
const DARK = '#1c2541'
const CYAN = '#66d9e8'

// The sideline chat robot. It hovers, turns to watch the player, blinks,
// and waves when the player steps into its ring.
export function Bot() {
  const model = useRef()
  const hover = useRef()
  const eyes = useRef()
  const armR = useRef()
  const armL = useRef()
  const bulb = useRef()
  const mouth = useRef()

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const t = clock.elapsedTime
    const game = useGame.getState()
    const near = game.nearZone === 'chat'
    const talking = game.openZone === 'chat'

    // turn to face the player
    const angle = Math.atan2(refs.playerPos.x - BOT_POSITION[0], refs.playerPos.z - BOT_POSITION[1])
    model.current.rotation.y = lerpAngle(model.current.rotation.y, angle, 1 - Math.exp(-dt * 5))

    hover.current.position.y = 0.32 + Math.sin(t * 2.2) * 0.07
    hover.current.rotation.z = Math.sin(t * 1.1) * 0.03

    // blink every few seconds
    const blink = t % 3.4 > 3.25 ? 0.12 : 1
    eyes.current.scale.y += (blink - eyes.current.scale.y) * Math.min(1, dt * 30)

    // wave hello when the player is close; arms rest by the sides otherwise
    const wave = near || talking ? 1 : 0
    const targetZ = wave ? -2.4 + Math.sin(t * 9) * 0.35 : -0.15
    armR.current.rotation.z += (targetZ - armR.current.rotation.z) * Math.min(1, dt * 10)
    armL.current.rotation.z = 0.15 + Math.sin(t * 2.2) * 0.05

    bulb.current.material.emissiveIntensity = (near || talking ? 1.4 : 0.6) + Math.sin(t * 5) * 0.3
    // the mouth flaps while the chat is open
    mouth.current.scale.y = talking ? 1 + Math.abs(Math.sin(t * 10)) * 1.6 : 1
  })

  return (
    <RigidBody type="fixed" colliders={false} position={[BOT_POSITION[0], 0, BOT_POSITION[1]]}>
      <CuboidCollider args={[0.85, 1.7, 0.7]} position={[0, 1.7, 0]} />
      <group ref={model} scale={1.4}>
        {/* glow ring on the ground under the hover jet */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.28, 0.42, 20]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.6} depthWrite={false} />
        </mesh>
        <group ref={hover} position={[0, 0.32, 0]}>
          {/* hover jet */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.2, 0.26, 8]} />
            <meshStandardMaterial color="#495057" flatShading />
          </mesh>
          {/* body */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.95, 0.9, 0.72]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0.74, 0.365]}>
            <boxGeometry args={[0.56, 0.4, 0.02]} />
            <meshStandardMaterial color={PINK} />
          </mesh>
          {/* chest lights */}
          {[-0.16, 0, 0.16].map((x, i) => (
            <mesh key={x} position={[x, 0.74, 0.38]}>
              <boxGeometry args={[0.09, 0.09, 0.02]} />
              <meshBasicMaterial color={['#ffd43b', WHITE, CYAN][i]} />
            </mesh>
          ))}
          {/* neck */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.14, 8]} />
            <meshStandardMaterial color="#868e96" flatShading />
          </mesh>
          {/* head with a screen face */}
          <mesh position={[0, 1.62, 0]} castShadow>
            <boxGeometry args={[1.08, 0.78, 0.8]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 1.62, 0.405]}>
            <boxGeometry args={[0.86, 0.56, 0.02]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          <group ref={eyes} position={[0, 1.7, 0.42]}>
            <mesh position={[-0.2, 0, 0]}>
              <boxGeometry args={[0.15, 0.18, 0.02]} />
              <meshBasicMaterial color={CYAN} />
            </mesh>
            <mesh position={[0.2, 0, 0]}>
              <boxGeometry args={[0.15, 0.18, 0.02]} />
              <meshBasicMaterial color={CYAN} />
            </mesh>
          </group>
          <mesh ref={mouth} position={[0, 1.47, 0.42]}>
            <boxGeometry args={[0.26, 0.05, 0.02]} />
            <meshBasicMaterial color={CYAN} />
          </mesh>
          {/* ear bolts */}
          {[-0.58, 0.58].map((x) => (
            <mesh key={x} position={[x, 1.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.1, 8]} />
              <meshStandardMaterial color={PINK} flatShading />
            </mesh>
          ))}
          {/* antenna */}
          <mesh position={[0, 2.16, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.34, 6]} />
            <meshStandardMaterial color="#868e96" />
          </mesh>
          <mesh ref={bulb} position={[0, 2.38, 0]} castShadow>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.8} flatShading />
          </mesh>
          {/* arms hang from the shoulders */}
          <group ref={armL} position={[-0.52, 1.02, 0]}>
            <mesh position={[-0.08, -0.26, 0]} castShadow>
              <boxGeometry args={[0.16, 0.56, 0.18]} />
              <meshStandardMaterial color="#dee2e6" />
            </mesh>
            <mesh position={[-0.08, -0.6, 0]} castShadow>
              <icosahedronGeometry args={[0.13, 0]} />
              <meshStandardMaterial color={PINK} flatShading />
            </mesh>
          </group>
          <group ref={armR} position={[0.52, 1.02, 0]}>
            <mesh position={[0.08, -0.26, 0]} castShadow>
              <boxGeometry args={[0.16, 0.56, 0.18]} />
              <meshStandardMaterial color="#dee2e6" />
            </mesh>
            <mesh position={[0.08, -0.6, 0]} castShadow>
              <icosahedronGeometry args={[0.13, 0]} />
              <meshStandardMaterial color={PINK} flatShading />
            </mesh>
          </group>
        </group>
      </group>
    </RigidBody>
  )
}
