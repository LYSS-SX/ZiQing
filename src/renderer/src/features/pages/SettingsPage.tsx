import { createDefaultAppData } from '../../../../shared/defaults'
import type { UserSettings } from '../../../../shared/types'
import { useApp } from '../../state/AppState'

export function SettingsPage(): JSX.Element {
  const { data, save } = useApp()
  const s = data.profile.settings

  const patch = async (partial: Partial<UserSettings>): Promise<void> => {
    const next = structuredClone(data)
    next.profile.settings = { ...next.profile.settings, ...partial }
    await save(next)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">设置</p>
          <h1>让练习更适合你</h1>
        </div>
      </header>

      <div className="settings card">
        <h3>随机弹题</h3>
        <label className="switch-row">
          <span>启用托盘随机弹题</span>
          <input
            type="checkbox"
            checked={s.popupEnabled}
            onChange={(e) => void patch({ popupEnabled: e.target.checked })}
          />
        </label>
        <label>
          最短间隔（分钟）
          <input
            type="number"
            min={5}
            max={180}
            value={s.popupMinMinutes}
            onChange={(e) => void patch({ popupMinMinutes: Number(e.target.value) || 30 })}
          />
        </label>
        <label>
          最长间隔（分钟）
          <input
            type="number"
            min={5}
            max={240}
            value={s.popupMaxMinutes}
            onChange={(e) => void patch({ popupMaxMinutes: Number(e.target.value) || 60 })}
          />
        </label>
        <label>
          每日上限
          <input
            type="number"
            min={1}
            max={50}
            value={s.popupDailyLimit}
            onChange={(e) => void patch({ popupDailyLimit: Number(e.target.value) || 8 })}
          />
        </label>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => void window.ziqing?.testPopup?.()}>
            立刻测试弹题
          </button>
          <button type="button" className="btn ghost" onClick={() => void window.ziqing?.snoozePopup?.(10)}>
            稍后 10 分钟
          </button>
        </div>
      </div>

      <div className="settings card">
        <h3>反馈与动效</h3>
        <label className="switch-row">
          <span>音效</span>
          <input
            type="checkbox"
            checked={s.soundEnabled}
            onChange={(e) => void patch({ soundEnabled: e.target.checked })}
          />
        </label>
        <label>
          音量
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.soundVolume}
            onChange={(e) => void patch({ soundVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          礼花
          <select
            value={s.fireworksLevel}
            onChange={(e) => void patch({ fireworksLevel: e.target.value as UserSettings['fireworksLevel'] })}
          >
            <option value="off">关</option>
            <option value="standard">标准</option>
            <option value="full">全开</option>
          </select>
        </label>
        <label>
          巴掌
          <select
            value={s.slapLevel}
            onChange={(e) => void patch({ slapLevel: e.target.value as UserSettings['slapLevel'] })}
          >
            <option value="off">关</option>
            <option value="light">轻</option>
            <option value="wild">狂</option>
          </select>
        </label>
        <label className="switch-row">
          <span>减弱动效</span>
          <input
            type="checkbox"
            checked={s.reduceMotion}
            onChange={(e) => void patch({ reduceMotion: e.target.checked })}
          />
        </label>
        <label className="switch-row">
          <span>语音题（跟读/短说）</span>
          <input
            type="checkbox"
            checked={s.voiceEnabled}
            onChange={(e) => void patch({ voiceEnabled: e.target.checked })}
          />
        </label>
        <label>
          主题
          <select
            value={s.theme}
            onChange={(e) => void patch({ theme: e.target.value as 'dark' | 'light' })}
          >
            <option value="dark">深色</option>
            <option value="light">浅色</option>
          </select>
        </label>
      </div>

      <div className="settings card">
        <h3>数据</h3>
        <div className="row">
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = `ziqing-backup-${new Date().toISOString().slice(0, 10)}.json`
              a.click()
            }}
          >
            导出进度 JSON
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={async () => {
              if (!confirm('确定重置全部进度？此操作不可恢复。')) return
              await save(createDefaultAppData())
            }}
          >
            重置进度
          </button>
        </div>
        <p className="muted small">版本 1.0.0 · 紫青口语 ZiQing</p>
      </div>
    </div>
  )
}
