# GoTrue Warning Monitoring

This lightweight monitor detects and throttles repeated GoTrueClient warnings (e.g., "Multiple GoTrueClient instances detected"). It logs once per session and helps diagnose duplicate client instantiation.

Location: `apps/web/src/lib/monitoring/gotrue-warning-monitor.ts`
Bootstrap: imported at the top of `apps/web/src/main.tsx`.

What it does:

- Intercepts `console.warn` and `console.error`
- Looks for messages containing `GoTrueClient` signatures
- Reports once per session via `console.info` (hook for telemetry later)

How to test:

1. Force a second Supabase client creation in dev to trigger the warning
2. Observe a single `[monitor] GoTrue warning observed once this session` log

Notes:

- Safe no-op in production unless the warning occurs
- No external dependencies or network calls
- Can be extended to send events to your APM
