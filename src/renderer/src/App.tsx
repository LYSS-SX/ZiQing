import { AppStateProvider, useApp } from './state/AppState'
import { AmbientBackground } from './components/AmbientBackground'
import { Onboarding } from './features/onboarding/Onboarding'
import { MapPage } from './features/pages/MapPage'
import { DungeonPage } from './features/pages/DungeonPage'
import { PracticePage } from './features/pages/PracticePage'
import { VocabPage } from './features/pages/VocabPage'
import { ReviewPage, HonorPage, RevengePage } from './features/pages/BoardsPage'
import { AchievementsPage } from './features/pages/AchievementsPage'
import { SettingsPage } from './features/pages/SettingsPage'
import { PopupApp } from './features/pages/PopupApp'
import type { NavId } from '../../shared/types'

function isPopupRoute(): boolean {
  const h = window.location.hash
  return h.includes('popup')
}

const NAV: { id: NavId; label: string; icon: string }[] = [
  { id: 'map', label: '冒险地图', icon: '🗺️' },
  { id: 'dungeon', label: '今日副本', icon: '📜' },
  { id: 'practice', label: '自由练习', icon: '🎯' },
  { id: 'vocab', label: '单词表', icon: '📗' },
  { id: 'review', label: '待翻盘', icon: '♻️' },
  { id: 'honor', label: '荣誉墙', icon: '🏆' },
  { id: 'revenge', label: '复仇墙', icon: '🗡️' },
  { id: 'achievements', label: '成就报告', icon: '🎖️' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

function Shell(): JSX.Element {
  const { ready, data, nav, setNav } = useApp()

  if (!ready) {
    return (
      <div className="boot">
        <div className="boot-card glass">紫青口语启动中…</div>
      </div>
    )
  }

  if (!data.profile.onboardingDone) {
    return (
      <div className="boot onboard-wrap">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">青</div>
          <div>
            <div className="brand-title">紫青口语</div>
            <div className="brand-sub">Mint · Glass Adventure</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${nav === item.id ? 'active' : ''}`}
              onClick={() => setNav(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div>
            {data.profile.displayName} · Lv.{data.profile.level}
          </div>
          <div className="muted small">
            连击 x{data.profile.currentCombo} · 🔥{data.profile.streakDays}
          </div>
        </div>
      </aside>
      <main className="main">
        {nav === 'map' && <MapPage />}
        {nav === 'dungeon' && <DungeonPage />}
        {nav === 'practice' && <PracticePage />}
        {nav === 'vocab' && <VocabPage />}
        {nav === 'review' && <ReviewPage />}
        {nav === 'honor' && <HonorPage />}
        {nav === 'revenge' && <RevengePage />}
        {nav === 'achievements' && <AchievementsPage />}
        {nav === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default function App(): JSX.Element {
  const popup = isPopupRoute()
  return (
    <AppStateProvider isPopup={popup}>
      <AmbientBackground />
      {popup ? <PopupApp /> : <Shell />}
    </AppStateProvider>
  )
}
