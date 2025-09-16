# Phase 0 Research – Enhanced Multi-Model Assistant

## 1. Multi-Model Selection Strategy
Decision: Strategy map {MODEL_BASIC: fast small context, MODEL_SPEED: low-latency mid quality, MODEL_ADV_REASON: reasoning-intensive, MODEL_ANALYTICS: summarization tuned}. Free: MODEL_BASIC only. Premium: all.
Rationale: Deterministic gating; supports A/B later.
Alternatives: Dynamic scoring per request (premature complexity now).

## 2. Failover Logic
Decision: If primary model timeout >1.8s (analytics) or >1.2s CRUD, escalate to next tier MODEL_SPEED → MODEL_ADV_REASON fallback hierarchy; annotate response with neutral notice.
Rationale: Predictable thresholds.
Alternatives: Concurrent race (higher cost), cascading retries (latency inflation).

## 3. Natural Language CRUD Parsing
Decision: Rule-based intent classifier (verb token + domain keyword set) + structured arg extraction patterns (date/time normalization, patient reference) before DB call; confirmation step if >5 entities or ambiguous domain.
Rationale: Transparent + testable.
Alternatives: Direct LLM generated SQL (security risks) or DSL training (time cost).

## 4. Quota & Abuse Enforcement
Decision: Daily counters persisted (usage_counters table) + sliding time windows in memory for abuse thresholds; write events to audit for post-analysis.
Rationale: Accuracy for quota, speed for abuse windows.
Alternatives: All in DB (contention), all in memory (loss after restart).

## 5. Cross-Domain Analytics Aggregation
Decision: Predefine allowed metric templates (engagement_rate, cancellation_rate, overdue_ratio) with safe parameter binding; combine domain queries server-side then feed sanitized aggregated JSON to model for summarization & recommendations.
Rationale: Avoid arbitrary free-form SQL.
Alternatives: Direct natural language → SQL (risk).

## 6. Recommendation Scope Limitation
Decision: Enum categories: PAYMENT_FOLLOWUP, SCHEDULING_OPTIMIZATION, CLIENT_ENGAGEMENT. Model prompt constrained with system guardrails.
Rationale: Prevent scope creep & compliance risk.
Alternatives: Open suggestions (unbounded actions).

## 7. Historical Window Enforcement
Decision: Validate requested date range; free limited to last 30 days (read only); premium up to 12 months; reject larger with compliance message.
Rationale: Manage cost & performance.
Alternatives: Same window for all (reduced premium value).

## 8. Partial CRUD Transaction Handling
Decision: Parse multi-instruction; execute in transactional batches per domain; on failure mid-batch, roll back that batch but report preceding successes; construct PartialOutcomeReport.
Rationale: Consistency + transparency.
Alternatives: All-or-nothing (loses partial productivity) or per-row commit (complex error summarization).

## 9. Usage Approaching Limit Notifications
Decision: Emit upgrade prompt events at 80% and 100% (free tier). Display remaining count and benefits list pulled from marketing copy file.
Rationale: Encourages conversion with context.
Alternatives: Only at 100% (missed upsell window).

## 10. Localization Expansion Plan
Decision: es-ES placeholders reserved; translation keys created now with fallback to en-US; Phase 2 will populate.
Rationale: Avoid key churn.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| CRUD parser misinterprets ambiguous phrasing | Wrong data change | Mandatory confirmation when low confidence / >5 modifications |
| Failover triggers too often (cost) | Elevated spend | Metrics threshold review, adjust timeouts via config |
| Abuse detection memory loss on restart | Temporary leniency | Persist last window snapshot periodically |
| Recommendation overreach | Compliance/ethical issues | Strict prompt template + category enum enforcement |

## Conclusion
All unknowns resolved; ready for Phase 1 design artifacts.
