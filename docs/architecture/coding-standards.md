# 🏥 **NEONPRO CODING STANDARDS**

## Healthcare SaaS Excellence Framework

> **Versão Concisa** | Qualidade 9.8/10 | LGPD ✅ ANVISA ✅ CFM ✅ HIPAA ✅ GDPR ✅

---

## 📋 **ÍNDICE**

1. [🎯 Princípios Fundamentais](#-princípios-fundamentais)
2. [🛡️ Healthcare Security & Compliance](#️-healthcare-security--compliance)
3. [⚛️ Next.js 15 Architecture](#️-nextjs-15-architecture)
4. [⚡ Performance & Accessibility](#-performance--accessibility)
5. [🗄️ Database & API Security](#️-database--api-security)
6. [🧪 Quality Gates & Testing](#-quality-gates--testing)
7. [🤖 AI Integration](#-ai-integration)
8. [📚 Quick Reference](#-quick-reference)

---

## 🎯 **PRINCÍPIOS FUNDAMENTAIS**

### **Core Engineering Principles**

```typescript
// KISS: Simplicidade mantendo funcionalidade
const updatePatient = async (id: string, data: PatientData) => {
  const encrypted = await encrypt(data);
  await db.patient.update({ where: { id }, data: encrypted });
  await auditLog("UPDATE_PATIENT", id);
};

// YAGNI: Implementar apenas o necessário
interface PatientData {
  name: string;
  cpf: string;
  // Adicionar campos conforme demanda real
}

// CoT: Raciocínio explícito em decisões críticas
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

  return professional && licenseValid && hasAccess;
};
```

### **Arquitetura Base**

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Backend**: Supabase + Hono RPC + tRPC
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Database**: PostgreSQL + Prisma + RLS
- **Testing**: Vitest + Playwright + Testing Library
- **Quality**: Biome + Ultracite + TypeScript Strict

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

## 📚 **QUICK REFERENCE**

### **🚀 Pre-Production Checklist**

- [ ] **Security**: MFA ativo, PHI criptografado, audit logs funcionando
- [ ] **Performance**: <200ms response, Lighthouse >95, bundle <1MB
- [ ] **Compliance**: LGPD consent, ANVISA audit, CFM ethics validated
- [ ] **Testing**: 95%+ coverage, E2E workflows, accessibility tested
- [ ] **Quality**: Biome clean, TypeScript strict, documentation complete

### **⚡ Emergency Commands**

```bash
# Validação completa pré-produção
pnpm check:all     # Lint + Type + Test + E2E
pnpm security:audit # Auditoria de segurança
pnpm compliance:lgpd # Validação LGPD

# Performance & Quality
pnpm build && pnpm lighthouse # Build + análise performance
pnpm test:coverage # Cobertura de testes
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
```

---
