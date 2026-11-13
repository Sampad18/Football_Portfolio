import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Field } from './Field.jsx'
import { Stadium } from './Stadium.jsx'
import { Goals } from './Goals.jsx'
import { Zones } from './Zones.jsx'
import { Player } from './Player.jsx'
import { Ball } from './Ball.jsx'
import { Npcs } from './Npcs.jsx'
import { Cones } from './Cones.jsx'
import { Bot } from './Bot.jsx'

const SKY = '#9bdcff'

export function Experience() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 44, near: 0.5, far: 260, position: [0, 15, 19.2] }}
      onCreated={({ camera }) => camera.lookAt(0, 1, 2.2)}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 70, 170]} />
      <hemisphereLight args={['#e8f7ff', '#5fae52', 1.1]} />
      <directionalLight
        position={[22, 34, 18]}
        intensity={2.4}
        color="#fff4dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={36}
        shadow-camera-bottom={-44}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0004}
      />
      <Stadium />
      <Zones />
      <Suspense fallback={null}>
        <Physics gravity={[0, -24, 0]}>
          <Field />
          <Goals />
          <Player />
          <Ball />
          <Npcs />
          <Cones />
          <Bot />
        </Physics>
      </Suspense>
    </Canvas>
  )
}
