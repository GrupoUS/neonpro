---
applyTo: "**/*.{ts,tsx,js,jsx,json,jsonc,css,scss,md}"
---

# 🏥 NeonPro Project Directives

## 🎯 Project Context & Business Domain

**NeonPro** é um **sistema de gestão para clínicas de estética multiprofissionais brasileiras** com foco em **gerenciamento de pacientes e inteligência financeira através de IA**. 

**Importante**: Sistema **não médico** (sem CFM, telemedicina), focado em procedimentos estéticos e wellness.

### **Core Business Focus**
- **Gerenciamento de Pacientes**: Cadastro, histórico, agendamentos, fotos antes/depois
- **Inteligência Financeira**: Analytics, predição de receita, otimização de preços
- **IA para Otimização**: Agendamento inteligente, redução de no-show, analytics preditivos
- **Compliance Brasileiro**: LGPD + ANVISA (produtos estéticos) - não médico
- **Multi-profissional**: Esteticistas, dermatologistas estéticos, terapeutas

---

## 🏗️ Core Architecture & Tech Stack

### **Monorepo Architecture (Turborepo + PNPM)**
```
neonpro/
├── apps/
│   └── web/               # Next.js 15 App Router (Principal)
├── packages/              # Shared packages for monorepo
│   ├── ui/               # @neonpro/ui - Design system shadcn/ui + Radix
│   ├── shared/           # @neonpro/shared - Business logic compartilhada
│   ├── types/            # @neonpro/types - TypeScript types globais
│   ├── config/           # @neonpro/config - Configurações compartilhadas
│   └── utils/            # @neonpro/utils - Utilities & helpers
```

### **Stack Definitivo**
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | Next.js | 15.0+ | React SSR/SSG with App Router |
| **Backend** | Supabase | Latest | PostgreSQL + Auth + Edge Functions |
| **Database** | PostgreSQL | 15+ | `ownkoxryswokcdanrdgj` (São Paulo) + RLS |
| **UI Framework** | shadcn/ui + Radix | Latest | Design system + accessibility |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **State Management** | Zustand + TanStack Query | 4.5+ / 5.0+ | Client + server state |
| **Package Manager** | PNPM | 9.x+ | Monorepo with workspaces |
| **Build Tool** | Turborepo | 2.x+ | Monorepo orchestration |
| **Code Quality** | Biome | 1.4+ | Replacing ESLint + Prettier |
| **Testing** | Vitest + Playwright | 1.0+ / 1.40+ | Unit + E2E testing |
| **TypeScript** | TypeScript | 5.6+ | Strict mode enabled |
| **Deploy** | Vercel | Latest | Edge Network deployment |

### **Database Configuration**
- **Instance**: `ownkoxryswokcdanrdgj.supabase.co` (São Paulo region)
- **RLS**: Row Level Security OBRIGATÓRIO para multi-tenancy
- **All Database Operations**: Use `mcp__supabase-mcp__*` tools exclusively

---

## 💻 Development Patterns by Domain

### **Next.js 15 App Router Patterns**
```typescript
// ✅ Server Component (PADRÃO) - Para data fetching e conteúdo estático
export default async function PatientsPage() {
  const patients = await getPatients()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pacientes</h1>
      <PatientList patients={patients} />
    </div>
  )
}

// ✅ Client Component - APENAS quando interatividade necessária
'use client'
export function PatientModal() {
  const [open, setOpen] = useState(false)
  return <Modal open={open} onOpenChange={setOpen} />
}

// ✅ Server Actions com useActionState
export async function createPatientAction(prevState: any, formData: FormData) {
  const validated = patientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    cpf: formData.get('cpf'),
  })
  
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }
  
  await createPatient(validated.data)
  revalidatePath('/patients')
  return { success: true }
}
```

### **Component Composition Patterns**
```typescript
// ✅ Compound Components para UI complexa
export function PatientCard({ patient, children }: PatientCardProps) {
  return <div className="border rounded-lg p-4">{children}</div>
}

PatientCard.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 font-semibold">{children}</div>
)

PatientCard.Content = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm text-gray-600">{children}</div>
)

PatientCard.Actions = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 flex gap-2">{children}</div>
)

// ✅ Uso
<PatientCard patient={patient}>
  <PatientCard.Header>{patient.name}</PatientCard.Header>
  <PatientCard.Content>{patient.email}</PatientCard.Content>
  <PatientCard.Actions>
    <Button>Editar</Button>
    <Button variant="secondary">Agendar</Button>
  </PatientCard.Actions>
</PatientCard>

// ✅ Polymorphic Components
type ButtonProps<T extends React.ElementType> = {
  as?: T
  variant?: 'primary' | 'secondary' | 'destructive'
} & React.ComponentPropsWithoutRef<T>
```

### **State Management Patterns**
```typescript
// ✅ Zustand para client state
import { create } from 'zustand'

interface AppointmentStore {
  selectedDate: Date
  selectedPatient: Patient | null
  setSelectedDate: (date: Date) => void
  setSelectedPatient: (patient: Patient | null) => void
}

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  selectedDate: new Date(),
  selectedPatient: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))

// ✅ TanStack Query para server state
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

---

## 🗃️ Data Models & Database Patterns

### **Core Business Entities**
```typescript
interface Clinic {
  id: string
  name: string
  cnpj: string
  anvisa_license: string
  compliance_status: 'active' | 'pending' | 'suspended'
  created_at: string
  updated_at: string
}

interface Patient {
  id: string
  clinic_id: string
  name: string
  email: string
  phone: string
  cpf_hash: string // encrypted with encryptSensitiveData()
  consent_status: 'granted' | 'pending' | 'revoked'
  medical_history: MedicalHistory
  created_at: string
  updated_at: string
}

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  professional_id: string
  scheduled_at: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  compliance_checks: ComplianceChecks
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  clinic_id: string
  name: string
  category: 'facial' | 'body' | 'hair' | 'laser' | 'injectables'
  anvisa_classification: string
  duration_minutes: number
  price: number
  description: string
  preparation_instructions: string
  aftercare_instructions: string
  contraindications: string[]
  requires_consultation: boolean
  before_after_photos: boolean
  consent_forms: string[]
}
```

### **Row Level Security (RLS) Patterns**
```sql
-- ✅ Multi-tenant isolation for patients
CREATE POLICY "clinic_staff_patients_access" ON patients
  FOR ALL TO authenticated
  USING (
    clinic_id IN (
      SELECT clinic_id FROM users
      WHERE user_id = auth.uid()
    )
  );

-- ✅ LGPD compliance audit trail
CREATE OR REPLACE FUNCTION log_patient_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    user_id,
    timestamp,
    ip_address
  ) VALUES (
    'patients',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    now(),
    current_setting('request.headers')::json->>'x-forwarded-for'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_access();
```

### **Authentication & Authorization**
```typescript
// ✅ Middleware para proteção de rotas
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/patients/:path*', '/appointments/:path*']
}

// ✅ Server-side user context
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}
```

---

## 🔐 Security & Compliance Framework

### **LGPD Compliance (Simplificado)**
```typescript
// ✅ LGPD consent management
export interface LGPDConsent {
  patient_id: string
  consent_type: 'data_processing' | 'marketing' | 'photography'
  granted: boolean
  granted_at: string
  expires_at?: string
  ip_address: string
  user_agent: string
}

export async function recordConsent(consent: LGPDConsent) {
  const { data, error } = await supabase
    .from('lgpd_consents')
    .insert(consent)
  
  if (error) throw error
  
  // Audit log for compliance
  await logComplianceEvent({
    event_type: 'consent_recorded',
    patient_id: consent.patient_id,
    details: consent
  })
  
  return data
}

// ✅ Data encryption for sensitive fields
export function encryptSensitiveData(data: string): string {
  const key = process.env.ENCRYPTION_KEY!
  return encrypt(data, key)
}

export function decryptSensitiveData(encryptedData: string): string {
  const key = process.env.ENCRYPTION_KEY!
  return decrypt(encryptedData, key)
}
```

### **ANVISA Compliance (Produtos Estéticos)**
```typescript
// ✅ ANVISA product tracking
interface ANVISAProduct {
  id: string
  anvisa_registration: string
  product_name: string
  manufacturer: string
  category: 'cosmetic' | 'aesthetic_device' | 'injectable'
  expiry_date: string
  batch_number: string
  clinic_id: string
}

// ✅ Equipment maintenance tracking
interface EquipmentMaintenance {
  equipment_id: string
  maintenance_date: string
  maintenance_type: 'preventive' | 'corrective' | 'calibration'
  technician_name: string
  certificate_number?: string
  next_maintenance_due: string
}
```

### **Security Multi-layer**
```yaml
Authentication: 
  - MFA obrigatório para admin
  - Supabase Auth + OAuth providers
  - Session management com timeout

Authorization:
  - RLS para isolamento multi-tenant
  - Role-based permissions
  - Context-aware access control

Encryption:
  - AES-256 para dados em repouso
  - TLS 1.3 para dados em trânsito
  - Field-level encryption para CPF/dados sensíveis

Security Headers:
  - CSP (Content Security Policy)
  - HSTS (HTTP Strict Transport Security)
  - X-Frame-Options, X-Content-Type-Options
```

---

## 🤖 AI & Business Intelligence

### **AI-Driven Features**
```typescript
// ✅ Agendamento Inteligente
export async function optimizeSchedule(
  appointments: Appointment[],
  constraints: ScheduleConstraints
): Promise<OptimizedSchedule> {
  const aiService = new OpenAIService()
  
  const prompt = `
    Otimize a agenda de uma clínica estética brasileira considerando:
    - ${appointments.length} agendamentos existentes
    - Horários disponíveis: ${constraints.availableHours}
    - Tipos de procedimento: ${constraints.serviceTypes}
    - Preferências dos pacientes: ${constraints.patientPreferences}
    - Tempo de preparação entre procedimentos: ${constraints.setupTime}
    
    Retorne uma agenda otimizada que:
    1. Minimize tempo de espera dos pacientes
    2. Maximize utilização dos profissionais
    3. Reduza probabilidade de no-show
    4. Considere complexidade dos procedimentos
  `
  
  const optimization = await aiService.generateScheduleOptimization(prompt)
  return parseOptimizationResponse(optimization)
}

// ✅ Patient Journey Analytics
export async function analyzePatientJourney(patientId: string) {
  const journey = await getPatientJourney(patientId)
  
  return {
    satisfactionScore: calculateSatisfactionScore(journey),
    retentionProbability: predictRetention(journey),
    recommendedTreatments: suggestTreatments(journey),
    riskFactors: identifyRiskFactors(journey),
    lifetimeValue: calculateLTV(journey),
    nextBestAction: getNextBestAction(journey)
  }
}

// ✅ No-Show Prediction
export async function predictNoShow(appointmentId: string): Promise<NoShowPrediction> {
  const appointment = await getAppointment(appointmentId)
  const patientHistory = await getPatientHistory(appointment.patient_id)
  
  return {
    probability: calculateNoShowProbability(appointment, patientHistory),
    riskFactors: identifyNoShowRiskFactors(appointment, patientHistory),
    suggestedActions: getSuggestedPreventiveActions(appointment),
    optimalReminderTime: getOptimalReminderTime(patientHistory)
  }
}
```

### **Business Intelligence Patterns**
```typescript
// ✅ Inteligência Financeira
export async function generateFinancialInsights(
  clinicId: string,
  period: DateRange
): Promise<FinancialInsights> {
  const data = await getFinancialData(clinicId, period)
  
  return {
    revenue: {
      total: data.totalRevenue,
      growth: calculateGrowthRate(data),
      byService: groupByService(data),
      byProfessional: groupByProfessional(data),
      forecast: predictRevenue(data),
      seasonality: analyzeSeasonality(data)
    },
    patients: {
      newPatients: data.newPatients,
      retention: calculateRetention(data),
      averageTicket: data.totalRevenue / data.appointments.length,
      lifetimeValue: calculateLTV(data),
      churnRate: calculateChurnRate(data),
      segmentation: segmentPatients(data)
    },
    operations: {
      utilizationRate: calculateUtilization(data),
      noShowRate: calculateNoShows(data),
      averageWaitTime: calculateWaitTimes(data),
      profitabilityByService: calculateServiceProfitability(data),
      resourceOptimization: suggestResourceOptimization(data)
    },
    predictions: {
      nextMonthRevenue: predictNextMonthRevenue(data),
      optimalPricing: suggestOptimalPricing(data),
      marketingROI: calculateMarketingROI(data),
      expansionOpportunities: identifyExpansionOpportunities(data)
    }
  }
}
```

---

## 👥 User Personas & Use Cases

### **Dr. Marina Silva** (Proprietária da Clínica)
```yaml
Perfil:
  - Proprietária de clínica estética com 3 profissionais
  - Foco em crescimento do negócio e eficiência operacional
  - Utiliza dados para tomada de decisão

Objetivos:
  - ≤3 cliques para insights financeiros críticos
  - 80% redução de erros operacionais
  - Crescimento de receita mensal de 15%

Funcionalidades Prioritárias:
  - BI executivo com dashboards em tempo real
  - Relatórios financeiros automatizados
  - Analytics preditivos de receita
  - Otimização de preços por serviço
  - Análise de rentabilidade por profissional

Fluxos Críticos:
  - Dashboard executivo ao login
  - Relatório mensal automatizado
  - Alertas de performance em tempo real
```

### **Carla Santos** (Recepcionista)
```yaml
Perfil:
  - Recepcionista com 2 anos de experiência
  - Responsável por agendamentos e atendimento
  - Multitarefa constante durante expediente

Objetivos:
  - <30s para tarefas essenciais (agendamento, cadastro)
  - Workflow otimizado e intuitivo
  - Redução de conflitos de agenda

Funcionalidades Prioritárias:
  - Agendamento rápido com sugestões inteligentes
  - Gestão de pacientes simplificada
  - Alertas de no-show e confirmações
  - Chat rápido com pacientes
  - Controle de sala e equipamentos

Fluxos Críticos:
  - Agendamento em 3 cliques máximo
  - Cadastro de paciente em 2 minutos
  - Confirmação de agendamentos por WhatsApp
```

### **Ana Costa** (Paciente)
```yaml
Perfil:
  - Paciente recorrente, 35 anos, profissional liberal
  - Valoriza transparência e experiência premium
  - Ansiedade natural com procedimentos estéticos

Objetivos:
  - 50% redução da ansiedade pré-procedimento
  - Tracking transparente do tratamento
  - Comunicação clara sobre resultados esperados

Funcionalidades Prioritárias:
  - Portal self-service para agendamentos
  - Histórico completo de tratamentos
  - Fotos antes/depois organizadas
  - Lembretes e preparação para procedimentos
  - Avaliação de satisfação pós-tratamento

Fluxos Críticos:
  - Auto-agendamento via portal
  - Acesso ao histórico visual de tratamentos
  - Recebimento de instruções pré/pós cuidados
```

---

## 🚀 Commands & Workflows

### **Scripts Principais**
```bash
# 🔧 Desenvolvimento
pnpm dev                    # Start dev server (Turborepo)
pnpm build                  # Build all packages 
pnpm test                   # Run test suite (Vitest + Playwright)
pnpm format                 # Biome formatting
pnpm lint:biome            # Biome linting
pnpm check:fix             # Auto-fix issues
pnpm ci                    # CI verification
pnpm type-check            # TypeScript validation

# 📦 Turborepo específico
pnpm build --filter=@neonpro/ui    # Build specific package
turbo run test --filter=web        # Test specific app
turbo run dev --filter=web         # Dev specific app

# 🗃️ Database (Supabase)
pnpm db:generate           # Generate Supabase types
pnpm db:push              # Push schema changes
pnpm db:reset             # Reset database
pnpm db:migrate           # Run migrations

# 🎯 Quality Gates
pnpm quality:check         # Quick quality check
pnpm quality:fix          # Auto-fix all issues
pnpm quality:report       # Generate quality report
```

### **Feature Development Workflow**
```typescript
// ✅ Estrutura de Feature
app/(dashboard)/patients/
├── page.tsx              # Lista de pacientes (Server Component)
├── [id]/                 # Detalhes do paciente
│   ├── page.tsx         # Página de detalhes
│   └── edit/            # Edição de paciente
├── components/           # Componentes específicos da feature
│   ├── patient-card.tsx
│   ├── patient-form.tsx
│   └── patient-modal.tsx
├── actions.ts           # Server actions (create, update, delete)
├── hooks.ts            # Custom hooks específicos
└── types.ts            # Types da feature

// ✅ Padrão de nomenclatura
- Arquivos: kebab-case (patient-card.tsx)
- Componentes: PascalCase (PatientCard)
- Funções: camelCase (createPatient)
- Actions: camelCase + Action suffix (createPatientAction)
- Hooks: camelCase + use prefix (usePatients)
```

### **Common Workflows**

#### **Creating a New Aesthetic Service**
```typescript
// 1. ✅ Define service type in @neonpro/types
interface AestheticService {
  id: string
  clinic_id: string
  name: string
  category: 'facial' | 'body' | 'hair' | 'laser' | 'injectables'
  duration_minutes: number
  price: number
  description: string
  preparation_instructions: string
  aftercare_instructions: string
  contraindications: string[]
  requires_consultation: boolean
  before_after_photos: boolean
  consent_forms: string[]
}

// 2. ✅ Create service management action
export async function createAestheticService(service: AestheticService) {
  const validated = aestheticServiceSchema.parse(service)
  
  const { data, error } = await supabase
    .from('services')
    .insert(validated)
    .select()
    .single()
  
  if (error) throw error
  
  await logServiceCreation(data)
  return data
}

// 3. ✅ Add to appointment booking flow
export function ServiceBookingForm({ services }: { services: AestheticService[] }) {
  return (
    <form>
      <select name="service_id">
        {services.map(service => (
          <option key={service.id} value={service.id}>
            {service.name} - {formatCurrency(service.price)} - {service.duration_minutes}min
          </option>
        ))}
      </select>
    </form>
  )
}
```

#### **Patient Data Workflow with LGPD**
```typescript
// ✅ Complete patient workflow with compliance
export async function createPatientWorkflow(patientData: PatientInput) {
  try {
    // 1. Validate data
    const validated = patientSchema.parse(patientData)
    
    // 2. Check for existing patient (prevent duplicates)
    const existing = await findPatientByCPF(validated.cpf)
    if (existing) {
      throw new Error('Paciente já cadastrado no sistema')
    }
    
    // 3. Encrypt sensitive data
    const encryptedData = {
      ...validated,
      cpf: encryptSensitiveData(validated.cpf),
      medical_history: encryptSensitiveData(JSON.stringify(validated.medical_history))
    }
    
    // 4. Create patient record with RLS
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(encryptedData)
      .select()
      .single()
    
    if (error) throw error
    
    // 5. Record LGPD consent
    await recordConsent({
      patient_id: patient.id,
      consent_type: 'data_processing',
      granted: true,
      granted_at: new Date().toISOString(),
      ip_address: getClientIP(),
      user_agent: getUserAgent()
    })
    
    // 6. Create audit log
    await logPatientCreation(patient.id)
    
    // 7. Send welcome communication
    await sendWelcomeMessage(patient)
    
    return patient
    
  } catch (error) {
    console.error('Patient creation failed:', error)
    throw error
  }
}
```

---

## ⚡ Performance & Quality Standards

### **Performance Targets**
```yaml
Core Web Vitals:
  LCP: <1.5s (target), <2.5s (threshold)
  FID: <50ms (target), <100ms (threshold)
  CLS: <0.05 (target), <0.1 (threshold)
  TTFB: <400ms (target), <800ms (threshold)

Build Performance:
  Development: <10s first build, <2s rebuilds
  Production: <5min full build
  Bundle_Size: <200KB initial JS gzipped
  Total_Page: <1MB
  Cache_Hit_Rate: >80%
```

### **Quality Gates**
```yaml
TypeScript_Coverage: >95%
Test_Coverage: >90% (Unit), >80% (E2E)
Code_Quality: 0 errors, <5 warnings (Biome)
Accessibility: WCAG 2.1 AA compliance
Security: Zero critical vulnerabilities (OWASP Top 10)
Performance: All Core Web Vitals in green
Compliance: LGPD + ANVISA automated checks
```

### **Testing Strategy**
```typescript
// ✅ Unit test example for business logic
import { calculateServiceProfitability } from './financial-analytics'

describe('Financial Analytics', () => {
  it('should calculate service profitability correctly', () => {
    const serviceData = {
      revenue: 10000,
      costs: 3000,
      appointments: 50,
      duration_hours: 100
    }
    
    const profitability = calculateServiceProfitability(serviceData)
    
    expect(profitability.margin).toBe(0.7) // 70% margin
    expect(profitability.revenuePerHour).toBe(100)
  })
})

// ✅ E2E test example for critical user flow
import { test, expect } from '@playwright/test'

test('should complete patient registration flow', async ({ page }) => {
  await page.goto('/patients/new')
  
  // Fill patient data
  await page.fill('[name="name"]', 'Maria Silva')
  await page.fill('[name="email"]', 'maria@example.com')
  await page.fill('[name="phone"]', '+5511999999999')
  await page.fill('[name="cpf"]', '123.456.789-00')
  
  // Grant LGPD consent
  await page.check('[name="consent_data_processing"]')
  await page.check('[name="consent_marketing"]')
  
  await page.click('button[type="submit"]')
  
  // Verify success
  await expect(page.locator('text=Paciente criado com sucesso')).toBeVisible()
  await expect(page.locator('text=Maria Silva')).toBeVisible()
})
```

---

## ❌ Anti-Patterns (NUNCA)

### **Development Anti-Patterns**
```typescript
// ❌ NUNCA: Client Components desnecessários
'use client' // Only use when ABSOLUTELY needed for interactivity
export function StaticContent() { return <div>Static content</div> }

// ✅ SEMPRE: Server Components como padrão
export default function StaticContent() { return <div>Static content</div> }

// ❌ NUNCA: Prop drilling extensivo
function DeepComponent({ data, onUpdate, onDelete, onEdit, onView }) {
  // Passing too many props through multiple levels
}

// ✅ SEMPRE: Context ou fetch direto
function DeepComponent() {
  const { data, actions } = usePatientContext()
  // Or fetch data directly in Server Component
}

// ❌ NUNCA: Any types no TypeScript
function processPatient(patient: any) { // FORBIDDEN
  return patient.someProperty
}

// ✅ SEMPRE: Strict typing
function processPatient(patient: Patient) {
  return patient.name
}

// ❌ NUNCA: Database operations fora do Supabase MCP
const db = new PostgresClient() // FORBIDDEN
await db.query('SELECT * FROM patients')

// ✅ SEMPRE: Supabase MCP tools
await supabase.from('patients').select()
```

### **Security Anti-Patterns**
```typescript
// ❌ NUNCA: Dados de pacientes não criptografados
const patient = {
  cpf: '123.456.789-00', // FORBIDDEN - raw CPF
  medical_history: { conditions: ['acne'] } // FORBIDDEN - raw medical data
}

// ✅ SEMPRE: Encrypt sensitive data
const patient = {
  cpf: encryptSensitiveData('123.456.789-00'),
  medical_history: encryptSensitiveData(JSON.stringify({ conditions: ['acne'] }))
}

// ❌ NUNCA: Tokens de API expostos no frontend
const OPENAI_API_KEY = 'sk-...' // FORBIDDEN in client code

// ✅ SEMPRE: Server-side only for API keys
// In server action or API route only
const response = await openai.chat.completions.create({...})

// ❌ NUNCA: Bypass de RLS policies
await supabase.from('patients').select() // Without proper auth context

// ✅ SEMPRE: Authenticated requests with RLS
const user = await getCurrentUser()
if (!user) throw new Error('Unauthorized')
await supabase.from('patients').select() // RLS automatically applied
```

### **Performance Anti-Patterns**
```typescript
// ❌ NUNCA: Bundles > 300KB sem tree shaking
import * as _ from 'lodash' // Imports entire library

// ✅ SEMPRE: Specific imports
import { debounce } from 'lodash/debounce'

// ❌ NUNCA: Imagens não otimizadas
<img src="/patient-photo.jpg" /> // FORBIDDEN

// ✅ SEMPRE: Next.js Image optimization
<Image src="/patient-photo.jpg" width={300} height={200} alt="Patient" />

// ❌ NUNCA: Fetch sem cache strategy
const patients = await fetch('/api/patients') // No caching

// ✅ SEMPRE: Proper caching
const patients = await fetch('/api/patients', { 
  next: { revalidate: 300 } // 5min cache
})

// ❌ NUNCA: Re-renders desnecessários
function PatientCard({ patient }) {
  const expensiveCalculation = calculateMetrics(patient) // Runs on every render
  return <div>{expensiveCalculation}</div>
}

// ✅ SEMPRE: Memoization when needed
const PatientCard = memo(function PatientCard({ patient }) {
  const expensiveCalculation = useMemo(
    () => calculateMetrics(patient), 
    [patient.id]
  )
  return <div>{expensiveCalculation}</div>
})
```

---

## 📚 Architecture Reference System

### **When to Load Complete Context**

Quando este `copilot-instructions.md` não tem detalhes suficientes para uma tarefa específica, consulte os arquivos completos:

```yaml
ARCHITECTURE_CONTEXT:
  main_architecture:
    file: "E:\neonpro\docs\architecture.md"
    lines: 4040
    content: "Arquitetura completa fullstack, patterns, security, API specs, deployment"
    use_when: "Infraestrutura, security detalhada, API completa, deployment strategy"

  technical_preferences:
    file: "E:\neonpro\.bmad-core\data\technical-preferences.md" 
    lines: 220
    content: "Configurações 2025, performance targets, build optimization, quality gates"
    use_when: "Configurações específicas, otimizações, standards de qualidade"

  architecture_shards:
    tech_stack:
      file: "E:\neonpro\docs\shards\architecture\tech-stack.md"
      lines: 704
      content: "Stack completo, dependências, configurações detalhadas"
      use_when: "Configuração específica de packages, builds, pipeline"
    
    coding_standards:
      file: "E:\neonpro\docs\shards\architecture\coding-standards.md"
      lines: 712
      content: "Padrões Next.js 15, TypeScript patterns, testing, components"
      use_when: "Implementação de componentes, patterns de código, testing"
    
    source_tree:
      file: "E:\neonpro\docs\shards\architecture\source-tree.md"
      lines: 335
      content: "Estrutura monorepo, organização packages, feature-based architecture"
      use_when: "Organização de código, estrutura de arquivos, monorepo"
```

### **How to Load Context**
```typescript
// Para arquitetura completa e infraestrutura
const architectureContext = await readFile("E:\neonpro\docs\architecture.md")

// Para preferências técnicas e otimizações
const techPreferences = await readFile("E:\neonpro\.bmad-core\data\technical-preferences.md")

// Para configurações específicas do stack
const techStack = await readFile("E:\neonpro\docs\shards\architecture\tech-stack.md")

// Para padrões de código detalhados
const codingStandards = await readFile("E:\neonpro\docs\shards\architecture\coding-standards.md")

// Para estrutura do projeto
const sourceTree = await readFile("E:\neonpro\docs\shards\architecture\source-tree.md")
```

### **Context Priority Rules**
1. **Always start with this file** (`copilot-instructions.md`) para overview e padrões básicos
2. **Load specific architecture files** quando precisar de detalhes de implementação
3. **Maintain consistency** entre este resumo e os arquivos detalhados
4. **Use MCP tools** para todas as operações de database e arquivos

---

## 🎯 Development Guidelines

### **Before Writing Code**
1. **Understand Business Context**: Considere workflows de clínicas estéticas brasileiras
2. **Check Compliance**: Garanta LGPD + ANVISA requirements (não médico)
3. **Validate Architecture**: Use padrões estabelecidos e shared packages
4. **Consider Performance**: Impact on Core Web Vitals e bundle size
5. **Plan Testing**: Unit tests para business logic, E2E para user flows
6. **AI Integration**: Considere como IA pode otimizar o workflow

### **Code Quality Checklist**
- [ ] TypeScript strict mode compliance
- [ ] Server Components usado como padrão
- [ ] Client Components apenas quando interatividade necessária
- [ ] Error boundaries e loading states apropriados
- [ ] LGPD compliance para dados de pacientes
- [ ] Accessibility (WCAG 2.1 AA) compliance
- [ ] Performance optimization (Core Web Vitals)
- [ ] Unit tests para business logic (≥90% coverage)
- [ ] E2E tests para critical user flows
- [ ] All database operations via Supabase MCP tools

### **Aesthetic Clinic Specific Considerations**
- **Patient Privacy**: Sempre criptografe dados sensíveis de pacientes
- **Appointment Optimization**: Use IA para otimizar agendamento e reduzir no-show
- **Treatment Tracking**: Gestão completa de fotos antes/depois
- **Financial Intelligence**: Otimização de receita e lifetime value de pacientes
- **Compliance Automation**: Gestão automatizada de consentimento LGPD
- **Multi-Professional Support**: Suporte para diferentes tipos de profissionais estéticos
- **Brazilian Market**: Formatos de telefone, endereço, métodos de pagamento (PIX)
- **AI-Driven Insights**: Integre analytics preditivos em todos os workflows principais

---

> **🔄 Living Documentation**: Esta documentação evolui com o projeto. Sempre consulte a versão mais recente para decisões arquiteturais atuais.

**Princípio Core**: *"Sistema simples que funciona > Sistema complexo que não é usado"*

**Quality Standard**: ≥9.5/10 | **Architecture**: Production-Ready | **Compliance**: LGPD + ANVISA | **Focus**: Clínicas Estéticas Brasileiras | **AI-Driven**: Business Intelligence & Optimization