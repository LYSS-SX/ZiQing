import { MAPS, type MapMeta } from '../../../../shared/maps'
import type { MapId } from '../../../../shared/types'
import pixelMap from '../../assets/pixel-world-map.jpg'
import './adventure-map.css'

interface Props {
  currentMapId: MapId
  unlockedMapIds: MapId[]
  onSelect: (id: MapId) => void
}

function pathD(maps: MapMeta[]): string {
  if (!maps.length) return ''
  const pts = maps.map((m) => `${m.x},${m.y}`)
  // smooth-ish polyline in percent space
  let d = `M ${pts[0]}`
  for (let i = 1; i < maps.length; i++) {
    const prev = maps[i - 1]
    const cur = maps[i]
    const cx = (prev.x + cur.x) / 2
    const cy1 = prev.y
    const cy2 = cur.y
    d += ` C ${cx},${cy1} ${cx},${cy2} ${cur.x},${cur.y}`
  }
  return d
}

export function AdventureMap({ currentMapId, unlockedMapIds, onSelect }: Props): JSX.Element {
  const d = pathD(MAPS)
  const current = MAPS.find((m) => m.id === currentMapId) ?? MAPS[0]

  return (
    <div className="adv-map glass-deep">
      <div className="adv-map-frame">
        <div className="adv-map-pixel" style={{ backgroundImage: `url(${pixelMap})` }} />
        <div className="adv-map-scan" />
        <div className="adv-map-shade" />

        <svg className="adv-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#A5F3FC" stopOpacity="0.95" />
            </linearGradient>
            <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* dotted underlay for pixel feel */}
          <path
            d={d}
            fill="none"
            stroke="rgba(2, 44, 34, 0.55)"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={d}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeDasharray="1.8 1.2"
            filter="url(#pathGlow)"
            vectorEffect="non-scaling-stroke"
            className="adv-path-line"
          />
        </svg>

        {MAPS.map((m, idx) => {
          const unlocked = unlockedMapIds.includes(m.id)
          const active = m.id === currentMapId
          return (
            <button
              key={m.id}
              type="button"
              className={`adv-node ${unlocked ? 'open' : 'locked'} ${active ? 'here' : ''}`}
              style={{ left: `${m.x}%`, top: `${m.y}%`, ['--node' as string]: m.color }}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(m.id)}
              title={m.name}
            >
              <span className="adv-node-ring" />
              <span className="adv-node-core">
                <span className="adv-node-idx">{idx + 1}</span>
                <span className="adv-node-emoji">{m.emoji}</span>
              </span>
              <span className="adv-node-label">
                <strong>{m.name}</strong>
                <small>{unlocked ? m.subtitle.split('·')[0].trim() : `XP ${m.unlockXp}`}</small>
              </span>
              {active && <span className="adv-you">YOU</span>}
              {!unlocked && <span className="adv-lock">🔒</span>}
            </button>
          )
        })}
      </div>

      <div className="adv-map-caption">
        <div>
          <p className="eyebrow">World Route</p>
          <h2>
            当前关卡 · {current.emoji} {current.name}
          </h2>
          <p className="sub">{current.subtitle}</p>
        </div>
        <div className="adv-legend">
          <span>
            <i className="lg-open" /> 已解锁
          </span>
          <span>
            <i className="lg-here" /> 你在这里
          </span>
          <span>
            <i className="lg-lock" /> 未解锁
          </span>
        </div>
      </div>
    </div>
  )
}
