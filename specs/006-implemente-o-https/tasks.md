# Tasks: AI Agent Database Integration

**Input**: Design documents from `/specs/006-implemente-o-https/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

# Task Generation for AI Agent Database Integration

- Implementar o https://github.com/CopilotKit/CopilotKit e https://github.com/ag-ui-protocol/ag-ui para aprimorar nossos agents do neonpro para interagir e ler totalmente os dados da nossa database, de clientes e financeiro e agendamentos usando o https://github.com/coleam00/ottomator-agents/tree/main/ag-ui-rag-agent para implementar no nosso projeto neonpro seguindo a sequencia abaixo:

METHODOLOGY: Analyze → Research → Think → Elaborate (A.P.T.E)
process:

- Analyze explicit and implicit requirements
- Research domain, standards, and constraints
- Think with layered reasoning and validation gates
- Elaborate a complete, testable specification
  Prompt_MUST_INCLUDE:
- Clear objective and scope boundaries
- Technical/environmental context
- Input/output structure with examples when needed
- Quality gates and measurable success criteria
- Non-negotiable constraints
- Hierarchical structure: context → requirements → validation
  PRINCIPLES:
- "KISS: Keep It Simple — choose the simplest viable solution"
- "YAGNI: Build only what's needed now"
- "Chain of Thought: Step-by-step reasoning"

## 🎯 OBJECTIVE

Transform NeonPro by empowering its agents to conversationally interact with the full database—reading and presenting clients, finance, and scheduling data—with a modern stack:

- **CopilotKit** (UI+infra) for chat and generative UI
- **AG-UI Protocol** for real-time agent communication
- **ottomator-agents/ag-ui-rag-agent** as agent logic + RAG skeleton
- Secure and organized direct access to Supabase

Focus on delivering a high-fidelity, real-world database interaction experience, ensuring a production-ready user experience.

## 🌐 CONTEXT

```yaml
project: "Conversational AI agent for NeonPro with direct database integration"
environment:
  frontend: "React/Next.js with CopilotKit, TypeScript"
  comms: "AG-UI Protocol (event-based, real time sync)"
  backend: "Node.js (e.g. Hono.js), ottomator agent/rag, Supabase"
  db: "Supabase (Postgres) with RLS, multi-tenant, secure"
  agent: "ottomator-agents/ag-ui-rag-agent as base"
  deployment: "monorepo with /apps/web and /apps/api"
inputs: "User messages, client/finance/scheduling queries"
outputs: "Rich, interactive chat answers (React), structured data (lists, summaries, charts)"
workflow:
  - "Document technical design and edge cases"
  - "Implement infrastructure and proof of concept (POC)"
  - "Securely connect to production database"
  - "Validate with live user testing"
hierarchy: "context → requirements → validation"
```

---

## ✅ QUALITY CHECKLIST

PRE:

- [ ] Explicit functional and non-functional requirements
- [ ] Security: No service keys in code, RLS enforced
- [ ] UI/UX and accessibility reviewed
      DURING:
- [ ] Each feature implemented as per testable acceptance criteria
- [ ] Agent responses correct, protected, friendly
- [ ] Real database reads validated end-to-end
      POST:
- [ ] ≥9.5/10 in UX feedback from user testing
- [ ] All critical workflows (list/query/summary) function as spec’d
- [ ] Integration points between CopilotKit, AG-UI, Backend, and DB are robust and observable

## 📄 IMPLEMENTATION PLAN & PROMPT

### 1. ARCHITECTURE OVERVIEW

- **Frontend (apps/web)**:  
  Use CopilotKit for chat UI, context sync, agentic actions, and rendering rich database answers (lists, charts, details).
- **Protocol Layer**:  
  AG-UI for robust, event-driven, real-time agent/user communication.
- **Backend (apps/api)**:  
  Use ottomator-agents/ag-ui-rag-agent skeleton for agent logic, connecting safely to Supabase via new data service.

---

### 2. PHASED IMPLEMENTATION

#### **FASE 1: INFRA & POC**

**Backend**:

- Path: `apps/api/src/routes/ai/data-agent.ts`
- Install `ag-ui`, `pydantic` (or preferred agent infra)
- Create endpoint: `/api/ai/data-agent` using Hono.js
- Implement agent logic (mock returns for now):
  - Example queries:
    - "Quais os próximos agendamentos?"
    - "Me mostre os clientes cadastrados"
    - "Como está o faturamento?"
- Expose via AG-UI protocol (`toAGUI`, etc.)

**Frontend**:

- Path: `apps/web/src/components/ai/DataAgentChat.tsx`
- Install `@copilotkit/react-core`, `@copilotkit/react-ui`
- Make new Chat component using CopilotKit
- Connect CopilotKitProvider to `/api/ai/data-agent`
- POC: Send queries, receive/display mock results

**Test Criteria**:

- User sees chat, types a question, gets a list/answer (even if mock) live in the UI

---

#### **FASE 2: DATABASE INTEGRATION**

**Backend**:

- Path: `apps/api/src/services/ai-data-service.ts`
- Build data service to safely read from Supabase
  - `getClientByName(name: string)`
  - `getAppointmentsByDate(date: string)`
  - `getFinancialSummary(period: string)`
- Use Supabase client with RLS (“Row Level Security”)
- NEVER store/expose the Supabase service key in agent code
- Update agent endpoint to return real DB results

**Frontend**:

- Path: `apps/web/src/components/ai/DataAgentChat.tsx`
- Refine chat UI to render answers as lists, tables, or simple chart components (React)
- Example:
  - Schedule as list or mini-calendar
  - Financial summary as table/bar chart
  - Clickable details for clients/appointments

**Validation**:

- Database queries return correct, permissioned data to UI, with proper feedback for empty/error/denied requests

---

#### **FASE 3: UX & INTELLIGENCE BOOST**

**Backend**:

- Path: `apps/api/src/routes/ai/data-agent.ts`
- Improve agent “system prompt” for natural language understanding (NLU):
  - Understand variations: "Agendamentos da Maria amanhã?", "Resumo financeiro semanal"
- Enable “function/tool calling” linking AI intent parsing to the right DB read methods

**Frontend**:

- Path: `apps/web/src/components/ai/`
- Use CopilotKit advanced features:
  - Rich answer rendering:
    - Custom React for lists/tables/charts in chat
    - Buttons for "Ver detalhes", "Filtrar", etc.
- Enable agent-driven UI (agent can return “render this chart/table” instructions)
- Rapid actions: e.g., “marcar como concluído”, etc via UI buttons

**Validation**:

- User can ask complex, real-world queries and see accurate, well-formatted answers
- Edge: Proper error messages and access-control in all flows

---

### 3. EXPLICIT SPECIFICATION & PROMPT (ONE-SHOT STYLE)

```yaml
role: "AI Agent Fullstack Developer (CopilotKit, AG-UI, Supabase, Node.js, React)"
objective:
  task: "Implement a conversational assistant for NeonPro, using CopilotKit (chat UI), AG-UI (protocol), and ottomator-agents/ag-ui-rag-agent (backend agent), to access and display real-time database data for clients, appointments, and finances."
  context: "Monorepo apps (web/api), production Supabase DB, secure RLS, multi-role agents/users."
chain_of_thought_process:
  analyze:
    checklist:
      - "Does agent securely read only permitted DB data?"
      - "Is UI output clear, interactive, and friendly?"
      - "Are backend endpoints protected, structured, and directly callable in a test harness?"
      - "Do frontend and agent exchange structured messages (per AG-UI spec)?"
      - "Are QA and UX test cases documented (e.g., wrong user/empty result/error)?"
  research:
    checklist:
      - "Study CopilotKit component patterns/docs"
      - "Review AG-UI event/message protocol"
      - "Check ottomator-agents RAG/AG-UI agent usage patterns"
      - "Enforce Supabase RLS and connection best practices"
      - "Lint and test TypeScript/Node code"
  think:
    step_by_step:
      - "First: Scaffold backend AP route and connect dummy agent"
      - "Then: Link chat UI to agent via AG-UI and CopilotKit"
      - "Next: Implement, test, and secure database reads (with RLS)"
      - "Finally: Polish UI, add agentic renderings (custom tables, actions), and validate with real users"
constraints:
  must:
    - "Never expose Supabase service keys in agent/backend code"
    - "All database access goes through the ai-data-service with correct RLS"
    - "Chat UI must display real, interactive answers (lists, charts)"
    - "Strict domain/user access enforced"
    - "Responsiveness and error handling in all endpoints"
    - "All agent/DB logic is unit and integration tested"
  must_not:
    - "Use fake/mock data after Fase 1"
    - "Bypass RLS or expose raw error traces to users"
    - "Leave unclear messages/answers to the end users"
    - "Reveal credentials/credentials pattern in prompt"
```

## EXAMPLES

**Input (User in NeonPro Chat):**  
"Quais os próximos agendamentos da Maria da Silva para amanhã?"

**Backend agent:**

- Receives query → parses intent (user wants tomorrow's appointments for 'Maria da Silva')
- Calls `getClientByName("Maria da Silva")` → gets client ID
- Calls `getAppointmentsByDate("YYYY-MM-DD", clientId)`
- Returns structured list for chat rendering

**Output (Frontend):**

- Responds with list of appointments for Maria da Silva, properly formatted and accessible in a chat, possibly with a quick-action button "Ver detalhes" for each item.

---

## EDGE CASES & VALIDATION

- **User requests info outside their domain/role** → Agent returns "Acesso negado – você não tem permissão para ver estes dados."
- **DB query returns empty** → "Nenhum agendamento encontrado para Maria da Silva amanhã."
- **Frontend loses connection** → Inform user: "Não foi possível conectar ao servidor, tente novamente."

---

## DELIVERABLES & SUCCESS CRITERIA

- [ ] Backend agent securely reads real Supabase data based on conversational queries, with RLS enforced
- [ ] Chat UI renders rich, interactive answers (lists, charts, action buttons, error states)
- [ ] CopilotKit and AG-UI protocol fully wired (bi-directional, state sync)
- [ ] Code is clean, modular, documented, and testable (unit/integration/regression)
- [ ] ≥9.5 UX rating from trial users in test group

## Execution Flow (main)

1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/api/src/`, `apps/web/src/`

## Phase 3.1: Setup

- [ ] T001 Install CopilotKit dependencies in apps/web/package.json
- [ ] T002 Install AG-UI Protocol and runtime dependencies in apps/api/package.json
- [ ] T003 [P] Configure environment variables for Supabase service key and OpenAI API
- [ ] T004 Set up Python environment for ottomator-agents in apps/api/agents/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T005 [P] Contract test POST /api/ai/data-agent in tests/unit/agent-endpoint.test.ts
- [ ] T006 [P] Contract test GET /api/ai/sessions/{sessionId} in tests/unit/sessions.test.ts
- [ ] T007 [P] Contract test POST /api/ai/sessions/{sessionId}/feedback in tests/unit/feedback.test.ts
- [ ] T008 [P] Integration test client data query in tests/integration/client-query.test.ts
- [ ] T009 [P] Integration test appointment query in tests/integration/appointment-query.test.ts
- [ ] T010 [P] Integration test financial query in tests/integration/financial-query.test.ts
- [ ] T011 [P] Integration test access control in tests/integration/access-control.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T012 [P] Data types and interfaces in apps/web/src/types/ai-agent.ts
- [ ] T013 [P] UserQuery and AgentResponse interfaces in apps/web/src/types/ai-agent.ts
- [ ] T014 [P] Data access entities (ClientData, AppointmentData, FinancialData) in apps/web/src/types/ai-agent.ts
- [ ] T015 [P] QueryIntent model in apps/web/src/types/ai-agent.ts
- [ ] T016 [P] AIDataService base class in apps/api/src/services/ai-data-service.ts
- [ ] T017 [P] getClientsByName method in apps/api/src/services/ai-data-service.ts
- [ ] T018 [P] getAppointmentsByDate method in apps/api/src/services/ai-data-service.ts
- [ ] T019 [P] getFinancialSummary method in apps/api/src/services/ai-data-service.ts
- [ ] T020 Intent parser service in apps/api/src/services/intent-parser.ts
- [ ] T021 Agent endpoint POST /api/ai/data-agent in apps/api/src/routes/ai/data-agent.ts
- [ ] T022 Session management endpoint GET /api/ai/sessions/{sessionId} in apps/api/src/routes/ai/sessions.ts
- [ ] T023 Feedback endpoint POST /api/ai/sessions/{sessionId}/feedback in apps/api/src/routes/ai/feedback.ts
- [ ] T024 [P] DataAgentChat React component in apps/web/src/components/ai/DataAgentChat.tsx
- [ ] T025 useAiAgent custom hook in apps/web/src/hooks/useAiAgent.ts
- [ ] T026 Frontend agent service in apps/web/src/services/ai-agent.ts

## Phase 3.4: Integration

- [ ] T027 Connect AIDataService to Supabase with RLS enforcement
- [ ] T028 Implement AG-UI Protocol communication layer
- [ ] T029 Integrate ottomator-agents with custom data retrieval functions
- [ ] T030 Add natural language processing for query intent recognition
- [ ] T031 Implement response formatting for different data types (list, table, chart)
- [ ] T032 Add action buttons and interactive elements to responses
- [ ] T033 Implement conversation context and session management
- [ ] T034 Add error handling and user-friendly error messages
- [ ] T035 Implement permission checking and access control
- [ ] T036 Add logging and monitoring for agent interactions

## Phase 3.5: Polish

- [ ] T037 [P] Unit tests for AIDataService in tests/unit/ai-data-service.test.ts
- [ ] T038 [P] Unit tests for intent parser in tests/unit/intent-parser.test.ts
- [ ] T039 [P] Unit tests for response formatting in tests/unit/response-formatter.test.ts
- [ ] T040 [P] E2E tests for chat interface in tests/e2e/ai-chat.spec.ts
- [ ] T041 Performance optimization for database queries (<2s response)
- [ ] T042 Add caching for frequently accessed data
- [ ] T043 Update documentation in docs/features/ai-agent-database-integration.md
- [ ] T044 Update API documentation in docs/apis/ai-agent-api.md
- [ ] T045 Run quickstart.md validation scenarios

## Dependencies

- Tests (T005-T011) before implementation (T012-T026)
- T016 blocks T017-T019
- T020 blocks T021
- T021 blocks T022-T023
- T024 depends on T025, T026
- Integration tasks (T027-T036) depend on core implementation
- Polish tasks (T037-T045) come after all functionality is complete

## Parallel Examples

### Phase 3.1 - Setup (Parallel)

```bash
# Launch T001-T004 together:
Task: "Install CopilotKit dependencies in apps/web/package.json"
Task: "Install AG-UI Protocol and runtime dependencies in apps/api/package.json"
Task: "Configure environment variables for Supabase service key and OpenAI API"
Task: "Set up Python environment for ottomator-agents in apps/api/agents/"
```

### Phase 3.2 - Tests (Parallel)

```bash
# Launch T005-T011 together:
Task: "Contract test POST /api/ai/data-agent in tests/unit/agent-endpoint.test.ts"
Task: "Contract test GET /api/ai/sessions/{sessionId} in tests/unit/sessions.test.ts"
Task: "Contract test POST /api/ai/sessions/{sessionId}/feedback in tests/unit/feedback.test.ts"
Task: "Integration test client data query in tests/integration/client-query.test.ts"
Task: "Integration test appointment query in tests/integration/appointment-query.test.ts"
Task: "Integration test financial query in tests/integration/financial-query.test.ts"
Task: "Integration test access control in tests/integration/access-control.test.ts"
```

### Phase 3.3 - Types and Interfaces (Parallel)

```bash
# Launch T012-T015 together:
Task: "Data types and interfaces in apps/web/src/types/ai-agent.ts"
Task: "UserQuery and AgentResponse interfaces in apps/web/src/types/ai-agent.ts"
Task: "Data access entities in apps/web/src/types/ai-agent.ts"
Task: "QueryIntent model in apps/web/src/types/ai-agent.ts"
```

### Phase 3.3 - Data Service Methods (Parallel)

```bash
# Launch T017-T019 together:
Task: "getClientsByName method in apps/api/src/services/ai-data-service.ts"
Task: "getAppointmentsByDate method in apps/api/src/services/ai-data-service.ts"
Task: "getFinancialSummary method in apps/api/src/services/ai-data-service.ts"
```

### Phase 3.3 - Frontend Components (Parallel)

```bash
# Launch T024-T026 together:
Task: "DataAgentChat React component in apps/web/src/components/ai/DataAgentChat.tsx"
Task: "useAiAgent custom hook in apps/web/src/hooks/useAiAgent.ts"
Task: "Frontend agent service in apps/web/src/services/ai-agent.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - api.yaml → 3 contract test tasks [P]
   - 3 endpoints → implementation tasks
2. **From Data Model**:
   - 5 entities → type/interface tasks [P]
   - 3 data access methods → service tasks [P]
3. **From User Stories**:
   - 5 acceptance scenarios → 5 integration test tasks [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Types → Services → Endpoints → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
