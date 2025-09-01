# 🚀 **NEONPRO CODING STANDARDS**

## AI-First Advanced Aesthetic Platform Development Standards

> **Quality Standard**: 9.8/10 | **Compliance**: LGPD ✅ ANVISA ✅ CFM ✅

**Streamlined coding standards for NeonPro AI Advanced Aesthetic Platform optimized for LLM consumption and efficient development.**

---

## 📋 **ESSENTIAL REFERENCES**

- **⚙️ Tech Stack**: [`tech-stack.md`](tech-stack.md) - Next.js 15, React 19, Vercel AI SDK 5.0, Hono.dev 4.x, Supabase
- **📁 Source Tree**: [`source-tree.md`](source-tree.md) - Monorepo structure and package organization

---

## 🎯 **CORE PRINCIPLES**

### **Development Philosophy**

- **KISS Principle**: Keep implementations simple and maintainable
- **YAGNI Principle**: Build only what current requirements specify
- **Test-Driven**: Verify functionality through direct observation, not assumptions
- **Quality Standard**: Maintain ≥9.8/10 code quality with advanced aesthetic compliance
- **AI-First**: Native AI integration across all aesthetic treatment workflows
- **Clean Code**: Remove deprecated code immediately

```yaml
KISS_PRINCIPLE:
  definition: "Keep It Simple, Stupid - Simplicity is key"
  rules:
    - Choose simplest solution that meets requirements
    - Prefer readable code over clever optimizations
    - Use clear, descriptive naming
    - Avoid over-engineering

YAGNI_PRINCIPLE:
  definition: "You Aren't Gonna Need It - Don't implement until needed"
  rules:
    - Build only what current requirements specify
    - Resist 'just in case' features
    - Remove unused code immediately
    - Refactor when requirements emerge
```

### **Technology Stack**

- **Package Manager**: pnpm (mandatory)
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Backend**: Supabase + Hono.dev + PostgreSQL
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: Vercel AI SDK 5.0 + OpenAI + Anthropic
- **Testing**: Vitest + Playwright + Testing Library
- **Quality**: Biome + TypeScript Strict

### **Code Quality Standards**

```typescript
// ✅ KISS: Simple, maintainable aesthetic operations
const updatePatient = async (id: string, data: PatientData) => {
  const encrypted = await encrypt(data);
  await db.patient.update({ where: { id }, data: encrypted });
  await auditLog("UPDATE_PATIENT", id);
};

// ✅ YAGNI: Implement only required fields
interface PatientData {
  name: string;
  email: string;
  phone?: string; // Add fields as needed, not "just in case"
}

// ✅ Advanced aesthetic validation with explicit reasoning
const validateAestheticAccess = async (professionalId: string, patientId: string) => {
  // 1. Verify professional authentication
  const professional = await validateProfessional(professionalId);
  // 2. Check specific permissions
  const hasAccess = await checkPatientAccess(professional.id, patientId);
  // 3. Validate LGPD consent
  const consentValid = await validateLGPDConsent(patientId, "ACCESS");

  return professional && hasAccess && consentValid;
};
```

### Architecture

- **Separation:** Frontend separated from backend (avoid monoliths)
- **TypeScript:** Strict typing across all layers
  - Never use `any` explicitly
  - Remove unused variables, imports, and parameters

### Performance & UX

- **Loading:** SSR + Skeletons as a fallback for instant display
- **Loading States:** Avoid when possible, prefer cache/fallback
- **Accessibility:** Always include `DialogTitle` in modals

### Testing & Development

- **Test-Driven Development:** Write comprehensive Jest tests before generating code - use TDD to validate requirements
- **Immediate Refactoring:** Refactor generated code immediately to align with SOLID principles and project architecture
- **Technical Documentation:** Maintain updated and detailed technical documentation to guide both humans and future code generation


### **Code Style Requirements**

- **High Confidence**: Only suggest changes with 95%+ confidence
- **Self-Documenting**: Clear code over comments, delete unused code
- **Modularization**: Split large files into smaller modules
- **Function Length**: Keep functions under 20 lines when possible
- **Single Responsibility**: Each function has one clear purpose
- **Early Returns**: Reduce nesting, improve readability
- **TypeScript Strict**: No `any` types, remove unused imports/variables

---
### React rules

- Use functional components with hooks instead of class components
- Use custom hooks for reusable logic
- Use the Context API for state management when needed
- Use proper prop validation with PropTypes
- Use React.memo for performance optimization when necessary
- Use fragments to avoid unnecessary DOM elements
- Use proper list rendering with keys
- Prefer composition over inheritance
- Use React.lazy for code splitting
- Use React.Suspense for loading states
- Use React.useCallback for performance optimization
- Use React.useMemo for performance optimization
- Use React.useRef for performance optimization
- Use React.useState for state management
- Use React.useEffect for side effects
- Use React.useContext for state management
- Use React.useReducer for state management
- Use React.useImperativeHandle for performance optimization

### Tailwind CSS rules

- Use responsive prefixes for mobile-first design:

```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on medium, one-third on large screens -->
</div>
```

- Use state variants for interactive elements:

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  Click me
</button>
```

- Use @apply for repeated patterns when necessary:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

- Use arbitrary values for specific requirements:

```html
<div class="top-[117px] grid-cols-[1fr_2fr]">
  <!-- Custom positioning and grid layout -->
</div>
```

- Use spacing utilities for consistent layout:

```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
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
// Server Component for sensitive aesthetic data
export default async function PatientProfile({ patientId }: { patientId: string; }) {
  // ✅ Server-side validation mandatory
  const session = await getSession();
  if (!session?.user) redirect("/auth");

  // ✅ Encrypted data stays on server
  const encryptedPatient = await getPatientSecure(patientId, session.user.id);
  const patient = await decrypt(encryptedPatient);

  return (
    <div className="patient-profile">
      <PatientHeader patient={patient} />
      <TreatmentHistory patientId={patientId} />
    </div>
  );
}

// Server Actions for critical operations
export async function updatePatientAction(formData: FormData) {
  "use server";

  const session = await getSession();
  const data = Object.fromEntries(formData);

  // Schema validation with Zod
  const validatedData = PatientUpdateSchema.parse(data);

  // Transaction with audit
  await db.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id: validatedData.id },
      data: validatedData,
    });

    await tx.auditLog.create({
      data: {
        action: "UPDATE_PATIENT",
        userId: session.user.id,
        patientId: validatedData.id,
        timestamp: new Date(),
      },
    });
  });

  revalidatePath(`/patients/${validatedData.id}`);
}
```

---

## 🔒 **ADVANCED AESTHETIC COMPLIANCE**

### **Regulatory Framework**

- **LGPD Compliance**: Automated patient consent management and data protection validation
- **ANVISA Class IIa**: Advanced aesthetic device software compliance with audit trail requirements
- **CFM Ethics**: Professional conduct validation and aesthetic medicine ethics compliance monitoring
- **International Standards**: HIPAA compatibility for future expansion

### **Security Implementation**

- **Encryption**: AES-256-GCM for all aesthetic patient information
- **Authentication**: Multi-factor authentication mandatory for advanced aesthetic access
- **Audit Trail**: Immutable logging for all patient data operations
- **Row Level Security**: Constitutional RLS patterns with real-time compliance validation

### **LGPD Core Implementation**

```typescript
// LGPD-compliant aesthetic data handling
export class LGPDManager {
  static async requestConsent(patientId: string, purpose: string) {
    const consent = await db.lgpdConsent.create({
      data: {
        patientId,
        purpose,
        status: "pending",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Send consent request notification
    await NotificationService.sendConsentRequest(patientId, consent.id);
    return consent;
  }

  static async revokeConsent(patientId: string, consentId: string) {
    await db.$transaction(async (tx) => {
      // Mark consent as revoked
      await tx.lgpdConsent.update({
        where: { id: consentId },
        data: { status: "revoked", revokedAt: new Date() },
      });

      // Anonymize related data
      await tx.patientData.updateMany({
        where: { patientId },
        data: { status: "anonymized" },
      });
    });
  }
}

// Data encryption patterns
export const encrypt = (data: string): Promise<string> => {
  // Use AES-256-GCM for aesthetic patient data
  return crypto.subtle.encrypt(algorithm, key, Buffer.from(data));
};

export const decrypt = (encryptedData: string): Promise<string> => {
  return crypto.subtle.decrypt(algorithm, key, Buffer.from(encryptedData));
};
```

### **Basic Security Middleware**

```typescript
// Authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

---## 🧪 **QUALITY GATES & TESTING**

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

### **Testing Requirements**

```typescript
// Utilities for advanced aesthetic tests
export class AestheticTestUtils {
  static createTestPatient(): TestPatient {
    return {
      id: crypto.randomUUID(),
      cpf: "00000000000", // Synthetic CPF
      name: "Test Patient",
      birthDate: "1990-01-01",
      // ✅ Always synthetic data for tests
    };
  }

  static async mockAestheticSession() {
    return {
      professional: {
        id: "test-professional-id",
        crm: "123456-SP",
        role: "aesthetician",
        mfaVerified: true,
      },
    };
  }
}

// Compliance tests mandatory
describe("LGPD Compliance", () => {
  test("should require consent for patient data access", async () => {
    const patient = AestheticTestUtils.createTestPatient();

    // ❌ Without consent should fail
    await expect(
      PatientService.getData(patient.id, "test-professional"),
    ).rejects.toThrow("LGPD consent required");

    // ✅ With consent should work
    await LGPDService.grantConsent(patient.id, "DATA_ACCESS");
    const data = await PatientService.getData(patient.id, "test-professional");
    expect(data).toBeDefined();
  });
});

// E2E for critical workflows
test("Emergency patient access workflow", async ({ page }) => {
  await page.goto("/emergency-access");

  // Verify MFA for emergency
  await page.fill("[data-testid=emergency-code]", "EMERGENCY123");
  await page.click("[data-testid=emergency-access]");

  // Validate access to critical data
  await expect(page.locator("[data-testid=patient-vitals]")).toBeVisible();

  // Verify emergency access audit
  const auditLogs = await db.auditLog.findMany({
    where: { action: "EMERGENCY_ACCESS" },
  });
  expect(auditLogs).toHaveLength(1);
});
```

### **Quality Metrics**

- **Security**: 100% compliance (LGPD, advanced aesthetic sector)
- **Performance**: <200ms response, >95 Lighthouse
- **Testing**: 95%+ coverage, E2E workflows
- **Accessibility**: WCAG 2.1 AA compliant
- **Type Safety**: TypeScript strict mode

---

## 🎯 **AI INTEGRATION & AUTOMATION**

### **AI-Powered Advanced Aesthetic Features**

- **Privacy-First AI**: Patient data sanitization before AI processing with compliance validation
- **Aesthetic Context**: Advanced aesthetic-specific AI prompts and validation patterns
- **Compliance Automation**: AI-powered LGPD/ANVISA/CFM adherence monitoring
- **Streaming Optimization**: Real-time AI responses with advanced aesthetic workflow integration

### **Privacy-Preserving AI**

```typescript
// Sanitization before AI
export class AestheticAI {
  static async processPatientQuery(query: string, professionalId: string) {
    // ✅ Remove PHI before sending to AI
    const sanitized = await PHIDetector.sanitize(query);

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an advanced aesthetic AI assistant. Never store or log patient data.",
        },
        { role: "user", content: sanitized },
      ],
    });

    // ✅ Audit without PHI
    await AuditLogger.logAIInteraction("AESTHETIC_AI_QUERY", professionalId, {
      query_length: sanitized.length,
      response_length: aiResponse.choices[0].message.content?.length,
      phi_detected: false,
    });

    return aiResponse.choices[0].message.content;
  }

  // Treatment analysis with privacy
  static async analyzeTreatment(treatments: string[]) {
    // Use only coded treatments (standardized codes)
    const codedTreatments = treatments.map((t) => AestheticCodes.encode(t));

    return await this.processPatientQuery(
      `Analyze these coded treatments: ${codedTreatments.join(", ")}`,
      "system",
    );
  }
}
```

---

## 🔧 **PERFORMANCE & MONITORING**

### **Advanced Aesthetic Performance Targets**

- **Emergency Response**: <200ms for critical patient data access
- **Aesthetic Operations**: <2s response time guarantee for all treatment workflows
- **Compliance Validation**: Real-time LGPD/ANVISA checking with automatic remediation
- **AI Response Times**: <500ms for advanced aesthetic AI interactions with streaming optimization

### **Quality Gates & Standards**

- **Progressive Quality**: L1-L10 standards with advanced aesthetic domain overrides
- **Test Coverage**: ≥95% for advanced aesthetic features with compliance scenario testing
- **Accessibility**: WCAG 2.1 AA+ compliance for aesthetic accessibility requirements
- **Security Validation**: Zero high/critical vulnerabilities with continuous monitoring

---

## 📚 **DEVELOPMENT WORKFLOW & DAILY ROUTINES**

### **Mandatory Tools**

- **Task Management**: Archon MCP server (primary system)
- **File Operations**: Desktop Commander (100% mandatory usage)
- **Research Chain**: Context7 → Tavily → Exa (progressive intelligence)
- **AI Integration**: Vercel AI SDK 5.0 with constitutional patterns
- **Compliance**: Automated LGPD/ANVISA/CFM validation tools

### **Code Quality Enforcement**

- **TypeScript**: Strict mode with advanced aesthetic data structures
- **Testing**: Vitest + Playwright with advanced aesthetic scenario coverage
- **Linting**: Constitutional linting rules with advanced aesthetic compliance checks
- **Architecture**: Constitutional service patterns with self-governance

### **Development Setup**

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd neonpro
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run development server**
   ```bash
   bun dev
   ```

### **Essential Environment Variables**

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

---

## 📚 **QUICK REFERENCE**

### **🚀 Pre-Production Checklist**

- [ ] **Archon**: Tasks completed and marked as "review"
- [ ] **Security**: MFA active, PHI encrypted, audit logs functioning
- [ ] **Performance**: <200ms response, Lighthouse >95, bundle <1MB
- [ ] **Compliance**: LGPD consent, ANVISA audit, CFM ethics validated
- [ ] **Testing**: 95%+ coverage, E2E workflows, accessibility tested
- [ ] **Quality**: 30-second reality check passed, TypeScript strict
- [ ] **Documentation**: Architecture docs updated, comments clear

### **⚡ Emergency Commands**

```bash
# Complete code validation
bun run ci:check      # Full code validation (format + lint + type + test)
bun run security:audit # Security audit
bun run compliance:validate # Advanced aesthetic compliance validation

# Performance & Quality
bun run build && bun run lighthouse # Build + performance analysis
bun run test:coverage # Test coverage
bun run format       # Format code automatically
bun run lint:fix     # Fix linting issues

# Archon Integration
archon:get_available_sources() # Check knowledge base
archon:manage_task(action="list") # List current tasks
archon:perform_rag_query(query="advanced aesthetic patterns") # Research
```

### **Development Workflow**

```bash
# Archon task management
archon:manage_task(action="list", filter_by="status", filter_value="todo")
archon:perform_rag_query(query="advanced aesthetic implementation patterns")

# Quality validation
bun run ci:check          # Complete code validation
bun run compliance:validate   # Advanced aesthetic compliance validation
bun run test:aesthetic   # Advanced aesthetic scenario testing
```

### **Advanced Aesthetic Compliance**

```bash
# Compliance validation
bun run compliance:validate     # Validate advanced aesthetic compliance
bun run audit:trail            # Generate audit trail reports
bun run lgpd:check            # LGPD compliance validation
bun run anvisa:validate       # ANVISA compliance validation
```

### **🏥 Advanced Aesthetic-Specific Patterns**

```typescript
// Pattern for critical operations
const criticalOperation = async (data: CriticalData) => {
  await validateMFA(); // 1. Multi-factor auth
  await validateConsent(); // 2. LGPD consent
  await auditStart(); // 3. Start audit

  try {
    const result = await executeOperation(data);
    await auditSuccess(result); // 4. Log success
    return result;
  } catch (error) {
    await auditFailure(error); // 5. Log failure
    throw error;
  }
};

// Data minimization
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
    `${feature} advanced aesthetic best practices`,
  );

  // 3. Implement based on research
  const implementation = await implement(patterns, guidance);

  // 4. Update task status
  await archon.updateTask(currentTaskId, { status: "review" });

  return implementation;
};
```

---

> **🏥 Constitutional Advanced Aesthetic Document**: This comprehensive document provides NeonPro-specific rules that complement the universal framework in [`../../.ruler/core-workflow.md`](../../.ruler/core-workflow.md) and complete architecture in [`docs/architecture/`](../). Unified coding standards integrated with VIBECODER principles, Archon workflow, and advanced aesthetic compliance. Maintains quality standards ≥9.8/10 with continuous validation and complete guidance for advanced aesthetic-first development. Last updated: January 2025.
