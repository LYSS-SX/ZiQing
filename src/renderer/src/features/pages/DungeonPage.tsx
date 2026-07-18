import { useEffect, useState } from 'react'
import type { AnswerResult } from '../../../../shared/types'
import { applyAnswer, buildDailyDungeon, markDungeonComplete, today } from '../../lib/progress'
import { playCombo, playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

export function DungeonPage(): JSX.Element {
  const { data, questions, save } = useApp()
  const [fx, setFx] = useState<EffectKind>('none')
  const [msg, setMsg] = useState('')

  const ensureDaily = async (): Promise<void> => {
    const t = today()
    if (data.daily?.date === t && data.daily.questionIds.length) return
    const ids = buildDailyDungeon(questions, data)
    const next = structuredClone(data)
    next.daily = {
      date: t,
      completed: false,
      questionIds: ids,
      currentIndex: 0,
      started: true
    }
    await save(next)
  }

  useEffect(() => {
    void ensureDaily()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.daily?.date])

  const daily = data.daily
  const q = daily ? questions.find((x) => x.id === daily.questionIds[daily.currentIndex]) : null
  const done = daily?.completed

  const onGraded = async (result: AnswerResult): Promise<void> => {
    if (!q || !daily) return
    const s = data.profile.settings
    const isChallenge = daily.currentIndex === Math.max(0, daily.questionIds.length - 3)
    const isSpeak = ['shadow_read', 'short_speak', 'topic_card'].includes(q.type)
    const wasReview = data.stats[q.id]?.inReview

    let next = applyAnswer(data, q, result.correct, { isChallenge, isSpeak })
    if (result.correct) {
      if (s.soundEnabled) {
        if (wasReview) playFlip(s.soundVolume)
        else if (next.profile.currentCombo >= 3) playCombo(s.soundVolume, next.profile.currentCombo)
        else playSuccess(s.soundVolume)
      }
      setFx(wasReview ? 'flip' : 'fireworks')
      setMsg(result.feedback)
    } else {
      if (s.soundEnabled && s.slapLevel !== 'off') playSlap(s.soundVolume)
      setFx('slap')
      setMsg(result.feedback)
    }

    const idx = daily.currentIndex + 1
    if (idx >= daily.questionIds.length) {
      next = markDungeonComplete(next)
      if (next.daily) {
        next.daily.currentIndex = idx
        next.daily.completed = true
      }
      setMsg((m) => `${m} · 今日副本完成！印章已盖上 📅`)
    } else if (next.daily) {
      next.daily.currentIndex = idx
    }
    await save(next)
  }

  if (!daily || !daily.questionIds.length) {
    return (
      <div className="page">
        <h1>今日副本</h1>
        <p>正在生成副本…</p>
        <button type="button" className="btn primary" onClick={() => void ensureDaily()}>
          重新生成
        </button>
      </div>
    )
  }

  if (done || daily.currentIndex >= daily.questionIds.length) {
    return (
      <div className="page">
        <div className="card center-card">
          <div className="hero-emoji">✅</div>
          <h1>今日副本已通关</h1>
          <p className="lead">连续打卡 {data.profile.streakDays} 天 · 星尘 {data.profile.currency}</p>
          <p className="muted">明天会再生成新的热身/主线/挑战/复仇组合。</p>
        </div>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="page">
        <p>题目走丢了，点击重新生成。</p>
        <button
          type="button"
          className="btn primary"
          onClick={async () => {
            const next = structuredClone(data)
            next.daily = null
            await save(next)
            await ensureDaily()
          }}
        >
          重新生成
        </button>
      </div>
    )
  }

  const phase =
    daily.currentIndex < 2
      ? '热身'
      : daily.currentIndex < 7
        ? '主线'
        : daily.currentIndex < 8
          ? '挑战'
          : '复仇'

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">今日副本 · {phase}</p>
          <h1>
            {daily.currentIndex + 1} / {daily.questionIds.length}
          </h1>
        </div>
        <div className="stat-pills">
          <span>连击 x{data.profile.currentCombo}</span>
        </div>
      </header>
      <div className="card">
        <QuestionPlayer
          key={q.id}
          question={q}
          voiceEnabled={data.profile.settings.voiceEnabled}
          onGraded={(r) => void onGraded(r)}
        />
        {msg && <p className="inline-msg">{msg}</p>}
      </div>
      <EffectOverlay
        kind={fx}
        level={fx === 'slap' ? data.profile.settings.slapLevel : data.profile.settings.fireworksLevel}
        reduceMotion={data.profile.settings.reduceMotion}
        onDone={() => setFx('none')}
      />
    </div>
  )
}
