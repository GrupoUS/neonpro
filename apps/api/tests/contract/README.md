# Contract Tests (RED phase)

This folder contains initial RED tests that define the API contracts for the AI Chat feature and related tools. They intentionally fail to drive TDD (RED → GREEN → REFACTOR).

## How to run only these tests

```bash
pnpm --filter @neonpro/api test:contract
```

Expected: 5 failing tests (one per contract) until implementations are added.

## Contracts covered

### Original AI Chat Contracts

- Chat API streaming (`chat.test.ts`) — UI messages + metadata + structured errors
- Explanation Summary (`explanation.test.ts`) — concise summary with trace id
- Finance: Overdue invoices (`tools.finance.test.ts`) — aging buckets and totals
- Clinical: New treatments (`tools.clinical.treatments.test.ts`) — provider, codes, consent
- Clinical: Patient balance (`tools.clinical.balance.test.ts`) — balance with consent check

### Patient API Contracts (T011-T018) - ✅ IMPLEMENTED

- **patients-list.test.ts** (GET /api/v2/patients) — Pagination, filtering, LGPD compliance
- **patients-create.test.ts** (POST /api/v2/patients) — Brazilian validation, LGPD consent
- **patients-get.test.ts** (GET /api/v2/patients/{id}) — Individual patient data with security
- **patients-update.test.ts** (PUT /api/v2/patients/{id}) — Partial updates with audit trail
- **patients-delete.test.ts** (DELETE /api/v2/patients/{id}) — Soft delete with LGPD compliance
- **patients-search.test.ts** (GET /api/v2/patients/search) — Advanced search with privacy
- **patients-bulk.test.ts** (POST /api/v2/patients/bulk) — Batch operations with validation
- **patients-history.test.ts** (GET /api/v2/patients/{id}/history) — Complete audit trail

## Current Status

**✅ COMPLETED**: 8 Patient API contract tests implemented with comprehensive validation
**🔧 BLOCKER**: @neonpro/security dependency resolution issue in Vite test environment
**⏳ PENDING**: Test execution validation after dependency fix

## Next steps

1. **IMMEDIATE**: Fix @neonpro/security dependency resolution for test environment
2. **SHORT-TERM**: Execute and validate all Patient API contract tests
3. **MEDIUM-TERM**: Implement AI & Compliance contract tests (T019-T026)
4. **LONG-TERM**: Add mobile & performance contract tests (T027, T029-T030)

## Implementation Notes

- All tests follow existing project patterns (api() helper function)
- Comprehensive schema validation with Zod
- Performance requirements (<500ms response times)
- LGPD compliance validation built-in
- Brazilian data format validation (CPF, phone, CEP)
- Error handling with proper HTTP status codes
