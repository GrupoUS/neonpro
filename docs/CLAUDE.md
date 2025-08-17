# 🏥 NEONPRO - CLÍNICA ESTÉTICA MULTIPROFISSIONAL

## Contexto do Projeto
**Sistema de gestão para clínicas de estética multiprofissionais brasileiras** com foco em gerenciamento de pacientes e inteligência financeira através de IA. Sistema **não médico** (sem CFM, telemedicina), focado em procedimentos estéticos e wellness.

## 🏗️ Arquitetura & Tech Stack

### **Monorepo Turborepo**
```
apps/
  web/                    # Next.js 15 App Router (principal)
packages/
  ui/                     # Design system shadcn/ui + Radix
  shared/                 # Business logic compartilhada
  types/                  # TypeScript types globais
  config/                 # Configurações compartilhadas
  utils/                  # Utilities & helpers
```

### **Stack Definitivo**
- **Frontend**: Next.js 15 + App Router + React 19 + Server Components
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Database**: `ownkoxryswokcdanrdgj` (São Paulo) + Row Level Security
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **State**: Zustand + TanStack Query 
- **Package Manager**: PNPM 9.x + Workspaces
- **Build**: Turborepo 2.x + TypeScript 5.x
- **Code Quality**: Biome (substituindo ESLint + Prettier)
- **Testing**: Vitest + Playwright + React Testing Library
- **Deploy**: Vercel Edge Network

## 🎯 Padrões de Desenvolvimento

### **Next.js 15 Patterns**
```typescript
// ✅ Server Component (padrão)
export default async function PatientsPage() {
  const patients = await getPatients()
  return <PatientList patients={patients} />
}

// ✅ Client Component (apenas quando necessário)
'use client'
export function PatientModal() {
  const [open, setOpen] = useState(false)
  return <Modal open={open} onOpenChange={setOpen} />
}

// ✅ Server Actions com useActionState
export async function createPatientAction(prevState: any, formData: FormData) {
  const validated = patientSchema.safeParse(formData)
  if (!validated.success) return { errors: validated.error }
  
  await createPatient(validated.data)
  revalidatePath('/patients')
  return { success: true }
}
```

### **Estrutura de Componentes**
```typescript
// ✅ Compound Components
export function PatientCard({ patient, children }) {
  return <div className="border rounded-lg p-4">{children}</div>
}

PatientCard.Header = ({ children }) => <div className="font-semibold">{children}</div>
PatientCard.Content = ({ children }) => <div className="text-gray-600">{children}</div>
PatientCard.Actions = ({ children }) => <div className="flex gap-2">{children}</div>

// ✅ Polymorphic Components
type ButtonProps<T extends React.ElementType> = {
  as?: T
  variant?: 'primary' | 'secondary' | 'destructive'
} & React.ComponentPropsWithoutRef<T>
```

### **Autenticação & RLS**
```typescript
// ✅ Middleware auth
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* config */)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// ✅ RLS patterns
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}
```

## 🗃️ Modelos de Dados Core

### **Entidades Principais**
```typescript
interface Clinic {
  id: string
  name: string
  cnpj: string
  anvisa_license: string
  compliance_status: 'active' | 'pending' | 'suspended'
}

interface Patient {
  id: string
  clinic_id: string
  name: string
  email: string
  cpf_hash: string // encrypted
  consent_status: 'granted' | 'pending' | 'revoked'
  medical_history: MedicalHistory
}

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  professional_id: string
  scheduled_at: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  compliance_checks: ComplianceChecks
}

interface Service {
  id: string
  name: string
  category: 'aesthetic' | 'wellness' | 'consultation'
  anvisa_classification: string
  duration_minutes: number
  price: number
}
```

## 📡 API & Integração

### **Supabase Obrigatório**
- **Todas** operações database via `mcp__supabase-mcp__*`
- **RLS** ativo para isolamento multi-tenant
- **Migrations** via `mcp__supabase-mcp__apply_migration`

### **REST API Patterns**
```typescript
// ✅ API Routes
// GET /api/patients - Lista pacientes (com paginação)
// POST /api/patients - Cria paciente (com validação Zod)
// GET /api/patients/[id] - Detalhes do paciente
// PUT /api/patients/[id] - Atualiza paciente

// ✅ Server Actions
'use server'
export async function createPatient(data: PatientData) {
  const validated = patientSchema.parse(data)
  // Supabase operation
}
```

### **Real-time Features**
```typescript
// ✅ WebSocket events
interface SocketEvents {
  'appointment:created': { appointment: Appointment }
  'appointment:updated': { appointment: Appointment }
  'patient:checkin': { patientId: string }
  'compliance:alert': { type: string; message: string }
}
```

## 🔐 Compliance & Segurança

### **LGPD (Simplificado)**
- Consentimento granular para dados + marketing + fotos
- Audit trail básico para acesso aos dados
- Direitos do titular: acesso, correção, exclusão, portabilidade
- Notificação de vazamento em 72h

### **ANVISA (Produtos Estéticos)**
- Registro de produtos estéticos utilizados
- Tracking de equipamentos + manutenção
- Relatório de eventos adversos
- **Não inclui**: medicamentos, dispositivos médicos complexos

### **Segurança Multi-camada**
```yaml
Autenticação: MFA obrigatório + Supabase Auth
Autorização: RLS + role-based permissions
Criptografia: AES-256 (dados) + TLS 1.3 (trânsito)
Headers: CSP + HSTS + X-Frame-Options
```

## ⚡ Performance & Qualidade

### **Targets de Performance**
```yaml
Core Web Vitals:
  LCP: <1.5s (target), <2.5s (threshold)
  FID: <50ms (target), <100ms (threshold)
  CLS: <0.05 (target), <0.1 (threshold)

Bundle Size:
  Initial JS: <200KB gzipped
  Total page: <1MB
  Images: WebP/AVIF optimized
```

### **Quality Gates**
```yaml
TypeScript: >95% coverage, strict mode
Test Coverage: >90% unit, >80% E2E
Code Quality: 0 errors, <5 warnings (Biome)
Accessibility: WCAG 2.1 AA compliance
Security: OWASP Top 10 validated
```

## 🚀 Comandos de Desenvolvimento

### **Scripts Principais**
```bash
# Desenvolvimento
pnpm dev                    # Start dev server
pnpm build                  # Build all packages
pnpm test                   # Run test suite
pnpm lint                   # Biome linting
pnpm type-check            # TypeScript validation

# Turborepo
pnpm build --filter=@neonpro/ui    # Build specific package
turbo run test --filter=web        # Test specific app

# Database
pnpm db:generate           # Generate Supabase types
pnpm db:push              # Push schema changes
pnpm db:reset             # Reset database
```

### **Estrutura de Feature**
```typescript
// ✅ Feature-based organization
app/(dashboard)/patients/
├── page.tsx              # Lista de pacientes
├── [id]/                 # Detalhes do paciente
├── components/           # Componentes específicos
├── actions.ts           # Server actions
└── types.ts             # Types da feature
```

## 🎨 Personas de Usuário

### **Dr. Marina Silva** (Proprietária)
- **Objetivo**: Crescimento do negócio + eficiência operacional
- **Meta**: ≤3 cliques para agendamento + 80% redução de erros
- **Funcionalidades**: BI executivo, relatórios financeiros, analytics

### **Carla Santos** (Recepcionista)
- **Objetivo**: Eficiência + organização + automação
- **Meta**: <30s para tarefas essenciais + workflow otimizado
- **Funcionalidades**: Agendamento rápido, gestão de pacientes

### **Ana Costa** (Paciente)
- **Objetivo**: Transparência + redução de ansiedade + experiência
- **Meta**: 50% redução ansiedade + tracking transparente
- **Funcionalidades**: Portal self-service, histórico de tratamentos

## 🤖 Funcionalidades de IA

### **Agendamento Inteligente**
- Otimização de horários baseada em padrões históricos
- Predição de no-show + alertas preventivos
- Balanceamento de carga de profissionais
- Sugestão de horários alternativos

### **Inteligência Financeira**
- Predição de receita mensal/trimestral
- Análise de rentabilidade por tratamento
- Detecção de oportunidades de upsell
- Otimização de pricing dinâmico

### **Analytics de Pacientes**
- Análise de satisfação via NPS
- Padrões de retenção e churn
- Segmentação automática de pacientes
- Recomendações personalizadas de tratamentos

## ❌ Anti-Patterns (NUNCA)

### **Desenvolvimento**
- Client Components desnecessários (usar Server Components como padrão)
- Prop drilling (usar Context ou fetch direto)
- Any types no TypeScript (strict mode obrigatório)
- Operações database fora do Supabase MCP

### **Segurança**
- Dados de pacientes não criptografados
- Tokens de API expostos no frontend
- Falta de validação de input (sempre usar Zod)
- Bypass de RLS policies

### **Performance**
- Bundles > 300KB sem tree shaking
- Imagens não otimizadas (sempre usar Next.js Image)
- Fetch sem cache strategy
- Re-renders desnecessários sem memo

## 🔧 Configurações Importantes

### **Environment Variables**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=production
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build", 
    "test": "turbo run test",
    "ci": "pnpm format:check && pnpm lint && pnpm type-check && pnpm test"
  }
}
```

## 📚 Contexto Completo - Referências Arquiteturais

Quando precisar de **contexto completo e detalhado** sobre a arquitetura, consulte estes arquivos:

### **Arquitetura Principal**
```yaml
ARCHITECTURE_CONTEXT:
  main_architecture:
    file: "E:\neonpro\docs\architecture.md"
    lines: 4040
    content: "Arquitetura completa fullstack, patterns, security, API specs, deployment"
    use_when: "Precisa de detalhes sobre infraestrutura, security, API completa, deployment strategy"

  technical_preferences:
    file: "E:\neonpro\.bmad-core\data\technical-preferences.md" 
    lines: 220
    content: "Configurações 2025, performance targets, build optimization, quality gates"
    use_when: "Configurações específicas, otimizações, standards de qualidade, pipeline CI/CD"

  architecture_shards:
    tech_stack:
      file: "E:\neonpro\docs\shards\architecture\tech-stack.md"
      lines: 704
      content: "Stack completo, dependências, configurações detalhadas, build scripts"
      use_when: "Configuração específica de packages, builds, pipeline optimization"
    
    coding_standards:
      file: "E:\neonpro\docs\shards\architecture\coding-standards.md"
      lines: 712
      content: "Padrões Next.js 15, TypeScript patterns, testing, component architecture"
      use_when: "Implementação de componentes, patterns de código, testing strategies"
    
    source_tree:
      file: "E:\neonpro\docs\shards\architecture\source-tree.md"
      lines: 335
      content: "Estrutura monorepo, organização packages, feature-based architecture"
      use_when: "Organização de código, estrutura de arquivos, monorepo patterns"

USAGE_INSTRUCTIONS:
  when_to_load: "Quando este claude.md não tem detalhes suficientes para uma tarefa específica"
  how_to_load: "Leia o arquivo específico usando read_file tool antes de implementar"
  priority: "Sempre consulte arquivos completos para implementações complexas"
  context_preservation: "Mantenha consistência entre este resumo e os arquivos detalhados"
```

### **Comandos para Carregar Contexto**
```bash
# Para arquitetura completa
read_file("E:\neonpro\docs\architecture.md")

# Para preferências técnicas detalhadas  
read_file("E:\neonpro\.bmad-core\data\technical-preferences.md")

# Para tech stack específico
read_file("E:\neonpro\docs\shards\architecture\tech-stack.md")

# Para padrões de código
read_file("E:\neonpro\docs\shards\architecture\coding-standards.md")

# Para estrutura do projeto
read_file("E:\neonpro\docs\shards\architecture\source-tree.md")
```

---

**Princípio Core**: *"Sistema simples que funciona > Sistema complexo que não é usado"*. Foque no essencial, evite overengineering, mantenha a arquitetura evolutiva e sempre priorize a experiência do usuário final (clínicas estéticas brasileiras).

**Fluxo de Contexto**: Este `claude.md` é o **resumo executivo**. Para implementações detalhadas, sempre consulte os **arquivos completos** listados acima para manter consistência e qualidade ≥9.9/10.