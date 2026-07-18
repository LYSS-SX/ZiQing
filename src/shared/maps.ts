import type { MapId } from './types'

export interface MapMeta {
  id: MapId
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6
  name: string
  subtitle: string
  emoji: string
  color: string
  unlockXp: number
}

export const MAPS: MapMeta[] = [
  {
    id: 'yayacun',
    tier: 0,
    name: '咿呀村',
    subtitle: '幼儿园～小学低 · 单词启蒙',
    emoji: '🏡',
    color: '#7dd3a0',
    unlockXp: 0
  },
  {
    id: 'wordtown',
    tier: 1,
    name: '单词小镇',
    subtitle: '小学～初中 · 词句基础',
    emoji: '🏘️',
    color: '#6ec6ff',
    unlockXp: 80
  },
  {
    id: 'dialoguevalley',
    tier: 2,
    name: '对话山谷',
    subtitle: '日常短对话',
    emoji: '🏞️',
    color: '#a78bfa',
    unlockXp: 220
  },
  {
    id: 'campusport',
    tier: 3,
    name: '校园港',
    subtitle: '校园与生活场景',
    emoji: '⚓',
    color: '#fbbf24',
    unlockXp: 420
  },
  {
    id: 'examfront',
    tier: 4,
    name: '考场前线',
    subtitle: '四六级口语感',
    emoji: '🎯',
    color: '#fb923c',
    unlockXp: 700
  },
  {
    id: 'toeflcity',
    tier: 5,
    name: '托福城',
    subtitle: 'TOEFL 口语任务感',
    emoji: '🏙️',
    color: '#f472b6',
    unlockXp: 1100
  },
  {
    id: 'ielstower',
    tier: 6,
    name: '雅思塔',
    subtitle: 'IELTS 口语 1～3',
    emoji: '🗼',
    color: '#e879f9',
    unlockXp: 1600
  }
]

export function getMap(id: MapId): MapMeta {
  return MAPS.find((m) => m.id === id) ?? MAPS[0]
}

export function mapByTier(tier: number): MapMeta {
  return MAPS.find((m) => m.tier === tier) ?? MAPS[0]
}
