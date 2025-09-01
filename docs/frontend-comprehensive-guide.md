# NeonPro Frontend Development Guide - Version: 4.0.0

## Overview

Frontend development guide for **NeonPro**, an AI-First Brazilian Aesthetic Clinic Platform. This guide provides **clear separation** between frontend and backend architecture, with comprehensive interface contracts and development patterns for our Turborepo monorepo.

**Target Audience**: Frontend developers, full-stack developers, and technical leads
**Focus**: Next.js 15 + React 19 frontend with clear backend boundaries
**Architecture Score**: 87/100 (24→22 packages optimization in progress)

## Prerequisites

**Frontend Developers:**

- Next.js 15 App Router, React 19, TypeScript 5.3+
- shadcn/ui component library, TweakCN NEONPRO theme
- Brazilian aesthetic clinic UX patterns
- WCAG 2.1 AA+ accessibility standards

**Full-Stack Developers (Additional):**

- Hono.dev 4.x API development
- Supabase PostgreSQL, Brazilian regulations (LGPD/ANVISA)
- Integration patterns with external services

**Development Environment:**

- Node.js 20+ with **pnpm** (required for Turborepo)
- VS Code with Turborepo extension
- Turborepo 2.x workspace understanding

## Quick Start

```bash
# Setup
git clone <neonpro-repo-url> && cd neonpro
pnpm install && pnpm dev

# Monorepo Structure
apps/web/     # Next.js 15 Frontend (PORT 3000)
apps/api/     # Hono.dev Backend (PORT 3004)
packages/     # 24 packages (optimizing to 22)

# Frontend Dependencies
pnpm add @neonpro/ui @neonpro/types
pnpm add ai @ai-sdk/openai @supabase/supabase-js

# Start Frontend Only
pnpm dev:web
```

---

## 🎨 Frontend Architecture

### Client-Side Architecture Overview

**Technology Stack:**

- **Framework**: Next.js 15 with App Router + React Server Components
- **Language**: TypeScript 5.3+ with strict mode
- **UI Library**: shadcn/ui + TweakCN NEONPRO theme
- **State Management**: React 19 hooks + Zustand for complex state
- **Styling**: Tailwind CSS with healthcare design tokens
- **AI Integration**: Vercel AI SDK for Portuguese chat

### Component Architecture

```typescript
// Component Interface Pattern
export interface AestheticPatientCardProps {
  readonly patientId: string;
  readonly name: string;
  readonly cpf: string; // Masked in UI: ***.***.***-**
  readonly lastProcedure?: string;
  readonly nextAppointment?: string;
  readonly lgpdCompliant: boolean;
  readonly noShowRisk: 'low' | 'medium' | 'high';
  readonly onViewDetails: (patientId: string) => void;
}

// Frontend Component Structure
src/
├── app/                    # Next.js 15 App Router
│   ├── (dashboard)/        # Route groups
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── aesthetic/          # Aesthetic clinic components
│   └── ai/                 # Portuguese AI chat components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript definitions
└── stores/                 # State management
```

### State Management Pattern

```typescript
// Zustand store for complex state
interface PatientStore {
  patients: Patient[];
  selectedPatient: Patient | null;
  searchQuery: string;
  // Actions
  setPatients: (patients: Patient[]) => void;
  selectPatient: (id: string) => void;
  updateSearchQuery: (query: string) => void;
}

// React Query for server state
export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: () => api.patients.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Routing Architecture

```typescript
// Next.js 15 App Router Structure
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── patients/
│   │   ├── page.tsx         # Patient list
│   │   └── [id]/page.tsx    # Patient details
│   ├── appointments/page.tsx
│   ├── ai-chat/page.tsx     # Portuguese AI assistant
│   └── analytics/page.tsx
└── layout.tsx               # Root layout with LGPD compliance
```

### Portuguese AI Chat Integration

```typescript
// AI Chat Component (Frontend)
export function PortugueseAestheticChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/ai/chat",
    body: {
      language: "pt-BR",
      context: "aesthetic-clinic",
      features: ["scheduling", "procedures", "aftercare"],
    },
  });

  return (
    <div className="aesthetic-chat-container">
      <div className="messages space-y-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
        />
      </form>
    </div>
  );
}
```

---

## ⚙️ Backend Architecture

### Server-Side Architecture Overview

**Technology Stack:**

- **Framework**: Hono.dev 4.x with Brazilian middleware
- **Database**: Supabase PostgreSQL with Real-time subscriptions
- **Authentication**: JWT with role-based access control
- **Integrations**: ANVISA, Professional Health Councils, SUS DataSUS, LGPD compliance services
- **AI Services**: OpenAI GPT-4 with Portuguese optimization

### API Architecture Pattern

```typescript
// Backend API Structure
apps/api/src/
├── routes/                 # API endpoints
│   ├── auth.ts            # Authentication routes
│   ├── patients.ts        # Patient management
│   ├── professionals.ts   # Healthcare providers
│   ├── appointments.ts    # Scheduling system
│   └── ai/               # AI services
├── middleware/           # Request processing
│   ├── auth.ts          # JWT validation
│   ├── lgpd.ts          # LGPD compliance
│   └── rateLimit.ts     # API rate limiting
├── services/            # Business logic
│   ├── encryption.ts    # Data encryption
│   ├── anvisa.ts        # ANVISA integration
│   └── sus.ts           # SUS DataSUS integration
└── types/              # Shared TypeScript types
```

### Database Architecture

```typescript
// Supabase Schema Structure
interface DatabaseSchema {
  patients: {
    id: string;
    full_name: string; // Encrypted
    email: string; // Encrypted
    cpf: string; // Encrypted
    consent_lgpd: boolean;
    created_at: string;
  };

  appointments: {
    id: string;
    patient_id: string;
    professional_id: string;
    scheduled_date: string;
    status: AppointmentStatus;
    no_show_risk: "low" | "medium" | "high";
  };

  professionals: {
    id: string;
    full_name: string;
    professional_license: string; // Professional councils: CRM, CRF, COREN, COFFITO, CRBM, state esthetics boards
    profession: ProfessionType;
    anvisa_compliant: boolean;
  };
}
```

### Authentication & Authorization

```typescript
// Backend Auth Service
export class AuthService {
  async validateToken(token: string): Promise<AuthUser | null> {
    // JWT validation with Brazilian healthcare roles
    const payload = jwt.verify(token, JWT_SECRET);
    return this.getUserWithPermissions(payload.userId);
  }

  async checkPermission(
    user: AuthUser,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Role-based access control for healthcare data
    const permissions = await this.getUserPermissions(user.id);
    return permissions.includes(`${action}:${resource}`);
  }
}
```

---

## 🔗 Interface Contracts

### API Contract Specifications

**Base API URL**: `/api/v1`
**Authentication**: `Bearer <JWT_TOKEN>`
**Content-Type**: `application/json`

#### Patient Management APIs

```typescript
// GET /api/v1/patients
interface PatientsListResponse {
  success: boolean;
  data: {
    patients: PatientBasicView[]; // Masked data for LGPD
    pagination: PaginationInfo;
  };
  message: string;
}

// POST /api/v1/patients
interface CreatePatientRequest {
  fullName: string;
  email: string;
  cpf: string; // Will be encrypted
  consent: PatientConsent; // LGPD required
}
```

#### Appointment Management APIs

```typescript
// POST /api/v1/appointments
interface CreateAppointmentRequest {
  patientId: string;
  professionalId: string;
  serviceId: string;
  scheduledDate: string; // ISO timestamp
  notes?: string;
}

interface AppointmentResponse {
  success: boolean;
  data: {
    appointment: Appointment;
    noShowPrediction: { // AI-powered prediction
      risk: "low" | "medium" | "high";
      confidence: number;
      factors: string[];
    };
  };
}
```

#### Portuguese AI Chat APIs

```typescript
// POST /api/v1/ai/chat
interface AIChatRequest {
  messages: ChatMessage[];
  language: "pt-BR";
  context: "aesthetic-clinic";
  features: string[];
}

interface AIChatResponse {
  success: boolean;
  data: {
    response: string; // Portuguese response
    suggestions: string[]; // Follow-up suggestions
    appointmentIntent?: { // Detected scheduling intent
      action: "schedule" | "reschedule" | "cancel";
      procedure?: string;
      preferredDate?: string;
    };
  };
}
```

### Component Interface Contracts

```typescript
// Frontend-Backend Data Flow
interface DataFlowPattern {
  // 1. Frontend Request
  frontend: {
    component: "PatientForm";
    action: "createPatient";
    data: CreatePatientRequest;
  };

  // 2. API Contract
  api: {
    endpoint: "POST /api/v1/patients";
    validation: "LGPD consent + CPF validation";
    encryption: "PII fields encrypted";
  };

  // 3. Backend Processing
  backend: {
    service: "PatientService";
    database: "Supabase insert with audit log";
    compliance: "LGPD consent recorded";
  };

  // 4. Frontend Response
  response: {
    component: "PatientForm";
    state: "success | error";
    navigation: "redirect to patient list";
  };
}
```

---

## 📱 Examples

### Aesthetic Clinic Components

```typescript
// Patient Card Component (Frontend)
export function AestheticPatientCard({
  name,
  cpf,
  lastProcedure,
  nextAppointment,
  lgpdCompliant,
  noShowRisk,
}: AestheticPatientCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{name}</CardTitle>
            <p className="text-xs text-muted-foreground">CPF: {cpf}</p>
          </div>
          {lgpdCompliant && (
            <Badge variant="outline" className="border-green-500">
              <Shield className="h-3 w-3 mr-1" />LGPD
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <span>Último: {lastProcedure}</span>
          {nextAppointment && (
            <Badge variant={noShowRisk === "high" ? "destructive" : "secondary"}>
              <Calendar className="h-3 w-3 mr-1" />
              {nextAppointment}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
```

### Anti-No-Show Prediction System

```typescript
// Frontend: Risk Display Component
export function NoShowRiskIndicator({ prediction }: {
  prediction: NoShowPrediction;
}) {
  const riskColors = {
    low: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    high: "text-red-600 bg-red-50",
  };

  return (
    <div className={`p-2 rounded-lg ${riskColors[prediction.risk]}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Risco: {prediction.risk.toUpperCase()}</span>
        <Badge>{prediction.confidence}%</Badge>
      </div>

      {prediction.risk !== "low" && (
        <div className="mt-2 text-sm">
          <p className="font-medium">Recomendações:</p>
          <ul className="list-disc list-inside">
            {prediction.recommendations.map(rec => <li key={rec}>{rec}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// Backend: Risk Calculation Service
export class NoShowPredictionService {
  async calculateRisk(appointmentData: AppointmentRiskData): Promise<NoShowPrediction> {
    const factors = await this.analyzeRiskFactors(appointmentData);
    const aiPrediction = await this.aiService.predictNoShow(factors);

    return {
      risk: this.categorizeRisk(aiPrediction.score),
      confidence: Math.round(aiPrediction.confidence * 100),
      factors: factors.map(f => f.description),
      recommendations: this.generateRecommendations(aiPrediction),
    };
  }
}
```

---

## 🔒 Security & PHI Protection

### PHI Masking Patterns

**Protected Health Information (PHI) Masking Requirements:**

```typescript
// PHI Masking Utilities
export class PHIMasker {
  static maskCPF(cpf: string): string {
    // Mask: 123.456.789-01 → ***.***.***-**
    return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "***.***.***-**");
  }

  static maskPhone(phone: string): string {
    // Mask: (11) 99999-9999 → (11) *****-****
    return phone.replace(/(\(\d{2}\)\s*)(\d{4,5})-(\d{4})/, "$1*****-****");
  }

  static maskEmail(email: string): string {
    // Mask: user@domain.com → u***@domain.com
    const [username, domain] = email.split("@");
    const maskedUsername = username[0] + "*".repeat(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  static maskMedicalRecord(record: string): string {
    // Mask sensitive medical information for non-authorized users
    const sensitivePatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
      /\b\d{2}\.\d{3}\.\d{3}-\d\b/g, // RG
      /\b\d{11}\b/g, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    ];

    let masked = record;
    sensitivePatterns.forEach(pattern => {
      masked = masked.replace(pattern, "[DADOS_PROTEGIDOS]");
    });

    return masked;
  }

  static sanitizeForAI(content: string): string {
    // Remove all PHI before sending to AI services
    return content
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF_REMOVIDO]")
      .replace(/\(\d{2}\)\s*\d{4,5}-\d{4}/g, "[TELEFONE_REMOVIDO]")
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL_REMOVIDO]")
      .replace(/\b\d{2}\.\d{3}\.\d{3}-\d\b/g, "[RG_REMOVIDO]")
      .replace(/\b(cartão|cartao)?\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/gi, "[CARTAO_REMOVIDO]");
  }
}

// Frontend Component with PHI Masking
export function PatientDataCard({ patient, userRole }: {
  patient: Patient;
  userRole: UserRole;
}) {
  const canViewFullData = ["admin", "doctor", "nurse"].includes(userRole);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
        <div className="space-y-1 text-sm">
          <p>CPF: {canViewFullData ? patient.cpf : PHIMasker.maskCPF(patient.cpf)}</p>
          <p>Tel: {canViewFullData ? patient.phone : PHIMasker.maskPhone(patient.phone)}</p>
          <p>Email: {canViewFullData ? patient.email : PHIMasker.maskEmail(patient.email)}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
```

### Access Control Components

```typescript
// Role-Based Access Control Hook
export function useRoleBasedAccess() {
  const { user } = useAuth();

  const checkPermission = useCallback((
    resource: string,
    action: "read" | "write" | "delete",
  ): boolean => {
    if (!user?.permissions) return false;

    return user.permissions.some(permission =>
      permission.resource === resource
      && permission.actions.includes(action)
    );
  }, [user?.permissions]);

  const canAccessPHI = useCallback((patientId: string): boolean => {
    // Check if user has valid consent to access patient data
    return checkPermission("patients", "read")
      && user?.clinicId === user?.assignedClinicId;
  }, [checkPermission, user]);

  return { checkPermission, canAccessPHI };
}

// Protected Component Wrapper
export function ProtectedComponent({
  resource,
  action,
  children,
  fallback,
}: {
  resource: string;
  action: "read" | "write" | "delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { checkPermission } = useRoleBasedAccess();

  if (!checkPermission(resource, action)) {
    return fallback || (
      <div className="p-4 text-center text-muted-foreground">
        <Lock className="h-8 w-8 mx-auto mb-2" />
        <p>Acesso restrito - permissão necessária</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage Example
export function MedicalRecordsSection() {
  return (
    <ProtectedComponent resource="medical_records" action="read">
      <div className="medical-records">
        {/* Medical records content */}
      </div>
    </ProtectedComponent>
  );
}
```

### Audit Logging Integration

```typescript
// Frontend Audit Logger
export class FrontendAuditLogger {
  private static instance: FrontendAuditLogger;

  static getInstance(): FrontendAuditLogger {
    if (!FrontendAuditLogger.instance) {
      FrontendAuditLogger.instance = new FrontendAuditLogger();
    }
    return FrontendAuditLogger.instance;
  }

  async logDataAccess(resource: string, resourceId: string, action: string) {
    const auditLog = {
      action: action,
      resource: resource,
      resource_id: resourceId,
      user_id: getCurrentUser()?.id,
      timestamp: new Date().toISOString(),
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
    };

    // Send to backend audit service
    await fetch("/api/audit/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auditLog),
    });
  }

  async logPHIAccess(patientId: string, dataType: string) {
    await this.logDataAccess("patient_phi", patientId, `VIEW_${dataType.toUpperCase()}`);
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch("/api/client-ip");
      const { ip } = await response.json();
      return ip;
    } catch {
      return "unknown";
    }
  }
}

// Audit Hook for Components
export function useAuditLogging() {
  const logger = FrontendAuditLogger.getInstance();

  const logPatientView = useCallback(async (patientId: string) => {
    await logger.logPHIAccess(patientId, "PATIENT_PROFILE");
  }, [logger]);

  const logMedicalRecordView = useCallback(async (patientId: string, recordId: string) => {
    await logger.logDataAccess("medical_records", recordId, "VIEW_MEDICAL_RECORD");
  }, [logger]);

  const logAppointmentAccess = useCallback(async (appointmentId: string) => {
    await logger.logDataAccess("appointments", appointmentId, "VIEW_APPOINTMENT");
  }, [logger]);

  return {
    logPatientView,
    logMedicalRecordView,
    logAppointmentAccess,
  };
}
```

### Secure AI Chat Implementation

```typescript
// Secure AI Chat with PHI Sanitization
export function SecureAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { logDataAccess } = useAuditLogging();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize input before processing
    const sanitizedInput = PHIMasker.sanitizeForAI(input);

    // Log AI interaction for compliance
    await logDataAccess("ai_chat", "new_session", "AI_CHAT_MESSAGE");

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input, // Original content for display
      sanitizedContent: sanitizedInput, // Sanitized for AI
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // Send sanitized content to AI
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { ...userMessage, content: sanitizedInput }],
          language: "pt-BR",
          context: "aesthetic-clinic",
        }),
      });

      const { data } = await response.json();

      // Add AI response
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: data.response,
      }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      // Add error message
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        error: true,
      }]);
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      {/* PHI Warning Banner */}
      <div className="bg-yellow-50 border-b p-2">
        <div className="flex items-center gap-2 text-sm text-yellow-800">
          <Shield className="h-4 w-4" />
          <span>⚠️ Não compartilhe dados pessoais (CPF, telefone, email) no chat</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : message.error
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.content}
              {message.role === "user" && message.sanitizedContent !== message.content && (
                <div className="mt-1 text-xs opacity-75">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Dados sensíveis removidos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem (sem dados pessoais)..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### Emergency Access Controls

```typescript
// Emergency Access Component
export function EmergencyAccess() {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [justification, setJustification] = useState("");
  const { user } = useAuth();

  const enableEmergencyAccess = async (patientId: string) => {
    if (!justification.trim()) {
      toast.error("Justificativa é obrigatória para acesso emergencial");
      return;
    }

    try {
      const response = await fetch("/api/emergency-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          justification: justification,
          professional_id: user?.professionalId,
        }),
      });

      if (response.ok) {
        setIsEmergencyMode(true);
        toast.success("Acesso emergencial concedido - justifique em 24h");

        // Log emergency access
        await FrontendAuditLogger.getInstance().logDataAccess(
          "emergency_access",
          patientId,
          "EMERGENCY_ACCESS_GRANTED",
        );
      }
    } catch (error) {
      toast.error("Erro ao solicitar acesso emergencial");
    }
  };

  return (
    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-red-800">Acesso Emergencial</h3>
      </div>

      <p className="text-sm text-red-700 mb-3">
        Use apenas em situações de emergência médica. Você terá 24h para justificar o acesso.
      </p>

      <Textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Descreva a situação de emergência..."
        className="mb-3"
      />

      <div className="flex gap-2">
        <Button
          onClick={() => enableEmergencyAccess("patient-id")}
          variant="destructive"
          size="sm"
        >
          <Shield className="h-4 w-4 mr-1" />
          Ativar Acesso Emergencial
        </Button>

        {isEmergencyMode && (
          <Badge variant="destructive">
            <Clock className="h-3 w-3 mr-1" />
            Modo Emergência Ativo
          </Badge>
        )}
      </div>
    </div>
  );
}
```

### Data Validation & Sanitization

```typescript
// Input Validation for Healthcare Data
export class HealthcareValidator {
  static validateCPF(cpf: string): { valid: boolean; message?: string; } {
    // Remove formatting
    const cleanCPF = cpf.replace(/\D/g, "");

    if (cleanCPF.length !== 11) {
      return { valid: false, message: "CPF deve ter 11 dígitos" };
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return { valid: false, message: "CPF inválido" };
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }

    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;

    if (parseInt(cleanCPF.charAt(9)) !== checkDigit) {
      return { valid: false, message: "CPF inválido" };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }

    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;

    if (parseInt(cleanCPF.charAt(10)) !== checkDigit) {
      return { valid: false, message: "CPF inválido" };
    }

    return { valid: true };
  }

  static sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  static validateMedicalData(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.patientId && !isValidUUID(data.patientId)) {
      errors.push("ID do paciente inválido");
    }

    if (data.professionalId && !isValidUUID(data.professionalId)) {
      errors.push("ID do profissional inválido");
    }

    if (data.procedure && data.procedure.length > 1000) {
      errors.push("Descrição do procedimento muito longa");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Secure Form Component
export function SecurePatientForm() {
  const [formData, setFormData] = useState<PatientFormData>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input
    const sanitizedValue = HealthcareValidator.sanitizeInput(value);

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Real-time validation
    if (field === "cpf") {
      const cpfValidation = HealthcareValidator.validateCPF(sanitizedValue);
      if (!cpfValidation.valid) {
        setValidationErrors(prev => [...prev, cpfValidation.message!]);
      } else {
        setValidationErrors(prev => prev.filter(error => !error.includes("CPF")));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all data
    const validation = HealthcareValidator.validateMedicalData(formData);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Log form submission
    await FrontendAuditLogger.getInstance().logDataAccess(
      "patients",
      "new_patient",
      "CREATE_PATIENT_FORM",
    );

    // Submit form
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Paciente cadastrado com sucesso");
        setFormData({});
      }
    } catch (error) {
      toast.error("Erro ao cadastrar paciente");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erros de validação:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map(error => <li key={error}>{error}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf || ""}
            onChange={(e) => handleInputChange("cpf", e.target.value)}
            placeholder="000.000.000-00"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Shield className="h-4 w-4 mr-2" />
        Cadastrar Paciente (Dados Protegidos)
      </Button>
    </form>
  );
}
```

---

## ♿ Accessibility & Compliance

### WCAG 2.1 AA+ Implementation

```typescript
// Accessibility utilities
export const a11yHelpers = {
  skipToMain: { href: "#main-content", className: "sr-only focus:not-sr-only" },
  landmarks: { main: "main", nav: "navigation", aside: "complementary" },
  colorContrast: { minimum: "4.5:1", large: "3:1", focus: "3:1" },
};

// High contrast theme support
export const highContrastTheme = {
  colors: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 0%)",
    primary: "hsl(0 0% 0%)",
    border: "hsl(0 0% 20%)",
  },
};
```

### LGPD/ANVISA Compliance (Frontend)

```typescript
// LGPD Consent Component
export function LGPDConsentManager() {
  const [consent, setConsent] = useConsent();

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3>Consentimento LGPD</h3>
      <p className="text-sm mb-3">
        Coletamos dados para prestação de serviços estéticos conforme LGPD.
      </p>
      <div className="space-y-2">
        <label>
          <input
            type="checkbox"
            checked={consent.dataProcessing}
            onChange={(e) => updateConsent("dataProcessing", e.target.checked)}
          />
          Processamento de dados para atendimento
        </label>
        <label>
          <input
            type="checkbox"
            checked={consent.marketing}
            onChange={(e) => updateConsent("marketing", e.target.checked)}
          />
          Comunicações de marketing (opcional)
        </label>
      </div>
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Frontend Issues

**Build/Development:**

- `pnpm not found` → Install: `npm install -g pnpm`
- `Turborepo cache errors` → Clear: `pnpm clean && pnpm install`
- `Next.js hydration errors` → Check server/client state consistency

**UI Components:**

- `shadcn/ui styles not loading` → Check Tailwind CSS configuration
- `Theme not applied` → Verify TweakCN NEONPRO theme import

**AI Chat Issues:**

- `Portuguese responses mixed with English` → Check `body.language: "pt-BR"`
- `Chat API timeout` → Verify OpenAI API key in environment

### Backend Issues

**API Integration:**

- `Supabase connection failed` → Check environment variables
- `JWT token invalid` → Verify token expiration and signing key
- `LGPD compliance errors` → Check consent data structure

**External Services:**

- `ANVISA integration timeout` → Check mutual TLS configuration
- `Professional license validation failed` → Verify license number and council format

---

## 📚 Related Docs

- [Architecture Overview](./architecture/tech-stack.md) - Complete technology stack
- [Source Tree Structure](./architecture/source-tree.md) - Turborepo organization
- [PRD Specifications](./prd.md) - Product requirements and features

---

**Version**: 4.0.0 | **Architecture**: Separated Frontend/Backend | **Packages**: 24→22 optimization | **Compliance**: LGPD/ANVISA | **AI**: Portuguese GPT-4 | **Accessibility**: WCAG 2.1 AA+
