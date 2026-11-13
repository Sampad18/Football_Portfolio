import { useEffect } from 'react'
import { Experience } from './game/Experience.jsx'
import { Hud } from './ui/Hud.jsx'
import { useGame } from './store.js'

const DAY_NIGHT_SECONDS = 90

export default function App() {
  // Day turns to night (and back) every 90 seconds, until the visitor picks a mode with the button.
  useEffect(() => {
    const id = setInterval(() => useGame.getState().autoFlipNight(), DAY_NIGHT_SECONDS * 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app">
      <Experience />
      <Hud />
    </div>
  )
}
