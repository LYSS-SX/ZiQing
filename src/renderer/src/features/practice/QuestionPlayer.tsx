import { useEffect, useMemo, useState } from 'react'
import { gradeAnswer } from '../../../../shared/scoring'
import type { AnswerResult, Question } from '../../../../shared/types'
import { speakText } from '../../lib/audio'
import './player.css'

interface Props {
  question: Question
  voiceEnabled?: boolean
  onGraded: (result: AnswerResult, raw: string) => void
}

export function QuestionPlayer({ question, voiceEnabled = true, onGraded }: Props): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [order, setOrder] = useState<string[]>([])
  const [listening, setListening] = useState(false)
  const [localFeedback, setLocalFeedback] = useState<string | null>(null)

  const choiceMode = useMemo(
    () =>
      ['listen_choose', 'word_choose', 'fill_blank', 'dialogue_next'].includes(question.type) &&
      question.choices?.length,
    [question]
  )

  const resetLocal = (): void => {
    setSelected(null)
    setText('')
    setOrder([])
    setLocalFeedback(null)
  }

  useEffect(() => {
    resetLocal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const submit = (value: string): void => {
    const result = gradeAnswer(question, value)
    setLocalFeedback(result.feedback)
    onGraded(result, value)
  }

  const startSpeech = (): void => {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
      || (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
    if (!SR) {
      setLocalFeedback('当前环境不支持语音识别，请改用打字作答，或点「我已跟读/说完」。')
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    setListening(true)
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const said = ev.results[0][0].transcript
      setText(said)
      setListening(false)
      submit(said)
    }
    rec.onerror = () => {
      setListening(false)
      setLocalFeedback('识别失败，可改打字或点自检完成。')
    }
    rec.onend = () => setListening(false)
    rec.start()
  }

  const playAudio = (): void => {
    const t = question.audioText || (Array.isArray(question.answer) ? question.answer[0] : question.answer)
    if (voiceEnabled) speakText(t)
  }

  return (
    <div className="q-player">
      <div className="q-meta">
        <span className="q-type">{typeLabel(question.type)}</span>
        <span className="q-time">约 {question.estSeconds}s</span>
      </div>
      <h2 className="q-prompt">{question.prompt}</h2>

      {(question.type === 'listen_choose' || question.type === 'shadow_read') && (
        <button type="button" className="btn ghost" onClick={playAudio}>
          🔊 播放示范
        </button>
      )}

      {choiceMode && (
        <div className="choices">
          {question.choices!.map((c) => (
            <button
              key={c}
              type="button"
              className={`choice ${selected === c ? 'active' : ''}`}
              onClick={() => {
                setSelected(c)
                submit(c)
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {question.type === 'reorder' && question.choices && (
        <div className="reorder">
          <div className="reorder-built">{order.length ? order.join(' ') : '按顺序点选单词…'}</div>
          <div className="choices">
            {question.choices.map((c) => (
              <button
                key={c + order.join()}
                type="button"
                className="choice"
                disabled={order.includes(c)}
                onClick={() => setOrder((o) => [...o, c])}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="row">
            <button type="button" className="btn ghost" onClick={() => setOrder([])}>
              清空
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!order.length}
              onClick={() => submit(order.join(' '))}
            >
              提交排序
            </button>
          </div>
        </div>
      )}

      {['shadow_read', 'short_speak', 'topic_card'].includes(question.type) && (
        <div className="speak-box">
          {question.sampleAnswer && (
            <p className="hint">示范：{question.sampleAnswer}</p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="语音识别结果会出现在这里，也可以直接打字…"
            rows={4}
          />
          <div className="row">
            <button type="button" className="btn primary" onClick={startSpeech} disabled={listening}>
              {listening ? '正在听…' : '🎤 开始说'}
            </button>
            <button type="button" className="btn ghost" onClick={() => submit(text || question.sampleAnswer || '')}>
              提交 / 我已说完
            </button>
            {question.audioText && (
              <button type="button" className="btn ghost" onClick={playAudio}>
                听示范
              </button>
            )}
          </div>
        </div>
      )}

      {localFeedback && <div className="q-feedback">{localFeedback}</div>}
    </div>
  )
}

function typeLabel(t: Question['type']): string {
  const map: Record<Question['type'], string> = {
    listen_choose: '听音选义',
    word_choose: '选词',
    fill_blank: '填空',
    reorder: '排序',
    shadow_read: '跟读',
    short_speak: '短说',
    dialogue_next: '情景对话',
    topic_card: '话题卡'
  }
  return map[t]
}

// minimal SpeechRecognition types for TS
interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
