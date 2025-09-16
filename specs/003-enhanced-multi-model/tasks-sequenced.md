# Atomic Task Sequencing – Enhanced Multi-Model Assistant
(Extends Phase 1; execute only after Phase 1 merged unless explicitly parallelized.)

## Legend
P = parallelizable, S = sequential, GATE = review checkpoint

## Phase A – Schema & Types
1. (S) Migration: plans, user_plan, usage_counters, recommendations, domain_descriptors
2. (S) Seed plans (basic, premium) + default user assignments script
3. (S) Extend types package (Plan, UsageCounter, Recommendation, DomainDescriptor)
4. (S) Zod schemas for new endpoints (analyze, crud, usage, recommendations, cancel, models)
5. (GATE) Schema + type review

## Phase B – Quota & Abuse Infrastructure
6. (S) Implement usage counter repository (daily upsert)
7. (S) Implement sliding window memory tracker + unit tests
8. (P) Integration test: free user 40 read queries boundary
9. (P) Integration test: abuse threshold (>12/60s, >5 modifies/10m)
10. (S) Notification events at 80% quota
11. (GATE) Accuracy validation (simulate concurrency)

## Phase C – Domain Descriptor & Parser
12. (S) CRUD domain descriptors (Client, Finance, Appointment)
13. (S) Natural language CRUD intent classifier (rule-based)
14. (S) Arg extraction utilities (date normalization, patient ref)
15. (P) Ambiguity detection + confirmation flow tests
16. (S) Partial outcome report structure + tests
17. (GATE) Parser safety review (no direct SQL injection vector)

## Phase D – Analytics Aggregation Layer
18. (S) Metric template definitions (engagement_rate, cancellation_rate, overdue_ratio)
19. (S) Aggregation queries with parameter binding tests
20. (S) Summarization prompt builder (sanitizes data)
21. (P) Historical window enforcement tests (premium 12m, free 30d)
22. (GATE) Performance sample run (<5s p95)

## Phase E – Model Routing & Failover
23. (S) Model strategy map + config
24. (S) Failover timer thresholds implementation
25. (P) Simulated timeout test triggers fallback
26. (S) Neutral failover notice injection
27. (GATE) Cost & latency impact review

## Phase F – Recommendations Engine
28. (S) Prompt template with category constraint
29. (S) Generation service returning structured JSON
30. (P) Unit tests: only allowed categories
31. (S) Persistence optional toggle (config)
32. (GATE) Compliance review (scope restriction)

## Phase G – API Endpoints
33. (S) POST /ai/analyze (auth + quota + abuse + aggregation + model routing)
34. (S) POST /ai/crud (intent parse → confirmation → execute)
35. (S) POST /ai/recommendations (limited categories)
36. (P) GET /ai/usage
37. (P) POST /ai/cancel
38. (P) GET /ai/models (catalog)
39. (GATE) Contract tests all pass

## Phase H – UI Integration
40. (S) Add plan gating UI states (upgrade prompt component)
41. (P) Usage meter indicator (80% & 100% warnings)
42. (P) CRUD confirmation modal
43. (S) Failover neutral banner injection
44. (P) Recommendation cards
45. (GATE) UX review (clarity & neutrality)

## Phase I – Metrics & Observability
46. (S) Implement metrics taxonomy counters/gauges
47. (S) Logging enrichment: model_used, failover flag
48. (P) Dashboard queries (temporary script)
49. (GATE) SLA dashboard readiness

## Phase J – Hardening & Finalization
50. (S) Abuse cooldown resume test scenario
51. (S) Data retention validation (usage + recs)
52. (S) Marketing copy integration for dynamic upgrade benefits
53. (S) es-ES key placeholders added
54. (GATE) Final constitution & security review

## Exit Criteria
- All GATE checkpoints pass
- Quota & abuse accuracy ≥99%
- Failover engaged <5% under normal load
- CRUD parser false positive destructive rate <1% test suite
