import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { makeTextTexture } from './util.js'

// A chunky low-poly footballer built from boxes. Feet are at y = 0, the face looks down +z.
// `motion` is a plain mutable object: { speed, kick } that the owner updates every frame.
export function Footballer({
  jersey = '#e03131',
  shorts = '#ffffff',
  socks = '#e03131',
  skin = '#e3a977',
  hair = '#2b1d0e',
  number = null,
  motion,
}) {
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const body = useRef()
  const phase = useRef(Math.random() * 10)

  const numberTex = useMemo(
    () => (number == null ? null : makeTextTexture(String(number), { width: 128, height: 128, bg: null, fg: '#ffffff', font: 96 })),
    [number],
  )

  useFrame((_, dt) => {
    const speed = motion?.speed ?? 0
    const amount = Math.min(1, speed / 5)
    phase.current += dt * (4 + speed * 1.3)
    const swing = Math.sin(phase.current) * 0.95 * amount
    legL.current.rotation.x = swing
    legR.current.rotation.x = -swing
    armL.current.rotation.x = -swing * 0.9
    armR.current.rotation.x = swing * 0.9
    // gentle breathing when idle, a bounce when running
    body.current.position.y = Math.abs(Math.sin(phase.current)) * 0.07 * amount + Math.sin(phase.current * 0.5) * 0.015 * (1 - amount)
    // referee pose: right hand brings the whistle to the mouth, left arm points to the centre spot
    const w = motion?.whistle ?? 0
    if (w > 0.001) {
      armR.current.rotation.x += (-2.5 - armR.current.rotation.x) * w
      armR.current.rotation.z = -0.5 * w
      armL.current.rotation.x += (-1.45 - armL.current.rotation.x) * w
      legL.current.rotation.x *= 1 - w
      legR.current.rotation.x *= 1 - w
      // lean back and puff with each blast
      body.current.rotation.x = -0.12 * w + Math.sin(phase.current * 6) * 0.02 * w
    } else {
      armR.current.rotation.z = 0
      body.current.rotation.x = 0
    }
    if (motion && motion.kick > 0) {
      legR.current.rotation.x = -1.5 * Math.sin(motion.kick * Math.PI)
      motion.kick = Math.max(0, motion.kick - dt * 3.5)
    }
  })

  return (
    <group ref={body}>
      {/* legs */}
      <group ref={legL} position={[-0.15, 0.58, 0]}>
        <mesh castShadow position={[0, -0.16, 0]}>
          <boxGeometry args={[0.2, 0.32, 0.22]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh castShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[0.22, 0.2, 0.24]} />
          <meshStandardMaterial color={socks} />
        </mesh>
        <mesh castShadow position={[0, -0.53, 0.05]}>
          <boxGeometry args={[0.23, 0.1, 0.36]} />
          <meshStandardMaterial color="#22252b" />
        </mesh>
      </group>
      <group ref={legR} position={[0.15, 0.58, 0]}>
        <mesh castShadow position={[0, -0.16, 0]}>
          <boxGeometry args={[0.2, 0.32, 0.22]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh castShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[0.22, 0.2, 0.24]} />
          <meshStandardMaterial color={socks} />
        </mesh>
        <mesh castShadow position={[0, -0.53, 0.05]}>
          <boxGeometry args={[0.23, 0.1, 0.36]} />
          <meshStandardMaterial color="#22252b" />
        </mesh>
      </group>
      {/* shorts */}
      <mesh castShadow position={[0, 0.66, 0]}>
        <boxGeometry args={[0.58, 0.24, 0.36]} />
        <meshStandardMaterial color={shorts} />
      </mesh>
      {/* torso */}
      <mesh castShadow position={[0, 1.03, 0]}>
        <boxGeometry args={[0.62, 0.52, 0.38]} />
        <meshStandardMaterial color={jersey} />
      </mesh>
      {numberTex && (
        <mesh position={[0, 1.05, -0.195]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.36, 0.36]} />
          <meshBasicMaterial map={numberTex} transparent />
        </mesh>
      )}
      {/* arms */}
      <group ref={armL} position={[-0.4, 1.24, 0]}>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.18, 0.24, 0.22]} />
          <meshStandardMaterial color={jersey} />
        </mesh>
        <mesh castShadow position={[0, -0.36, 0]}>
          <boxGeometry args={[0.15, 0.3, 0.17]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={armR} position={[0.4, 1.24, 0]}>
        <mesh castShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[0.18, 0.24, 0.22]} />
          <meshStandardMaterial color={jersey} />
        </mesh>
        <mesh castShadow position={[0, -0.36, 0]}>
          <boxGeometry args={[0.15, 0.3, 0.17]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      {/* head */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <boxGeometry args={[0.66, 0.6, 0.6]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh castShadow position={[0, 1.93, -0.02]}>
        <boxGeometry args={[0.7, 0.16, 0.66]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh castShadow position={[0, 1.72, -0.28]}>
        <boxGeometry args={[0.7, 0.34, 0.12]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      {/* eyes and smile */}
      <mesh position={[-0.15, 1.64, 0.305]}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
        <meshBasicMaterial color="#1b1b1f" />
      </mesh>
      <mesh position={[0.15, 1.64, 0.305]}>
        <boxGeometry args={[0.08, 0.1, 0.02]} />
        <meshBasicMaterial color="#1b1b1f" />
      </mesh>
      <mesh position={[0, 1.47, 0.305]}>
        <boxGeometry args={[0.2, 0.04, 0.02]} />
        <meshBasicMaterial color="#7a3b2e" />
      </mesh>
      {/* cheeks */}
      <mesh position={[-0.24, 1.54, 0.304]}>
        <boxGeometry args={[0.08, 0.05, 0.02]} />
        <meshBasicMaterial color="#f08c7a" />
      </mesh>
      <mesh position={[0.24, 1.54, 0.304]}>
        <boxGeometry args={[0.08, 0.05, 0.02]} />
        <meshBasicMaterial color="#f08c7a" />
      </mesh>
    </group>
  )
}
