# AI Agent Database Integration - Implementation Plan

## 1. Summary

Based on the PRD for AI Agent Database Integration, this plan outlines the implementation of CopilotKit, AG-UI Protocol, and ottomator-agents to enable conversational interaction with NeonPro's database (clients, finances, appointments) while maintaining LGPD/ANVISA/CFM compliance.

## 2. Technical Context

### Language & Frameworks

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + tRPC + TypeScript
- **Database**: Supabase (PostgreSQL) with RLS
- **AI Framework**: CopilotKit + AG-UI Protocol
- **RAG**: ottomator-agents patterns

### Dependencies

```json
{
  "copilotkit": "^1.3.0",
  "@copilotkit/react": "^1.3.0",
  "@copilotkit/runtime": "^1.3.0",
  "ag-protocol": "^0.2.0",
  "zod": "^3.22.0",
  "@supabase/supabase-js": "^2.39.0",
  "openai": "^4.26.0"
}
```

### Testing Strategy

- **Unit**: Jest + React Testing Library
- **Integration**: Playwright for E2E
- **Contract**: OpenAPI validation
- **Security**: OWASP ZAP scans

### Platform Constraints

- **Deployment**: Vercel (frontend) + Supabase Edge Functions
- **Compliance**: LGPD/ANVISA/CFM requirements
- **Performance**: <2s response time for agents
- **Security**: End-to-end encryption, audit logging

## 3. Constitution Check

### ✓ Simplicity (KISS)

- Using established patterns from existing codebase
- Leveraging existing Supabase integration
- Minimal abstraction layers

### ✓ Architecture

- Follows monorepo structure
- Uses existing tRPC patterns
- Maintains separation of concerns

### ✓ Testing

- TDD approach mandated
- Test coverage ≥90%
- Security testing included

### ✓ Observability

- Integration with existing metrics service
- Agent performance tracking
- Error boundary implementation

### ✓ Versioning

- Semantic versioning for new packages
- API versioning through tRPC
- Database migration versioning

## 4. Phase 0: Outline & Research

### Outputs:

- [x] `docs/features/ai-agent-database-integration.md` (Feature documentation)
- [x] `docs/features/ai-agent-database-integration-research.md` (Research findings)
- [x] `specs/ai-agent-database-integration/prd.md` (Product requirements)

### Status: COMPLETE

## 5. Phase 1: Design & Contracts

### 5.1 Data Model Design

#### File: `specs/ai-agent-database-integration/data-model.md`

````markdown
# AI Agent Database Integration - Data Model

## Core Tables

### agent_sessions

```sql
CREATE TABLE agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  agent_type VARCHAR(50) NOT NULL, -- 'client', 'financial', 'appointment'
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can access their own sessions" ON agent_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
```
````

### agent_messages

```sql
CREATE TABLE agent_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can access their session messages" ON agent_messages
  FOR ALL TO authenticated
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );
```

### agent_knowledge_base

```sql
CREATE TABLE agent_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(100),
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Enable read for all users" ON agent_knowledge_base
  FOR SELECT TO authenticated
  USING (true);
```

## Enhanced Views

### client_agent_view

```sql
CREATE VIEW client_agent_view AS
SELECT
  c.id,
  c.name,
  c.email,
  c.phone,
  c.status,
  COUNT(a.id) as appointment_count,
  MAX(a.scheduled_at) as last_appointment
FROM patients c
LEFT JOIN appointments a ON c.id = a.patient_id
GROUP BY c.id, c.name, c.email, c.phone, c.status;
```

### financial_agent_view

```sql
CREATE VIEW financial_agent_view AS
SELECT
  i.id,
  i.patient_id,
  p.name as patient_name,
  i.amount,
  i.status,
  i.due_date,
  i.paid_at,
  CASE
    WHEN i.status = 'paid' THEN 'Pago'
    WHEN i.due_date < NOW() THEN 'Vencido'
    ELSE 'Pendente'
  END as status_text
FROM invoices i
JOIN patients p ON i.patient_id = p.id;
```

## Security Considerations

1. All tables implement RLS
2. Sensitive data encrypted at rest
3. Audit logging for all agent actions
4. Data retention policies compliant with LGPD

````

### 5.2 API Contracts
#### Directory: `specs/ai-agent-database-integration/contracts/`

##### OpenAPI Specification: `ai-agent.yaml`
```yaml
openapi: 3.0.3
info:
  title: AI Agent API
  version: 1.0.0
  description: API for AI agent interactions with database

paths:
  /api/v1/agents/{agentType}/chat:
    post:
      summary: Send message to AI agent
      parameters:
        - name: agentType
          in: path
          required: true
          schema:
            type: string
            enum: [client, financial, appointment]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - message
              properties:
                message:
                  type: string
                sessionId:
                  type: string
                  format: uuid
      responses:
        200:
          description: Agent response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  sessionId:
                    type: string
                    format: uuid
                  sources:
                    type: array
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                        content:
                          type: string

  /api/v1/agents/sessions/{sessionId}:
    get:
      summary: Get agent session history
      parameters:
        - name: sessionId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Session history
          content:
            application/json:
              schema:
                type: object
                properties:
                  messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/AgentMessage'

  /api/v1/agents/knowledge/{agentType}:
    get:
      summary: Get agent knowledge base
      parameters:
        - name: agentType
          in: path
          required: true
          schema:
            type: string
            enum: [client, financial, appointment]
      responses:
        200:
          description: Knowledge base entries
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/KnowledgeEntry'

components:
  schemas:
    AgentMessage:
      type: object
      properties:
        id:
          type: string
          format: uuid
        role:
          type: string
          enum: [user, assistant, system]
        content:
          type: string
        createdAt:
          type: string
          format: date-time

    KnowledgeEntry:
      type: object
      properties:
        id:
          type: string
          format: uuid
        agentType:
          type: string
        content:
          type: string
        source:
          type: string
````

##### tRPC Router Definition: `agent-router.ts`

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const agentRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        agentType: z.enum(["client", "financial", "appointment"]),
        message: z.string(),
        sessionId: z.string().uuid().optional(),
      }),
    )
    .output(
      z.object({
        response: z.string(),
        sessionId: z.string().uuid(),
        sources: z.array(
          z.object({
            type: z.string(),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),

  getSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        messages: z.array(
          z.object({
            id: z.string().uuid(),
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
            createdAt: z.date(),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Implementation
    }),

  getKnowledge: protectedProcedure
    .input(
      z.object({
        agentType: z.enum(["client", "financial", "appointment"]),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string().uuid(),
          agentType: z.string(),
          content: z.string(),
          source: z.string(),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

### 5.3 Quick Start Guide

#### File: `specs/ai-agent-database-integration/quickstart.md`

````markdown
# AI Agent Integration Quick Start

## Prerequisites

1. Node.js 18+
2. Supabase project with migrations applied
3. OpenAI API key

## Setup

```bash
# Install dependencies
pnpm add copilotkit @copilotkit/react @copilotkit/runtime
pnpm add ag-protocol zod openai

# Apply database migrations
pnpm db:push

# Build the project
pnpm build
```
````

## Basic Usage

```tsx
// In your React component
import { CopilotKit } from "@copilotkit/react";
import { useCoAgent } from "@copilotkit/react";

function AgentChat() {
  const { agentState, addMessage } = useCoAgent({
    name: "client_agent",
    initialState: { input: "" },
  });

  return (
    <CopilotKit runtimeUrl="/api/agent">
      <ChatInterface agentState={agentState} onSend={addMessage} />
    </CopilotKit>
  );
}
```

## Testing

```bash
# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Deployment

1. Set environment variables
2. Deploy to Vercel
3. Configure Supabase Edge Functions

```

## 6. Phase 2: Task Planning

### Generated Tasks: 15 atomic tasks following TDD approach
- T-001 to T-015 detailed in task list below
- Parallel execution marked with [P]
- Dependencies clearly defined

## 7. Progress Tracking

- [x] Phase 0: Research & Documentation
- [ ] Phase 1: Design & Contracts
  - [ ] Data model design
  - [ ] API contracts
  - [ ] Quick start guide
- [ ] Phase 2: Implementation
  - [ ] Backend service
  - [ ] Frontend components
  - [ ] Agent logic
  - [ ] Security integration
- [ ] Phase 3: Testing & Validation
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Security audit

## 8. Risk Mitigation

### Technical Risks
1. **Performance**: Implement caching and pagination
2. **Security**: Multiple layers of validation and encryption
3. **Compliance**: Regular audits and documentation

### Compliance Risks
1. **LGPD**: Data minimization and consent management
2. **ANVISA**: Medical device classification assessment
3. **CFM**: Ethical guidelines integration

## 9. Success Metrics

1. Agent response time < 2s
2. Test coverage ≥ 90%
3. Zero security vulnerabilities
4. User satisfaction score ≥ 4.5/5
5. Compliance audit pass rate 100%
```
