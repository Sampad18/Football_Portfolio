import { CuboidCollider, RigidBody } from '@react-three/rapier'

const LINE = '#f8fff4'

function Line({ x = 0, z = 0, w, d }) {
  return (
    <mesh position={[x, 0.025, z]} receiveShadow>
      <boxGeometry args={[w, 0.02, d]} />
      <meshStandardMaterial color={LINE} />
    </mesh>
  )
}

function Box({ side }) {
  // penalty area and six-yard box for one end
  const gx = side * 30
  return (
    <>
      <Line x={gx - side * 9} w={0.2} d={22} />
      <Line x={gx - side * 4.5} z={11} w={9} d={0.2} />
      <Line x={gx - side * 4.5} z={-11} w={9} d={0.2} />
      <Line x={gx - side * 3.5} w={0.2} d={11} />
      <Line x={gx - side * 1.75} z={5.5} w={3.5} d={0.2} />
      <Line x={gx - side * 1.75} z={-5.5} w={3.5} d={0.2} />
      <mesh position={[gx - side * 6.5, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 12]} />
        <meshStandardMaterial color={LINE} />
      </mesh>
    </>
  )
}

export function Field() {
  const stripes = Array.from({ length: 12 }, (_, i) => i)
  return (
    <>
      {/* physics: the ground and invisible walls around the playable area */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[60, 0.5, 45]} position={[0, -0.5, 0]} friction={1} />
        <CuboidCollider args={[40, 8, 0.5]} position={[0, 8, -21.6]} restitution={0.4} />
        <CuboidCollider args={[40, 8, 0.5]} position={[0, 8, 23.5]} restitution={0.4} />
        <CuboidCollider args={[0.5, 8, 26]} position={[35.5, 8, 0]} restitution={0.4} />
        <CuboidCollider args={[0.5, 8, 26]} position={[-35.5, 8, 0]} restitution={0.4} />
        <CuboidCollider args={[40, 0.5, 26]} position={[0, 16, 0]} />
      </RigidBody>

      {/* surrounding ground */}
      <mesh position={[0, -0.26, -10]} receiveShadow>
        <boxGeometry args={[220, 0.5, 170]} />
        <meshStandardMaterial color="#6cc35b" />
      </mesh>
      {/* warm-up track around the pitch */}
      <mesh position={[0, -0.005, 0.8]} receiveShadow>
        <boxGeometry args={[73, 0.02, 47]} />
        <meshStandardMaterial color="#e8946a" />
      </mesh>
      {/* mown stripes */}
      {stripes.map((i) => (
        <mesh key={i} position={[-27.5 + i * 5, 0.005, 0]} receiveShadow>
          <boxGeometry args={[5, 0.02, 40]} />
          <meshStandardMaterial color={i % 2 ? '#58b84f' : '#4fae48'} />
        </mesh>
      ))}

      {/* markings */}
      <Line z={20} w={60.2} d={0.2} />
      <Line z={-20} w={60.2} d={0.2} />
      <Line x={30} w={0.2} d={40.2} />
      <Line x={-30} w={0.2} d={40.2} />
      <Line w={0.2} d={40} />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[5.4, 5.6, 48]} />
        <meshStandardMaterial color={LINE} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color={LINE} />
      </mesh>
      <Box side={1} />
      <Box side={-1} />
    </>
  )
}
