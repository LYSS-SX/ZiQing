import { useMemo, useState } from 'react'
import { MAPS, mapByTier } from '../../../../shared/maps'
import type { AnswerResult, MapId } from '../../../../shared/types'
import { applyAnswer } from '../../lib/progress'
import { playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

export function Onboarding(): JSX.Element {
  const { data, questions, save } = useApp()
  const [step, setStep] = useState(0) // 0 welcome, 1-5 quiz, 6 done
  const [fx, setFx] = useState<EffectKind>('none')
  const [wins, setWins] = useState(0)
  const [maxTier, setMaxTier] = useState(0)

  const quiz = useMemo(() => {
    const pick = (tier: number): (typeof questions)[0] => {
      const pool = questions.filter((q) => q.tier === tier && q.choices?.length)
      return pool[Math.floor(Math.random() * pool.length)] || questions[0]
    }
    return [pick(0), pick(0), pick(1), pick(2), pick(3)]
  }, [questions])

  const finish = async (finalWins: number, tier: number): Promise<void> => {
    let mapId: MapId = 'yayacun'
    if (finalWins >= 4 && tier >= 2) mapId = 'dialoguevalley'
    else if (finalWins >= 3) mapId = 'wordtown'
    else mapId = 'yayacun'

    const next = structuredClone(data)
    next.profile.onboardingDone = true
    next.profile.currentMapId = mapId
    if (!next.profile.unlockedMapIds.includes(mapId)) {
      next.profile.unlockedMapIds.push(mapId)
    }
    // ensure chain unlocked up to map
    for (const m of MAPS) {
      if (m.tier <= MAPS.find((x) => x.id === mapId)!.tier) {
        if (!next.profile.unlockedMapIds.includes(m.id)) next.profile.unlockedMapIds.push(m.id)
      }
    }
    next.profile.currency += 30
    const ach = next.profile.achievements.find((a) => a.id === 'first_win')
    if (ach && !ach.unlockedAt && finalWins > 0) ach.unlockedAt = new Date().toISOString()
    await save(next)
    setStep(6)
  }

  const onGraded = async (result: AnswerResult): Promise<void> => {
    const q = quiz[step - 1]
    const s = data.profile.settings
    if (result.correct) {
      setWins((w) => w + 1)
      setMaxTier((t) => Math.max(t, q.tier))
      if (s.soundEnabled) playSuccess(s.soundVolume)
      setFx('fireworks')
    } else {
      if (s.soundEnabled && s.slapLevel !== 'off') playSlap(s.soundVolume)
      setFx('slap')
    }
    const next = applyAnswer(data, q, result.correct)
    await save(next)

    setTimeout(() => {
      if (step >= 5) {
        const w = result.correct ? wins + 1 : wins
        const t = result.correct ? Math.max(maxTier, q.tier) : maxTier
        void finish(w, t)
      } else {
        setStep((s) => s + 1)
      }
    }, 700)
  }

  if (step === 0) {
    return (
      <div className="onboard card">
        <div className="hero-emoji">🗺️✨</div>
        <h1>欢迎来到紫青口语宇宙</h1>
        <p className="lead">
          今天不考试，只玩 3～5 个小游戏。我们会把你放在合适的地图起点——宁可简单一点，让你连赢！
        </p>
        <ul className="bullets">
          <li>答对：礼花 + 经验 + 连击</li>
          <li>答错：巴掌提醒（可关）+ 马上给示范</li>
          <li>错题进「待翻盘」，以后还能复仇</li>
        </ul>
        <button type="button" className="btn primary lg" onClick={() => setStep(1)}>
          开始 30 秒热身定级
        </button>
      </div>
    )
  }

  if (step === 6) {
    const map = MAPS.find((m) => m.id === data.profile.currentMapId) || mapByTier(0)
    return (
      <div className="onboard card">
        <div className="hero-emoji">🏅</div>
        <h1>首枚勋章已发放！</h1>
        <p className="lead">
          你落在了 <strong>{map.emoji} {map.name}</strong>。热身答对 {wins} 题。
        </p>
        <p className="muted">接下来去做「今日副本」，大约 8～12 分钟，爽感拉满。</p>
        <p className="ok-note">关闭引导后进入主界面即可开始冒险。</p>
      </div>
    )
  }

  const q = quiz[step - 1]
  return (
    <div className="onboard card">
      <div className="progress-line">
        <span>
          热身 {step}/5 · 已连对感 {wins}
        </span>
        <div className="bar">
          <i style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>
      <QuestionPlayer
        key={q.id}
        question={q}
        voiceEnabled={data.profile.settings.voiceEnabled}
        onGraded={(r) => void onGraded(r)}
      />
      <EffectOverlay
        kind={fx}
        level={fx === 'slap' ? data.profile.settings.slapLevel : data.profile.settings.fireworksLevel}
        reduceMotion={data.profile.settings.reduceMotion}
        onDone={() => setFx('none')}
      />
    </div>
  )
}
