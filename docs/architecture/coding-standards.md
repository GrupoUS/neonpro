# 🏥 **NEONPRO CODING STANDARDS**

## Healthcare SaaS Excellence Framework with VIBECODER Integration

> **Versão Enhanced** | Qualidade 9.8/10 | LGPD ✅ ANVISA ✅ CFM ✅ HIPAA ✅ GDPR ✅ | VIBECODER ✅ ARCHON ✅

---

## 📋 **ÍNDICE**

1. [🎯 Princípios Fundamentais](#-princípios-fundamentais)
2. [🤖 Archon Integration & Task-Driven Development](#-archon-integration--task-driven-development)
3. [🛠️ Development Workflow & Tools](#️-development-workflow--tools)
4. [🛡️ Healthcare Security & Compliance](#️-healthcare-security--compliance)
5. [⚛️ Next.js 15 Architecture](#️-nextjs-15-architecture)
6. [⚡ Performance & Accessibility](#-performance--accessibility)
7. [🗄️ Database & API Security](#️-database--api-security)
8. [🧪 Quality Gates & Testing](#-quality-gates--testing)
9. [📊 Code Quality & Validation](#-code-quality--validation)
10. [🔍 Research-Driven Development](#-research-driven-development)
11. [🤖 AI Integration](#-ai-integration)
12. [🧠 Session Management & Anti-Context Drift](#-session-management--anti-context-drift)
13. [📚 Quick Reference](#-quick-reference)

---

## 🎯 **PRINCÍPIOS FUNDAMENTAIS**

### **VIBECODER Core Engineering Principles**

```typescript
// KISS: Keep It Simple, Stupid - Simplicidade mantendo funcionalidade
const updatePatient = async (id: string, data: PatientData) => {
  const encrypted = await encrypt(data);
  await db.patient.update({ where: { id }, data: encrypted });
  await auditLog("UPDATE_PATIENT", id);
};

// YAGNI: You Aren't Gonna Need It - Implementar apenas o necessário
interface PatientData {
  name: string;
  cpf: string;
  // Adicionar campos conforme demanda real - não "just in case"
}

// CoT: Chain of Thought - Raciocínio explícito em decisões críticas
const validateHealthcareAccess = async (
  professionalId: string,
  patientId: string,
) => {
  // 1. Verificar autenticação profissional
  const professional = await validateProfessional(professionalId);
  // 2. Validar licença ativa (CRM/COREN)
  const licenseValid = await validateLicense(professional.crm);
  // 3. Verificar permissões específicas
  const hasAccess = await checkPatientAccess(professional.id, patientId);
  // 4. Validar consentimento LGPD
  const consentValid = await validateLGPDConsent(patientId, "ACCESS");

  return professional && licenseValid && hasAccess && consentValid;
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

## 🛠️ **DEVELOPMENT WORKFLOW & TOOLS**

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

### **Clean Up Constantly**

```typescript
// ✅ Remover código morto imediatamente
// ❌ Anti-pattern: Manter código "legacy" comentado
/*
// LEGACY CODE - REMOVE THIS
const oldPatientUpdate = async () => {
  // ... código antigo
};
*/

// ✅ Padrão correto: Remover e documentar na funcionalidade atual
const updatePatient = async (id: string, data: PatientData) => {
  // Updated implementation with LGPD compliance
  const encrypted = await encrypt(data);
  await db.patient.update({ where: { id }, data: encrypted });
  await auditLog("UPDATE_PATIENT", id);
};

// ✅ Verificar e corrigir imports não utilizados
// import { unused } from './utils'; // REMOVER
import { encrypt, auditLog } from "./utils"; // MANTER
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

## 🛡️ **HEALTHCARE SECURITY & COMPLIANCE**

### **Unified Compliance Framework**

```typescript
// LGPD + ANVISA + CFM + HIPAA Integration
export class HealthcareCompliance {
  // ✅ LGPD: Consent Management
  static async validateConsent(patientId: string, operation: string) {
    const consent = await db.lgpdConsent.findFirst({
      where: { patientId, operation, valid: true },
    });
    return consent && !this.isExpired(consent.expiresAt);
  }

  // ✅ ANVISA: Medical Device Software (Class IIa)
  static async auditMedicalOperation(operation: MedicalOperation) {
    await db.anvisaAudit.create({
      data: {
        operation: operation.type,
        professional_crm: operation.professionalCrm,
        device_class: "IIA",
        compliance_level: "ANVISA_RDC_301_2019",
      },
    });
  }

  // ✅ CFM: Professional Ethics
  static async validateProfessionalConduct(professionalId: string) {
    const professional = await db.healthcareProfessional.findUnique({
      where: { id: professionalId },
    });
    return professional?.ethicsCompliant && professional?.licenseActive;
  }

  // ✅ HIPAA: US Healthcare Interoperability
  static async generateHL7FHIR(patientData: PatientData) {
    return {
      resourceType: "Patient",
      identifier: [{ value: await hashCPF(patientData.cpf) }],
      // FHIR R4 compliant structure
    };
  }
}

// Multi-Factor Authentication (Obrigatório)
export const healthcareAuthMiddleware = async (req: Request) => {
  const { mfaToken, professionalToken } = req.headers;

  const professional = await validateJWT(professionalToken);
  const mfaValid = await validateMFA(professional.id, mfaToken);

  if (!mfaValid) throw new AuthError("MFA required for healthcare access");

  return { professional, authenticated: true, mfaVerified: true };
};
```

### **Encryption & Data Protection**

```typescript
// AES-256-GCM para PHI (Protected Health Information)
export class HealthcareEncryption {
  private static readonly algorithm = "aes-256-gcm";

  static async encryptPHI(data: any): Promise<EncryptedData> {
    const key = await this.getDerivedKey();
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // ❌ Anti-pattern: Nunca logar dados não criptografados
    // console.log('Encrypting:', data) // NUNCA!

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(JSON.stringify(data)),
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
    };
  }

  // ✅ Auditoria sem exposição de PHI
  static async auditEncryption(operation: string, dataSize: number) {
    await AuditLogger.log("ENCRYPTION_OPERATION", {
      operation,
      dataSize, // Tamanho, não conteúdo
      algorithm: this.algorithm,
      compliance: ["LGPD", "HIPAA", "ANVISA"],
    });
  }
}

// Rate Limiting para Healthcare
export const healthcareRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // requests per window
  message: "Too many healthcare requests",
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## ⚛️ **NEXT.JS 15 ARCHITECTURE**

### **Server Components + Healthcare Patterns**

```typescript
// Server Component para dados sensíveis
export default async function PatientProfile({ patientId }: { patientId: string; }) {
  // ✅ Validação server-side obrigatória
  const session = await getHealthcareSession();
  if (!session?.professional) redirect('/auth');

  // ✅ Dados criptografados permanecem no servidor
  const encryptedPatient = await getPatientSecure(patientId, session.professional.id);
  const patient = await HealthcareEncryption.decryptPHI(encryptedPatient);

  // ✅ Minimização de dados baseada no papel
  const sanitizedData = applyDataMinimization(patient, session.professional.role);

  return (
    <div className="patient-profile">
      <PatientHeader patient={sanitizedData} />
      <MedicalHistory patientId={patientId} />
    </div>
  );
}

// Server Actions para operações críticas
export async function updatePatientAction(formData: FormData) {
  'use server';

  const session = await getHealthcareSession();
  const data = Object.fromEntries(formData);

  // Validação de esquema com Zod
  const validatedData = PatientUpdateSchema.parse(data);

  // Transação com auditoria
  await db.$transaction(async (tx) => {
    const encrypted = await HealthcareEncryption.encryptPHI(validatedData);

    await tx.patient.update({
      where: { id: validatedData.id },
      data: encrypted,
    });

    await tx.auditLog.create({
      data: {
        action: 'UPDATE_PATIENT',
        professionalId: session.professional.id,
        patientId: validatedData.id,
        timestamp: new Date(),
      },
    });
  });

  revalidatePath(`/patients/${validatedData.id}`);
}

// Client Component para interações
'use client';
export function PatientForm({ patientId }: { patientId: string; }) {
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    (state, newData) => ({ ...state, ...newData }),
  );

  // ❌ Anti-pattern: PHI no estado do cliente
  // const [patientCPF, setPatientCPF] = useState() // NUNCA!

  const handleSubmit = async (formData: FormData) => {
    addOptimistic({ updating: true });
    await updatePatientAction(formData);
  };

  return (
    <form action={handleSubmit}>
      {/* Formulário sem PHI no cliente */}
    </form>
  );
}
```

### **Hono RPC + Healthcare Endpoints**

```typescript
// Type-safe healthcare API
const healthcareApi = new Hono()
  .use("*", healthcareAuthMiddleware)
  .use("*", healthcareRateLimit)
  .get("/patients/:id", async (c) => {
    const patientId = c.req.param("id");
    const professional = c.get("professional");

    // Validação de acesso
    const hasAccess = await validatePatientAccess(professional.id, patientId);
    if (!hasAccess) return c.json({ error: "Access denied" }, 403);

    // Dados com minimização aplicada
    const patient = await getPatientWithMinimization(
      patientId,
      professional.role,
    );

    return c.json({ patient, accessLevel: professional.role });
  });

// Client-side com type safety
const client = hc<typeof healthcareApi>("/api/healthcare");
const patientData = await client.patients[patientId].$get();
```

---

## ⚡ **PERFORMANCE & ACCESSIBILITY**

### **Performance Thresholds**

```typescript
// Métricas obrigatórias para healthcare
export const PERFORMANCE_GATES = {
  responseTime: 200, // ms - crítico para emergências
  dbQueryTime: 50, // ms - consultas médicas
  bundleSize: 1000, // KB - profissionais móveis
  lighthouseScore: 95, // Mínimo para produção
  memoryUsage: 100, // MB por sessão
};

// Otimização de consultas médicas
export const OptimizedQueries = {
  // ✅ Paginação para grandes volumes
  getPatients: (limit = 20, offset = 0) =>
    db.patient.findMany({
      take: limit,
      skip: offset,
      select: { id: true, name: true, lastVisit: true }, // Apenas essencial
    }),

  // ✅ Índices para buscas médicas
  searchBySymptoms: (symptoms: string[]) =>
    db.patient.findMany({
      where: { symptoms: { hasSome: symptoms } },
      // Índice GIN para arrays de sintomas
    }),
};

// Code Splitting por módulo médico
const AppointmentsModule = lazy(() => import("./modules/appointments"));
const MedicalRecordsModule = lazy(() => import("./modules/medical-records"));
const PrescriptionsModule = lazy(() => import("./modules/prescriptions"));
```

### **WCAG 2.1 AA Healthcare Compliance**

```typescript
// Componentes acessíveis para healthcare
export function EmergencyButton({ onEmergency }: { onEmergency: () => void; }) {
  return (
    <button
      onClick={onEmergency}
      className="bg-red-600 text-white p-4 text-lg font-bold
                 focus:ring-4 focus:ring-red-300
                 aria-label='Emergency Alert Button'"
      aria-describedby="emergency-help"
      // ✅ Contraste mínimo 4.5:1 para emergências
      style={{ minHeight: '48px' }} // ✅ Target size mínimo
    >
      🚨 EMERGÊNCIA
    </button>
  );
}

// Navegação para leitores de tela
export function HealthcareNavigation() {
  return (
    <nav role="navigation" aria-label="Healthcare Navigation">
      <ul>
        <li>
          <a href="/patients" aria-current="page">Pacientes</a>
        </li>
        <li>
          <a href="/appointments">Consultas</a>
        </li>
        <li>
          <a href="/prescriptions">Prescrições</a>
        </li>
      </ul>
    </nav>
  );
}

// Multi-idioma para inclusão
export const healthcareTranslations = {
  'pt-BR': { emergency: 'Emergência', patient: 'Paciente' },
  'en-US': { emergency: 'Emergency', patient: 'Patient' },
  'es-ES': { emergency: 'Emergencia', patient: 'Paciente' },
};
```

---

## 🗄️ **DATABASE & API SECURITY**

### **Row Level Security (RLS)**

```sql
-- Política LGPD para pacientes
CREATE POLICY "healthcare_professional_patients" ON patients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM healthcare_access ha
      WHERE ha.professional_id = auth.uid()
      AND ha.patient_id = patients.id
      AND ha.lgpd_consent = true
      AND ha.expires_at > NOW()
    )
  );

-- Auditoria automática
CREATE OR REPLACE FUNCTION audit_healthcare_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name, operation, user_id,
    patient_id, timestamp, compliance_flags
  ) VALUES (
    TG_TABLE_NAME, TG_OP, auth.uid(),
    COALESCE(NEW.id, OLD.id), NOW(),
    jsonb_build_object('lgpd', true, 'anvisa', true)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### **API Security Patterns**

```typescript
// Middleware stack completo
export const secureHealthcareAPI = [
  cors({ origin: process.env.ALLOWED_ORIGINS }),
  helmet({ contentSecurityPolicy: HEALTHCARE_CSP }),
  healthcareRateLimit,
  healthcareAuthMiddleware,
  lgpdComplianceMiddleware,
  auditMiddleware,
];

// Validação de esquemas com sanitização
export const PatientSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeName),
  cpf: z
    .string()
    .regex(/^\d{11}$/)
    .transform(hashCPF),
  birthDate: z.coerce.date().max(new Date()),
  // ❌ Anti-pattern: Campos sensíveis sem validação
  medicalHistory: z.string().max(5000).optional(),
});

// Rate limiting específico por operação
export const operationLimits = {
  patient_read: { windowMs: 60000, max: 100 },
  patient_write: { windowMs: 60000, max: 20 },
  emergency_access: { windowMs: 60000, max: 5 },
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

- **Security**: 100% compliance (LGPD, ANVISA, CFM)
- **Performance**: <200ms response, >95 Lighthouse
- **Testing**: 95%+ coverage, E2E workflows
- **Accessibility**: WCAG 2.1 AA compliant
- **Type Safety**: TypeScript strict mode

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
          content:
            "You are a healthcare AI assistant. Never store or log patient data.",
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
