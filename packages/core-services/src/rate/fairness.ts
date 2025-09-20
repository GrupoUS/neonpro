// Phase 3.3 — T014: Rate counter LRU wrapper
import { RateCounterService } from "../services/rate-counter";

const counter = new RateCounterService();

export function withinChatLimits(userId: string, max5 = 10, max60 = 30) {
  return counter.withinLimits(userId, max5, max60);
}

export function recordChatHit(userId: string) {
  return counter.touch(userId);
}
