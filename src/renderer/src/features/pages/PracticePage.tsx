import { useMemo, useState } from 'react'
import { MAPS } from '../../../../shared/maps'
import type { AnswerResult, MapId, QuestionType } from '../../../../shared/types'
import { applyAnswer } from '../../lib/progress'
import { playCombo, playFlip, playSlap, playSuccess } from '../../lib/audio'
import { EffectOverlay, type EffectKind } from '../effects/EffectOverlay'
import { QuestionPlayer } from '../practice/QuestionPlayer'
import { useApp } from '../../state/AppState'

type MapFilter = MapId | 'all'
type TypeFilter = QuestionType | 'all'

const TYPE_OPTS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: '全部题型' },
  { id: 'word_choose', label: '选词' },
  { id: 'listen_choose', label: '听音选义' },
  { id: 'fill_blank', label: '填空' },
  { id: 'reorder', label: '排序' },
  { id: 'shadow_read', label: '跟读' },
  { id: 'dialogue_next', label: '情景对话' },
  { id: 'short_speak', label: '短说' },
  { id: 'topic_card', label: '话题卡' }
]

export function PracticePage(): JSX.Element {
  const { data, questions, save } = useApp()
  const [mapId, setMapId] = useState<MapFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [index, setIndex] = useState(0)
  const [fx, setFx] = useState<EffectKind>('none')
  const [seed, setSeed] = useState(0)

  // Full pool — no unlock gate, no 12-cap
  const list = useMemo(() => {
    let pool = questions.slice()
    if (mapId !== 'all') pool = pool.filter((q) => q.mapId === mapId)
    if (typeFilter !== 'all') pool = pool.filter((q) => q.type === typeFilter)
    // shuffle with seed
    const rng = mulberry32(seed + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
  }, [mapId, typeFilter, questions, seed])

  const q = list[index]
  const total = list.length

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
    setTimeout(() => setIndex((i) => (i + 1 < total ? i + 1 : i)), 450)
  }

  return (
    <div className="page page-wide">
      <header className="page-head">
        <div>
          <p className="eyebrow">Free Practice</p>
          <h1>自由练习 · 不设上限</h1>
          <p className="sub">
            全部地图与题库可随意学 · 当前筛选 <strong>{total}</strong> 题 · 进度 {total ? index + 1 : 0}/{total}
          </p>
        </div>
        <div className="row">
          <button
            type="button"
            className="btn ghost"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index <= 0}
          >
            上一题
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={index >= total - 1}
          >
            下一题
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setSeed((s) => s + 1)
              setIndex(0)
            }}
          >
            重新打乱
          </button>
        </div>
      </header>

      <div className="chip-row">
        <button
          type="button"
          className={`chip ${mapId === 'all' ? 'on' : ''}`}
          onClick={() => {
            setMapId('all')
            setIndex(0)
          }}
        >
          全部地图
        </button>
        {MAPS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`chip ${mapId === m.id ? 'on' : ''}`}
            onClick={() => {
              setMapId(m.id)
              setIndex(0)
            }}
          >
            {m.emoji} {m.name}
          </button>
        ))}
      </div>

      <div className="chip-row">
        {TYPE_OPTS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${typeFilter === t.id ? 'on' : ''}`}
            onClick={() => {
              setTypeFilter(t.id)
              setIndex(0)
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {q ? (
        <div className="card glass">
          <div className="practice-progress">
            <div className="bar">
              <i style={{ width: `${total ? ((index + 1) / total) * 100 : 0}%` }} />
            </div>
            <span className="muted small">
              #{index + 1} · {q.id}
            </span>
          </div>
          <QuestionPlayer
            key={q.id + index}
            question={q}
            voiceEnabled={data.profile.settings.voiceEnabled}
            onGraded={(r) => void onGraded(r)}
          />
        </div>
      ) : (
        <p className="empty card glass">当前筛选下没有题目，试试「全部地图」。</p>
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

function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
