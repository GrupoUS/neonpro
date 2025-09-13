# Contract Tests (RED phase)

This folder contains initial RED tests that define the API contracts for the AI Chat feature and related tools. They intentionally fail to drive TDD (RED → GREEN → REFACTOR).

## How to run only these tests

```bash
pnpm --filter @neonpro/api test:contract
```

Expected: 5 failing tests (one per contract) until implementations are added.

## Contracts covered
- Chat API streaming (`chat.test.ts`) — UI messages + metadata + structured errors
- Explanation Summary (`explanation.test.ts`) — concise summary with trace id
- Finance: Overdue invoices (`tools.finance.test.ts`) — aging buckets and totals
- Clinical: New treatments (`tools.clinical.treatments.test.ts`) — provider, codes, consent
- Clinical: Patient balance (`tools.clinical.balance.test.ts`) — balance with consent check

## Next steps
1. Implement minimal routes/handlers in `src/routes/ai/*` to satisfy each contract.
2. Add Zod schemas for request/response validation and wire into Hono.
3. Add MSW/fixtures for deterministic tests.
4. Turn tests GREEN incrementally and refactor.
