# Phase 0 Research – Phase 1 AI Chat

## Unknowns & Decisions

### 1. Brazilian PII Redaction Coverage
Decision: Regex + structured parsing for CPF (###.###.###-##), CNPJ (##.###.###/####-##), emails, phone (+55, (##) #####-####), DOB (YYYY-MM-DD or DD/MM/YYYY), insurance numbers alphanumeric length 8-12.
Rationale: Deterministic + fast (<1ms per message) without external ML.
Alternatives: NER model (slower, heavier); hybrid approach not required Phase 1.

### 2. Context Window Strategy
Decision: Maintain last N user+assistant messages where cumulative tokens <= 2k; older summarized into a rolling context note.
Rationale: Keeps latency <2s and cost predictable.
Alternatives: Full transcript every query (latency/cost spike); vector retrieval (overkill Phase 1).

### 3. Deterministic Mock Mode
Decision: Fixed JSON fixtures keyed by scenario code (clinical_summary, balance_summary, overdue_summary, consent_refusal, ambiguous_reference) returned via bypass service.
Rationale: Enables frontend & contract tests w/o LLM.
Alternatives: Seeded pseudo-random generation (non-deterministic test snapshots).

### 4. Fairness Counter Storage
Decision: In-memory LRU (per API instance) + persistent reconciliation event written to audit for investigative tooling. Soft tolerance for slight race across replicas Phase 1.
Rationale: Simplicity + speed; low initial scale.
Alternatives: Redis (premature infra) or Postgres row locking (latency + contention risk).

### 5. Bilingual Localization
Decision: Static message catalog (pt-BR, en-US) with keys (refusal.missing_consent, limit.reached, clarification.request, explanation.header) stored in shared i18n module.
Rationale: Small surface, fast lookups.
Alternatives: Third-party i18n SaaS (unnecessary) or dynamic DB (overhead).

### 6. Audit Retention Implementation
Decision: Postgres table partitioned by year with scheduled job to archive after retention threshold (config default 5y, min 2y) to cold storage table.
Rationale: Efficient pruning and future scalability.
Alternatives: Single large table (bloat); external log service (cost/complexity).

### 7. Redaction Pipeline Design
Decision: Sequential regex passes → placeholder tokens (e.g., <CPF>, <EMAIL>) before logging & explanation generation.
Rationale: Simplicity + readability.
Alternatives: Hashing only (less readable for audits) or irreversible deletion (loses context).

### 8. Consent Verification Path
Decision: Single SQL view verifying active consent row for patient+clinic within last valid window; API call uses SELECT EXISTS.
Rationale: Minimizes application logic; leverages DB RLS.
Alternatives: Service-layer caching (risk of stale revocations Phase 1).

### 9. Latency Budget Allocation (<2s p95)
Decision: 250ms DB lookups + 100ms redaction/validation + 1.4s model response + 250ms safety margin.
Rationale: Explicit budget guides perf monitoring.
Alternatives: Unbounded model streaming (risk of regressions).

### 10. Session Expiration Handling
Decision: Track last_activity timestamp; middleware denies context reuse after 60m → forces new session.
Rationale: Keeps memory size bounded.
Alternatives: Idle summarization (not needed initially).

## Open Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| In-memory rate limiting across replicas inconsistent | Uneven enforcement | Monitor audit; add Redis Phase 2 if discrepancy >5% |
| Regex false positives on numeric strings | Over-redaction reduces clarity | Unit corpus tests; refine patterns |
| Model latency spikes | SLA breach | Multi-provider fallback Phase 2 roadmap |

## Glossary
- Fairness Limit: Query thresholds to prevent resource abuse.
- Deterministic Mock: Static scenario response ensuring test snapshot stability.

## Conclusion
All NEEDS CLARIFICATION resolved. Ready for Phase 1 design implementation.
