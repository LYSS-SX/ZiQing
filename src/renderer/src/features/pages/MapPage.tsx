import { getMap } from '../../../../shared/maps'
import { useApp } from '../../state/AppState'
import { AdventureMap } from '../map/AdventureMap'
import type { MapId } from '../../../../shared/types'

export function MapPage(): JSX.Element {
  const { data, setNav, save } = useApp()
  const current = getMap(data.profile.currentMapId)

  const selectMap = async (id: MapId): Promise<void> => {
    const next = structuredClone(data)
    next.profile.currentMapId = id
    await save(next)
  }

  return (
    <div className="page page-wide">
      <header className="page-head">
        <div>
          <p className="eyebrow">Adventure Map</p>
          <h1>口语世界 · 关卡路线</h1>
          <p className="sub">沿像素之路从咿呀村走到雅思塔 — 点击节点切换当前关卡</p>
        </div>
        <div className="stat-pills">
          <span>Lv.{data.profile.level}</span>
          <span>XP {data.profile.xp}</span>
          <span>⭐ {data.profile.currency}</span>
          <span>🔥 {data.profile.streakDays} 天</span>
        </div>
      </header>

      <AdventureMap
        currentMapId={data.profile.currentMapId}
        unlockedMapIds={data.profile.unlockedMapIds}
        onSelect={(id) => void selectMap(id)}
      />

      <section className="cta-card glass">
        <div>
          <h2>今日副本 · {current.emoji} {current.name}</h2>
          <p>30 题循环挑战 · 答对才前进 · 直到全部通关</p>
        </div>
        <button type="button" className="btn primary lg" onClick={() => setNav('dungeon')}>
          进入今日副本
        </button>
      </section>

      <section className="tips card soft glass">
        <h3>路线说明</h3>
        <p>
          地图上的虚线是你的主线关卡路线。已解锁节点可随时回访复习；未解锁节点需积累 XP。
          托盘弹题会优先抽取当前关卡与「待翻盘」短题。
        </p>
      </section>
    </div>
  )
}
