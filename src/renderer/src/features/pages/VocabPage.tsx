import { useMemo, useState } from 'react'
import type { VocabEntry } from '../../../../shared/types'
import vocabData from '../../content/vocabulary.json'
import { speakText } from '../../lib/audio'
import { useApp } from '../../state/AppState'
import './vocab.css'

const LEVELS = ['all', 'A1', 'A2', 'B1', 'B2'] as const

export function VocabPage(): JSX.Element {
  const { data } = useApp()
  const words = (vocabData as { words: VocabEntry[] }).words
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all')
  const [active, setActive] = useState<VocabEntry | null>(null)

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase()
    return words
      .filter((w) => (level === 'all' ? true : w.level === level))
      .filter((w) => {
        if (!key) return true
        return (
          w.word.toLowerCase().includes(key) ||
          w.meaningZh.includes(key) ||
          (w.example || '').toLowerCase().includes(key)
        )
      })
      .sort((a, b) => a.word.localeCompare(b.word))
  }, [words, q, level])

  return (
    <div className="page page-wide">
      <header className="page-head">
        <div>
          <p className="eyebrow">Word Book</p>
          <h1>单词表</h1>
          <p className="sub">
            内置基础词库 <strong>{words.length}</strong> 词 · 支持中英搜索 · 点击可听发音
          </p>
        </div>
      </header>

      <div className="vocab-toolbar card glass">
        <input
          className="vocab-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索英文单词或中文释义，例如 apple / 苹果"
        />
        <div className="chip-row">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              className={`chip ${level === lv ? 'on' : ''}`}
              onClick={() => setLevel(lv)}
            >
              {lv === 'all' ? '全部级别' : lv}
            </button>
          ))}
        </div>
        <p className="muted small">匹配 {filtered.length} 词</p>
      </div>

      <div className="vocab-layout">
        <div className="vocab-list card glass">
          {filtered.slice(0, 400).map((w) => (
            <button
              key={w.id}
              type="button"
              className={`vocab-row ${active?.id === w.id ? 'on' : ''}`}
              onClick={() => setActive(w)}
            >
              <span className="vw">{w.word}</span>
              <span className="vm">{w.meaningZh}</span>
              <span className="vl">{w.level}</span>
            </button>
          ))}
          {filtered.length > 400 && (
            <p className="muted small pad">仅显示前 400 条，请用搜索缩小范围。</p>
          )}
          {filtered.length === 0 && <p className="empty pad">没有匹配的单词</p>}
        </div>

        <div className="vocab-detail card glass">
          {active ? (
            <>
              <div className="vd-word">{active.word}</div>
              <div className="vd-meta">
                <span>{active.level}</span>
                {active.pos ? <span>{active.pos}</span> : null}
              </div>
              <div className="vd-zh">{active.meaningZh}</div>
              {active.example ? (
                <div className="vd-ex">
                  <p>{active.example}</p>
                  {active.exampleZh ? <p className="muted">{active.exampleZh}</p> : null}
                </div>
              ) : null}
              <div className="row">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    if (data.profile.settings.voiceEnabled) speakText(active.word)
                  }}
                >
                  🔊 听发音
                </button>
                {active.example ? (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      if (data.profile.settings.voiceEnabled) speakText(active.example as string)
                    }}
                  >
                    听例句
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="empty">从左侧选择一个单词查看详情</div>
          )}
        </div>
      </div>
    </div>
  )
}
