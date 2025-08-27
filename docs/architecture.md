# NeonPro - Arquitetura da Plataforma

> **Plataforma de Gestão para Clínicas de Estética**  
> **Status:** Tier 1 - Implementação Atual  
> **Foco:** Funcionalidades essenciais, implementáveis e práticas

## 🎯 Visão Geral

NeonPro é uma plataforma de gestão para clínicas de estética brasileiras, com funcionalidades de IA para otimização operacional e compliance LGPD/ANVISA automatizado.

### Objetivo Atual (Tier 1)
- **Gestão básica**: Pacientes, agendamentos, profissionais
- **AI Chat simples**: FAQ automatizado e agendamento inteligente  
- **Anti-No-Show**: Predição básica de faltas com alertas
- **Compliance**: LGPD/ANVISA automatizado

## 🏗️ Tech Stack Atual

```typescript
// Stack implementado e validado
const techStack = {
  frontend: {
    framework: "Next.js 15 (App Router)",
    ui: "React 19 + TypeScript 5.7",
    styling: "Tailwind CSS + shadcn/ui",
    components: "@radix-ui"
  },
  backend: {
    database: "Supabase (PostgreSQL + Auth + Real-time)",
    api: "Next.js API Routes",
    auth: "Supabase Auth"
  },
  ai: {
    chat: "@ai-sdk/anthropic + @ai-sdk/openai", 
    ml: "TensorFlow.js (client-side)"
  },
  infrastructure: {
    monorepo: "Turborepo + PNPM",
    deploy: "Vercel",
    quality: "Biome + Ultracite"
  }
};
```

## 📦 Estrutura de Packages

```
neonpro/
├── apps/
│   ├── web/              # Frontend Next.js
│   ├── api/              # Backend API  
│   └── docs/             # Documentação
│
├── packages/
│   ├── ai/               # Funcionalidades de IA
│   ├── auth/             # Autenticação
│   ├── compliance/       # LGPD/ANVISA
│   ├── database/         # Utilities DB
│   ├── types/            # TypeScript types
│   ├── ui/               # Componentes UI
│   └── shared/           # Utilitários comuns
│
└── infrastructure/       # Deploy e scripts
```

## 🤖 Funcionalidades AI (Tier 1)

### AI Chat Básico
```typescript
// Chat simples para FAQ e agendamento
interface AIChatBasic {
  external: {
    purpose: "FAQ automático + agendamento";
    language: "Português otimizado";
    integration: "Widget no site da clínica";
  };
  internal: {
    purpose: "Consultas básicas ao sistema";
    integration: "Dashboard interno";
  };
}
```

### Anti-No-Show Simples
```typescript
// Predição básica de faltas
interface NoShowPrediction {
  factors: [
    "Histórico do paciente",
    "Dia da semana", 
    "Horário do agendamento",
    "Tipo de procedimento"
  ];
  output: {
    riskScore: "0-100 scale";
    intervention: "SMS reminder | Call | Email";
  };
}
```

## 🗄️ Database Schema Essencial

```sql
-- AI Chat básico
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  session_type TEXT CHECK (session_type IN ('external', 'internal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No-Show prediction básico
CREATE TABLE no_show_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS básico
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_show_predictions ENABLE ROW LEVEL SECURITY;
```

## 🔒 Compliance LGPD/ANVISA

### LGPD Automatizado
```typescript
// Compliance básico e automatizado
interface LGPDCompliance {
  auditTrail: "Log automático de todas as operações";
  dataMinimization: "Coleta apenas dados necessários";
  consentManagement: "Gestão de consentimento automática";
  dataRetention: "Retenção conforme regulamentação";
}
```

### ANVISA Básico
```typescript
interface ANVISACompliance {
  procedures: "Log de procedimentos estéticos";
  devices: "Controle de equipamentos";
  adverse: "Relatório de eventos adversos";
  documentation: "Documentação automática";
}
```

## 🔄 Frontend Architecture & State Management

### State Management Strategy
```typescript
// Estratégia de gerenciamento de estado
const stateManagement = {
  global: {
    auth: "Zustand para autenticação e estado do usuário",
    theme: "Context API para tema e configurações UI",
    clinic: "Zustand para dados da clínica atual"
  },
  server: {
    queries: "TanStack Query para cache e sincronização",
    mutations: "TanStack Query mutations para operações CRUD",
    realtime: "Supabase subscriptions para updates em tempo real"
  },
  forms: {
    validation: "React Hook Form + Zod schemas",
    state: "React Hook Form para estado de formulários",
    persistence: "localStorage para drafts automáticos"
  },
  ui: {
    modals: "Estado local com React useState",
    navigation: "Next.js router + shallow routing",
    loading: "Suspense boundaries + TanStack Query"
  }
};
```

### Component Architecture & Directory Structure
```
apps/web/src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Protected routes group  
│   │   ├── dashboard/page.tsx
│   │   ├── patients/page.tsx
│   │   ├── appointments/page.tsx
│   │   └── compliance/page.tsx
│   ├── api/                      # API routes
│   │   ├── ai/
│   │   ├── patients/
│   │   └── appointments/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui base components
│   ├── forms/                    # Form components
│   ├── layouts/                  # Layout components
│   └── features/                 # Feature-specific components
├── lib/                          # Utilities
│   ├── api-client.ts             # API client configuration
│   ├── auth.ts                   # Auth utilities
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # Common utilities
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-api.ts
│   └── use-patients.ts
└── stores/                       # State stores
    ├── auth-store.ts             # Zustand auth store
    └── clinic-store.ts           # Zustand clinic store
```

## 🔗 API Contracts & Integration

### Core API Endpoints
```typescript
// Contratos de API bem definidos
interface APIContracts {
  // AI Chat endpoints
  ai: {
    chat: {
      endpoint: "/api/ai/chat",
      method: "POST",
      streaming: true,
      input: "{ message: string, sessionId: string }",
      output: "Server-Sent Events stream"
    },
    sessions: {
      endpoint: "/api/ai/sessions",
      method: "GET | POST",
      auth: "required",
      rls: "patient_id filtering"
    }
  },
  
  // No-Show Prediction
  predictions: {
    noShow: {
      endpoint: "/api/predictions/no-show",
      method: "POST",
      input: "{ appointmentId: string }",
      output: "{ riskScore: number, riskLevel: string, actions: string[] }"
    },
    bulk: {
      endpoint: "/api/predictions/bulk",
      method: "POST",
      input: "{ appointmentIds: string[] }",
      output: "{ predictions: NoShowPrediction[] }"
    }
  },
  
  // Core CRUD operations
  patients: {
    list: "GET /api/patients?page=1&limit=20",
    get: "GET /api/patients/:id",
    create: "POST /api/patients",
    update: "PUT /api/patients/:id",
    delete: "DELETE /api/patients/:id"
  },
  
  appointments: {
    list: "GET /api/appointments?date=2025-08-27",
    get: "GET /api/appointments/:id", 
    create: "POST /api/appointments",
    update: "PUT /api/appointments/:id",
    cancel: "DELETE /api/appointments/:id"
  }
}
```

### Integration Patterns
```typescript
// Padrões de integração com backend
const integrationPatterns = {
  authentication: {
    provider: "Supabase Auth",
    tokens: "JWT access + refresh tokens",
    middleware: "Auth verification em todas as rotas protegidas",
    rls: "Row Level Security automático via user.id"
  },
  
  realtime: {
    subscriptions: "Supabase Realtime para appointments e chat",
    events: "appointment.created, appointment.updated, message.created",
    fallback: "Polling a cada 30s se WebSocket falhar"
  },
  
  errorHandling: {
    network: "Retry automático 3x com exponential backoff",
    auth: "Redirect para login se token expirado",
    validation: "Zod errors + toast notifications",
    server: "Error boundaries + Sentry logging"
  }
};
```

## ⚠️ Error Handling & Resilience

### Comprehensive Error Strategy
```typescript
// Estratégia completa de tratamento de erros
const errorHandling = {
  // API Error Handling
  api: {
    networkErrors: {
      strategy: "Try-catch com retry automático",
      retries: "3 tentativas com exponential backoff",
      fallback: "Cache local + offline mode notification",
      logging: "Sentry para todos os network errors"
    },
    validationErrors: {
      strategy: "Zod validation + user-friendly messages",
      display: "Toast notifications + form field errors",
      prevention: "Schema validation no frontend e backend"
    },
    authErrors: {
      strategy: "Token refresh automático",
      fallback: "Redirect para login se refresh falhar",
      persistence: "Manter form data durante reauth"
    }
  },
  
  // UI Error Boundaries
  ui: {
    global: "Root error boundary para crashes não tratados",
    features: "Error boundaries por feature (chat, appointments)",
    recovery: "Retry button + clear state options",
    fallback: "Graceful degradation para funcionalidades não críticas"
  },
  
  // Data Error Handling  
  data: {
    loading: "Skeleton states + Suspense boundaries",
    empty: "Empty states com call-to-action",
    stale: "Background refetch + stale-while-revalidate",
    conflicts: "Optimistic updates + conflict resolution"
  },
  
  // Critical System Errors
  critical: {
    database: "Circuit breaker pattern para DB connections",
    ai: "Fallback para respostas pré-definidas se AI falhar",
    compliance: "Fail-safe para audit logging (nunca pode falhar)",
    payment: "Transaction rollback + user notification"
  }
};
```

### Circuit Breakers & Retry Policies
```typescript
// Políticas de resilência
const resiliencePatterns = {
  circuitBreaker: {
    threshold: "5 falhas consecutivas",
    timeout: "30s antes de tentar novamente", 
    fallback: "Cache local ou modo degradado"
  },
  
  retryPolicies: {
    api: "3 tentativas com 1s, 2s, 4s delays",
    ai: "2 tentativas com 5s delay",
    critical: "5 tentativas com exponential backoff",
    compliance: "Immediate retry + manual queue se falhar"
  },
  
  gracefulDegradation: {
    ai: "FAQ estático se AI indisponível",
    predictions: "Histórico manual se ML falhar",
    realtime: "Polling se WebSocket falhar",
    search: "Client-side filtering se server search falhar"
  }
};
```

## 🚀 Deploy e Performance

### Deploy Simples
```yaml
deployment:
  platform: "Vercel"
  database: "Supabase"
  domain: "Custom domain"
  ssl: "Automático"
  
performance_targets:
  page_load: "< 2s"
  api_response: "< 500ms" 
  ai_chat: "< 3s"
  uptime: "> 99%"
```

### Performance Optimization Strategies
```typescript
// Estratégias específicas de performance
const performanceStrategies = {
  frontend: {
    bundleOptimization: "Code splitting por rota + lazy loading",
    imageOptimization: "Next.js Image component + WebP/AVIF",
    caching: "Static generation + ISR para páginas públicas",
    prefetching: "Prefetch de rotas críticas + data preloading"
  },
  
  backend: {
    database: "Connection pooling + prepared statements",
    caching: "Redis para session data + query results",
    compression: "Gzip/Brotli para API responses",
    cdn: "Vercel Edge Network para static assets"
  },
  
  ai: {
    streaming: "Server-sent events para chat responses",
    batching: "Batch predictions para reduzir latência",
    caching: "Cache de respostas frequentes por 1h",
    optimization: "Model optimization para client-side ML"
  }
};
```

### Monitoring Básico
```typescript
// Métricas essenciais
interface BasicMetrics {
  performance: "Vercel Analytics";
  errors: "Console logs + Sentry básico";
  usage: "Métricas de uso das funcionalidades AI";
  compliance: "Logs de auditoria LGPD";
}
```

## 🧪 Testes Essenciais

```typescript
// Testes mínimos necessários
describe('Core Features', () => {
  test('Patient management CRUD', () => {
    // Testes básicos de CRUD
  });
  
  test('AI chat responses', () => {
    // Testa resposta do chat AI
  });
  
  test('No-show prediction', () => {
    // Testa predição básica
  });
  
  test('LGPD compliance', () => {
    // Testa logs de auditoria
  });
});
```

## 📊 Data Flow & Component Interactions

### Core Data Flow Patterns
```mermaid
graph TD
    A[User Action] --> B[React Component]
    B --> C[Zustand Store / TanStack Query]
    C --> D[API Client]
    D --> E[Next.js API Route]
    E --> F[Supabase Database]
    F --> G[RLS Policy Check]
    G --> H[Response + Real-time Updates]
    H --> C
    C --> B
    B --> I[UI Update]
```

### Component Interaction Map
```typescript
// Mapeamento de interações entre componentes
const componentInteractions = {
  // AI Chat Flow
  aiChatFlow: {
    trigger: "User types message in ChatWidget",
    flow: [
      "ChatWidget → useChatStore → API /ai/chat",
      "API streams response → ChatWidget updates",
      "Session persisted → ChatHistory component",
      "Real-time updates → Other users (if internal)"
    ]
  },
  
  // Appointment Scheduling Flow
  appointmentFlow: {
    trigger: "User creates/updates appointment",
    flow: [
      "AppointmentForm → useAppointments → API /appointments",
      "Success → NoShowPrediction triggered automatically", 
      "Prediction → NotificationService → SMS/Email alerts",
      "Real-time → Calendar component updates",
      "LGPD audit log → Compliance dashboard"
    ]
  },
  
  // Patient Data Flow
  patientDataFlow: {
    trigger: "Patient data access/modification",
    flow: [
      "PatientComponent → usePatients → API /patients",
      "RLS check → User permissions validation",
      "Data encrypted/decrypted → Response",
      "Audit log → LGPD compliance tracking",
      "Cache update → Background sync"
    ]
  }
};
```

## 🎯 Edge Cases & Business Logic

### Critical Edge Cases
```typescript
// Casos extremos que devem ser tratados
const criticalEdgeCases = {
  // AI Chat Edge Cases
  aiChat: {
    longSessions: "Limite de 2h + auto-expire + session cleanup",
    aiUnavailable: "Fallback para FAQ estático + agent notification",
    offensiveContent: "Content moderation + auto-block + staff alert",
    concurrentSessions: "Limit 3 active sessions per user",
    dataPrivacy: "Auto-redact PHI before sending to AI models"
  },
  
  // Appointment Edge Cases
  appointments: {
    doubleBooking: "Conflict detection + alternative time suggestions",
    lastMinuteCancel: "Auto-notification + waitlist promotion",
    noShowPrediction: "High risk → automatic confirmation calls",
    equipmentFailure: "Reschedule affected appointments + notifications",
    staffAbsence: "Auto-reassign + patient notification"
  },
  
  // System Edge Cases
  system: {
    internetFailure: "Offline mode + sync when reconnected",
    databaseCorruption: "Auto-backup restore + data recovery",
    highTraffic: "Rate limiting + queue management",
    securityBreach: "Auto-lockdown + admin notification + audit",
    complianceFailure: "Manual review queue + legal notification"
  },
  
  // User Edge Cases
  user: {
    accountLocked: "Unlock flow + security verification",
    forgottenPassword: "Multi-factor password reset",
    dataExport: "LGPD compliance + full data export",
    accountDeletion: "Data anonymization + retention compliance",
    roleChanges: "Permission sync + access recalculation"
  }
};
```

### Business Logic Validation
```typescript
// Regras de negócio críticas
const businessRules = {
  appointments: {
    scheduling: {
      minAdvance: "2h minimum booking advance", 
      maxAdvance: "90 days maximum booking window",
      businessHours: "8:00-18:00 Mon-Fri, 8:00-14:00 Sat",
      holidays: "Brazilian holidays auto-blocked",
      capacity: "Max 2 procedures per time slot"
    },
    
    cancellation: {
      patientCancel: "24h advance for no penalty",
      clinicCancel: "48h advance + automatic rescheduling",
      noShow: "3 no-shows = automatic review",
      refunds: "Automatic refund processing for valid cancellations"
    }
  },
  
  compliance: {
    lgpd: {
      consentExpiry: "Annual consent renewal required",
      dataRetention: "7 years for aesthetic procedures",
      rightToForget: "30 days maximum for data deletion",
      dataPortability: "JSON export within 48h of request"
    },
    
    anvisa: {
      procedureLogging: "All procedures logged within 1h",
      deviceTracking: "Equipment usage + maintenance logs",
      adverseEvents: "24h reporting for serious events",
      documentation: "Digital signature + timestamp validation"
    }
  }
};
```

### Monitoring Avançado & Recovery
```typescript
// Sistema completo de monitoramento e recuperação
const advancedMonitoring = {
  // Real-time Monitoring
  realtime: {
    healthChecks: "Endpoint /health a cada 30s",
    performance: "Core Web Vitals + API response times",
    errors: "Sentry real-time error tracking",
    usage: "User activity + feature adoption metrics",
    compliance: "LGPD audit log monitoring"
  },
  
  // Alerting System
  alerts: {
    critical: "SMS + Email para downtime > 2min",
    performance: "Slack alert se response time > 1s",
    errors: "Auto-alert se error rate > 1%", 
    compliance: "Immediate alert para LGPD violations",
    security: "Instant notification para login attempts"
  },
  
  // Automated Recovery
  recovery: {
    serviceRestart: "Auto-restart para memory leaks",
    databaseReconnect: "Auto-reconnect com exponential backoff",
    cacheInvalidation: "Smart cache invalidation on errors",
    fallbackActivation: "Auto-enable offline mode",
    dataRecovery: "Point-in-time backup restoration"
  },
  
  // Performance Optimization
  optimization: {
    autoScaling: "Vercel automatic scaling",
    queryOptimization: "Slow query detection + indexing alerts",
    bundleAnalysis: "Bundle size monitoring + alerts",
    imageOptimization: "Automatic WebP/AVIF conversion",
    cacheStrategy: "Intelligent cache warming"
  }
};
```

### Disaster Recovery Plan
```typescript
// Plano de recuperação de desastres
const disasterRecovery = {
  backupStrategy: {
    database: "Hourly snapshots + daily full backups",
    files: "Vercel blob storage + S3 redundancy", 
    code: "Git + multiple remote repositories",
    config: "Environment variables backup",
    compliance: "Immutable audit log backups"
  },
  
  recoveryProcedures: {
    rto: "2 hours Recovery Time Objective",
    rpo: "1 hour Recovery Point Objective", 
    steps: [
      "1. Assess damage + activate incident response",
      "2. Switch to backup infrastructure",
      "3. Restore latest clean backup",
      "4. Verify data integrity + compliance",
      "5. Resume operations + notify users"
    ]
  },
  
  businessContinuity: {
    offlineMode: "Local data + sync when restored",
    phoneBackup: "Call-based appointment booking",
    paperBackup: "Emergency paper forms for critical data",
    staffProtocols: "Manual procedures during outages",
    customerComm: "Auto-status page + SMS notifications"
  }
};
```

## 📋 Implementation Roadmap

### Fase 1 (Atual) - 2-3 meses
- ✅ **Setup básico**: Monorepo + packages estruturados
- ✅ **CRUD básico**: Pacientes, agendamentos, profissionais  
- 🚧 **AI Chat**: FAQ básico funcionando
- 🚧 **No-Show**: Predição simples implementada
- 🚧 **Compliance**: LGPD básico automatizado

### Fase 2 (Futuro) - 6+ meses  
- **Otimizações**: Performance e UX melhorados
- **Features avançadas**: Funcionalidades adicionais conforme demanda
- **Escalabilidade**: Suporte para mais clínicas

## 📊 Success Metrics

```typescript
interface SuccessMetrics {
  technical: {
    pageLoad: "< 2s",
    apiResponse: "< 500ms", 
    uptime: "> 99%"
  };
  business: {
    noShowReduction: "> 15%",
    staffEfficiency: "> 20%",
    patientSatisfaction: "> 80%"
  };
  compliance: {
    lgpdCompliance: "100%",
    anvisaCompliance: "100%"
  };
}
```

---

## 🎯 Foco Atual

**Princípios**: KISS (Keep It Simple), YAGNI (You Aren't Gonna Need It), CoT (Chain of Thought)

**Prioridade**: 
1. **Funcionalidade sobre perfeição** - Fazer funcionar primeiro
2. **Simplicidade sobre complexidade** - Evitar over-engineering  
3. **Implementável sobre idealizado** - Foco no que pode ser feito agora

**Status**: Tier 1 - Construindo funcionalidades essenciais que agregam valor real para clínicas de estética brasileiras.