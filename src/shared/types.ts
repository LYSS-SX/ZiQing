export type QuestionType =
  | 'listen_choose'
  | 'word_choose'
  | 'fill_blank'
  | 'reorder'
  | 'shadow_read'
  | 'short_speak'
  | 'dialogue_next'
  | 'topic_card'

export type MapId =
  | 'yayacun'
  | 'wordtown'
  | 'dialoguevalley'
  | 'campusport'
  | 'examfront'
  | 'toeflcity'
  | 'ielstower'

export interface Question {
  id: string
  mapId: MapId
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6
  type: QuestionType
  prompt: string
  /** Chinese translation of the prompt for learners */
  promptZh?: string
  promptLocale?: 'zh' | 'en' | 'bilingual'
  choices?: string[]
  /** Optional Chinese glosses aligned with choices */
  choicesZh?: string[]
  answer: string | string[]
  keywords?: string[]
  sampleAnswer?: string
  sampleAnswerZh?: string
  audioText?: string
  tags: string[]
  allowPopup: boolean
  estSeconds: number
  explanation?: string
}

export interface VocabEntry {
  id: string
  word: string
  phonetic?: string
  meaningZh: string
  pos?: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'basic'
  mapId?: MapId
  example?: string
  exampleZh?: string
  tags?: string[]
}

export interface UserSettings {
  popupEnabled: boolean
  popupMinMinutes: number
  popupMaxMinutes: number
  popupDailyLimit: number
  quietHours: { start: string; end: string }[]
  snoozeMinutes: number
  soundEnabled: boolean
  soundVolume: number
  fireworksLevel: 'off' | 'standard' | 'full'
  slapLevel: 'off' | 'light' | 'wild'
  reduceMotion: boolean
  voiceEnabled: boolean
  theme: 'dark' | 'light'
}

export interface QuestionStats {
  questionId: string
  correctCount: number
  wrongCount: number
  lastResult: 'correct' | 'wrong' | null
  lastSeenAt: string | null
  inReview: boolean
  recentResults: boolean[]
}

export interface AchievementState {
  id: string
  unlockedAt: string | null
}

export interface UserProfile {
  displayName: string
  createdAt: string
  onboardingDone: boolean
  currentMapId: MapId
  unlockedMapIds: MapId[]
  level: number
  xp: number
  currency: number
  streakDays: number
  lastPracticeDate: string | null
  totalCorrect: number
  totalWrong: number
  totalSpeak: number
  maxCombo: number
  currentCombo: number
  popupCountToday: number
  popupCountDate: string | null
  achievements: AchievementState[]
  settings: UserSettings
}

export interface DailyDungeonState {
  date: string
  completed: boolean
  questionIds: string[]
  currentIndex: number
  started: boolean
  /** How many questions cleared correctly in this run (0–30) */
  clearedCount: number
  /** Wrong answers on the current question */
  wrongOnCurrent: number
  /** Times the player restarted this dungeon today */
  restartCount: number
  /** Target size (always 30 for v2) */
  targetCount: number
}

export interface AppData {
  profile: UserProfile
  stats: Record<string, QuestionStats>
  daily: DailyDungeonState | null
}

export type NavId =
  | 'map'
  | 'dungeon'
  | 'practice'
  | 'vocab'
  | 'review'
  | 'honor'
  | 'revenge'
  | 'achievements'
  | 'settings'

export interface AnswerResult {
  correct: boolean
  feedback: string
  stars?: number
}
