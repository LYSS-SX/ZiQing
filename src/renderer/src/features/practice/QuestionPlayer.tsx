import { useEffect, useMemo, useState } from 'react'
import { gradeAnswer } from '../../../../shared/scoring'
import type { AnswerResult, Question } from '../../../../shared/types'
import { speakText } from '../../lib/audio'
import {
  ensureMicrophone,
  isSpeechRecognitionAvailable,
  recognizeOnce,
  type SpeechStatus
} from '../../lib/speech'
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
  const [showZh, setShowZh] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechHint, setSpeechHint] = useState<string | null>(null)
  const [localFeedback, setLocalFeedback] = useState<string | null>(null)
  const [interim, setInterim] = useState('')

  const choiceMode = useMemo(
    () =>
      ['listen_choose', 'word_choose', 'fill_blank', 'dialogue_next'].includes(question.type) &&
      !!question.choices?.length,
    [question]
  )

  const isSpeakType = ['shadow_read', 'short_speak', 'topic_card'].includes(question.type)

  const resetLocal = (): void => {
    setSelected(null)
    setText('')
    setOrder([])
    setLocalFeedback(null)
    setSpeechHint(null)
    setInterim('')
    setListening(false)
  }

  useEffect(() => {
    resetLocal()
    // keep showZh preference across questions within a session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const submit = (value: string): void => {
    const result = gradeAnswer(question, value)
    setLocalFeedback(result.feedback)
    onGraded(result, value)
  }

  const startSpeech = async (): Promise<void> => {
    setSpeechHint(null)
    setLocalFeedback(null)

    if (!isSpeechRecognitionAvailable()) {
      setSpeechHint(
        '当前环境未启用 Web 语音识别。你仍可：① 点「播放示范」跟读 ② 在输入框打字 ③ 点「我已跟读」自评提交。'
      )
      return
    }

    setListening(true)
    setSpeechHint('正在请求麦克风权限…')
    const mic = await ensureMicrophone()
    if (!mic.ok) {
      setListening(false)
      setSpeechHint(mic.message || '麦克风不可用')
      return
    }

    setSpeechHint('请清晰朗读（约 8～12 秒）… 识别中')
    try {
      const result = await recognizeOnce({
        lang: 'en-US',
        timeoutMs: 14000,
        onInterim: (t) => {
          setInterim(t)
          setText(t)
        },
        onStatus: (s: SpeechStatus) => {
          if (s === 'listening') setSpeechHint('正在听… 请继续说')
          if (s === 'processing') setSpeechHint('正在处理识别结果…')
        }
      })
      setText(result.transcript)
      setInterim('')
      setSpeechHint(`识别结果：${result.transcript}`)
      setListening(false)
      // auto-grade for short shadow reads; longer topics wait for user confirm
      if (question.type === 'shadow_read') {
        submit(result.transcript)
      }
    } catch (e) {
      setListening(false)
      setInterim('')
      setSpeechHint(e instanceof Error ? e.message : '识别失败')
    }
  }

  const playAudio = (): void => {
    const t =
      question.audioText ||
      (Array.isArray(question.answer) ? question.answer[0] : question.answer)
    if (voiceEnabled) speakText(String(t))
  }

  const promptMain = showZh
    ? question.promptZh || question.prompt
    : question.prompt
  const promptSub =
    showZh && question.promptZh
      ? question.prompt
      : !showZh && question.promptZh
        ? null
        : null

  return (
    <div className="q-player">
      <div className="q-meta">
        <span className="q-type">{typeLabel(question.type)}</span>
        <span className="q-time">约 {question.estSeconds}s</span>
        <button
          type="button"
          className={`btn sm ghost zh-toggle ${showZh ? 'on' : ''}`}
          onClick={() => setShowZh((v) => !v)}
          title="不会的时候打开中文提示"
        >
          {showZh ? '中文提示 · 开' : '显示中文'}
        </button>
      </div>

      <h2 className="q-prompt">{promptMain}</h2>
      {showZh && question.promptZh && promptSub && (
        <p className="q-prompt-en muted">{promptSub}</p>
      )}
      {showZh && question.promptZh && !promptSub && question.prompt !== question.promptZh && (
        <p className="q-prompt-en muted">{question.prompt}</p>
      )}
      {!showZh && question.promptZh && (
        <p className="hint soft-hint">不会题意？点右上角「显示中文」</p>
      )}

      {(question.type === 'listen_choose' ||
        question.type === 'shadow_read' ||
        question.audioText) && (
        <button type="button" className="btn ghost" onClick={playAudio}>
          🔊 播放示范 / 发音
        </button>
      )}

      {choiceMode && (
        <div className="choices">
          {question.choices!.map((c, i) => (
            <button
              key={c + i}
              type="button"
              className={`choice ${selected === c ? 'active' : ''}`}
              onClick={() => {
                setSelected(c)
                submit(c)
              }}
            >
              <span>{c}</span>
              {showZh && question.choicesZh?.[i] && (
                <small className="choice-zh">{question.choicesZh[i]}</small>
              )}
              {showZh && !question.choicesZh && question.explanation && c === (Array.isArray(question.answer) ? question.answer[0] : question.answer) && (
                <small className="choice-zh">（答案提示见解析）</small>
              )}
            </button>
          ))}
        </div>
      )}

      {question.type === 'reorder' && question.choices && (
        <div className="reorder">
          <div className="reorder-built">
            {order.length ? order.join(' ') : '按顺序点选单词…'}
          </div>
          <div className="choices">
            {question.choices.map((c, i) => (
              <button
                key={c + i + order.join()}
                type="button"
                className="choice"
                disabled={order.filter((x) => x === c).length >= question.choices!.filter((x) => x === c).length && order.includes(c)}
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

      {isSpeakType && (
        <div className="speak-box">
          {(question.sampleAnswer || question.sampleAnswerZh) && (
            <p className="hint">
              示范：
              {showZh
                ? question.sampleAnswerZh || question.sampleAnswer
                : question.sampleAnswer}
              {showZh && question.sampleAnswer && question.sampleAnswerZh
                ? ` · ${question.sampleAnswer}`
                : ''}
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="语音识别结果会出现在这里，也可以直接打字英文…"
            rows={4}
          />
          {interim && listening && <p className="interim">实时：{interim}</p>}
          <div className="row">
            <button
              type="button"
              className="btn primary"
              onClick={() => void startSpeech()}
              disabled={listening || !voiceEnabled}
            >
              {listening ? '正在听…' : '🎤 开始说'}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                submit(
                  text ||
                    (question.type === 'shadow_read'
                      ? String(question.audioText || question.answer)
                      : text)
                )
              }
            >
              提交答案
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                // self-check pass for beginners who practiced orally
                const target = String(
                  question.audioText ||
                    (Array.isArray(question.answer) ? question.answer[0] : question.answer)
                )
                submit(text.trim() ? text : target)
              }}
            >
              我已跟读/说完
            </button>
            <button type="button" className="btn ghost" onClick={playAudio}>
              听示范
            </button>
          </div>
          {speechHint && <div className="speech-hint">{speechHint}</div>}
          <p className="hint soft-hint">
            提示：Windows 上语音识别通常需要<strong>联网</strong>，并在系统隐私设置里允许应用使用麦克风。
            若仍失败，请用打字或「我已跟读/说完」。
          </p>
        </div>
      )}

      {showZh && question.explanation && (
        <div className="q-explain">解析：{question.explanation}</div>
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
