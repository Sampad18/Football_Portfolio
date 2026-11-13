import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { refs, useGame } from '../store.js'
import { seeded } from './util.js'

// Everything that changes between day and night: sky, sun and moon, stars and the four floodlights.
// useGame().night is the target; `amount` eases from 0 (day) to 1 (night) so the change is a visible sunset.

const TRANSITION_SECONDS = 7

const SKY = { day: new THREE.Color('#9bdcff'), dusk: new THREE.Color('#ff9d6c'), night: new THREE.Color('#0a0f2c') }
const SUN = { day: new THREE.Color('#fff4dc'), dusk: new THREE.Color('#ff8a4c'), night: new THREE.Color('#9db4ff') }
const HEMI_SKY = { day: new THREE.Color('#e8f7ff'), night: new THREE.Color('#33407a') }
const HEMI_GROUND = { day: new THREE.Color('#5fae52'), night: new THREE.Color('#10202a') }
const SUN_POS = {
  day: new THREE.Vector3(22, 34, 18),
  dusk: new THREE.Vector3(46, 9, 14),
  night: new THREE.Vector3(-18, 32, 14), // the moon
}

const LAMP_OFF = new THREE.Color('#5b6068')
const LAMP_COLD = new THREE.Color('#a9c8ff')
const LAMP_WARM = new THREE.Color('#fff6dc')
const FLOOD_INTENSITY = 1250

// Pole position and the spot on the pitch each light aims at.
const FLOODLIGHTS = [
  { pole: [-41, -30], aim: [-15, 0, -8] },
  { pole: [41, -30], aim: [15, 0, -8] },
  { pole: [-45, 30], aim: [-15, 0, 9] },
  { pole: [45, 30], aim: [15, 0, 9] },
]
const LAMP_HEIGHT = 17

const smooth = (x) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

// Blend day -> dusk -> night, with dusk at the halfway point.
function threeWay(out, set, e) {
  if (e < 0.5) return out.copy(set.day).lerp(set.dusk, smooth(e / 0.5))
  return out.copy(set.dusk).lerp(set.night, smooth((e - 0.5) / 0.5))
}

// How bright a stadium lamp is `t` seconds after it is switched on:
// it strikes with a stutter, then warms up slowly like a real metal-halide lamp.
function lampPower(t) {
  if (t <= 0) return 0
  if (t < 0.75) return Math.sin(t * 61) + Math.sin(t * 37) > 0.25 ? 0.32 : 0.03
  return 0.3 + 0.7 * smooth((t - 0.75) / 2.8)
}

function Floodlight({ config, index, register }) {
  const head = useRef()
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(...config.aim)
    return o
  }, [config])
  // one material shared by all eight lamps, so they light together
  const lampMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: LAMP_OFF, fog: false }), [])
  const beamMat = useRef()
  const spot = useRef()

  useLayoutEffect(() => {
    head.current.lookAt(target.position)
    register(index, { spot, lampMaterial, beamMat })
  }, [register, index, target, lampMaterial])

  const [x, z] = config.pole
  return (
    <>
      <primitive object={target} />
      <mesh position={[x, LAMP_HEIGHT / 2, z]} castShadow>
        <cylinderGeometry args={[0.25, 0.42, LAMP_HEIGHT, 6]} />
        <meshStandardMaterial color="#868e96" flatShading />
      </mesh>
      <spotLight
        ref={spot}
        position={[x, LAMP_HEIGHT, z]}
        target={target}
        intensity={0}
        angle={0.56}
        penumbra={0.95}
        decay={2}
        distance={130}
      />
      {/* lamp head, turned to face its patch of the pitch */}
      <group ref={head} position={[x, LAMP_HEIGHT, z]}>
        <mesh castShadow>
          <boxGeometry args={[4.4, 2.6, 0.6]} />
          <meshStandardMaterial color="#343a40" />
        </mesh>
        {[-1.5, -0.5, 0.5, 1.5].flatMap((bx) =>
          [-0.6, 0.6].map((by) => (
            <mesh key={`${bx},${by}`} position={[bx, by, 0.32]} material={lampMaterial}>
              <boxGeometry args={[0.8, 0.9, 0.08]} />
            </mesh>
          )),
        )}
        {/* the visible beam */}
        <mesh position={[0, 0, 21]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[13, 42, 24, 1, true]} />
          <meshBasicMaterial
            ref={beamMat}
            color="#fff1c9"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      </group>
    </>
  )
}

export function DayNight() {
  const hemi = useRef()
  const sun = useRef()
  const stars = useRef()
  const moon = useRef()
  const standLight = useRef()
  const amount = useRef(0)
  const lamps = useRef([])
  const timers = useRef(FLOODLIGHTS.map(() => 0))
  const powers = useRef(FLOODLIGHTS.map(() => 0))
  const tmp = useMemo(() => new THREE.Color(), [])
  const register = useMemo(() => (index, lamp) => (lamps.current[index] = lamp), [])

  const starPositions = useMemo(() => {
    const rand = seeded(2024)
    const pts = new Float32Array(420 * 3)
    for (let i = 0; i < 420; i++) {
      pts[i * 3] = -190 + rand() * 380
      pts[i * 3 + 1] = 14 + rand() * 95
      pts[i * 3 + 2] = -95 - rand() * 70
    }
    return pts
  }, [])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const wantNight = useGame.getState().night
    const step = dt / TRANSITION_SECONDS
    amount.current = wantNight ? Math.min(1, amount.current + step) : Math.max(0, amount.current - step)
    const a = amount.current
    refs.nightAmount = a // 0 = day, 1 = night; handy for other objects and for testing
    const e = smooth(a)

    // sky and haze
    threeWay(tmp, SKY, a)
    state.scene.background.copy(tmp)
    state.scene.fog.color.copy(tmp)

    // the sun sinks and reddens, then the moon takes over
    threeWay(sun.current.color, SUN, a)
    sun.current.intensity = a < 0.5 ? 2.4 - 0.9 * smooth(a / 0.5) : 1.5 - 1.28 * smooth((a - 0.5) / 0.5)
    if (a < 0.5) sun.current.position.lerpVectors(SUN_POS.day, SUN_POS.dusk, smooth(a / 0.5))
    else sun.current.position.lerpVectors(SUN_POS.dusk, SUN_POS.night, smooth((a - 0.5) / 0.5))

    hemi.current.intensity = 1.1 - 0.9 * e
    hemi.current.color.copy(HEMI_SKY.day).lerp(HEMI_SKY.night, e)
    hemi.current.groundColor.copy(HEMI_GROUND.day).lerp(HEMI_GROUND.night, e)

    const starlight = smooth((a - 0.55) / 0.45)
    stars.current.material.opacity = starlight * (0.8 + Math.sin(state.clock.elapsedTime * 2.3) * 0.12)
    moon.current.material.opacity = starlight

    // floodlights strike one after another once it is getting dark, and cut out when day returns
    const lightsOn = wantNight ? a > 0.42 : a > 0.6
    let total = 0
    for (let i = 0; i < lamps.current.length; i++) {
      const lamp = lamps.current[i]
      if (!lamp?.spot.current) continue
      if (lightsOn) {
        timers.current[i] += dt
        powers.current[i] = lampPower(timers.current[i] - i * 0.55)
      } else {
        timers.current[i] = 0
        powers.current[i] = Math.max(0, powers.current[i] - dt * 2.5)
      }
      const p = powers.current[i]
      total += p
      lamp.spot.current.intensity = p * FLOOD_INTENSITY
      lamp.spot.current.color.copy(LAMP_COLD).lerp(LAMP_WARM, smooth((p - 0.3) / 0.7))
      lamp.lampMaterial.color.copy(LAMP_OFF).lerp(p < 0.35 ? LAMP_COLD : LAMP_WARM, Math.min(1, p * 2.2))
      if (lamp.beamMat.current) lamp.beamMat.current.opacity = p * 0.085
    }
    // a soft glow on the stand so the crowd is not left in the dark
    standLight.current.intensity = (total / FLOODLIGHTS.length) * 170
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#e8f7ff', '#5fae52', 1.1]} />
      <directionalLight
        ref={sun}
        position={[22, 34, 18]}
        intensity={2.4}
        color="#fff4dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={44}
        shadow-camera-bottom={-48}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-bias={-0.0004}
      />
      <pointLight ref={standLight} position={[0, 15, -22]} intensity={0} color="#fff1d0" decay={2} distance={70} />

      {FLOODLIGHTS.map((config, i) => (
        <Floodlight key={i} index={i} config={config} register={register} />
      ))}

      <points ref={stars} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={1.6} sizeAttenuation transparent opacity={0} depthWrite={false} fog={false} />
      </points>
      <mesh ref={moon} position={[-70, 62, -150]}>
        <icosahedronGeometry args={[9, 1]} />
        <meshBasicMaterial color="#f6f1cf" transparent opacity={0} fog={false} />
      </mesh>
    </>
  )
}
