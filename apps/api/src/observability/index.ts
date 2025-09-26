// Minimal observability utilities (structured logs & metrics)
import { endTimerMs, logMetric, startTimer } from '@/services/metrics'

export type ObsTimer = ReturnType<typeof startTimer>

export function withTimer<T>(fn: (timer: ObsTimer) => Promise<T>): Promise<T> {
  const timer = startTimer()
  return fn(timer)
}

export function metric(
  route: string,
  timer: ObsTimer,
  ok: boolean,
  extra?: Record<string, unknown>,
) {
  const ms = endTimerMs(timer)
  logMetric({ route, ms, ok, ...extra })
  return ms
}

export function structuredLog(
  event: string,
  _payload: Record<string, unknown>,
) {
  // Delegate to metrics logger to keep JSON format consistent
  logMetric({ type: 'log', event, ...payload })
}
