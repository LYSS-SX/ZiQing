import { ACHIEVEMENT_DEFS } from '../../../../shared/defaults'
import { useApp } from '../../state/AppState'

export function AchievementsPage(): JSX.Element {
  const { data } = useApp()
  const unlocked = data.profile.achievements.filter((a) => a.unlockedAt).length

  const weekCorrect = data.profile.totalCorrect
  const weekSpeak = data.profile.totalSpeak

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">成就与报告</p>
          <h1>勋章墙</h1>
          <p className="sub">
            已解锁 {unlocked}/{ACHIEVEMENT_DEFS.length}
          </p>
        </div>
      </header>

      <section className="report card">
        <h2>成长速览</h2>
        <div className="report-grid">
          <div>
            <b>{weekCorrect}</b>
            <span>累计答对</span>
          </div>
          <div>
            <b>{data.profile.totalWrong}</b>
            <span>累计失手</span>
          </div>
          <div>
            <b>{weekSpeak}</b>
            <span>开口次数</span>
          </div>
          <div>
            <b>{data.profile.maxCombo}</b>
            <span>最长连击</span>
          </div>
          <div>
            <b>{data.profile.streakDays}</b>
            <span>连续打卡</span>
          </div>
          <div>
            <b>{Object.values(data.stats).filter((s) => s.inReview).length}</b>
            <span>待翻盘</span>
          </div>
        </div>
      </section>

      <div className="ach-grid">
        {ACHIEVEMENT_DEFS.map((def) => {
          const st = data.profile.achievements.find((a) => a.id === def.id)
          const on = Boolean(st?.unlockedAt)
          return (
            <div key={def.id} className={`ach-card ${on ? 'on' : ''}`}>
              <div className="ach-icon">{def.icon}</div>
              <div className="ach-name">{def.name}</div>
              <div className="ach-desc">{def.desc}</div>
              <div className="ach-state">{on ? '已解锁' : '未解锁'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
