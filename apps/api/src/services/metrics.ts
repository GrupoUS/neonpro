// Lightweight metrics helpers (no external deps)
// Note: Keep PII out of labels and logs

export type Timer = { start: bigint }

export function startTimer(): Timer {
  return { start: process.hrtime.bigint() }
}

export function endTimerMs(t: Timer): number {
  const ns = process.hrtime.bigint() - t.start
  return Number(ns / 1000000n)
}

export function logMetric(event: Record<string, unknown>) {
  try {
    console.log(JSON.stringify({ type: 'metrics', ...event }))
  } catch {
    // noop
  }
}
