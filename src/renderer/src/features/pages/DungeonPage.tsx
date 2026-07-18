import { useEffect, useState } from 'react'
import type { AnswerResult } from '../../../../shared/types'
import {
  applyAnswer,
  buildDailyDungeon,
  DUNGEON_SIZE,
  dungeonPhase,
  markDungeonComplete,
  today
} from '../../lib/progress'
import { playCombo, playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

function freshDaily(
  questionIds: string[],
  restartCount = 0
): NonNullable<ReturnType<typeof useApp>['data']['daily']> {
  return {
    date: today(),
    completed: false,
    questionIds,
    currentIndex: 0,
    started: true,
    clearedCount: 0,
    wrongOnCurrent: 0,
    restartCount,
    targetCount: DUNGEON_SIZE
  }
}

export function DungeonPage(): JSX.Element {
  const { data, questions, save } = useApp()
  const [fx, setFx] = useState<EffectKind>('none')
  const [msg, setMsg] = useState('')

  const needsRebuild = (d: typeof data.daily): boolean => {
    if (!d) return true
    if (d.date !== today()) return true
    if (!d.questionIds?.length) return true
    // migrate old short dungeons → 30
    if (d.questionIds.length !== DUNGEON_SIZE || d.targetCount !== DUNGEON_SIZE) return true
    return false
  }

  const ensureDaily = async (force = false): Promise<void> => {
    if (!force && data.daily && !needsRebuild(data.daily) && !data.daily.completed) return
    // keep completed same-day state unless force restart
    if (!force && data.daily?.date === today() && data.daily.completed && data.daily.questionIds.length === DUNGEON_SIZE) {
      return
    }
    const ids = buildDailyDungeon(questions, data)
    const next = structuredClone(data)
    next.daily = freshDaily(ids, force ? (data.daily?.restartCount ?? 0) + 1 : 0)
    await save(next)
    setMsg(force ? '已重新生成 30 题，开始新一轮挑战！' : '')
  }

  useEffect(() => {
    void ensureDaily(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.daily?.date, data.daily?.questionIds?.length])

  const daily = data.daily
  const q = daily ? questions.find((x) => x.id === daily.questionIds[daily.currentIndex]) : null
  const done = daily?.completed

  const onGraded = async (result: AnswerResult): Promise<void> => {
    if (!q || !daily || daily.completed) return
    const s = data.profile.settings
    const isChallenge = daily.currentIndex >= 20 && daily.currentIndex < 25
    const isSpeak = ['shadow_read', 'short_speak', 'topic_card'].includes(q.type)
    const wasReview = data.stats[q.id]?.inReview

    let next = applyAnswer(data, q, result.correct, { isChallenge, isSpeak })
    // ensure daily fields exist on clone
    if (!next.daily) next.daily = structuredClone(daily)

    if (result.correct) {
      if (s.soundEnabled) {
        if (wasReview) playFlip(s.soundVolume)
        else if (next.profile.currentCombo >= 3) playCombo(s.soundVolume, next.profile.currentCombo)
        else playSuccess(s.soundVolume)
      }
      setFx(wasReview ? 'flip' : 'fireworks')

      const cleared = (next.daily!.clearedCount ?? daily.currentIndex) + 1
      next.daily!.clearedCount = cleared
      next.daily!.wrongOnCurrent = 0
      const idx = daily.currentIndex + 1

      if (idx >= daily.questionIds.length) {
        next = markDungeonComplete(next)
        if (next.daily) {
          next.daily.currentIndex = idx
          next.daily.completed = true
          next.daily.clearedCount = DUNGEON_SIZE
        }
        setMsg(`${result.feedback} · 今日副本 30 题全部通关！`)
      } else {
        next.daily!.currentIndex = idx
        setMsg(`${result.feedback} · 前进 ${idx + 1}/${DUNGEON_SIZE}`)
      }
    } else {
      // wrong → stay on same question, loop until correct
      if (s.soundEnabled && s.slapLevel !== 'off') playSlap(s.soundVolume)
      setFx('slap')
      const wrongN = (next.daily!.wrongOnCurrent ?? 0) + 1
      next.daily!.wrongOnCurrent = wrongN
      next.daily!.currentIndex = daily.currentIndex
      setMsg(
        `${result.feedback} · 答错不前进，再战第 ${daily.currentIndex + 1} 题（本关已错 ${wrongN} 次）`
      )
    }

    await save(next)
  }

  const restartChallenge = async (): Promise<void> => {
    const next = structuredClone(data)
    next.daily = null
    await save(next)
    // rebuild after clear
    const ids = buildDailyDungeon(questions, { ...data, daily: null })
    const after = structuredClone(data)
    after.daily = freshDaily(ids, (data.daily?.restartCount ?? 0) + 1)
    await save(after)
    setMsg('新一轮 30 题挑战已就绪，答对才前进，直到全部成功！')
  }

  if (!daily || !daily.questionIds.length) {
    return (
      <div className="page">
        <h1>今日副本</h1>
        <p>正在生成 30 题挑战…</p>
        <button type="button" className="btn primary" onClick={() => void ensureDaily(true)}>
          生成副本
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="page">
        <div className="card center-card glass">
          <div className="hero-emoji">✅</div>
          <h1>今日副本通关！</h1>
          <p className="lead">
            30 题全部挑战成功 · 连续打卡 {data.profile.streakDays} 天 · 星尘 {data.profile.currency}
          </p>
          <p className="muted">
            规则：必须答对才前进；答错原地重来，可循环挑战直到成功。
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button type="button" className="btn primary lg" onClick={() => void restartChallenge()}>
              再来一轮 30 题
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="page">
        <p>题目走丢了，点击重新生成 30 题。</p>
        <button type="button" className="btn primary" onClick={() => void restartChallenge()}>
          重新生成
        </button>
      </div>
    )
  }

  const phase = dungeonPhase(daily.currentIndex)
  const cleared = daily.clearedCount ?? daily.currentIndex
  const progressPct = Math.round((cleared / DUNGEON_SIZE) * 100)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">今日副本 · {phase} · 循环挑战</p>
          <h1>
            {daily.currentIndex + 1} / {DUNGEON_SIZE}
          </h1>
          <p className="sub">
            答对才前进 · 已通关 {cleared}/{DUNGEON_SIZE}
            {(daily.wrongOnCurrent ?? 0) > 0 ? ` · 本题已错 ${daily.wrongOnCurrent} 次` : ''}
          </p>
        </div>
        <div className="stat-pills">
          <span>连击 x{data.profile.currentCombo}</span>
          <span>{progressPct}%</span>
          <button type="button" className="btn ghost sm" onClick={() => void restartChallenge()}>
            重开 30 题
          </button>
        </div>
      </header>

      <div className="practice-progress">
        <div className="bar">
          <i style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="card glass">
        <p className="hint soft-hint" style={{ marginTop: 0 }}>
          挑战规则：共 <strong>30</strong> 题（热身5 · 主线15 · 挑战5 · 复仇5）。
          只有答对才能进入下一题；答错原地再战，直到本题成功，最终通关全部 30 题。
        </p>
        <QuestionPlayer
          key={`${q.id}-${daily.currentIndex}-${daily.wrongOnCurrent ?? 0}`}
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
