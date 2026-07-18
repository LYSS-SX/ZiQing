import type { MapId } from './types'

export interface MapMeta {
  id: MapId
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6
  name: string
  subtitle: string
  emoji: string
  color: string
  unlockXp: number
  /** percent position on world map canvas */
  x: number
  y: number
}

/** Teal / aqua / mint only — no purple */
export const MAPS: MapMeta[] = [
  {
    id: 'yayacun',
    tier: 0,
    name: '咿呀村',
    subtitle: '幼儿园～小学低 · 单词启蒙',
    emoji: '🏡',
    color: '#5EEAD4',
    unlockXp: 0,
    x: 7,
    y: 68
  },
  {
    id: 'wordtown',
    tier: 1,
    name: '单词小镇',
    subtitle: '小学～初中 · 词句基础',
    emoji: '🏘️',
    color: '#2DD4BF',
    unlockXp: 80,
    x: 20,
    y: 42
  },
  {
    id: 'dialoguevalley',
    tier: 2,
    name: '对话山谷',
    subtitle: '日常短对话',
    emoji: '🏞️',
    color: '#14B8A6',
    unlockXp: 220,
    x: 34,
    y: 58
  },
  {
    id: 'campusport',
    tier: 3,
    name: '校园港',
    subtitle: '校园与生活场景',
    emoji: '⚓',
    color: '#06B6D4',
    unlockXp: 420,
    x: 48,
    y: 38
  },
  {
    id: 'examfront',
    tier: 4,
    name: '考场前线',
    subtitle: '四六级口语感',
    emoji: '🎯',
    color: '#22D3EE',
    unlockXp: 700,
    x: 62,
    y: 55
  },
  {
    id: 'toeflcity',
    tier: 5,
    name: '托福城',
    subtitle: 'TOEFL 口语任务感',
    emoji: '🏙️',
    color: '#67E8F9',
    unlockXp: 1100,
    x: 76,
    y: 36
  },
  {
    id: 'ielstower',
    tier: 6,
    name: '雅思塔',
    subtitle: 'IELTS 口语 1～3',
    emoji: '🗼',
    color: '#A5F3FC',
    unlockXp: 1600,
    x: 90,
    y: 50
  }
]

export function getMap(id: MapId): MapMeta {
  return MAPS.find((m) => m.id === id) ?? MAPS[0]
}

export function mapByTier(tier: number): MapMeta {
  return MAPS.find((m) => m.tier === tier) ?? MAPS[0]
}
