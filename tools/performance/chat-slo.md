# Chat SLO — Startup Latency

Objective: p95 time to first streamed token (chat start) ≤ 2000 ms in steady state.

Scope
- Endpoint: POST /v1/ai-chat/stream (mock and provider-backed)
- Environment: local dev and preview
- Measurement units: milliseconds

Acceptance Criteria
- p95 ≤ 2000 ms for 30 sequential runs (warm cache)
- p99 ≤ 3000 ms
- No single outlier > 5000 ms

How to Measure
1) Use the included scripts:

```bash
# warmup / cold-start check
bash tools/performance/run-cold-start-measurement.sh

# verify turbo cache effects on build
bash tools/performance/verify-turbo-cache.sh

# run performance budget checks (includes p95 assertions)
bash tools/performance/validate-performance-budgets.sh
```

2) Web test (integration) already asserts streaming starts ≤ 2s:
- apps/web/tests/integration/chat-streaming.test.ts

3) Headers and Metrics
- X-Response-Time header is set by the API for chat requests
- Structured metric log emitted: { type: 'metrics', route, ms, ok, model? }

References
- docs/features/chat-slo.md (authoritative SLO and diagnosis playbook)
- specs/001-ai-chat-with/contracts/chat.md (headers)
- apps/api/src/services/metrics.ts (timers, logging)
- apps/api/src/routes/ai-chat.ts (instrumentation)
