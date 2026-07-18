import { MAPS, getMap } from '../../../../shared/maps'
import { useApp } from '../../state/AppState'

export function MapPage(): JSX.Element {
  const { data, setNav, save } = useApp()
  const current = getMap(data.profile.currentMapId)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">冒险地图</p>
          <h1>
            {current.emoji} {current.name}
          </h1>
          <p className="sub">{current.subtitle}</p>
        </div>
        <div className="stat-pills">
          <span>Lv.{data.profile.level}</span>
          <span>XP {data.profile.xp}</span>
          <span>⭐ {data.profile.currency}</span>
          <span>🔥 {data.profile.streakDays} 天</span>
        </div>
      </header>

      <section className="cta-card">
        <div>
          <h2>今日副本已就绪</h2>
          <p>热身 → 主线 → 挑战 → 复仇，大约 8～12 分钟</p>
        </div>
        <button type="button" className="btn primary lg" onClick={() => setNav('dungeon')}>
          进入今日副本
        </button>
      </section>

      <div className="map-grid">
        {MAPS.map((m) => {
          const unlocked = data.profile.unlockedMapIds.includes(m.id)
          const active = data.profile.currentMapId === m.id
          return (
            <button
              key={m.id}
              type="button"
              className={`map-card ${unlocked ? '' : 'locked'} ${active ? 'active' : ''}`}
              style={{ ['--map' as string]: m.color }}
              disabled={!unlocked}
              onClick={async () => {
                if (!unlocked) return
                const next = structuredClone(data)
                next.profile.currentMapId = m.id
                await save(next)
              }}
            >
              <div className="map-emoji">{m.emoji}</div>
              <div className="map-name">{m.name}</div>
              <div className="map-sub">{m.subtitle}</div>
              <div className="map-xp">解锁 XP ≥ {m.unlockXp}</div>
              {!unlocked && <div className="lock">🔒 继续冒险解锁</div>}
              {active && <div className="you-are">你在这里</div>}
            </button>
          )
        })}
      </div>

      <section className="tips card soft">
        <h3>新手提示</h3>
        <p>
          系统托盘会随机弹短题（可在设置关闭）。答错的题会进「待翻盘」，荣誉墙会越来越绿，复仇墙越来越红——但红色代表「还欠你一场胜利」。
        </p>
      </section>
    </div>
  )
}
