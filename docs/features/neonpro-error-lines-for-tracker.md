# NeonPro — Error lines for tracker

Generated: 2025-09-23
Source: IDE diagnostics (get_errors) + `bun run type-check` output

Format for tracker: `path:line:column — brief message`

---

## TypeScript / Type-check failures (from `bun run type-check`)

- packages/utils/src/lgpd.ts:52:11 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:53:23 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:70:29 — TS18048: 'domain' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:73:15 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:75:40 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:75:71 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:78:40 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:78:71 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:78:106 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:78:137 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:82:32 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:82:63 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:89:11 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:90:26 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:91:28 — TS18048: 'baseName' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:91:53 — TS18048: 'baseName' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:92:29 — TS18048: 'domain' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:93:30 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:93:61 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:99:27 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:99:49 — TS18048: 'local' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:100:27 — TS18048: 'domain' is possibly 'undefined'.
- packages/utils/src/lgpd.ts:101:28 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:101:59 — TS2532: Object is possibly 'undefined'.
- packages/utils/src/lgpd.ts:125:42 — TS6133: 'match' is declared but its value is never read.
- packages/utils/src/lgpd.ts:138:33 — TS6133: 'partialRedaction' is declared but its value is never read.
- packages/utils/src/lgpd.ts:190:6 — TS6133: 'match' is declared but its value is never read.

---

## IDE diagnostics (selected entries) — ready to paste

- apps/api/src/schemas/healthcare-validation-schemas.ts:462:1 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:81:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:119:7 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:148:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:177:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:234:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:243:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:362:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:384:7 — Variable 'payload' is declared but never used.
- apps/api/src/services/certificate-monitor.ts:407:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:449:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/certificate-monitor.ts:494:5 — Catch parameter '_error' is caught but never used.
- apps/api/src/services/data-retention-service.ts:613:3 — Parameter 'dataSource' is declared but never used.
- apps/api/src/services/data-retention-service.ts:614:3 — Parameter 'dataIdentifier' is declared but never used.
- apps/api/src/services/audit-trail-compatibility.ts:36:5 — Variable 'orderBy' is declared but never used.
- apps/api/src/services/lgpd-service.ts:485:7 — Variable 'request' is declared but never used.
- apps/api/src/__tests__/audit/performance-threshold-tests.test.ts:198:7 — Variable 'responseTimes' is declared but never used.
- apps/api/src/__tests__/audit/performance-threshold-tests.test.ts:203:12 — Parameter 'i' is declared but never used.
- apps/api/src/__tests__/contracts/clinic.contract.test.ts:52:3 — Variable 'trpcMsw' is declared but never used.
- apps/api/src/middleware/compression-middleware.ts:110:5 — Variable 'originalWrite' is declared but never used.
- apps/api/src/middleware/compression-middleware.ts:550:3 — Parameter 'config' is declared but never used.
- apps/api/src/middleware/lgpd-middleware.ts:416:1 — Function 'exportUserData' is declared but never used.
- apps/api/src/middleware/lgpd-middleware.ts:575:1 — Function 'deleteUserData' is declared but never used.
- apps/api/src/middleware/streaming.ts:170:9 — Catch parameter 'error' is caught but never used.
- apps/api/src/routes/ai/chat.ts:164:7 — Variable 'aiChatRequest' is declared but never used.
- apps/api/src/routes/ai/chat.ts:446:11 — Variable 'user' is declared but never used.
- apps/api/src/routes/ai/chat.ts:551:11 — Variable 'user' is declared but never used.
- apps/api/src/routes/ai/insights.ts:304:7 — Variable 'insightsRequest' is declared but never used.
- apps/api/src/services/circuit-breaker/circuit-breaker-service.ts:260:7 — Catch parameter 'fallbackError' is caught but never used.
- apps/api/src/services/circuit-breaker/circuit-breaker-service.ts:307:7 — Catch parameter 'fallbackError' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:303:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:319:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:334:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:353:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:368:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/circuit-breaker/health-checker.ts:303:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/database/query-optimizer-service.ts:123:5 — Parameter 'client' is declared but never used.
- apps/api/src/services/database/query-optimizer-service.ts:128:5 — Parameter 'client' is declared but never used.
- apps/api/src/services/database/query-optimizer-service.ts:133:5 — Parameter 'client' is declared but never used.
- apps/api/src/services/database/query-optimizer-service.ts:262:5 — Variable 'startTime' is declared but never used.
- apps/api/src/services/database/query-optimizer-service.ts:636:5 — Variable 'cacheKey' is declared but never used.
- apps/api/src/services/database/query-optimizer-service.ts:650:5 — Variable 'cacheKey' is declared but never used.
- apps/api/src/services/dynamic-connection-pool.ts:469:5 — Variable 'now' is declared but never used.
- apps/api/src/services/dynamic-connection-pool.ts:599:5 — Catch parameter 'error' is caught but never used.
- apps/api/src/services/enhanced-performance-optimization.ts:578:9 — Variable 'batch' is declared but never used.
- apps/api/src/services/enhanced-performance-optimization.ts:1105:5 — Variable 'cutoff' is declared but never used.
- apps/api/src/services/enhanced-rls-security.ts:7:1 — Identifier 'HealthcareRateLimitStore' is imported but never used.
- apps/api/src/services/enhanced-rls-security.ts:7:1 — Type 'RateLimitData' is imported but never used.

---

## Notes
- The type-check failure in `packages/utils/src/lgpd.ts` caused the overall `bun run type-check` to fail; I included all reported TS errors above.
- If you want a CSV instead, I can generate it next (columns: path, line, column, message).
- I will attach `docs/features/neonpro-typecheck-log.txt` to subtask `2.G.02` as requested (please confirm the exact Archon task ID if you have it). 

---

