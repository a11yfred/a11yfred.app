import { isSongPlaying } from './fiestaSongs.js'

let audioCtx = null
let masterGain = null

function ac() {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function dest(ctx) {
  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.5
    masterGain.connect(ctx.destination)
  }
  return masterGain
}

function tone(ctx, type, freq, start, dur, vol) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(vol, start + 0.01)
  g.gain.setValueAtTime(vol, start + dur - 0.02)
  g.gain.linearRampToValueAtTime(0, start + dur)
  osc.connect(g)
  g.connect(dest(ctx))
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function gooseHonk() {
  const ctx = ac()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const g = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(240, t)
  osc.frequency.linearRampToValueAtTime(200, t + 0.06)
  osc.frequency.linearRampToValueAtTime(220, t + 0.38)
  filter.type = 'bandpass'
  filter.frequency.value = 650
  filter.Q.value = 4
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.75, t + 0.02)
  g.gain.setValueAtTime(0.7, t + 0.32)
  g.gain.linearRampToValueAtTime(0, t + 0.48)
  osc.connect(filter)
  filter.connect(g)
  g.connect(dest(ctx))
  osc.start(t)
  osc.stop(t + 0.52)
}

function catHiss() {
  const ctx = ac()
  const t = ctx.currentTime
  const bufSize = Math.floor(ctx.sampleRate * 0.55)
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2800
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 6500
  bp.Q.value = 2
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.45, t + 0.04)
  g.gain.setValueAtTime(0.4, t + 0.35)
  g.gain.linearRampToValueAtTime(0, t + 0.55)
  src.connect(hp)
  hp.connect(bp)
  bp.connect(g)
  g.connect(dest(ctx))
  src.start(t)
  src.stop(t + 0.6)
}

function catMeow() {
  const ctx = ac()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(280, t)
  osc.frequency.linearRampToValueAtTime(820, t + 0.18)
  osc.frequency.linearRampToValueAtTime(580, t + 0.32)
  osc.frequency.linearRampToValueAtTime(320, t + 0.52)
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(750, t)
  filter.frequency.linearRampToValueAtTime(1300, t + 0.18)
  filter.frequency.linearRampToValueAtTime(900, t + 0.42)
  filter.Q.value = 5
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.5, t + 0.05)
  g.gain.setValueAtTime(0.48, t + 0.38)
  g.gain.linearRampToValueAtTime(0, t + 0.56)
  osc.connect(filter)
  filter.connect(g)
  g.connect(dest(ctx))
  osc.start(t)
  osc.stop(t + 0.6)
}

function fartNoise() {
  const ctx = ac()
  const t = ctx.currentTime
  const dur = 0.25 + Math.random() * 0.2
  const bufSize = Math.floor(ctx.sampleRate * (dur + 0.15))
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  // Resonant lowpass sweeps down, classic descending toot
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(320, t)
  lp.frequency.exponentialRampToValueAtTime(65, t + dur)
  lp.Q.value = 10
  // Low sawtooth adds body and flapping texture
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(85, t)
  osc.frequency.exponentialRampToValueAtTime(38, t + dur)
  const oscG = ctx.createGain()
  oscG.gain.value = 0.35
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.85, t + 0.015)
  g.gain.setValueAtTime(0.8, t + dur * 0.6)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.05)
  src.connect(lp)
  lp.connect(g)
  osc.connect(oscG)
  oscG.connect(g)
  g.connect(dest(ctx))
  src.start(t)
  src.stop(t + dur + 0.15)
  osc.start(t)
  osc.stop(t + dur + 0.15)
}

function carHorn2() {
  // Descending ahooga
  const ctx = ac()
  const t = ctx.currentTime
  ;[987, 880, 784, 698, 659].forEach((f, i) => {
    tone(ctx, 'sawtooth', f, t + i * 0.075, 0.1, 0.28)
  })
}

function wolfWhistle() {
  const ctx = ac()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  // Short rising note
  osc.frequency.setValueAtTime(750, t)
  osc.frequency.linearRampToValueAtTime(1450, t + 0.22)
  // Gap pause via gain
  osc.frequency.setValueAtTime(950, t + 0.32)
  // Swoop: up then fall
  osc.frequency.linearRampToValueAtTime(1650, t + 0.62)
  osc.frequency.exponentialRampToValueAtTime(680, t + 0.95)
  // Gain envelope: two bursts with gap
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.4, t + 0.03)
  g.gain.setValueAtTime(0.38, t + 0.2)
  g.gain.linearRampToValueAtTime(0, t + 0.28)
  g.gain.linearRampToValueAtTime(0.4, t + 0.35)
  g.gain.setValueAtTime(0.38, t + 0.88)
  g.gain.linearRampToValueAtTime(0, t + 1.0)
  osc.connect(g)
  g.connect(dest(ctx))
  osc.start(t)
  osc.stop(t + 1.05)
}

function squeakyShoe() {
  const ctx = ac()
  const t = ctx.currentTime
  const base = 1000 + Math.random() * 500
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base * 0.65, t)
  osc.frequency.linearRampToValueAtTime(base, t + 0.025)
  osc.frequency.linearRampToValueAtTime(base * 0.8, t + 0.11)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.55, t + 0.007)
  g.gain.setValueAtTime(0.5, t + 0.045)
  g.gain.linearRampToValueAtTime(0, t + 0.13)
  osc.connect(g)
  g.connect(dest(ctx))
  osc.start(t)
  osc.stop(t + 0.15)
}

function snareDrum() {
  const ctx = ac()
  const t = ctx.currentTime
  // Body: punchy sine with fast pitch drop
  const bodyOsc = ctx.createOscillator()
  const bodyG = ctx.createGain()
  bodyOsc.type = 'sine'
  bodyOsc.frequency.setValueAtTime(260, t)
  bodyOsc.frequency.exponentialRampToValueAtTime(80, t + 0.07)
  bodyG.gain.setValueAtTime(0, t)
  bodyG.gain.linearRampToValueAtTime(0.9, t + 0.003)
  bodyG.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  bodyOsc.connect(bodyG)
  bodyG.connect(dest(ctx))
  bodyOsc.start(t)
  bodyOsc.stop(t + 0.12)
  // Snare wires: filtered noise burst
  const bufSize = Math.floor(ctx.sampleRate * 0.18)
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2000
  const noiseG = ctx.createGain()
  noiseG.gain.setValueAtTime(0, t)
  noiseG.gain.linearRampToValueAtTime(0.7, t + 0.003)
  noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
  src.connect(hp)
  hp.connect(noiseG)
  noiseG.connect(dest(ctx))
  src.start(t)
  src.stop(t + 0.18)
}

const SOUNDS = [
  gooseHonk, gooseHonk,
  catHiss, catHiss,
  catMeow, catMeow,
  fartNoise, fartNoise, fartNoise,
  carHorn2, carHorn2,
  wolfWhistle, wolfWhistle,
  snareDrum, snareDrum,
]

export function playSqueak() {
  try { squeakyShoe() } catch { /* fail silently */ }
}

export function playPartySound() {
  if (isSongPlaying()) return
  try {
    SOUNDS[Math.floor(Math.random() * SOUNDS.length)]()
  } catch {
    // AudioContext unavailable or blocked, fail silently
  }
}
