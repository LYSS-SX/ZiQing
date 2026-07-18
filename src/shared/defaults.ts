import type { AppData, UserProfile, UserSettings } from './types'

export const DEFAULT_SETTINGS: UserSettings = {
  popupEnabled: true,
  popupMinMinutes: 30,
  popupMaxMinutes: 60,
  popupDailyLimit: 8,
  quietHours: [
    { start: '12:00', end: '13:30' },
    { start: '23:00', end: '08:00' }
  ],
  snoozeMinutes: 10,
  soundEnabled: true,
  soundVolume: 0.7,
  fireworksLevel: 'full',
  slapLevel: 'wild',
  reduceMotion: false,
  voiceEnabled: true,
  theme: 'dark'
}

export const ACHIEVEMENT_DEFS = [
  { id: 'first_win', name: '首胜', desc: '第一次答对题目', icon: '🥇' },
  { id: 'combo_5', name: '连击新手', desc: '达成 5 连击', icon: '🔥' },
  { id: 'combo_10', name: '连击达人', desc: '达成 10 连击', icon: '⚡' },
  { id: 'revenge_10', name: '复仇者', desc: '翻盘 10 道待翻盘题', icon: '🗡️' },
  { id: 'speak_20', name: '开口勇气', desc: '累计开口 20 次', icon: '🎤' },
  { id: 'dungeon_1', name: '副本启程', desc: '完成第一次今日副本', icon: '📜' },
  { id: 'streak_3', name: '三日坚持', desc: '连续打卡 3 天', icon: '📅' },
  { id: 'streak_7', name: '一周战士', desc: '连续打卡 7 天', icon: '🏅' },
  { id: 'map_wordtown', name: '走出咿呀村', desc: '解锁单词小镇', icon: '🗺️' },
  { id: 'map_ielstower', name: '仰望雅思塔', desc: '解锁雅思塔', icon: '🗼' }
] as const

export function createDefaultProfile(): UserProfile {
  const now = new Date().toISOString()
  return {
    displayName: '口语冒险家',
    createdAt: now,
    onboardingDone: false,
    currentMapId: 'yayacun',
    unlockedMapIds: ['yayacun'],
    level: 1,
    xp: 0,
    currency: 0,
    streakDays: 0,
    lastPracticeDate: null,
    totalCorrect: 0,
    totalWrong: 0,
    totalSpeak: 0,
    maxCombo: 0,
    currentCombo: 0,
    popupCountToday: 0,
    popupCountDate: null,
    achievements: ACHIEVEMENT_DEFS.map((a) => ({ id: a.id, unlockedAt: null })),
    settings: { ...DEFAULT_SETTINGS }
  }
}

export function createDefaultAppData(): AppData {
  return {
    profile: createDefaultProfile(),
    stats: {},
    daily: null
  }
}
