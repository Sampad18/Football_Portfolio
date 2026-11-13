import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../store.js'
import { makeTextTexture, seeded } from './util.js'

const CROWD_COLORS = ['#ff6b6b', '#ffd43b', '#4dabf7', '#ffffff', '#69db7c', '#b197fc', '#ffa94d', '#f783ac']
const TIERS = 5

function Stand() {
  const crowd = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const fans = useMemo(() => {
    const rand = seeded(7)
    const list = []
    for (let tier = 0; tier < TIERS; tier++) {
      for (let x = -35; x <= 35; x += 1.25) {
        if (rand() < 0.12) continue // a few empty seats
        list.push({
          x: x + (rand() - 0.5) * 0.3,
          y: 1.2 * (tier + 1) + 0.35,
          z: -27.2 - tier * 2.4,
          phase: rand() * Math.PI * 2,
          color: CROWD_COLORS[Math.floor(rand() * CROWD_COLORS.length)],
        })
      }
    }
    return list
  }, [])

  useLayoutEffect(() => {
    const color = new THREE.Color()
    fans.forEach((f, i) => crowd.current.setColorAt(i, color.set(f.color)))
    crowd.current.instanceColor.needsUpdate = true
  }, [fans])

  useFrame(({ clock }) => {
    const celebrating = useGame.getState().celebrating
    const t = clock.elapsedTime
    for (let i = 0; i < fans.length; i++) {
      const f = fans[i]
      const hop = celebrating ? Math.abs(Math.sin(t * 9 + f.phase)) * 0.7 : Math.max(0, Math.sin(t * 2.2 + f.phase)) * 0.1
      dummy.position.set(f.x, f.y + hop, f.z)
      dummy.updateMatrix()
      crowd.current.setMatrixAt(i, dummy.matrix)
    }
    crowd.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {Array.from({ length: TIERS }, (_, tier) => (
        <mesh key={tier} position={[0, 0.6 * (tier + 1), -27.4 - tier * 2.4]} castShadow receiveShadow>
          <boxGeometry args={[76, 1.2 * (tier + 1), 2.4]} />
          <meshStandardMaterial color={tier % 2 ? '#dfe7f1' : '#c9d5e3'} />
        </mesh>
      ))}
      {/* back wall and roof */}
      <mesh position={[0, 5.2, -39.6]} castShadow>
        <boxGeometry args={[76, 10.4, 0.6]} />
        <meshStandardMaterial color="#3d5a80" />
      </mesh>
      <mesh position={[0, 10.6, -35.5]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[78, 0.4, 9]} />
        <meshStandardMaterial color="#e63946" />
      </mesh>
      <instancedMesh ref={crowd} args={[null, null, fans.length]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.6, 0.75, 0.5]} />
        <meshStandardMaterial />
      </instancedMesh>
    </group>
  )
}

function AdBoards() {
  const words = ['PYTHON', 'SQL', 'TABLEAU', 'EXCEL', 'POWER BI', 'LEAN SIX SIGMA', 'DATA', 'ANALYTICS']
  const colors = ['#1c2541', '#e63946', '#3a86ff', '#2a9d8f', '#f4a261', '#6a4c93', '#1c2541', '#e63946']
  const boards = useMemo(
    () =>
      words.map((w, i) => ({
        x: -31.5 + i * 9,
        tex: makeTextTexture(w, { width: 512, height: 72, bg: colors[i], fg: '#ffffff', font: 46 }),
      })),
    [],
  )
  return boards.map((b) => (
    <group key={b.x} position={[b.x, 0.62, -22.3]}>
      <mesh castShadow>
        <boxGeometry args={[8.8, 1.24, 0.25]} />
        <meshStandardMaterial color="#1c2541" />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[8.8, 1.24]} />
        <meshStandardMaterial map={b.tex} />
      </mesh>
    </group>
  ))
}

function Scoreboard() {
  const goals = useGame((s) => s.goals)
  const tex = useMemo(
    () =>
      makeTextTexture(
        [
          { text: 'SAMPAD FC', size: 44, color: '#ffd23f' },
          { text: `${goals}  –  0`, size: 92 },
          { text: 'EDUCATION & HIGHLIGHTS', size: 26, color: '#ffa94d' },
        ],
        { width: 640, height: 320, bg: '#101728' },
      ),
    [goals],
  )
  return (
    <group position={[11, 0, -24.4]}>
      {[-3.6, 3.6].map((x) => (
        <mesh key={x} position={[x, 3.4, 0]} castShadow>
          <boxGeometry args={[0.35, 6.8, 0.35]} />
          <meshStandardMaterial color="#495057" />
        </mesh>
      ))}
      <mesh position={[0, 7.4, 0]} castShadow>
        <boxGeometry args={[10, 5, 0.6]} />
        <meshStandardMaterial color="#212a3e" />
      </mesh>
      <mesh position={[0, 7.4, 0.32]}>
        <planeGeometry args={[9.4, 4.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}

function Dugout() {
  return (
    <group position={[-11, 0, -24.2]}>
      <mesh position={[0, 1.3, -0.9]} castShadow>
        <boxGeometry args={[7.4, 2.6, 0.2]} />
        <meshStandardMaterial color="#7950f2" />
      </mesh>
      {[-3.7, 3.7].map((x) => (
        <mesh key={x} position={[x, 1.3, 0]} castShadow>
          <boxGeometry args={[0.2, 2.6, 2]} />
          <meshStandardMaterial color="#7950f2" />
        </mesh>
      ))}
      <mesh position={[0, 2.7, 0.1]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[7.8, 0.18, 2.5]} />
        <meshStandardMaterial color="#d0bfff" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0.45, -0.3]} castShadow>
        <boxGeometry args={[6.6, 0.25, 0.8]} />
        <meshStandardMaterial color="#f1f3f5" />
      </mesh>
      {[-2.4, -0.8, 0.8, 2.4].map((x, i) => (
        <mesh key={x} position={[x, 0.95, -0.35]} castShadow>
          <boxGeometry args={[0.7, 0.75, 0.5]} />
          <meshStandardMaterial color={['#e63946', '#ffd43b', '#e63946', '#4dabf7'][i]} />
        </mesh>
      ))}
      {/* cones and a spare ball out front */}
      {[-2.6, -1.8, -1].map((x) => (
        <mesh key={x} position={[x, 0.3, 1.6]} castShadow>
          <coneGeometry args={[0.28, 0.6, 6]} />
          <meshStandardMaterial color="#ff922b" flatShading />
        </mesh>
      ))}
    </group>
  )
}

function CornerFlag({ x, z, color = '#ffd43b', big = false }) {
  const flag = useRef()
  useFrame(({ clock }) => {
    flag.current.rotation.y = Math.sin(clock.elapsedTime * 3 + x) * 0.35
  })
  const h = big ? 4.2 : 2
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, h, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <group ref={flag} position={[0, h - (big ? 0.6 : 0.3), 0]}>
        <mesh position={[big ? 0.75 : 0.35, 0, 0]} castShadow>
          <boxGeometry args={[big ? 1.5 : 0.7, big ? 1 : 0.5, 0.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  )
}

function Scenery() {
  const { trees, hills, bushes } = useMemo(() => {
    const rand = seeded(42)
    const trees = []
    for (let i = 0; i < 34; i++) {
      const left = i % 2 === 0
      trees.push({
        x: (left ? -1 : 1) * (40 + rand() * 26),
        z: -34 + rand() * 54,
        s: 0.8 + rand() * 0.9,
        c: ['#2f9e44', '#37b24d', '#2b8a3e'][Math.floor(rand() * 3)],
      })
    }
    const hills = []
    for (let i = 0; i < 9; i++) {
      hills.push({ x: -90 + i * 23 + rand() * 8, z: -62 - rand() * 14, s: 14 + rand() * 12, c: ['#74c69d', '#52b788', '#95d5b2'][i % 3] })
    }
    const bushes = []
    for (let i = 0; i < 18; i++) {
      bushes.push({ x: -34 + i * 4 + rand() * 2, z: 25.5 + rand() * 2, s: 0.5 + rand() * 0.5 })
    }
    return { trees, hills, bushes }
  }, [])

  return (
    <>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 1.8, 6]} />
            <meshStandardMaterial color="#8d5a3b" flatShading />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.8, 3, 7]} />
            <meshStandardMaterial color={t.c} flatShading />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <coneGeometry args={[1.3, 2.4, 7]} />
            <meshStandardMaterial color={t.c} flatShading />
          </mesh>
        </group>
      ))}
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, h.s * 0.25, h.z]} scale={[h.s, h.s * 0.55, h.s]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={h.c} flatShading />
        </mesh>
      ))}
      {bushes.map((b, i) => (
        <mesh key={i} position={[b.x, b.s * 0.5, b.z]} scale={b.s} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#40c057" flatShading />
        </mesh>
      ))}
    </>
  )
}

function Clouds() {
  const group = useRef()
  const clouds = useMemo(() => {
    const rand = seeded(99)
    return Array.from({ length: 8 }, () => ({
      x: -80 + rand() * 160,
      y: 22 + rand() * 10,
      z: -60 + rand() * 30,
      s: 2.5 + rand() * 2.5,
      v: 0.4 + rand() * 0.6,
    }))
  }, [])
  useFrame((_, dt) => {
    group.current.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt
      if (c.position.x > 95) c.position.x = -95
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[
            [0, 0, 0, 1],
            [1.1, -0.1, 0.2, 0.75],
            [-1.1, -0.15, -0.1, 0.7],
            [0.4, 0.45, -0.2, 0.65],
          ].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffffff" flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function Stadium() {
  return (
    <>
      <Stand />
      <AdBoards />
      <Scoreboard />
      <Dugout />
      <CornerFlag x={-30} z={-20} />
      <CornerFlag x={30} z={-20} />
      <CornerFlag x={-30} z={20} />
      <CornerFlag x={30} z={20} color="#63e6be" big />
      <Scenery />
      <Clouds />
    </>
  )
}
