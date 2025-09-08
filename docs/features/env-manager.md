# GoTrue Warning Monitor

Purpose: throttle noisy GoTrueClient warnings/errors to a single session-level notice so real issues stay visible.

- Location: `apps/web/src/lib/monitoring/gotrue-warning-monitor.ts`
- Wiring: imported first in `apps/web/src/main.tsx`
- Behavior:
  - Patches `console.warn`/`console.error` in the browser only
  - Detects messages containing: `GoTrueClient`, `Multiple GoTrueClient instances`, `gotrue`
  - Reports once per session via `console.info` and lets originals pass through
- Safety:
  - No-op on server (checks `typeof window !== 'undefined'`)
  - No external deps or side effects
- Next:
  - Optionally forward first hit to Sentry when DSN is configured
