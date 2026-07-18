import { useState } from 'react'
import type { AnswerResult } from '../../../../shared/types'
import { applyAnswer, boardEntries } from '../../lib/progress'
import { playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

export function ReviewPage(): JSX.Element {
  return <BoardBase mode="review" title="待翻盘" subtitle="这些题还欠你一场胜利" />
}

export function HonorPage(): JSX.Element {
  return <BoardBase mode="honor" title="荣誉墙" subtitle="你征服过的单词与句子，越绿越强" />
}

export function RevengePage(): JSX.Element {
  return <BoardBase mode="revenge" title="复仇墙" subtitle="失手越多越红——点进去讨回来" />
}

function BoardBase({
  mode,
  title,
  subtitle
}: {
  mode: 'review' | 'honor' | 'revenge'
  title: string
  subtitle: string
}): JSX.Element {
  const { data, questions, save } = useApp()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [fx, setFx] = useState<EffectKind>('none')

  const entries =
    mode === 'review'
      ? Object.values(data.stats)
          .filter((s) => s.inReview)
          .map((stats) => ({
            stats,
            intensity: Math.min(1, Math.log(1 + stats.wrongCount) / Math.log(11))
          }))
      : boardEntries(data, mode)

  const q = activeId ? questions.find((x) => x.id === activeId) : null

  const onGraded = async (result: AnswerResult): Promise<void> => {
    if (!q) return
    const s = data.profile.settings
    const wasReview = data.stats[q.id]?.inReview
    const next = applyAnswer(data, q, result.correct, {
      isSpeak: ['shadow_read', 'short_speak', 'topic_card'].includes(q.type)
    })
    if (result.correct) {
      if (s.soundEnabled) (wasReview ? playFlip : playSuccess)(s.soundVolume)
      setFx(wasReview ? 'flip' : 'fireworks')
    } else {
      if (s.soundEnabled && s.slapLevel !== 'off') playSlap(s.soundVolume)
      setFx('slap')
    }
    await save(next)
    if (result.correct && mode === 'review') setActiveId(null)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
        </div>
        <span className="stat-pills">
          <span>{entries.length} 项</span>
        </span>
      </header>

      {q ? (
        <div className="card">
          <button type="button" className="btn ghost" onClick={() => setActiveId(null)}>
            ← 返回列表
          </button>
          <QuestionPlayer
            key={q.id}
            question={q}
            voiceEnabled={data.profile.settings.voiceEnabled}
            onGraded={(r) => void onGraded(r)}
          />
        </div>
      ) : (
        <div className="board-list">
          {entries.length === 0 && <div className="empty card">暂时还空着，去练习几题再回来看。</div>}
          {entries.map(({ stats, intensity }) => {
            const qq = questions.find((x) => x.id === stats.questionId)
            const bg =
              mode === 'honor'
                ? `rgba(34, 197, 94, ${0.08 + intensity * 0.45})`
                : `rgba(239, 68, 68, ${0.08 + intensity * 0.5})`
            const border =
              mode === 'honor'
                ? `rgba(34, 197, 94, ${0.25 + intensity * 0.6})`
                : `rgba(239, 68, 68, ${0.25 + intensity * 0.6})`
            return (
              <button
                key={stats.questionId}
                type="button"
                className="board-item"
                style={{ background: bg, borderColor: border }}
                onClick={() => setActiveId(stats.questionId)}
              >
                <div className="board-title">{qq?.prompt || stats.questionId}</div>
                <div className="board-meta">
                  对 {stats.correctCount} · 错 {stats.wrongCount}
                  {stats.inReview ? ' · 待翻盘' : ''}
                </div>
              </button>
            )
          })}
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
