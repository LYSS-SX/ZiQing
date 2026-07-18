/** Lightweight procedural SFX via Web Audio — no asset files required */

let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playSuccess(volume = 0.7): void {
  const c = ac()
  const now = c.currentTime
  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'triangle'
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.2 * volume, now + 0.02 + i * 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i * 0.05)
    o.connect(g)
    g.connect(c.destination)
    o.start(now + i * 0.05)
    o.stop(now + 0.4 + i * 0.05)
  })
}

export function playCombo(volume = 0.7, combo = 3): void {
  const c = ac()
  const now = c.currentTime
  const base = 400 + Math.min(combo, 12) * 30
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(base, now)
  o.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.12)
  g.gain.setValueAtTime(0.15 * volume, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
  o.connect(g)
  g.connect(c.destination)
  o.start(now)
  o.stop(now + 0.22)
}

export function playSlap(volume = 0.7): void {
  const c = ac()
  const now = c.currentTime
  // noise burst
  const bufferSize = c.sampleRate * 0.25
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1200
  const g = c.createGain()
  g.gain.setValueAtTime(0.5 * volume, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
  noise.connect(filter)
  filter.connect(g)
  g.connect(c.destination)
  noise.start(now)

  // crackle pops
  for (let i = 0; i < 5; i++) {
    const o = c.createOscillator()
    const gg = c.createGain()
    o.type = 'sawtooth'
    o.frequency.value = 180 + Math.random() * 400
    const t = now + i * 0.04
    gg.gain.setValueAtTime(0.12 * volume, t)
    gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
    o.connect(gg)
    gg.connect(c.destination)
    o.start(t)
    o.stop(t + 0.07)
  }
}

export function playFlip(volume = 0.7): void {
  playSuccess(volume)
  setTimeout(() => playCombo(volume, 8), 120)
}

export function speakText(text: string): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.92
  window.speechSynthesis.speak(u)
}
