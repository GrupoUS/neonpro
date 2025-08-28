# 🚀 **NEONPRO CODING STANDARDS**

## Aesthetic Health AI Platform - Developer Guide & Standards

> **Tier 1 Implementation** | Qualidade 9.8/10 | LGPD ✅ Estética ✅ | VIBECODER ✅ ARCHON ✅

---

## 📋 **ÍNDICE**

1. [🎯 Princípios Fundamentais](#-princípios-fundamentais)
2. [🤖 Archon Integration & Task-Driven Development](#-archon-integration--task-driven-development)
3. [🛠️ Environment Setup & Development](#️-environment-setup--development)
4. [⚛️ Tech Stack & Architecture](#️-tech-stack--architecture)
5. [🗄️ Database & API Patterns](#️-database--api-patterns)
6. [🔒 Security & LGPD Compliance](#-security--lgpd-compliance)
7. [🧪 Quality Gates & Testing](#-quality-gates--testing)
8. [📊 Integration Examples](#-integration-examples)
9. [📚 Quick Reference](#-quick-reference)

---

## 🎯 **PRINCÍPIOS FUNDAMENTAIS**

### **VIBECODER Core Engineering Principles**

```typescript
// KISS: Keep It Simple, Stupid - Simplicidade mantendo funcionalidade
const updateClient = async (id: string, data: ClientData) => {
  const encrypted = await encrypt(data);
  await db.client.update({ where: { id }, data: encrypted });
  await auditLog("UPDATE_CLIENT", id);
};

// YAGNI: You Aren't Gonna Need It - Implementar apenas o necessário
interface ClientData {
  name: string;
  email: string;
  phone?: string;
  // Adicionar campos conforme demanda real - não "just in case"
}

// CoT: Chain of Thought - Raciocínio explícito em decisões críticas
const validateClinicAccess = async (
  professionalId: string,
  clientId: string,
) => {
  // 1. Verificar autenticação profissional
  const professional = await validateProfessional(professionalId);
  // 2. Verificar permissões específicas
  const hasAccess = await checkClientAccess(professional.id, clientId);
  // 3. Validar consentimento LGPD
  const consentValid = await validateLGPDConsent(clientId, "ACCESS");

  return professional && hasAccess && consentValid;
};
```

### **Healthcare-First Philosophy**

- **Test changes instead of assuming they work** - Verificar outputs com observação direta
- **"Should work" ≠ "does work"** - Pattern matching não é suficiente para healthcare
- **Detailed errors over graceful failures** - Identificar e corrigir problemas rapidamente
- **No backwards compatibility** - Remover código deprecated imediatamente
- **Focus on user experience and feature completeness** - Priorizar funcionalidade sobre padrões "production-ready"

### **Arquitetura Base**

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Backend**: Supabase + Hono RPC + tRPC
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Database**: PostgreSQL + Prisma + RLS
- **Testing**: Vitest + Playwright + Testing Library
- **Quality**: Biome + Ultracite + TypeScript Strict
- **Task Management**: Archon MCP (obrigatório)
- **Package Manager**: PNPM (obrigatório)

---

## 🤖 **ARCHON INTEGRATION & TASK-DRIVEN DEVELOPMENT**

### **CRITICAL: Archon-First Rule**

**MANDATORY: Always complete the full Archon task cycle before any coding:**

```bash
# 1. Check Current Task
archon:manage_task(action="get", task_id="current_task_id")

# 2. Research for Task
archon:search_code_examples(query="healthcare feature implementation")
archon:perform_rag_query(query="LGPD compliance patterns", match_count=5)

# 3. Implement the Task
# Write code based on research

# 4. Update Task Status
archon:manage_task(
  action="update",
  task_id="current_task_id",
  update_fields={"status": "review"}
)

# 5. Get Next Task
archon:manage_task(action="list", filter_by="status", filter_value="todo")
```

### **Task Status Management**

**Status Progression**: `todo` → `doing` → `review` → `done`

```typescript
// Exemplo de desenvolvimento orientado a tarefas
const developFeature = async (taskId: string) => {
  // 1. Obter detalhes da task
  const task = await archon.getTask(taskId);

  // 2. Marcar como em progresso
  await archon.updateTask(taskId, { status: "doing" });

  // 3. Pesquisar padrões e melhores práticas
  const patterns = await archon.searchCodeExamples(task.feature);
  const guidance = await archon.performRAGQuery(task.requirements);

  // 4. Implementar com base na pesquisa
  const implementation = await implementBasedOnResearch(patterns, guidance);

  // 5. Marcar para revisão
  await archon.updateTask(taskId, {
    status: "review",
    notes: "Implementation complete, ready for testing",
  });

  return implementation;
};
```

### **Project Feature Integration**

```bash
# Get current project features
archon:get_project_features(project_id="healthcare_project")

# Create tasks aligned with features
archon:manage_task(
  action="create",
  project_id="healthcare_project",
  title="Implement LGPD consent management",
  feature="Compliance",
  task_order=10
)
```

---

## 🛠️ **ENVIRONMENT SETUP & DEVELOPMENT**

### **Prerequisites**

- Node.js 18+
- Access to NeonPro API credentials
- Supabase project

### **Essential Environment Variables**

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **PNPM Over NPM (Obrigatório)**

```bash
# ✅ Use PNPM for all operations
pnpm install
pnpm dev
pnpm build
pnpm test

# ❌ Never use NPM
# npm install # NUNCA!
```

### **Git & Version Control**

```bash
# Commit automático após completar task
git add .
git commit -m "feat(healthcare): implement LGPD consent management

- Add consent validation middleware
- Implement audit trail for consent changes
- Add ANVISA compliance markers
- Update patient access validation

Closes: TASK-123"

# Padrão de mensagens
# feat(scope): description - novas features
# fix(scope): description - correções
# refactor(scope): description - refatoração
# docs(scope): description - documentação
# test(scope): description - testes
```

### **Development Setup**

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd neonpro
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

### **Clean Up Constantly**

```typescript
// ✅ Remover código morto imediatamente
// ❌ Anti-pattern: Manter código "legacy" comentado

// ✅ Padrão correto: Remover e documentar na funcionalidade atual
const updateClient = async (id: string, data: ClientData) => {
  // Updated implementation with LGPD compliance
  await auditLog("UPDATE_CLIENT", id);
};

// ✅ Verificar e corrigir imports não utilizados
// import { unused } from './utils'; // REMOVER
import { auditLog, encrypt } from "./utils"; // MANTER
```

### **Always Check Architecture Docs**

```typescript
// Sempre verificar docs/architecture/ antes de implementar
const implementFeature = async () => {
  // 1. Consultar tech-stack.md para tecnologias aprovadas
  // 2. Verificar source-tree.md para estrutura correta
  // 3. Seguir coding-standards.md para padrões
  // 4. Validar contra compliance requirements
};
```

---

## ⚛️ **TECH STACK & ARCHITECTURE**

### **Core Technologies**

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Supabase + PostgreSQL + Auth + Real-time
- **AI**: @ai-sdk/anthropic + @ai-sdk/openai + TensorFlow.js
- **UI**: shadcn/ui + Tailwind CSS

### **Authentication & Basic Patterns**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

// Use session token for API calls
const token = data.session?.access_token;
```

### **Server Components for Sensitive Data**

```typescript
// Server Component para dados sensíveis
export default async function ClientProfile({ clientId }: { clientId: string; }) {
  // ✅ Validação server-side obrigatória
  const session = await getSession();
  if (!session?.user) redirect("/auth");

  // ✅ Dados criptografados permanecem no servidor
  const encryptedClient = await getClientSecure(clientId, session.user.id);
  const client = await decrypt(encryptedClient);

  return (
    <div className="client-profile">
      <ClientHeader client={client} />
      <TreatmentHistory clientId={clientId} />
    </div>
  );
}

// Server Actions para operações críticas
export async function updateClientAction(formData: FormData) {
  "use server";

  const session = await getSession();
  const data = Object.fromEntries(formData);

  // Validação de esquema com Zod
  const validatedData = ClientUpdateSchema.parse(data);

  // Transação com auditoria
  await db.$transaction(async (tx) => {
    await tx.client.update({
      where: { id: validatedData.id },
      data: validatedData,
    });

    await tx.auditLog.create({
      data: {
        action: "UPDATE_CLIENT",
        userId: session.user.id,
        clientId: validatedData.id,
        timestamp: new Date(),
      },
    });
  });

  revalidatePath(`/clients/${validatedData.id}`);
}
```

---

## 🗄️ **DATABASE & API PATTERNS**

### **Database Schema (Tier 1 Implementation)**

Execute this SQL in your Supabase project:

```sql
-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours')
);

-- AI Chat Messages
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment No-Show Predictions
CREATE TABLE no_show_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  recommended_actions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_show_predictions ENABLE ROW LEVEL SECURITY;

-- Basic policies (authenticated users only)
CREATE POLICY "authenticated_access" ON ai_chat_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_access" ON ai_chat_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_access" ON no_show_predictions FOR ALL TO authenticated USING (true);

-- Insert basic feature flags
INSERT INTO feature_flags (flag_name, description, enabled) VALUES
('ai_chat', 'AI Chat System', true),
('no_show_prediction', 'No-show prediction engine', true);
```

### **API Security Patterns**

```typescript
// Basic validation schemas
export const ClientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

// Basic rate limiting
export const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: "Too many requests",
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## 🔒 **LGPD COMPLIANCE & SECURITY**

### **LGPD Core Implementation**

```typescript
// LGPD-compliant data handling
export class LGPDManager {
  static async requestConsent(clientId: string, purpose: string) {
    const consent = await db.lgpdConsent.create({
      data: {
        clientId,
        purpose,
        status: "pending",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Send consent request notification
    await NotificationService.sendConsentRequest(clientId, consent.id);
    return consent;
  }

  static async revokeConsent(clientId: string, consentId: string) {
    await db.$transaction(async (tx) => {
      // Mark consent as revoked
      await tx.lgpdConsent.update({
        where: { id: consentId },
        data: { status: "revoked", revokedAt: new Date() },
      });

      // Anonymize related data
      await tx.clientData.updateMany({
        where: { clientId },
        data: { status: "anonymized" },
      });
    });
  }
}

// Data encryption patterns
export const encrypt = (data: string): Promise<string> => {
  // Use AES-256-GCM for aesthetic client data
  return crypto.subtle.encrypt(algorithm, key, Buffer.from(data));
};

export const decrypt = (encryptedData: string): Promise<string> => {
  return crypto.subtle.decrypt(algorithm, key, Buffer.from(encryptedData));
};
```

### **Basic Security Middleware**

```typescript
// Authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    const { data: user } = await supabase.auth.getUser(token);
    req.user = user.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Basic audit logging
export const auditLog = async (action: string, userId: string, data?: any) => {
  await db.auditLog.create({
    data: {
      action,
      userId,
      metadata: data,
      timestamp: new Date(),
      ipAddress: req.ip,
    },
  });
};
```

---

## 🧪 **QUALITY GATES & TESTING**

### **The 30-Second Reality Check**

**Must answer YES to ALL before considering code complete:**

- [ ] Did I run/build the code?
- [ ] Did I trigger the exact feature I changed?
- [ ] Did I see the expected result with my own observations?
- [ ] Did I test edge cases?
- [ ] Did I check for error messages?
- [ ] Did I verify no new warnings or errors appeared?
- [ ] Did I check performance impact?
- [ ] Did I validate accessibility requirements?
- [ ] Did I review the code for style and consistency?
- [ ] Did I ensure no security vulnerabilities were introduced?

### **Testing Requirements**

```typescript
// Utilitários para testes healthcare
export class HealthcareTestUtils {
  static createTestPatient(): TestPatient {
    return {
      id: crypto.randomUUID(),
      cpf: "00000000000", // CPF sintético
      name: "Test Patient",
      birthDate: "1990-01-01",
      // ✅ Sempre dados sintéticos para testes
    };
  }

  static async mockHealthcareSession() {
    return {
      professional: {
        id: "test-professional-id",
        crm: "123456-SP",
        role: "doctor",
        mfaVerified: true,
      },
    };
  }
}

// Testes de compliance obrigatórios
describe("LGPD Compliance", () => {
  test("should require consent for patient data access", async () => {
    const patient = HealthcareTestUtils.createTestPatient();

    // ❌ Sem consentimento deve falhar
    await expect(
      PatientService.getData(patient.id, "test-professional"),
    ).rejects.toThrow("LGPD consent required");

    // ✅ Com consentimento deve funcionar
    await LGPDService.grantConsent(patient.id, "DATA_ACCESS");
    const data = await PatientService.getData(patient.id, "test-professional");
    expect(data).toBeDefined();
  });
});

// E2E para workflows críticos
test("Emergency patient access workflow", async ({ page }) => {
  await page.goto("/emergency-access");

  // Verificar MFA para emergência
  await page.fill("[data-testid=emergency-code]", "EMERGENCY123");
  await page.click("[data-testid=emergency-access]");

  // Validar acesso aos dados críticos
  await expect(page.locator("[data-testid=patient-vitals]")).toBeVisible();

  // Verificar auditoria de acesso de emergência
  const auditLogs = await db.auditLog.findMany({
    where: { action: "EMERGENCY_ACCESS" },
  });
  expect(auditLogs).toHaveLength(1);
});
```

### **Quality Metrics**

- **Security**: 100% compliance (LGPD, aesthetic health sector)
- **Performance**: <200ms response, >95 Lighthouse
- **Testing**: 95%+ coverage, E2E workflows
- **Accessibility**: WCAG 2.1 AA compliant
- **Type Safety**: TypeScript strict mode

---

## 🤖 **AI INTEGRATION**

### **Privacy-Preserving AI**

```typescript
// Sanitização antes de AI
export class AestheticAI {
  static async processClientQuery(query: string, professionalId: string) {
    // ✅ Remover PII antes de enviar para AI
    const sanitized = await PIIDetector.sanitize(query);

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an aesthetic health AI assistant. Never store or log client data.",
        },
        { role: "user", content: sanitized },
      ],
    });

    // ✅ Auditoria sem PII
    await AuditLogger.logAIInteraction("AESTHETIC_AI_QUERY", professionalId, {
      query_length: sanitized.length,
      response_length: aiResponse.choices[0].message.content?.length,
      pii_detected: false,
    });

    return aiResponse.choices[0].message.content;
  }

  // Análise de tratamentos com privacy
  static async analyzeTreatment(treatmentData: string[]) {
    // Usar apenas dados codificados
    const codedTreatments = treatmentData.map((t) => TreatmentCodes.encode(t));

    return await this.processClientQuery(
      `Analyze these treatment patterns: ${codedTreatments.join(", ")}`,
      "system",
    );
  }
}
```

---

## 🔍 **RESEARCH-DRIVEN DEVELOPMENT**

### **Before Any Implementation**

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications
- [ ] Check for common pitfalls or antipatterns

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(
  query="aesthetic health JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(
  query="Next.js Server Actions LGPD compliance patterns",
  match_count=3
)

# Implementation examples
archon:search_code_examples(
  query="React aesthetic health form validation Zod",
  match_count=3
)
```

### **Knowledge Source Prioritization**

**Query Strategy:**

- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

### **Research Validation**

**Always validate research findings:**

- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context
- Document assumptions and limitations

### **Task Completion Criteria**

**Every task must meet these criteria before marking "done":**

- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed
- [ ] All tests pass without errors

---

## 📊 **CODE QUALITY & VALIDATION**

### **Ultracite Integration**

```bash
# Initialize Ultracite in project
npx ultracite init

# Format and fix code automatically
npx ultracite format

# Check for issues without fixing
npx ultracite lint
```

### **Essential Rules**

#### **Accessibility (WCAG 2.1 AA+)**

- Proper ARIA labels and roles for all interactive elements
- Semantic HTML structure over div-heavy layouts
- Keyboard navigation support for all interactions
- Sufficient color contrast ratios (4.5:1 minimum)
- Screen reader compatibility with meaningful alt text
- Form labels properly associated with inputs
- Focus management for dynamic content

#### **TypeScript Excellence**

- Strict type checking without `any` usage
- Proper error boundaries and exception handling
- `import type` for type-only imports
- `as const` assertions for literal types
- Consistent array syntax (`T[]` or `Array<T>`)
- Explicit enum member values
- No non-null assertions (`!`) or unsafe operations

#### **React/JSX Best Practices**

- Hooks called only at component top level
- Proper dependency arrays in useEffect
- Unique keys for iterated elements (not array indices)
- Fragment syntax (`<>`) over `React.Fragment`
- No component definitions inside other components
- Proper prop types and validation

#### **Code Quality & Performance**

- Arrow functions over function expressions
- Optional chaining over nested conditionals
- Template literals for string interpolation
- `for...of` loops over `Array.forEach()`
- Modern array methods (`flatMap`, `at()`, etc.)
- Const declarations for unchanging variables
- Early returns over nested conditionals

#### **Security & Correctness**

- Input validation and sanitization
- No hardcoded sensitive data
- Secure communication protocols
- Proper error handling with meaningful messages
- No usage of `eval()`, `document.cookie`, or unsafe patterns
- Prevent XSS through proper escaping

#### **Next.js Specific**

- Use `next/image` instead of `<img>` tags
- Proper `next/head` usage (not in `_document.js`)
- Correct import paths for Next.js modules
- Static optimization considerations

#### **Testing Standards**

- Descriptive test names and structure
- Proper assertion placement inside test functions
- No focused or disabled tests in committed code
- Comprehensive error case coverage

### **Error Handling Example**

```typescript
// ✅ Proper error handling
async function fetchPatientData(id: string): Promise<ApiResponse> {
  try {
    const result = await api.getPatient(id);
    return { success: true, data: result };
  } catch (error) {
    console.error("Patient data fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ❌ Avoid error swallowing
try {
  return await fetchPatientData(id);
} catch (e) {
  console.log(e); // Silent failure - NUNCA em healthcare!
}
```

---

## 🔍 **RESEARCH-DRIVEN DEVELOPMENT**

### **Before Any Implementation**

**Research checklist:**

- [ ] Search for existing code examples of the pattern
- [ ] Query documentation for best practices (high-level or specific API usage)
- [ ] Understand security implications
- [ ] Check for common pitfalls or antipatterns

```bash
# High-level: Architecture, security, optimization patterns
archon:perform_rag_query(
  query="healthcare JWT authentication security best practices",
  match_count=5
)

# Low-level: Specific API usage, syntax, configuration
archon:perform_rag_query(
  query="Next.js Server Actions LGPD compliance patterns",
  match_count=3
)

# Implementation examples
archon:search_code_examples(
  query="React healthcare form validation Zod",
  match_count=3
)
```

### **Knowledge Source Prioritization**

**Query Strategy:**

- Start with broad architectural queries, narrow to specific implementation
- Use RAG for both strategic decisions and tactical "how-to" questions
- Cross-reference multiple sources for validation
- Keep match_count low (2-5) for focused results

### **Research Validation**

**Always validate research findings:**

- Cross-reference multiple sources
- Verify recency of information
- Test applicability to current project context
- Document assumptions and limitations

### **Task Completion Criteria**

**Every task must meet these criteria before marking "done":**

- [ ] Implementation follows researched best practices
- [ ] Code follows project style guidelines
- [ ] Security considerations addressed
- [ ] Basic functionality tested
- [ ] Documentation updated if needed
- [ ] All tests pass without errors

---

## 🤖 **AI INTEGRATION**

### **Privacy-Preserving AI**

```typescript
// Sanitização antes de AI
export class HealthcareAI {
  static async processPatientQuery(query: string, professionalId: string) {
    // ✅ Remover PHI antes de enviar para AI
    const sanitized = await PHIDetector.sanitize(query);

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a healthcare AI assistant. Never store or log patient data.",
        },
        { role: "user", content: sanitized },
      ],
    });

    // ✅ Auditoria sem PHI
    await AuditLogger.logAIInteraction("HEALTHCARE_AI_QUERY", professionalId, {
      query_length: sanitized.length,
      response_length: aiResponse.choices[0].message.content?.length,
      phi_detected: false,
    });

    return aiResponse.choices[0].message.content;
  }

  // Análise de sintomas com privacy
  static async analyzeSymptoms(symptoms: string[]) {
    // Usar apenas sintomas codificados (ICD-10)
    const codedSymptoms = symptoms.map((s) => ICD10.encode(s));

    return await this.processPatientQuery(
      `Analyze these coded symptoms: ${codedSymptoms.join(", ")}`,
      "system",
    );
  }
}
```

---

## 🧠 **SESSION MANAGEMENT & ANTI-CONTEXT DRIFT**

### **Consistency Protocols**

```yaml
SESSION_MANAGEMENT:
  constitutional_relevance: "Score interactions for constitutional adherence (0-10)"
  think_first_enforcement: "Mandatory sequential-thinking for complexity ≥3"
  research_continuity: "Reference previous MCP research with constitutional context"
  quality_consistency: "Maintain ≥9.8/10 quality standards throughout session"
```

### **Recovery Mechanisms**

- **Drift Detection**: Auto-detect when constitutional relevance drops below 8/10
- **Context Refresh**: Automatic refresh with constitutional principle clarification
- **Think-First Reset**: Return to sequential-thinking analysis when complexity increases
- **Quality Escalation**: Increase quality thresholds if standards drop

### **Quality Validation Patterns**

```typescript
// Validação contínua durante desenvolvimento
const validateQuality = async (code: string, context: string) => {
  const qualityScore = await assessCodeQuality(code);
  const complianceScore = await assessHealthcareCompliance(code);
  const architectureScore = await assessArchitecturalAlignment(code, context);

  const overallScore = (qualityScore + complianceScore + architectureScore) / 3;

  if (overallScore < 9.5) {
    throw new QualityGateError(`Quality score ${overallScore} below threshold`);
  }

  return { score: overallScore, passed: true };
};
```

---

## 📚 **QUICK REFERENCE**

### **🚀 Pre-Production Checklist**

- [ ] **Archon**: Tasks completed and marked as "review"
- [ ] **Security**: MFA ativo, PHI criptografado, audit logs funcionando
- [ ] **Performance**: <200ms response, Lighthouse >95, bundle <1MB
- [ ] **Compliance**: LGPD consent, ANVISA audit, CFM ethics validated
- [ ] **Testing**: 95%+ coverage, E2E workflows, accessibility tested
- [ ] **Quality**: 30-second reality check passed, Ultracite clean, TypeScript strict
- [ ] **Documentation**: Architecture docs updated, comments clear

### **⚡ Emergency Commands**

```bash
# Validação completa pré-produção
pnpm ci:check      # Full code validation (format + lint + type + test)
pnpm security:audit # Security audit
pnpm compliance:lgpd # LGPD validation

# Performance & Quality
pnpm build && pnpm lighthouse # Build + performance analysis
pnpm test:coverage # Test coverage
pnpm format       # Format code automatically
pnpm lint:fix     # Fix linting issues

# Archon Integration
archon:get_available_sources() # Check knowledge base
archon:manage_task(action="list") # List current tasks
archon:perform_rag_query(query="healthcare patterns") # Research

# Ultracite Commands
npx ultracite init   # Initialize in project
npx ultracite format # Format and fix code
npx ultracite lint   # Check without fixing
```

### **🏥 Healthcare-Specific Patterns**

```typescript
// Padrão para operações críticas
const criticalOperation = async (data: CriticalData) => {
  await validateMFA(); // 1. Multi-factor auth
  await validateConsent(); // 2. LGPD consent
  await auditStart(); // 3. Iniciar auditoria

  try {
    const result = await executeOperation(data);
    await auditSuccess(result); // 4. Log sucesso
    return result;
  } catch (error) {
    await auditFailure(error); // 5. Log falha
    throw error;
  }
};

// Minimização de dados
const getMinimizedData = (data: PatientData, role: Role) => {
  const permissions = ROLE_PERMISSIONS[role];
  return Object.keys(data)
    .filter((key) => permissions.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});
};

// Task-driven development pattern
const developWithArchon = async (feature: string) => {
  // 1. Check current tasks
  const tasks = await archon.listTasks({ status: "todo" });

  // 2. Research before implementation
  const patterns = await archon.searchCodeExamples(feature);
  const guidance = await archon.performRAGQuery(
    `${feature} healthcare best practices`,
  );

  // 3. Implement based on research
  const implementation = await implement(patterns, guidance);

  // 4. Update task status
  await archon.updateTask(currentTaskId, { status: "review" });

  return implementation;
};
```

### **📊 Sentry Integration Patterns**

```typescript
// Custom Span instrumentation for healthcare operations
function HealthcareComponent() {
  const handlePatientAccess = () => {
    Sentry.startSpan(
      {
        op: "healthcare.patient.access",
        name: "Patient Data Access",
      },
      (span) => {
        span.setAttribute("compliance", "LGPD");
        span.setAttribute("professional_role", userRole);
        span.setAttribute("access_type", "routine");

        accessPatientData();
      },
    );
  };
}

// Healthcare API monitoring
async function fetchPatientData(patientId: string) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/patients/${patientId}`,
    },
    async () => {
      const response = await fetch(`/api/patients/${patientId}`);
      const data = await response.json();
      return data;
    },
  );
}

// Structured logging for healthcare
const { logger } = Sentry;

logger.info("Patient accessed", {
  patientId: "hashed_id",
  professionalId: "professional_id",
  compliance: "LGPD_APPROVED",
});

logger.warn("LGPD consent expiring", {
  patientId: "hashed_id",
  expiresIn: "7days",
  action_required: "renewal",
});

logger.error("ANVISA compliance violation", {
  violation: "missing_audit_trail",
  professional: "professional_id",
  severity: "high",
});
```

---

> **🏥 Enhanced Constitutional Healthcare Document**: Coding standards integrados com VIBECODER principles, Archon workflow, e healthcare compliance. Mantém padrões de qualidade ≥9.8/10 com validação contínua e guidance completo para desenvolvimento healthcare-first. Última atualização: Janeiro 2025.

---

## 🧠 **SESSION MANAGEMENT & ANTI-CONTEXT DRIFT**

### **Consistency Protocols**

```yaml
SESSION_MANAGEMENT:
  constitutional_relevance: "Score interactions for constitutional adherence (0-10)"
  think_first_enforcement: "Mandatory sequential-thinking for complexity ≥3"
  research_continuity: "Reference previous MCP research with constitutional context"
  quality_consistency: "Maintain ≥9.8/10 quality standards throughout session"
```

### **Recovery Mechanisms**

- **Drift Detection**: Auto-detect when constitutional relevance drops below 8/10
- **Context Refresh**: Automatic refresh with constitutional principle clarification
- **Think-First Reset**: Return to sequential-thinking analysis when complexity increases
- **Quality Escalation**: Increase quality thresholds if standards drop

### **Quality Validation Patterns**

```typescript
// Validação contínua durante desenvolvimento
const validateQuality = async (code: string, context: string) => {
  const qualityScore = await assessCodeQuality(code);
  const complianceScore = await assessAestheticCompliance(code);
  const architectureScore = await assessArchitecturalAlignment(code, context);

  const overallScore = (qualityScore + complianceScore + architectureScore) / 3;

  if (overallScore < 9.5) {
    throw new QualityGateError(`Quality score ${overallScore} below threshold`);
  }

  return { score: overallScore, passed: true };
};
```

---

## 📚 **QUICK REFERENCE**

### **🚀 Pre-Production Checklist**

- [ ] **Archon**: Tasks completed and marked as "review"
- [ ] **Security**: Auth active, client data encrypted, audit logs functioning
- [ ] **Performance**: <200ms response, Lighthouse >95, bundle <1MB
- [ ] **Compliance**: LGPD consent, aesthetic health compliance validated
- [ ] **Testing**: 95%+ coverage, E2E workflows, accessibility tested
- [ ] **Quality**: 30-second reality check passed, code formatted, TypeScript strict
- [ ] **Documentation**: Architecture docs updated, comments clear

### **⚡ Emergency Commands**

```bash
# Validação completa pré-produção
pnpm ci:check      # Full code validation (format + lint + type + test)
pnpm security:audit # Security audit
pnpm compliance:lgpd # LGPD validation

# Performance & Quality
pnpm build && pnpm lighthouse # Build + performance analysis
pnpm test:coverage # Test coverage
pnpm format       # Format code automatically
pnpm lint:fix     # Fix linting issues

# Archon Integration
archon:get_available_sources() # Check knowledge base
archon:manage_task(action="list") # List current tasks
archon:perform_rag_query(query="aesthetic health patterns") # Research

# Ultracite Commands
npx ultracite init   # Initialize in project
npx ultracite format # Format and fix code
npx ultracite lint   # Check without fixing
```

### **🏥 Aesthetic Health-Specific Patterns**

```typescript
// Padrão para operações críticas
const criticalOperation = async (data: CriticalData) => {
  await validateAuth(); // 1. Authentication
  await validateConsent(); // 2. LGPD consent
  await auditStart(); // 3. Iniciar auditoria

  try {
    const result = await executeOperation(data);
    await auditSuccess(result); // 4. Log sucesso
    return result;
  } catch (error) {
    await auditFailure(error); // 5. Log falha
    throw error;
  }
};

// Minimização de dados
const getMinimizedData = (data: ClientData, role: Role) => {
  const permissions = ROLE_PERMISSIONS[role];
  return Object.keys(data)
    .filter((key) => permissions.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});
};

// Task-driven development pattern
const developWithArchon = async (feature: string) => {
  // 1. Check current tasks
  const tasks = await archon.listTasks({ status: "todo" });

  // 2. Research before implementation
  const patterns = await archon.searchCodeExamples(feature);
  const guidance = await archon.performRAGQuery(
    `${feature} aesthetic health best practices`,
  );

  // 3. Implement based on research
  const implementation = await implement(patterns, guidance);

  // 4. Update task status
  await archon.updateTask(currentTaskId, { status: "review" });

  return implementation;
};
```

---

> **🏥 Enhanced Constitutional Aesthetic Health Document**: Coding standards integrados com VIBECODER principles, Archon workflow, e aesthetic health compliance. Mantém padrões de qualidade ≥9.8/10 com validação contínua e guidance completo para desenvolvimento aesthetic health-first. Última atualização: Janeiro 2025.
