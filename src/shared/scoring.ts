import type { AnswerResult, Question } from './types'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function answersOf(q: Question): string[] {
  return Array.isArray(q.answer) ? q.answer : [q.answer]
}

function similarity(a: string, b: string): number {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.85
  const wa = new Set(na.split(' '))
  const wb = nb.split(' ')
  const hit = wb.filter((w) => wa.has(w)).length
  return hit / Math.max(wb.length, 1)
}

export function gradeAnswer(q: Question, userInput: string): AnswerResult {
  const input = userInput.trim()
  if (!input) {
    return { correct: false, feedback: '还没有作答哦，再试一次！' }
  }

  switch (q.type) {
    case 'listen_choose':
    case 'word_choose':
    case 'fill_blank':
    case 'dialogue_next':
    case 'reorder': {
      const ok = answersOf(q).some((a) => normalize(a) === normalize(input))
      return {
        correct: ok,
        feedback: ok
          ? pickPraise()
          : `正确答案：${answersOf(q)[0]}${q.explanation ? ` · ${q.explanation}` : ''}`
      }
    }
    case 'shadow_read': {
      const target = q.audioText || answersOf(q)[0]
      const score = similarity(input, target)
      // more forgiving for beginners / noisy STT
      const stars = score >= 0.8 ? 3 : score >= 0.45 ? 2 : score >= 0.22 ? 1 : 0
      const correct = stars >= 2 || normalize(input) === normalize(target)
      return {
        correct,
        stars: Math.max(stars, correct ? 2 : stars),
        feedback: correct
          ? `跟读不错！${'⭐'.repeat(Math.max(stars, 2))}`
          : `目标：${target}。识别到：${input}。可点「显示中文」看释义，或再跟读/打字。`
      }
    }
    case 'short_speak':
    case 'topic_card': {
      const keys = q.keywords?.length ? q.keywords : answersOf(q)
      const n = normalize(input)
      const hits = keys.filter((k) => n.includes(normalize(k)))
      const ratio = hits.length / Math.max(keys.length, 1)
      const longEnough = input.split(/\s+/).length >= (q.type === 'topic_card' ? 12 : 5)
      const correct = ratio >= 0.4 && longEnough
      return {
        correct,
        stars: Math.min(3, Math.round(ratio * 3) + (longEnough ? 0 : -1)),
        feedback: correct
          ? `说得很好！你提到了：${hits.slice(0, 4).join(', ') || '关键信息'}`
          : `可以再丰富一点。示范：${q.sampleAnswer || answersOf(q)[0]}。关键词：${keys.join(', ')}`
      }
    }
    default:
      return { correct: false, feedback: '未知题型' }
  }
}

function pickPraise(): string {
  const list = [
    '漂亮！又征服一题 ✨',
    '太棒了，连击继续冲！',
    '正确！口语冒险家名不虚传',
    '完美命中！',
    '就是这个感觉 🔥'
  ]
  return list[Math.floor(Math.random() * list.length)]
}

export function xpForQuestion(q: Question, correct: boolean, combo: number, isChallenge = false): number {
  if (!correct) return 2
  const base = q.tier <= 1 ? 10 : q.tier <= 3 ? 15 : 20
  const challengeBonus = isChallenge ? base : 0
  const comboBonus = combo >= 3 ? Math.min(10, combo) : 0
  return base + challengeBonus + comboBonus
}

export function colorIntensity(count: number, maxRef: number): number {
  if (count <= 0) return 0
  return Math.min(1, Math.log(1 + count) / Math.log(1 + maxRef))
}

/** Consecutive correct in recentResults to leave review (need 2) */
export function shouldLeaveReview(recentResults: boolean[]): boolean {
  if (recentResults.length < 2) return false
  const last2 = recentResults.slice(-2)
  return last2[0] === true && last2[1] === true
}
