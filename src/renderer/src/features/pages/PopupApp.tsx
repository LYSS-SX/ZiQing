import { useMemo, useState } from 'react'
import type { AnswerResult } from '../../../../shared/types'
import { applyAnswer, pickQuestions } from '../../lib/progress'
import { playCombo, playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

export function PopupApp(): JSX.Element {
  const { data, questions, save, ready } = useApp()
  const [fx, setFx] = useState<EffectKind>('none')
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')

  const q = useMemo(() => {
    const reviewIds = Object.values(data.stats)
      .filter((s) => s.inReview)
      .map((s) => s.questionId)
    const roll = Math.random()
    if (roll < 0.2 && reviewIds.length) {
      const list = questions.filter((x) => reviewIds.includes(x.id) && x.allowPopup)
      if (list[0]) return list[Math.floor(Math.random() * list.length)]
    }
    if (roll > 0.9) {
      const easy = pickQuestions(questions, 'yayacun', 1, true)
      if (easy[0]) return easy[0]
    }
    const cur = pickQuestions(questions, data.profile.currentMapId, 1, true)
    return cur[0] || questions.find((x) => x.allowPopup) || questions[0]
  }, [data.profile.currentMapId, data.stats, questions])

  const onGraded = async (result: AnswerResult): Promise<void> => {
    if (!q) return
    const s = data.profile.settings
    const wasReview = data.stats[q.id]?.inReview
    const next = applyAnswer(data, q, result.correct, {
      isSpeak: q.type === 'shadow_read'
    })
    setFeedback(result.feedback)
    if (result.correct) {
      if (s.soundEnabled) {
        if (wasReview) playFlip(s.soundVolume)
        else if (next.profile.currentCombo >= 3) playCombo(s.soundVolume, next.profile.currentCombo)
        else playSuccess(s.soundVolume)
      }
      setFx(wasReview ? 'flip' : 'fireworks')
    } else {
      if (s.soundEnabled && s.slapLevel !== 'off') playSlap(s.soundVolume)
      setFx('slap')
    }
    await save(next)
    setDone(true)
  }

  if (!ready) return <div className="popup-shell">加载中…</div>

  return (
    <div className="popup-shell">
      <header className="popup-head">
        <strong>紫青 · 随机挑战</strong>
        <div className="row">
          <button type="button" className="btn ghost sm" onClick={() => void window.ziqing?.snoozePopup?.(10)}>
            稍后
          </button>
          <button type="button" className="btn ghost sm" onClick={() => void window.ziqing?.closePopup?.()}>
            关闭
          </button>
        </div>
      </header>
      {!done && q ? (
        <QuestionPlayer
          key={q.id}
          question={q}
          voiceEnabled={data.profile.settings.voiceEnabled}
          onGraded={(r) => void onGraded(r)}
        />
      ) : (
        <div className="popup-done">
          <div className="hero-emoji">{feedback.includes('对') || fx !== 'slap' ? '🎉' : '💪'}</div>
          <p>{feedback || '本轮结束'}</p>
          <div className="row">
            <button type="button" className="btn primary" onClick={() => void window.ziqing?.closePopup?.()}>
              收下反馈
            </button>
          </div>
        </div>
      )}
      <EffectOverlay
        kind={fx}
        level={fx === 'slap' ? data.profile.settings.slapLevel : data.profile.settings.fireworksLevel}
        reduceMotion={data.profile.settings.reduceMotion}
        onDone={() => setFx('none')}
      />
    </div>
  )
}
