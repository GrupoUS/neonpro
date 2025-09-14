# AI Chat SLOs

Last updated: 2025-09-13

Scope
- Endpoints: `/v1/ai-chat/stream`, `/v1/ai-chat/suggestions`
- Environment: production; same targets apply in preview with ±20% tolerance

Targets
- Latency (cold start excluded):
  - P50 ≤ 400ms, P95 ≤ 1500ms for `/stream` (end-to-first-token)
  - P50 ≤ 250ms, P95 ≤ 800ms for `/suggestions`
- Availability: ≥ 99.9% monthly (non-5xx responses)
- Error rate: ≤ 0.5% 5xx per day
- Throughput: sustain 50 RPS for `/suggestions`, 10 RPS for `/stream` without P95 regression >15%
- Budget: slow request budget ≤ 1% above thresholds

Measurement plan
- Add lightweight timers in handlers to emit `X-Response-Time` header and console metrics `{ route, ms, ok }`
- Use Vitest integration tests to assert headers exist and sanity-check bounds in CI
- Optional: k6/Gatling for load to validate throughput; retain reports under `tools/performance/`
- Dashboard: forward logs to your aggregator (Datadog/Loki) and chart P50/P95, error rate, throughput, slow budget

Acceptance checks
- [ ] `/v1/ai-chat/stream` sets timing header(s) and logs route metrics
- [ ] `/v1/ai-chat/suggestions` sets timing header(s) and logs route metrics
- [ ] CI has smoke tests asserting timing headers present

Notes
- Keep PII out of logs. Use `redactPII` for any user-provided content.
- Account for provider time; consider per-provider labels in metrics (OpenAI, Google)