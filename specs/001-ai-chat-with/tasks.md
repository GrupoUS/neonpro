# Tasks: AI Chat with Database-Aware Context

**Input**: Design documents from `/specs/001-ai-chat-with/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Load optional design documents (data-model, contracts, research, quickstart)
3. Generate tasks by category (Setup → Tests → Core → Integration → Polish)
4. Apply rules (different files → [P], tests before implementation)
5. Number tasks sequentially (T001, T002...)
6. Create dependency graph and parallel examples
7. Return: SUCCESS (tasks ready for execution)
```

## Path Conventions (Web App)
- Backend: `apps/api/src/` + tests in `apps/api/`
- Frontend: `apps/web/src/` + tests in `apps/web/`

---

## Phase 3.1: Setup
- [x] T001 Create feature branch scaffolding and ensure specs are synced
  - Done: Verified `/specs/001-ai-chat-with/*` exists (plan.md, research.md, data-model.md, contracts) and is synced. Working on main due to tool constraints; branch noted in docs.
  - Files: `/home/vibecode/neonpro/specs/001-ai-chat-with/*`
  - Notes: Branch already created `001-ai-chat-with`; verify latest
- [x] T002 Install UI primitives (shadcn) for Elements-based chat [P]
  - Done: UI primitives already available via `@neonpro/ui` and `apps/web/src/components/ui/*`; no further install needed.
  - Run:
    - `pnpm dlx shadcn@latest add @shadcn/input @shadcn/textarea @shadcn/dialog @shadcn/popover @shadcn/tooltip @shadcn/toast @shadcn/badge @shadcn/card @shadcn/progress @shadcn/skeleton @shadcn/spinner @shadcn/separator @shadcn/alert @shadcn/accordion @shadcn/avatar @shadcn/scroll-area @shadcn/dropdown-menu @shadcn/command @shadcn/tabs`
  - Scope: repo root (monorepo-aware)
- [x] T003 Configure accessibility and i18n scaffolding [P]
  - Done: Added `apps/web/src/i18n/*` with pt-BR default and en-US; basic a11y labels in new UI (aria-live/status).
  - Files: `apps/web/src/i18n/*`, `apps/web/src/components/*`
  - Notes: Ensure pt-BR default, structure for additional locales

## Phase 3.2: Tests First (TDD)
### Contract Tests (from contracts/)
- [x] T004 [P] Contract test — Chat API streaming in `apps/api/tests/contract/chat.test.ts`
- [x] T005 [P] Contract test — Explanation Summary in `apps/api/tests/contract/explanation.test.ts`
- [x] T006 [P] Contract test — Finance getOverdueInvoices in `apps/api/tests/contract/tools.finance.test.ts`
- [x] T007 [P] Contract test — Clinical getNewTreatments in `apps/api/tests/contract/tools.clinical.treatments.test.ts`
- [x] T008 [P] Contract test — Clinical getPatientBalance (consent) in `apps/api/tests/contract/tools.clinical.balance.test.ts`

### Integration Tests (from spec user stories)
- [x] T009 [P] Integration — Chat streaming start ≤2s in `apps/web/tests/integration/chat-streaming.test.ts`
- [x] T010 [P] Integration — Consent gating on patient query in `apps/api/tests/integration/consent-gating.test.ts`
- [x] T011 [P] Integration — RLS clinic isolation in `apps/api/tests/integration/rls-isolation.test.ts`
- [x] T012 [P] Integration — Error handling (provider/rate limit/timeout) in `apps/web/tests/integration/chat-errors.test.ts`
- [x] T013 [P] Integration — Audit logging for chat/explanation in `apps/api/tests/integration/audit-events.test.ts`

### UI Component Tests (Elements)
- [x] T014 [P] Prompt Input — Enter/Shift+Enter/validation in `apps/web/tests/ui/prompt-input.test.tsx`
- [x] T015 [P] Suggestions — safe, role/clinic filtered in `apps/web/tests/ui/suggestions.test.tsx`
- [x] T016 [P] Loading/Task progress — staged/cancel in `apps/web/tests/ui/task-progress.test.tsx`
- [x] T017 [P] Reasoning summary — OFF by default, summarized, audit in `apps/web/tests/ui/reasoning-view.test.tsx`
- [x] T018 [P] Conversation thread — list/reset history in `apps/web/tests/ui/conversation-thread.test.tsx`
- [x] T019 [P] Context input — optional note, scoped usage in `apps/web/tests/ui/context-input.test.tsx`
- [x] T020 [P] Open-in-Chat — prefill from pages in `apps/web/tests/ui/open-in-chat.test.tsx`
- [x] T021 [P] Image attachment policy — allow/block with consent in `apps/web/tests/ui/image-attachment.test.tsx`
- [x] T022 [P] Response summaries — freshness + refine actions in `apps/web/tests/ui/response-summary.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
### Backend (apps/api)
- [x] T023 Implement Chat API route (streaming) in `apps/api/src/routes/ai-chat.ts`
- [x] T024 Implement Explanation summary endpoint in `apps/api/src/routes/ai-explanation.ts`
- [x] T025 Implement Finance tool — getOverdueInvoices in `apps/api/src/routes/tools-finance.ts` (contract minimal)
- [x] T026 Implement Clinical tool — getNewTreatments in `apps/api/src/routes/tools-clinical.ts` (contract minimal)
- [x] T027 Implement Clinical tool — getPatientBalance (consent) in `apps/api/src/routes/tools-clinical.ts` (contract minimal)
- [x] T028 Add audit event emission in `apps/api/src/middleware/audit.ts`
- [x] T029 Add RLS/consent enforcement wrappers in `apps/api/src/middleware/authz.ts`

### Frontend (apps/web)
- [x] T030 Build Prompt Input component in `apps/web/src/components/chat/PromptInput.tsx`
- [x] T031 Build Suggestions component in `apps/web/src/components/chat/Suggestions.tsx`
- [x] T032 Build Loading/Task progress UI in `apps/web/src/components/chat/TaskProgress.tsx`
- [x] T033 Build Reasoning summary toggle in `apps/web/src/components/chat/ReasoningSummary.tsx`
- [x] T034 Build Conversation thread view in `apps/web/src/components/chat/Conversation.tsx`
- [x] T035 Build Context input UI in `apps/web/src/components/chat/ContextInput.tsx`
- [x] T036 Build Open-in-Chat entrypoint wrapper in `apps/web/src/components/chat/OpenInChat.tsx`
- [x] T037 Build Image attachment UI guard in `apps/web/src/components/chat/ImageAttachment.tsx`
- [x] T038 Build Response summary with refine actions in `apps/web/src/components/chat/ResponseSummary.tsx`

## Phase 3.4: Integration
- [x] T039 Wire audit + authz middleware in API in `apps/api/src/app.ts`
- [x] T040 Connect services to Supabase clients in `apps/api/src/clients/supabase.ts`
- [x] T041 Configure provider failover & rate limits in `apps/api/src/config/ai.ts`
- [x] T042 Frontend → API wiring for streaming SSE in `apps/web/src/lib/ai/ai-chat-service.ts` + `apps/web/src/hooks/useAIChat.ts`
- [x] T043 i18n and accessibility pass across chat UI in `apps/web/src/components/chat/*`
  - Done: Refactored chat components to use useI18n; added aria-labels/live regions. Added test helper `apps/web/tests/test-utils.tsx` with I18nProvider wrapper and updated UI tests.

## Phase 3.5: Polish
- [ ] T044 [P] Unit tests for utilities (redaction, consent checks) in `apps/api/tests/unit/utils.test.ts`
- [ ] T045 [P] Performance validation — p95 start ≤2s in `tools/performance/chat-slo.md`
- [ ] T046 [P] Docs — update quickstart and contracts in `specs/001-ai-chat-with/*`
- [ ] T047 [P] Observability — structured logs/metrics in `apps/api/src/observability/*`
- [ ] T048 [P] Accessibility — keyboard/screen reader in `apps/web/tests/ui/a11y.chat.test.tsx`

## Dependencies
- T001 → T002–T003
- T004–T022 (tests) before T023–T038 (implementation)
- Models/services (T025–T027) before endpoints/middleware wiring (T023–T024, T028–T029)
- API clients/config (T040–T041) before streaming wiring (T042)
- Implementation before polish (T044–T048)

## Parallel Execution Examples
```
# Contract tests in parallel
Task: T004, T005, T006, T007, T008
# UI tests in parallel
Task: T014–T022
# Frontend components in parallel (different files)
Task: T030–T038
```

## Notes
- [P] tasks = different files, no dependencies
- Ensure tests fail (RED) before implementing (GREEN)
- Commit after each task; keep changes small and focused
