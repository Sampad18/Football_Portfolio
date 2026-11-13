import { useEffect, useRef } from 'react'
import { refs } from '../store.js'

const RADIUS = 46

// On-screen thumbstick for touch devices. Writes into refs.joystick.
export function Joystick() {
  const base = useRef()
  const knob = useRef()
  const pointer = useRef(null)

  useEffect(
    () => () => {
      refs.joystick.x = 0
      refs.joystick.z = 0
    },
    [],
  )

  const move = (e) => {
    if (pointer.current !== e.pointerId) return
    const rect = base.current.getBoundingClientRect()
    let dx = e.clientX - (rect.left + rect.width / 2)
    let dy = e.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS
      dy = (dy / len) * RADIUS
    }
    knob.current.style.transform = `translate(${dx}px, ${dy}px)`
    refs.joystick.x = dx / RADIUS
    refs.joystick.z = dy / RADIUS
  }

  const end = (e) => {
    if (pointer.current !== e.pointerId) return
    pointer.current = null
    knob.current.style.transform = 'translate(0px, 0px)'
    refs.joystick.x = 0
    refs.joystick.z = 0
  }

  return (
    <div
      ref={base}
      className="joystick"
      onPointerDown={(e) => {
        pointer.current = e.pointerId
        base.current.setPointerCapture(e.pointerId)
        move(e)
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div ref={knob} className="joystick-knob" />
    </div>
  )
}
