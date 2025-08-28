# 🏥 NeonPro - Arquitetura do Sistema

> **Sistema de gestão para clínicas de estética brasileiras**

## 📋 Visão Geral

**NeonPro** é uma plataforma completa de gestão para clínicas de estética no Brasil, focada em:

- **Gestão de Pacientes**: Cadastro, histórico médico, agendamentos
- **Compliance Automatizado**: LGPD e ANVISA integrados
- **IA Integrada**: Chat inteligente e predição de no-show
- **Experiência Otimizada**: Interface moderna e intuitiva

## 🎯 Objetivos Atuais (Tier 1)

### Funcionalidades Essenciais

```typescript
const coreFeatures = {
  patients: "CRUD completo + histórico médico",
  appointments: "Agendamento + calendário + notificações",
  professionals: "Gestão de profissionais + especialidades",
  aiChat: "FAQ inteligente + suporte automatizado",
  noShowPrediction: "ML para reduzir faltas em consultas",
  lgpdCompliance: "Automatização de compliance LGPD",
};
```

### Documentation References

- Tech stack: docs/architecture/tech-stack.md
- Application flows: docs/app-flows/ (Mermaid diagrams), docs/app-flows.md (guidelines)
- Database schema: docs/database-schema.md
- API documentation: docs/apis/apis.md
- Design guidelines: docs/architecture/design-guidelines.md
- Testing workflow: docs/ttd-flow.md
- Configuration: docs/variables-configuration.md

### Métricas de Sucesso

- **Redução de No-Show**: > 15%
- **Eficiência da Equipe**: > 20%
- **Satisfação do Paciente**: > 80%
- **Compliance**: 100% LGPD + ANVISA

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15**: App Router + React Server Components
- **TypeScript**: Type safety completo
- **Tailwind CSS**: Styling utilitário
- **shadcn/ui**: Biblioteca de componentes
- **Framer Motion**: Animações e transições

### Backend

- **Hono.dev**: Framework web moderno e rápido
- **tRPC**: Type-safe APIs
- **Supabase**: Database + Auth + Realtime
- **PostgreSQL**: Database principal

### AI & Integrações

- **OpenAI GPT-4**: Chat inteligente
- **Vercel AI SDK**: Integração de IA
- **Supabase Vector**: Embeddings e busca semântica
- **Resend**: Email transacional

### DevOps & Monitoramento

- **Vercel**: Deploy e hosting
- **Sentry**: Error tracking
- **Turborepo**: Monorepo management
- **PNPM**: Package management

## 🏗️ Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Dashboard] --> B[Pacientes]
        A --> C[Agendamentos]
        A --> D[Chat IA]
        A --> E[Relatórios]
    end

    subgraph "Backend (Hono + tRPC)"
        F[API Gateway] --> G[Auth Service]
        F --> H[Patient Service]
        F --> I[Appointment Service]
        F --> J[AI Service]
        F --> K[Notification Service]
    end

    subgraph "Database (Supabase)"
        L[(PostgreSQL)]
        M[Realtime]
        N[Auth]
        O[Storage]
    end

    subgraph "External Services"
        P[OpenAI]
        Q[Resend]
        R[ANVISA APIs]
    end

    A --> F
    F --> L
    J --> P
    K --> Q
    K --> R
```

## 🔐 Segurança & Compliance

### LGPD (Lei Geral de Proteção de Dados)

```typescript
const lgpdCompliance = {
  dataMinimization: "Coleta apenas dados necessários",
  consentManagement: "Controle granular de consentimentos",
  rightToForget: "Exclusão automática de dados",
  dataPortability: "Export completo em JSON",
  auditTrail: "Log completo de todas as operações",
  encryption: "Dados sensíveis criptografados",
};
```

### ANVISA Integration

```typescript
const anvisaCompliance = {
  procedureLogging: "Log automático de procedimentos",
  deviceTracking: "Rastreamento de equipamentos",
  adverseEvents: "Notificação automática de eventos",
  documentation: "Assinatura digital + timestamp",
};
```

## 🤖 Funcionalidades de IA

### Chat Inteligente

```typescript
const aiChatFeatures = {
  faqAutomation: "Respostas automáticas para dúvidas comuns",
  appointmentBooking: "Agendamento via chat",
  procedureInfo: "Informações sobre procedimentos",
  postCareGuidance: "Orientações pós-procedimento",
  emergencyDetection: "Detecção de situações de emergência",
};
```

### Predição de No-Show

```typescript
const noShowPrediction = {
  riskFactors: [
    "Histórico de faltas",
    "Tempo desde último agendamento",
    "Tipo de procedimento",
    "Dia da semana",
    "Condições climáticas",
    "Distância da clínica",
  ],
  actions: {
    highRisk: "Ligação de confirmação automática",
    mediumRisk: "SMS de lembrete",
    lowRisk: "Email de confirmação",
  },
};
```

## 📊 Schema do Banco de Dados

### Tabelas Principais

```sql
-- Pacientes
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  cpf VARCHAR UNIQUE,
  birth_date DATE,
  medical_history JSONB,
  lgpd_consent JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  professional_id UUID REFERENCES professionals(id),
  procedure_type VARCHAR NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'scheduled',
  no_show_risk_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessões de Chat
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mensagens do Chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  content TEXT NOT NULL,
  role VARCHAR NOT NULL, -- 'user' | 'assistant'
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Fluxos de Dados Principais

### 1. Agendamento de Consulta

```mermaid
sequenceDiagram
    participant P as Paciente
    participant F as Frontend
    participant A as API
    participant D as Database
    participant AI as IA Service

    P->>F: Solicita agendamento
    F->>A: POST /appointments
    A->>D: Verifica disponibilidade
    A->>AI: Calcula risco de no-show
    AI-->>A: Score de risco
    A->>D: Cria agendamento
    A-->>F: Confirmação
    F-->>P: Agendamento confirmado
```

### 2. Chat com IA

```mermaid
sequenceDiagram
    participant P as Paciente
    participant F as Frontend
    participant A as API
    participant AI as OpenAI
    participant D as Database

    P->>F: Envia mensagem
    F->>A: POST /chat/message
    A->>D: Salva mensagem do usuário
    A->>AI: Processa com contexto
    AI-->>A: Resposta da IA
    A->>D: Salva resposta da IA
    A-->>F: Retorna resposta
    F-->>P: Exibe resposta
```

## 🚀 Deploy & Performance

### Estratégia de Deploy

```typescript
const deploymentStrategy = {
  frontend: "Vercel (Edge Functions + CDN global)",
  backend: "Vercel Serverless Functions",
  database: "Supabase (PostgreSQL gerenciado)",
  monitoring: "Sentry + Vercel Analytics",
  cdn: "Vercel Edge Network",
};
```

---

> **Princípios de Desenvolvimento**: KISS (Keep It Simple), YAGNI (You Aren't Gonna Need It), CoT (Chain of Thought)
>
> **Foco**: Funcionalidade sobre perfeição • Simplicidade sobre complexidade • Implementável sobre idealizado
