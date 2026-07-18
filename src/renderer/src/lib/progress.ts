import { MAPS } from '../../../shared/maps'
import { ACHIEVEMENT_DEFS } from '../../../shared/defaults'
import { shouldLeaveReview, xpForQuestion } from '../../../shared/scoring'
import type { AppData, MapId, Question, QuestionStats } from '../../../shared/types'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function ensureStats(data: AppData, id: string): QuestionStats {
  if (!data.stats[id]) {
    data.stats[id] = {
      questionId: id,
      correctCount: 0,
      wrongCount: 0,
      lastResult: null,
      lastSeenAt: null,
      inReview: false,
      recentResults: []
    }
  }
  return data.stats[id]
}

function unlockAchievement(data: AppData, id: string): void {
  const a = data.profile.achievements.find((x) => x.id === id)
  if (a && !a.unlockedAt) {
    a.unlockedAt = new Date().toISOString()
    data.profile.currency += 20
  }
}

function refreshUnlocks(data: AppData): void {
  for (const m of MAPS) {
    if (data.profile.xp >= m.unlockXp && !data.profile.unlockedMapIds.includes(m.id)) {
      data.profile.unlockedMapIds.push(m.id)
      if (m.id === 'wordtown') unlockAchievement(data, 'map_wordtown')
      if (m.id === 'ielstower') unlockAchievement(data, 'map_ielstower')
    }
  }
  data.profile.level = 1 + Math.floor(data.profile.xp / 100)
}

export function applyAnswer(
  data: AppData,
  q: Question,
  correct: boolean,
  opts?: { isChallenge?: boolean; isSpeak?: boolean }
): AppData {
  const next: AppData = structuredClone(data)
  const st = ensureStats(next, q.id)
  const now = new Date().toISOString()
  st.lastSeenAt = now
  st.recentResults = [...st.recentResults, correct].slice(-8)

  if (correct) {
    st.correctCount += 1
    st.lastResult = 'correct'
    next.profile.totalCorrect += 1
    next.profile.currentCombo += 1
    next.profile.maxCombo = Math.max(next.profile.maxCombo, next.profile.currentCombo)
    next.profile.currency += 3
    if (next.profile.totalCorrect === 1) unlockAchievement(next, 'first_win')
    if (next.profile.currentCombo >= 5) unlockAchievement(next, 'combo_5')
    if (next.profile.currentCombo >= 10) unlockAchievement(next, 'combo_10')
    if (st.inReview && shouldLeaveReview(st.recentResults)) {
      st.inReview = false
      // revenge success count via wrong that were fixed
      const revengeCount = Object.values(next.stats).filter((s) => s.correctCount > 0 && s.wrongCount > 0).length
      if (revengeCount >= 10) unlockAchievement(next, 'revenge_10')
    }
  } else {
    st.wrongCount += 1
    st.lastResult = 'wrong'
    st.inReview = true
    next.profile.totalWrong += 1
    next.profile.currentCombo = 0
  }

  if (opts?.isSpeak) {
    next.profile.totalSpeak += 1
    if (next.profile.totalSpeak >= 20) unlockAchievement(next, 'speak_20')
  }

  const xp = xpForQuestion(q, correct, next.profile.currentCombo, opts?.isChallenge)
  next.profile.xp += xp
  refreshUnlocks(next)

  // streak touch when practicing
  const t = today()
  if (next.profile.lastPracticeDate !== t) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const y = yesterday.toISOString().slice(0, 10)
    if (next.profile.lastPracticeDate === y) {
      next.profile.streakDays += 1
    } else {
      next.profile.streakDays = 1
    }
    next.profile.lastPracticeDate = t
    if (next.profile.streakDays >= 3) unlockAchievement(next, 'streak_3')
    if (next.profile.streakDays >= 7) unlockAchievement(next, 'streak_7')
  }

  return next
}

export function markDungeonComplete(data: AppData): AppData {
  const next = structuredClone(data)
  if (next.daily) next.daily.completed = true
  next.profile.currency += 15
  unlockAchievement(next, 'dungeon_1')
  return next
}

export function pickQuestions(
  all: Question[],
  mapId: MapId,
  count: number,
  preferPopup = false,
  reviewIds: string[] = []
): Question[] {
  const pool = all.filter((q) => {
    if (preferPopup && !q.allowPopup) return false
    return q.mapId === mapId
  })
  const review = all.filter((q) => reviewIds.includes(q.id) && (!preferPopup || q.allowPopup))
  const easy = all.filter((q) => q.tier === 0 && q.allowPopup)

  const result: Question[] = []
  const used = new Set<string>()

  const take = (arr: Question[], n: number): void => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    for (const q of shuffled) {
      if (result.length >= count) break
      if (used.has(q.id)) continue
      used.add(q.id)
      result.push(q)
    }
  }

  // mix: review, current, easy sugar
  take(review, Math.min(2, count))
  take(pool, count)
  take(easy, count)
  take(all.filter((q) => !preferPopup || q.allowPopup), count)
  return result.slice(0, count)
}

/** Daily dungeon size — fixed 30, retry until all cleared */
export const DUNGEON_SIZE = 30

/**
 * Build a 30-question dungeon:
 * 5 warm-up · 15 main · 5 challenge · 5 revenge/review
 * Fills from broader pools if a map runs short.
 */
export function buildDailyDungeon(all: Question[], data: AppData): string[] {
  const mapId = data.profile.currentMapId
  const reviewIds = Object.values(data.stats)
    .filter((s) => s.inReview)
    .map((s) => s.questionId)

  const lower = MAPS.find((m) => m.id === mapId)
  const warmMap = lower && lower.tier > 0 ? MAPS[lower.tier - 1].id : mapId
  const challengeMap =
    lower && lower.tier < 6 ? MAPS[Math.min(6, lower.tier + 1)].id : mapId

  const warmQs = pickQuestions(all, warmMap, 5, true)
  const main = pickQuestions(all, mapId, 15, false, reviewIds)
  const challenge = pickQuestions(all, challengeMap, 5, false)
  const revenge = all
    .filter((q) => reviewIds.includes(q.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)

  const ids = [...warmQs, ...main, ...challenge, ...revenge].map((q) => q.id)
  const seen = new Set<string>()
  const unique: string[] = []
  for (const qid of ids) {
    if (seen.has(qid)) continue
    seen.add(qid)
    unique.push(qid)
  }

  // Fill to 30 from current map, then any map
  const fillFrom = (pool: Question[]): void => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    for (const q of shuffled) {
      if (unique.length >= DUNGEON_SIZE) break
      if (seen.has(q.id)) continue
      seen.add(q.id)
      unique.push(q.id)
    }
  }
  fillFrom(all.filter((q) => q.mapId === mapId))
  fillFrom(all.filter((q) => q.allowPopup))
  fillFrom(all)

  return unique.slice(0, DUNGEON_SIZE)
}

export function dungeonPhase(index: number): string {
  if (index < 5) return '热身'
  if (index < 20) return '主线'
  if (index < 25) return '挑战'
  return '复仇'
}

export function boardEntries(
  data: AppData,
  mode: 'honor' | 'revenge'
): { stats: QuestionStats; intensity: number }[] {
  const list = Object.values(data.stats).filter((s) =>
    mode === 'honor' ? s.correctCount > 0 : s.wrongCount > 0
  )
  list.sort((a, b) =>
    mode === 'honor' ? b.correctCount - a.correctCount : b.wrongCount - a.wrongCount
  )
  return list.map((stats) => ({
    stats,
    intensity:
      mode === 'honor'
        ? Math.min(1, Math.log(1 + stats.correctCount) / Math.log(21))
        : Math.min(1, Math.log(1 + stats.wrongCount) / Math.log(11))
  }))
}

export { ACHIEVEMENT_DEFS, today }
