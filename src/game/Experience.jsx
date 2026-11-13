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
import { DayNight } from './DayNight.jsx'

const SKY = '#9bdcff'

export function Experience() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ fov: 44, near: 0.5, far: 260, position: [0, 15, 19.2] }}
      onCreated={({ camera }) => camera.lookAt(0, 1, 2.2)}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 70, 170]} />
      <DayNight />
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
