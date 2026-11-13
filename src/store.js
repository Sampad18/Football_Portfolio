import { create } from 'zustand'
import { playWhistle, setMuted, unlockAudio } from './sound.js'

// Mutable, non-reactive handles shared between game objects (read in useFrame).
export const refs = {
  ball: null, // Rapier rigid body of the ball
  player: null, // Rapier rigid body of the player
  joystick: { x: 0, z: 0 }, // touch joystick vector, -1..1
  kick: false, // set true for one frame to request a kick
  playerPos: { x: 0, z: 0 },
}

export const useGame = create((set, get) => ({
  ready: false, // physics world has loaded
  started: false,
  nearZone: null, // id of the zone the player is standing in
  openZone: null, // id of the zone whose panel is open
  menuOpen: false,
  goals: 0,
  celebrating: false,
  setReady: () => set({ ready: true }),
  muted: false,
  toggleMute: () => {
    const muted = !get().muted
    setMuted(muted)
    set({ muted })
  },
  start: () => {
    unlockAudio()
    set({ started: true })
  },
  setNearZone: (id) => {
    if (get().nearZone !== id) set({ nearZone: id })
  },
  open: (id) => set({ openZone: id, menuOpen: false }),
  close: () => set({ openZone: null }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
  scoreGoal: (zoneId) => {
    if (get().celebrating) return
    set((s) => ({ goals: s.goals + 1, celebrating: true }))
    playWhistle()
    setTimeout(() => {
      // put the ball back on the centre spot
      const ball = refs.ball
      if (ball) {
        ball.setTranslation({ x: 0, y: 1.5, z: 3 }, true)
        ball.setLinvel({ x: 0, y: 0, z: 0 }, true)
        ball.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
      set({ celebrating: false, openZone: zoneId })
    }, 1600)
  },
}))

if (import.meta.env.DEV) window.__game = { refs, useGame, playWhistle }
