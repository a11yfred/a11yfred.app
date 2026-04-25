let songCtx = null

function getCtx() {
  if (!songCtx) songCtx = new AudioContext()
  if (songCtx.state === 'suspended') songCtx.resume()
  return songCtx
}

function makeDistortionCurve(k = 350) {
  const n = 512
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

function guitar(ctx, dest, hz, t, dur) {
  // Mix root + 5th before distortion — avoids harsh intermodulation from separate shapers
  const mixer = ctx.createGain()
  mixer.gain.value = 1

  for (const [mult, vol] of [[1, 0.55], [1.4983, 0.38]]) {
    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = hz * mult
    og.gain.value = vol
    osc.connect(og)
    og.connect(mixer)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  // Very light waveshaper + lowpass — sawtooth already has harmonics
  const dist = ctx.createWaveShaper()
  dist.curve = makeDistortionCurve(30)
  dist.oversample = '2x'

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1800

  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.005)
  g.gain.setValueAtTime(0.19, t + dur - 0.02)
  g.gain.linearRampToValueAtTime(0, t + dur)

  mixer.connect(dist)
  dist.connect(lp)
  lp.connect(g)
  g.connect(dest)
}

function bass(ctx, dest, hz, t, dur) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = hz / 2
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.5, t + 0.008)
  g.gain.setValueAtTime(0.45, t + dur - 0.03)
  g.gain.linearRampToValueAtTime(0, t + dur)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function kick(ctx, dest, t) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.07)
  g.gain.setValueAtTime(0.75, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + 0.12)
}

function snare(ctx, dest, t) {
  const bOsc = ctx.createOscillator()
  const bG = ctx.createGain()
  bOsc.type = 'sine'
  bOsc.frequency.setValueAtTime(200, t)
  bOsc.frequency.exponentialRampToValueAtTime(80, t + 0.05)
  bG.gain.setValueAtTime(0.45, t)
  bG.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
  bOsc.connect(bG)
  bG.connect(dest)
  bOsc.start(t)
  bOsc.stop(t + 0.09)
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2000
  const nG = ctx.createGain()
  nG.gain.setValueAtTime(0.3, t)
  nG.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  src.connect(hp)
  hp.connect(nG)
  nG.connect(dest)
  src.start(t)
  src.stop(t + 0.1)
}

function hihat(ctx, dest, t) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 8000
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.1, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
  src.connect(hp)
  hp.connect(g)
  g.connect(dest)
  src.start(t)
  src.stop(t + 0.035)
}

// Song 2 (Blur) — simplified: E | E | C | D at 132 BPM
const PROG = [82.41, 82.41, 65.41, 73.42]

function scheduleLoop(ctx, dest, startTime, beat) {
  const half = beat / 2
  const bar = beat * 4

  PROG.forEach((root, bi) => {
    const bs = startTime + bi * bar
    for (let i = 0; i < 8; i++) guitar(ctx, dest, root, bs + i * half, half * 0.72)
    for (let b = 0; b < 4; b++) bass(ctx, dest, root, bs + b * beat, beat * 0.88)
    for (let b = 0; b < 4; b++) {
      const bt = bs + b * beat
      kick(ctx, dest, bt)
      if (b === 0 || b === 2) kick(ctx, dest, bt + half)
      if (b === 1 || b === 3) snare(ctx, dest, bt)
      hihat(ctx, dest, bt)
      hihat(ctx, dest, bt + half)
    }
  })

  return startTime + 4 * bar
}

let _playing = false
export const isSongPlaying = () => _playing

export function startSong2() {
  const ctx = getCtx()
  const master = ctx.createGain()
  master.gain.value = 0.22
  master.connect(ctx.destination)

  const beat = 60 / 132
  const loopMs = beat * 16 * 1000

  let stopped = false
  let timer = null
  let nextStart = ctx.currentTime + 0.05
  _playing = true

  function loop() {
    if (stopped) return
    nextStart = scheduleLoop(ctx, master, nextStart, beat)
    timer = setTimeout(loop, loopMs - 80)
  }

  loop()

  return function stop() {
    stopped = true
    _playing = false
    clearTimeout(timer)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
    setTimeout(() => { try { master.disconnect() } catch (e) { void e } }, 350)
  }
}
