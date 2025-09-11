// T014 structured logger (initial). Now integrates redaction (T042) for sensitive patterns.

export interface LogEntry {
  ts: string
  level: 'info' | 'error' | 'warn'
  svc: string
  msg: string
  [k: string]: unknown
}

import { redact } from './redact'

export function createLogger(service = 'api', autoRedact: boolean = true) {
  function sanitize(value: unknown): unknown {
    if (typeof value === 'string') return redact(value)
    if (Array.isArray(value)) return value.map(sanitize)
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = sanitize(v)
      return out
    }
    return value
  }

  function base(level: LogEntry['level'], msg: string, extra: Record<string, unknown> = {}): LogEntry {
    const cleanMsg = autoRedact ? redact(msg) : msg
    const cleanExtra = autoRedact ? sanitize(extra) : extra
    // Ensure we only spread plain objects — sanitize() can return primitives or arrays.
    const extraObj: Record<string, unknown> =
      cleanExtra && typeof cleanExtra === 'object' && !Array.isArray(cleanExtra)
        ? (cleanExtra as Record<string, unknown>)
        : {}
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      svc: service,
      msg: cleanMsg,
      ...extraObj,
    }
    // For now just console.log JSON
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry))
    return entry
  }
  return {
    info: (msg: string, extra?: Record<string, unknown>) => base('info', msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => base('error', msg, extra),
    warn: (msg: string, extra?: Record<string, unknown>) => base('warn', msg, extra),
  }
}
