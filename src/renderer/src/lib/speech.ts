/** Robust speech recognition helpers for Electron + Chromium */

export type SpeechStatus =
  | 'idle'
  | 'requesting-mic'
  | 'listening'
  | 'processing'
  | 'error'
  | 'unsupported'

export interface SpeechResult {
  transcript: string
  confidence?: number
}

type Rec = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: ((ev: Event) => void) | null
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((ev: { error?: string; message?: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string; confidence: number }
  }>
}

function getSRConstructor(): (new () => Rec) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec
    webkitSpeechRecognition?: new () => Rec
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function isSpeechRecognitionAvailable(): boolean {
  return Boolean(getSRConstructor())
}

export async function ensureMicrophone(): Promise<{ ok: boolean; message?: string }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      message: '当前环境无法访问麦克风。请检查系统麦克风权限，或改用打字作答。'
    }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    })
    // release immediately — SpeechRecognition will reopen
    stream.getTracks().forEach((t) => t.stop())
    return { ok: true }
  } catch (e) {
    const name = e instanceof DOMException ? e.name : 'Error'
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return {
        ok: false,
        message:
          '麦克风权限被拒绝。请在 Windows「设置 → 隐私 → 麦克风」中允许桌面应用使用麦克风，然后重启紫青口语。'
      }
    }
    if (name === 'NotFoundError') {
      return { ok: false, message: '未检测到麦克风设备。' }
    }
    return { ok: false, message: `无法打开麦克风：${name}` }
  }
}

/**
 * Listen once for English speech. Returns transcript or throws with readable message.
 * Requires network on many Chromium builds (Google STT backend).
 */
export function recognizeOnce(opts?: {
  lang?: string
  timeoutMs?: number
  onInterim?: (text: string) => void
  onStatus?: (s: SpeechStatus) => void
}): Promise<SpeechResult> {
  const SR = getSRConstructor()
  if (!SR) {
    return Promise.reject(
      new Error('当前 Chromium/Electron 未启用 Web Speech API。请改用打字，或更新 Electron。')
    )
  }

  const lang = opts?.lang ?? 'en-US'
  const timeoutMs = opts?.timeoutMs ?? 12000

  return new Promise((resolve, reject) => {
    let settled = false
    let finalText = ''
    let interimText = ''
    const rec = new SR()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 3

    const finish = (fn: () => void): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        rec.onresult = null
        rec.onerror = null
        rec.onend = null
        rec.stop()
      } catch {
        /* ignore */
      }
      fn()
    }

    const timer = setTimeout(() => {
      const text = (finalText || interimText).trim()
      if (text) {
        opts?.onStatus?.('processing')
        finish(() => resolve({ transcript: text }))
      } else {
        finish(() =>
          reject(
            new Error(
              '超时未识别到语音。请靠近麦克风清晰朗读，确认网络可用（语音识别常需联网），或改用打字。'
            )
          )
        )
      }
    }, timeoutMs)

    rec.onstart = () => opts?.onStatus?.('listening')

    rec.onresult = (ev) => {
      let interim = ''
      let final = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript || ''
        if (ev.results[i].isFinal) final += piece
        else interim += piece
      }
      if (final) finalText = `${finalText} ${final}`.trim()
      interimText = interim
      const live = (finalText || interim).trim()
      if (live) opts?.onInterim?.(live)

      // if we got a solid final chunk, settle early for short answers
      if (finalText && finalText.split(/\s+/).length >= 1 && !interim) {
        // small delay to catch trailing finals
        setTimeout(() => {
          if (!settled && finalText) {
            opts?.onStatus?.('processing')
            finish(() => resolve({ transcript: finalText.trim() }))
          }
        }, 450)
      }
    }

    rec.onerror = (ev) => {
      const code = ev.error || 'unknown'
      const map: Record<string, string> = {
        'not-allowed': '麦克风权限被拒绝，请在系统设置中允许本应用使用麦克风。',
        'service-not-allowed': '语音识别服务不可用（可能被系统策略禁用）。请改用打字。',
        'network': '语音识别需要网络连接，请检查网络后重试，或改用打字。',
        'no-speech': '没有检测到声音，请靠近麦克风再说一次。',
        'audio-capture': '无法捕获音频，请检查麦克风是否被占用。',
        'aborted': '识别已取消。'
      }
      finish(() => reject(new Error(map[code] || `识别错误：${code}`)))
    }

    rec.onend = () => {
      if (settled) return
      const text = (finalText || interimText).trim()
      if (text) {
        opts?.onStatus?.('processing')
        finish(() => resolve({ transcript: text }))
      } else {
        finish(() => reject(new Error('识别结束但未得到文本，请重试或打字作答。')))
      }
    }

    try {
      rec.start()
    } catch (e) {
      finish(() =>
        reject(new Error(e instanceof Error ? e.message : '无法启动语音识别'))
      )
    }
  })
}
