// Sounds are generated in code with the Web Audio API, so there are no audio files to load.
let ctx = null
let muted = false

// Browsers only allow sound after a click or key press, so this is called from "Kick off".
export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) ctx = new AudioCtx()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
}

export function setMuted(value) {
  muted = value
}

// One blast of a pea whistle: two close high tones with a fast warble, plus a little breath noise.
function blast(start, duration) {
  const out = ctx.createGain()
  out.gain.setValueAtTime(0, start)
  out.gain.linearRampToValueAtTime(0.025, start + 0.02)
  out.gain.setValueAtTime(0.025, start + duration - 0.05)
  out.gain.linearRampToValueAtTime(0, start + duration)
  out.connect(ctx.destination)

  // the warble made by the pea rattling inside the whistle
  const warble = ctx.createGain()
  warble.gain.value = 0.7
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 42
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.value = 0.3
  lfo.connect(lfoDepth).connect(warble.gain)
  warble.connect(out)

  for (const freq of [2850, 3080]) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * 0.97, start)
    osc.frequency.linearRampToValueAtTime(freq, start + 0.04)
    osc.connect(warble)
    osc.start(start)
    osc.stop(start + duration)
  }

  const noise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noise.buffer = buffer
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 3000
  band.Q.value = 4
  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.25
  noise.connect(band).connect(noiseGain).connect(out)
  noise.start(start)

  lfo.start(start)
  lfo.stop(start + duration)
}

// Whistle patterns, as [start delay, length] in seconds for each blast.
const PATTERNS = {
  single: [[0, 0.6]],
  shortLong: [
    [0, 0.22],
    [0.32, 0.85],
  ],
}
const GOAL_WHISTLE = 'single' // change to 'shortLong' for the two-blast version

export function playWhistle() {
  if (!ctx || muted) return false
  const now = ctx.currentTime + 0.02
  for (const [delay, length] of PATTERNS[GOAL_WHISTLE]) blast(now + delay, length)
  return true
}
