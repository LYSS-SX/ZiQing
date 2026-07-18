import { useMemo, useState } from 'react'
import { MAPS } from '../../../../shared/maps'
import type { AnswerResult, MapId } from '../../../../shared/types'
import { applyAnswer, pickQuestions } from '../../lib/progress'
import { playCombo, playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

export function PracticePage(): JSX.Element {
  const { data, questions, save } = useApp()
  const [mapId, setMapId] = useState<MapId>(data.profile.currentMapId)
  const [index, setIndex] = useState(0)
  const [fx, setFx] = useState<EffectKind>('none')
  const [seed, setSeed] = useState(0)

  const list = useMemo(() => {
    const reviewIds = Object.values(data.stats)
      .filter((s) => s.inReview)
      .map((s) => s.questionId)
    return pickQuestions(questions, mapId, 12, false, reviewIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, questions, seed])

  const q = list[index % Math.max(list.length, 1)]

  const onGraded = async (result: AnswerResult): Promise<void> => {
    if (!q) return
    const s = data.profile.settings
    const wasReview = data.stats[q.id]?.inReview
    const isSpeak = ['shadow_read', 'short_speak', 'topic_card'].includes(q.type)
    const next = applyAnswer(data, q, result.correct, { isSpeak })
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
    setTimeout(() => setIndex((i) => i + 1), 500)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">自由练习</p>
          <h1>按地图自学</h1>
        </div>
        <button type="button" className="btn ghost" onClick={() => setSeed((s) => s + 1)}>
          换一批题
        </button>
      </header>

      <div className="chip-row">
        {MAPS.map((m) => {
          const unlocked = data.profile.unlockedMapIds.includes(m.id)
          return (
            <button
              key={m.id}
              type="button"
              className={`chip ${mapId === m.id ? 'on' : ''}`}
              disabled={!unlocked}
              onClick={() => {
                setMapId(m.id)
                setIndex(0)
              }}
            >
              {m.emoji} {m.name}
            </button>
          )
        })}
      </div>

      {q ? (
        <div className="card">
          <QuestionPlayer
            key={q.id + index}
            question={q}
            voiceEnabled={data.profile.settings.voiceEnabled}
            onGraded={(r) => void onGraded(r)}
          />
        </div>
      ) : (
        <p>该地图暂无题目</p>
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
