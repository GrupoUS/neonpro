// Phase 3.3 — T014: Rate counter LRU wrapper
import { RateCounter } from '../services/rate-counter'

const counter = new RateCounter({
  windowMs: 60000,
  maxRequests: 10,
})

export function withinChatLimits(_userId: string, max5 = 10, max60 = 30) {
  return counter.withinLimits(_userId, max5, max60)
}

export function recordChatHit(_userId: string) {
  return counter.touch(_userId)
}
