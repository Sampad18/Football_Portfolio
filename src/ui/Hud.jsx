import { CONTENT, PROFILE, ZONES } from '../content.js'
import { refs, useGame } from '../store.js'
import { Panel } from './Panel.jsx'
import { Joystick } from './Joystick.jsx'

function StartScreen() {
  const start = useGame((s) => s.start)
  const ready = useGame((s) => s.ready)
  return (
    <div className="start">
      <div className="start-card">
        <p className="kicker">Portfolio · Matchday</p>
        <h1>{PROFILE.name}</h1>
        <p className="start-role">
          {PROFILE.role} · {PROFILE.location}
        </p>
        <p className="start-copy">
          This portfolio is a football pitch. Run to a glowing ring to open a section, or shoot the ball into a goal.
        </p>
        <ul className="keys keys-desktop">
          <li>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> <span>move</span>
          </li>
          <li>
            <kbd>Shift</kbd> <span>sprint</span>
          </li>
          <li>
            <kbd>Space</kbd> <span>kick</span>
          </li>
          <li>
            <kbd>E</kbd> <span>open section</span>
          </li>
        </ul>
        <ul className="keys keys-touch">
          <li>
            <kbd>Joystick</kbd> <span>move, push fully to sprint</span>
          </li>
          <li>
            <kbd>Kick</kbd> <span>kick the ball</span>
          </li>
          <li>
            <kbd>Tap</kbd> <span>the Open button to read a section</span>
          </li>
        </ul>
        <button className="btn btn-primary" onClick={start} disabled={!ready}>
          {ready ? 'Kick off' : 'Warming up…'}
        </button>
      </div>
    </div>
  )
}

function Menu() {
  const open = useGame((s) => s.open)
  return (
    <div className="menu">
      {ZONES.map((z) => (
        <button key={z.id} className="menu-item" onClick={() => open(z.id)}>
          <span className="dot" style={{ background: z.color }} />
          <span>
            <strong>{z.label}</strong>
            <small>{z.hint}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

export function Hud() {
  const started = useGame((s) => s.started)
  const nearZone = useGame((s) => s.nearZone)
  const openZone = useGame((s) => s.openZone)
  const menuOpen = useGame((s) => s.menuOpen)
  const goals = useGame((s) => s.goals)
  const celebrating = useGame((s) => s.celebrating)
  const open = useGame((s) => s.open)
  const toggleMenu = useGame((s) => s.toggleMenu)
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)

  if (!started) return <StartScreen />

  const near = ZONES.find((z) => z.id === nearZone)

  return (
    <div className="hud">
      <header className="topbar">
        <div className="brand">
          <span className="badge">11</span>
          <span>
            <strong>{PROFILE.name}</strong>
            <small>{PROFILE.role}</small>
          </span>
        </div>
        <div className="top-actions">
          <span className="score" title="Goals scored">
            ⚽ {goals}
          </span>
          <button className="btn" onClick={toggleMute} aria-pressed={muted}>
            <span className="wide-only">{muted ? 'Sound off' : 'Sound on'}</span>
            <span className="narrow-only" aria-label={muted ? 'Sound off' : 'Sound on'}>
              {muted ? '🔇' : '🔊'}
            </span>
          </button>
          <button className="btn" onClick={toggleMenu} aria-expanded={menuOpen}>
            {menuOpen ? 'Close' : 'Sections'}
          </button>
        </div>
      </header>

      {menuOpen && <Menu />}

      {celebrating && <div className="goal-banner">GOAL!</div>}

      {near && !openZone && !celebrating && (
        <button className="prompt" style={{ '--zone': near.color }} onClick={() => open(near.id)}>
          <kbd>E</kbd> Open {near.label}
        </button>
      )}

      {!openZone && !menuOpen && (
        <p className="hint">
          <kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> kick
        </p>
      )}

      {!openZone && !menuOpen && (
        <div className="touch">
          <Joystick />
          <button
            className="kick-btn"
            onPointerDown={(e) => {
              e.preventDefault()
              refs.kick = true
            }}
          >
            Kick
          </button>
        </div>
      )}

      {openZone && <Panel zone={ZONES.find((z) => z.id === openZone)} data={CONTENT[openZone]} />}
    </div>
  )
}
