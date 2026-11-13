import { ConeCollider, CuboidCollider, RigidBody } from '@react-three/rapier'

// Training cones along the near touchline. They are loose, so the player and ball knock them over.
const CONES = [
  ...Array.from({ length: 9 }, (_, i) => [-16 + i * 4, 21.6]),
  // a little slalom gate by each corner
  [-26, 21.2],
  [-24.5, 22.4],
  [-23, 21.2],
  [20, 22.3],
  [21.5, 21.3],
  [23, 22.3],
  // behind the goals
  [-33, -7],
  [-33.4, 7],
  [33, -7],
  [33.4, 7],
]

function Cone({ position }) {
  return (
    <RigidBody colliders={false} position={[position[0], 0.05, position[1]]} linearDamping={0.4} angularDamping={0.5}>
      <ConeCollider args={[0.36, 0.3]} position={[0, 0.4, 0]} mass={0.25} friction={0.9} restitution={0.2} />
      <CuboidCollider args={[0.34, 0.03, 0.34]} position={[0, 0.03, 0]} mass={0.25} friction={0.9} />
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.68, 0.06, 0.68]} />
        <meshStandardMaterial color="#f76707" />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.3, 0.72, 8]} />
        <meshStandardMaterial color="#ff922b" flatShading />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.165, 0.215, 0.12, 8]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
    </RigidBody>
  )
}

export function Cones() {
  return CONES.map((p, i) => <Cone key={i} position={p} />)
}
