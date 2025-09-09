# 📋 NeonPro Coding Standards & Best Practices

**Padrões de código para sistema de gestão em saúde com qualidade ≥9.5/10**

## 🎯 **Princípios Fundamentais**

### **KISS Principle** - Keep It Simple, Stupid

```yaml
definition: "Simplicidade é fundamental"
core_rules:
  - Escolher solução mais simples que atende aos requisitos
  - Preferir código legível sobre otimizações inteligentes
  - Reduzir carga cognitiva
  - "Isso resolve o problema central sem complexidade desnecessária?"
  - Usar nomenclatura clara e evitar Over-Engineering
```

### **YAGNI Principle** - You Aren't Gonna Need It

```yaml
definition: "Não implementar até ser necessário"
core_rules:
  - Construir apenas o que os requisitos atuais especificam
  - Resistir a features 'só por precaução'
  - Refatorar quando requisitos emergirem
  - Focar nas user stories atuais
  - Remover código não usado imediatamente
```

### **Chain of Thought**

```yaml
definition: "Raciocínio passo-a-passo explícito para precisão"
core_rules:
  - Quebrar problemas em passos sequenciais
  - Verbalizar processo de raciocínio
  - Mostrar decisões intermediárias
  - Questionar suposições
  - Validar contra requisitos
  - Cada passo segue logicamente do anterior
  - Solução final rastreável aos requisitos
```

## 🏥 **Padrões Específicos para Healthcare**

### **Nomenclatura Healthcare**

```typescript
// ✅ CORRETO - Terminologia médica clara
interface PatientRecord {
  patientId: string
  medicalRecordNumber: string
  healthInsuranceNumber: string
  emergencyContact: EmergencyContact
  lgpdConsent: ConsentStatus
}

// ❌ INCORRETO - Abreviações confusas
interface PatRec {
  id: string
  mrn: string
  ins: string
  emg: Contact
}
```

### **Error Handling Healthcare**

```typescript
// ✅ CORRETO - Contexto healthcare em erros
class HealthcareError extends Error {
  constructor(
    message: string,
    public readonly healthcareContext: {
      patientId?: string
      appointmentId?: string
      clinicId?: string
      action?: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    },
  ) {
    super(message,)
    this.name = 'HealthcareError'
  }
}

// ❌ INCORRETO - Erro genérico
throw new Error('Something went wrong',)
```

## 🔧 **TypeScript Standards**

### **TypeScript 5.7.2 Healthcare Domain Types**

```typescript
// ✅ CORRETO - Tipos avançados com TypeScript 5.7.2
import { z, } from 'zod'

// Branded types para segurança de tipos healthcare
type PatientId = string & { readonly __brand: unique symbol }
type CPF = string & { readonly __brand: unique symbol }
type CRM = string & { readonly __brand: unique symbol }
type AppointmentId = string & { readonly __brand: unique symbol }

// Utility types para dados sensíveis
type SensitiveData<T,> = T & { readonly __sensitive: true }
type AuditableAction = 'create' | 'read' | 'update' | 'delete' | 'export'

// Schema de validação com Zod para runtime safety
const PatientSchema = z.object({
  id: z.string().transform((val,): PatientId => val as PatientId),
  personalInfo: z.object({
    fullName: z.string().min(2,).max(100,),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/,).transform((val,): CPF => val as CPF),
    dateOfBirth: z.date().refine((date,) => date < new Date(), {
      message: 'Data de nascimento deve ser no passado',
    },),
    gender: z.enum(['M', 'F', 'O',],),
  },),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\+55\d{2}\d{8,9}$/,),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string().length(2,),
      zipCode: z.string().regex(/^\d{5}-\d{3}$/,),
    },),
  },),
  medicalInfo: z.object({
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',],).optional(),
    allergies: z.array(z.string(),),
    medications: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
    },),),
  },),
  privacy: z.object({
    lgpdConsent: z.boolean(),
    consentDate: z.date(),
    dataRetentionUntil: z.date(),
    consentVersion: z.string(),
  },),
},)

// Infer type from schema for type safety
type Patient = z.infer<typeof PatientSchema>

// Template literal types para status healthcare
type AppointmentStatus =
  | `${string}_appointment`
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
type EmergencyLevel = `level_${1 | 2 | 3 | 4 | 5}` | 'critical' | 'high' | 'medium' | 'low'

// Conditional types para permissões
type HasPermission<T extends string, U extends string,> = T extends `${U}_${string}` ? true : false
type CanAccessPatient<Role extends string,> = Role extends 'doctor' | 'nurse' | 'admin' ? true
  : false

// ❌ INCORRETO - Tipos genéricos sem validação
interface Patient {
  id: string // Sem brand type
  name: string // Sem validação
  data: any // Evitar any
}
```

### **Advanced Type Patterns para Healthcare**

```typescript
// ✅ CORRETO - Mapped types para auditoria
type AuditLog<T,> = {
  [K in keyof T]: {
    oldValue: T[K]
    newValue: T[K]
    changedAt: Date
    changedBy: string
  }
}

// Discriminated unions para diferentes tipos de usuário
type HealthcareUser =
  | { role: 'doctor'; crm: CRM; specialization: string }
  | { role: 'nurse'; coren: string; department: string }
  | { role: 'admin'; permissions: string[] }
  | { role: 'receptionist'; clinicId: string }

// Generic constraints para funções healthcare
interface HealthcareEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  clinicId: string
}

function createHealthcareRecord<T extends HealthcareEntity,>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  user: HealthcareUser,
): Promise<T> {
  // Validação de permissões baseada no tipo de usuário
  if (user.role === 'receptionist' && 'medicalInfo' in data) {
    throw new Error('Recepcionista não pode criar registros médicos',)
  }

  // Implementation...
  return Promise.resolve(data as T,)
}

// Recursive types para estruturas hierárquicas
type ClinicHierarchy = {
  name: string
  type: 'clinic' | 'department' | 'room'
  children?: ClinicHierarchy[]
}

// Utility type para extrair tipos aninhados
type DeepPartial<T,> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Type guards para validação em runtime
function isPatient(obj: unknown,): obj is Patient {
  return PatientSchema.safeParse(obj,).success
}

function isEmergencyCase(appointment: any,): appointment is { level: EmergencyLevel } {
  return appointment && typeof appointment.level === 'string'
    && (appointment.level.startsWith('level_',)
      || ['critical', 'high', 'medium', 'low',].includes(appointment.level,))
}
```

### **Function Signatures**

```typescript
// ✅ CORRETO - Função pura, tipada, documentada
/**
 * Calcula próxima data disponível considerando feriados brasileiros
 * @param baseDate - Data base para cálculo
 * @param excludeWeekends - Excluir fins de semana
 * @param clinicSchedule - Horários de funcionamento da clínica
 * @returns Promise<Date> - Próxima data disponível
 */
async function calculateNextAvailableDate(
  baseDate: Date,
  excludeWeekends: boolean = true,
  clinicSchedule: ClinicSchedule,
): Promise<Date> {
  // Implementação...
}

// ❌ INCORRETO - Sem tipos, sem documentação
function getDate(date, options,) {
  // Implementação...
}
```

## 🚀 **TanStack Router Healthcare Patterns**

### **File-Based Routing Structure**

```typescript
// ✅ CORRETO - Estrutura de rotas healthcare
// src/routes/patients/$patientId.tsx
import { PatientDetail, } from '@/components/patient/PatientDetail'
import { createFileRoute, } from '@tanstack/react-router'

export const Route = createFileRoute('/patients/$patientId',)({
  component: PatientDetailPage,
  beforeLoad: ({ params, context, },) => {
    // Verificação de permissão healthcare obrigatória
    if (!hasPatientAccess(context.user.id, params.patientId,)) {
      throw new HealthcareError('Acesso negado ao prontuário', {
        patientId: params.patientId,
        action: 'view_patient',
        severity: 'high',
      },)
    }
  },
  loader: async ({ params, },) => {
    // Auditoria LGPD obrigatória
    await logPatientAccess({
      patientId: params.patientId,
      action: 'view',
      timestamp: new Date(),
    },)
    return await getPatientData(params.patientId,)
  },
  errorComponent: PatientErrorBoundary,
},)

function PatientDetailPage() {
  const { patient, } = Route.useLoaderData()
  return <PatientDetail patient={patient} />
}
```

### **Type-Safe Navigation**

```typescript
// ✅ CORRETO - Navegação type-safe com auditoria
import { useNavigate, } from '@tanstack/react-router'

function usePatientNavigation() {
  const navigate = useNavigate()

  const goToPatient = (patientId: PatientId,) => {
    navigate({
      to: '/patients/$patientId',
      params: { patientId, },
      // Healthcare audit trail
      search: {
        referrer: 'patient-list',
        timestamp: Date.now(),
        auditTrail: true,
      },
    },)
  }

  const goToAppointment = (patientId: PatientId, appointmentId: AppointmentId,) => {
    navigate({
      to: '/patients/$patientId/appointments/$appointmentId',
      params: { patientId, appointmentId, },
    },)
  }

  return { goToPatient, goToAppointment, }
}

// ❌ INCORRETO - Navegação sem type safety
const navigate = useNavigate()
navigate('/patients/' + patientId,) // Sem validação de tipos
```

### **Protected Routes & Healthcare Access**

```typescript
// ✅ CORRETO - Proteção de rotas com contexto healthcare
export const protectedPatientRoute = createFileRoute('/patients/$patientId',)({
  beforeLoad: ({ params, context, },) => {
    // Verificação de autenticação
    if (!context.user) {
      throw redirect({ to: '/auth/login', },)
    }

    // Verificação de permissão específica do paciente
    if (!hasPatientAccess(context.user.id, params.patientId,)) {
      throw new HealthcareError('Acesso negado ao prontuário', {
        patientId: params.patientId,
        userId: context.user.id,
        action: 'view_patient',
        severity: 'high',
      },)
    }
  },
  loader: async ({ params, context, },) => {
    // Auditoria LGPD obrigatória
    await logPatientAccess({
      patientId: params.patientId,
      userId: context.user.id,
      action: 'view',
      timestamp: new Date(),
      ipAddress: context.request.headers['x-forwarded-for'],
    },)

    return await getPatientData(params.patientId,)
  },
},)
```

## 🏗️ **Vite Build Optimization para Clínicas**

### **Configuração Healthcare-Optimized**

```typescript
// vite.config.ts - Otimizado para ambiente de clínica
import react from '@vitejs/plugin-react'
import { defineConfig, } from 'vite'

export default defineConfig({
  plugins: [react(),],
  build: {
    // Otimização para dispositivos de clínica (tablets, computadores básicos)
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk específico para funcionalidades críticas de healthcare
          'healthcare-core': [
            'src/components/patient',
            'src/components/appointment',
            'src/components/emergency',
          ],
          // Chunk para funcionalidades administrativas
          'admin': [
            'src/components/admin',
            'src/components/reports',
            'src/components/billing',
          ],
          // Chunk para vendor libraries
          'vendor': ['react', 'react-dom', '@tanstack/react-router',],
        },
      },
    },
    // Limites ajustados para ambiente de clínica
    chunkSizeWarningLimit: 1000, // 1MB para funcionalidades críticas
  },
  server: {
    // Configuração para desenvolvimento em clínicas
    host: '0.0.0.0', // Acesso de dispositivos na rede local
    port: 3000,
    hmr: {
      port: 3001, // Porta separada para HMR
    },
  },
},)
```

### **Performance Monitoring para Healthcare**

```typescript
// ✅ CORRETO - Monitoramento de performance crítica para healthcare
import { onCLS, onFCP, onFID, onLCP, onTTFB, } from 'web-vitals'

// Métricas críticas para operações de clínica
function initHealthcareMetrics() {
  // Core Web Vitals com contexto healthcare
  onLCP((metric,) => {
    // LCP < 2.5s é crítico para formulários de emergência
    if (metric.value > 2500) {
      reportHealthcareMetric('lcp_slow', {
        value: metric.value,
        page: window.location.pathname,
        severity: 'critical',
        impact: 'emergency_response_delay',
      },)
    }
  },)

  onFID((metric,) => {
    // FID < 100ms é essencial para interações rápidas
    if (metric.value > 100) {
      reportHealthcareMetric('fid_slow', {
        value: metric.value,
        interaction: metric.name,
        severity: 'high',
      },)
    }
  },)
}

// Métricas específicas para healthcare
function trackHealthcareActions() {
  // Tempo de carregamento de prontuário
  performance.mark('patient-load-start',)
  // ... carregamento de dados
  performance.mark('patient-load-end',)
  performance.measure('patient-load', 'patient-load-start', 'patient-load-end',)

  // SLA: Carregamento de prontuário < 1.5s
  const patientLoadTime = performance.getEntriesByName('patient-load',)[0]?.duration
  if (patientLoadTime > 1500) {
    reportHealthcareMetric('patient_load_slow', {
      duration: patientLoadTime,
      severity: 'medium',
      impact: 'workflow_delay',
    },)
  }
}
```

## ⚛️ **React & Components Standards**

### **React 19 Healthcare Patterns**

```typescript
// ✅ CORRETO - useOptimistic para atualizações de prontuário
import { useOptimistic, useTransition, } from 'react'

function usePatientUpdates(patientId: PatientId,) {
  const [patient, setPatient,] = useState<Patient>()
  const [optimisticPatient, updateOptimisticPatient,] = useOptimistic(
    patient,
    (current, update: Partial<Patient>,) => ({ ...current, ...update, }),
  )
  const [isPending, startTransition,] = useTransition()

  const updatePatient = async (updates: Partial<Patient>,) => {
    // Atualização otimista para UX responsiva
    updateOptimisticPatient(updates,)

    startTransition(async () => {
      try {
        await updatePatientInDatabase(patientId, updates,)
        // Auditoria obrigatória para mudanças em prontuário
        await logPatientUpdate({
          patientId,
          changes: updates,
          timestamp: new Date(),
        },)
        setPatient(prev => ({ ...prev, ...updates, }))
      } catch (error) {
        // Reverte optimistic update em caso de erro
        setPatient(patient,)
        throw new HealthcareError('Falha ao atualizar prontuário', {
          patientId,
          action: 'update',
          severity: 'high',
        },)
      }
    },)
  }

  return { optimisticPatient, updatePatient, isPending, }
}
```

### **Component Structure**

```typescript
// ✅ CORRETO - Componente bem estruturado com React 19
interface PatientCardProps {
  patient: Patient
  onEdit: (patientId: PatientId,) => void
  onDelete: (patientId: PatientId,) => Promise<void>
  readOnly?: boolean
  className?: string
  'data-testid'?: string
}

export function PatientCard({
  patient,
  onEdit,
  onDelete,
  readOnly = false,
  className,
  'data-testid': testId,
}: PatientCardProps,) {
  // React 19 hooks no topo
  const [isDeleting, setIsDeleting,] = useState(false,)
  const [isPending, startTransition,] = useTransition()

  // Event handlers com concurrent features
  const handleDelete = () => {
    startTransition(async () => {
      setIsDeleting(true,)
      try {
        await onDelete(patient.id,)
        // Log healthcare action
        await logHealthcareAction({
          action: 'delete_patient',
          patientId: patient.id,
          timestamp: new Date(),
        },)
      } catch (error) {
        // Error handling com contexto healthcare
        throw new HealthcareError('Falha ao excluir paciente', {
          patientId: patient.id,
          action: 'delete',
          severity: 'critical',
        },)
      } finally {
        setIsDeleting(false,)
      }
    },)
  }

  // Early returns
  if (!patient) {
    return <PatientCardSkeleton />
  }

  // Main render com loading states
  return (
    <Card
      className={cn('patient-card', className, {
        'opacity-50': isPending,
        'cursor-not-allowed': isDeleting,
      },)}
      data-testid={testId}
    >
      {/* Component content */}
    </Card>
  )
}
```

### **Concurrent Data Loading**

```typescript
// ✅ CORRETO - Suspense com concurrent features para dados healthcare
import { Suspense, use, } from 'react'

function PatientDataProvider(
  { patientId, children, }: { patientId: PatientId; children: React.ReactNode },
) {
  return (
    <Suspense fallback={<PatientDataSkeleton />}>
      <PatientDataBoundary patientId={patientId}>
        {children}
      </PatientDataBoundary>
    </Suspense>
  )
}

function PatientDataBoundary(
  { patientId, children, }: { patientId: PatientId; children: React.ReactNode },
) {
  // React 19 'use' hook para data fetching
  const patientPromise = getPatientData(patientId,)
  const patient = use(patientPromise,)

  // Healthcare context validation
  if (!patient || !hasPatientAccess(patient.id,)) {
    throw new HealthcareError('Acesso ao paciente não autorizado',)
  }

  return (
    <PatientContext.Provider value={patient}>
      {children}
    </PatientContext.Provider>
  )
}
```

### **Custom Hooks Pattern**

```typescript
// ✅ CORRETO - Hook bem estruturado
interface UsePatientOptions {
  patientId: PatientId
  includeHistory?: boolean
  autoRefresh?: boolean
}

interface UsePatientReturn {
  patient: Patient | null
  isLoading: boolean
  error: HealthcareError | null
  refetch: () => Promise<void>
  updatePatient: (updates: Partial<Patient>,) => Promise<void>
}

export function usePatient({
  patientId,
  includeHistory = false,
  autoRefresh = false,
}: UsePatientOptions,): UsePatientReturn {
  // Estado local
  const [patient, setPatient,] = useState<Patient | null>(null,)
  const [isLoading, setIsLoading,] = useState(true,)
  const [error, setError,] = useState<HealthcareError | null>(null,)

  // Lógica do hook...

  return {
    patient,
    isLoading,
    error,
    refetch,
    updatePatient,
  }
}
```

## 🗄️ **Supabase Healthcare Integration**

### **Row Level Security para Dados de Paciente**

```sql
-- ✅ CORRETO - RLS para proteção de dados healthcare
CREATE POLICY "healthcare_staff_patient_access" ON patients
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_permissions sp
    WHERE sp.user_id = auth.uid()
    AND sp.clinic_id = patients.clinic_id
    AND sp.can_access_patients = true
  )
);

-- Auditoria automática para LGPD
CREATE POLICY "audit_patient_access" ON patient_audit_log
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Política para dados sensíveis
CREATE POLICY "sensitive_data_access" ON patient_sensitive_data
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('doctor', 'nurse')
    AND ur.clinic_id = patient_sensitive_data.clinic_id
  )
);
```

### **Supabase Client Healthcare Configuration**

```typescript
// ✅ CORRETO - Cliente Supabase com configuração healthcare
import { createClient, } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Segurança extra para ambiente clínica
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Limitado para estabilidade em clínicas
      },
    },
    global: {
      headers: {
        'X-Healthcare-App': 'NeonPro',
        'X-Compliance': 'LGPD-ANVISA',
      },
    },
  },
)

// Healthcare-specific query helpers
export const healthcareQueries = {
  async getPatientWithAudit(patientId: string,) {
    // Auditoria automática
    await supabase
      .from('patient_audit_log',)
      .insert({
        patient_id: patientId,
        action: 'view',
        timestamp: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },)

    return supabase
      .from('patients',)
      .select('*',)
      .eq('id', patientId,)
      .single()
  },

  async updatePatientWithValidation(patientId: string, updates: any,) {
    // Validação healthcare antes da atualização
    if (updates.cpf) {
      if (!validateCPF(updates.cpf,)) {
        throw new Error('CPF inválido',)
      }
    }

    return supabase
      .from('patients',)
      .update(updates,)
      .eq('id', patientId,)
      .select()
  },
}
```

### **Real-time Healthcare Subscriptions**

```typescript
// ✅ CORRETO - Subscrições em tempo real para clínicas
function useAppointmentUpdates(clinicId: string,) {
  const [appointments, setAppointments,] = useState<Appointment[]>([],)

  useEffect(() => {
    const subscription = supabase
      .channel('appointments',)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload,) => {
          // Notificação para equipe da clínica
          if (payload.eventType === 'INSERT') {
            showHealthcareNotification({
              type: 'new_appointment',
              message: 'Novo agendamento recebido',
              priority: 'medium',
            },)
          }

          if (payload.eventType === 'UPDATE' && payload.new.status === 'emergency') {
            showHealthcareNotification({
              type: 'emergency',
              message: 'Agendamento de emergência!',
              priority: 'critical',
            },)
          }

          // Atualiza estado local
          setAppointments(prev => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prev, payload.new as Appointment,]
              case 'UPDATE':
                return prev.map(apt => apt.id === payload.new.id ? payload.new as Appointment : apt)
              case 'DELETE':
                return prev.filter(apt => apt.id !== payload.old.id)
              default:
                return prev
            }
          },)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [clinicId,],)

  return appointments
}
```

## 🗄️ **Database & API Standards**

### **Database Naming**

```sql
-- ✅ CORRETO - Nomenclatura consistente
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- LGPD compliance
  data_retention_until TIMESTAMPTZ,
  lgpd_consent_date TIMESTAMPTZ
);

-- ❌ INCORRETO - Inconsistente
CREATE TABLE pat (
  ID int,
  nm varchar(50),
  createdAt datetime
);
```

### **API Response Pattern**

```typescript
// ✅ CORRETO - Resposta padronizada
interface ApiResponse<T,> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    healthcareContext?: HealthcareErrorContext
  }
  meta?: {
    pagination?: PaginationInfo
    requestId: string
    timestamp: string
  }
}

// Uso
async function getPatients(): Promise<ApiResponse<Patient[]>> {
  try {
    const response = await fetch('/api/patients',)
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Falha na conexão com o servidor',
      },
    }
  }
}
```

## 🎨 **shadcn/ui Healthcare Components**

### **Healthcare Component Variants**

```typescript
// ✅ CORRETO - Button variants para healthcare
import { cn, } from '@/lib/utils'
import { cva, } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        emergency:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 font-semibold',
        healthcare: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
        patient: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base', // Maior para facilidade em tablets de clínica
        xl: 'h-14 px-8 text-lg', // Extra grande para emergências
      },
    },
    defaultVariants: {
      variant: 'healthcare',
      size: 'md',
    },
  },
)

interface HealthcareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'emergency' | 'healthcare' | 'patient' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  requireConfirmation?: boolean
}

export function HealthcareButton({
  variant = 'healthcare',
  size = 'md',
  isLoading = false,
  requireConfirmation = false,
  className,
  children,
  onClick,
  ...props
}: HealthcareButtonProps,) {
  const [showConfirmation, setShowConfirmation,] = useState(false,)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>,) => {
    if (requireConfirmation && !showConfirmation) {
      setShowConfirmation(true,)
      return
    }

    onClick?.(e,)
    setShowConfirmation(false,)
  }

  return (
    <>
      <button
        className={cn(buttonVariants({ variant, size, },), className,)}
        onClick={handleClick}
        disabled={isLoading}
        {...props}
      >
        {isLoading
          ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          )
          : children}
      </button>

      {showConfirmation && (
        <ConfirmationDialog
          title="Confirmar Ação"
          description="Tem certeza que deseja executar esta ação?"
          onConfirm={() => setShowConfirmation(false,)}
          onCancel={() => setShowConfirmation(false,)}
        />
      )}
    </>
  )
}
```

### **Healthcare Card Patterns**

```typescript
// ✅ CORRETO - Card para dados sensíveis
interface PatientDataCardProps {
  patient: Patient
  accessLevel: 'public' | 'sensitive' | 'confidential'
  showSensitiveData?: boolean
  className?: string
}

export function PatientDataCard({
  patient,
  accessLevel,
  showSensitiveData = false,
  className,
}: PatientDataCardProps,) {
  return (
    <Card
      className={cn(
        'border-l-4 transition-colors',
        {
          'border-l-green-500 bg-green-50/50': accessLevel === 'public',
          'border-l-yellow-500 bg-yellow-50/50': accessLevel === 'sensitive',
          'border-l-red-500 bg-red-50/50': accessLevel === 'confidential',
        },
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {patient.name}
          </CardTitle>
          <Badge
            variant={accessLevel === 'confidential' ? 'destructive' : 'secondary'}
          >
            {accessLevel === 'public' && 'Dados Públicos'}
            {accessLevel === 'sensitive' && 'Dados Sensíveis'}
            {accessLevel === 'confidential' && 'Confidencial'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <p>ID: {patient.id}</p>
          {(accessLevel === 'public' || showSensitiveData) && <p>CPF: {patient.cpf}</p>}
          {accessLevel === 'confidential' && showSensitiveData && (
            <div className="p-3 bg-red-100 rounded border border-red-200">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Informações confidenciais - Acesso restrito
              </p>
              <p>Informações médicas sensíveis...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### **Accessibility (WCAG 2.1 AA+) para Healthcare**

```typescript
// ✅ CORRETO - Componente acessível para clínicas
interface EmergencyAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  patientName?: string
  onAcknowledge: () => void
  autoFocus?: boolean
}

export function EmergencyAlert({
  severity,
  message,
  patientName,
  onAcknowledge,
  autoFocus = false,
}: EmergencyAlertProps,) {
  const alertRef = useRef<HTMLDivElement>(null,)

  // Auto-focus para alertas críticos (acessibilidade)
  useEffect(() => {
    if (autoFocus && severity === 'critical' && alertRef.current) {
      alertRef.current.focus()
    }
  }, [autoFocus, severity,],)

  return (
    <Alert
      ref={alertRef}
      className={cn(
        'border-l-4 focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'border-l-blue-500 bg-blue-50': severity === 'low',
          'border-l-yellow-500 bg-yellow-50': severity === 'medium',
          'border-l-orange-500 bg-orange-50': severity === 'high',
          'border-l-red-500 bg-red-50 animate-pulse': severity === 'critical',
        },
      )}
      // Acessibilidade: ARIA labels
      role="alert"
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={-1}
    >
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        {severity === 'critical' && '🚨 '}
        Alerta {severity === 'critical' ? 'CRÍTICO' : severity.toUpperCase()}
        {patientName && ` - ${patientName}`}
      </AlertTitle>
      <AlertDescription className="text-base">
        {message}
      </AlertDescription>

      <div className="mt-4">
        <HealthcareButton
          variant={severity === 'critical' ? 'emergency' : 'healthcare'}
          onClick={onAcknowledge}
          size={severity === 'critical' ? 'lg' : 'md'}
        >
          Reconhecer Alerta
        </HealthcareButton>
      </div>
    </Alert>
  )
}
```

## 🧪 **Testing Standards**

### **Vitest Healthcare Testing Patterns**

```typescript
// ✅ CORRETO - Testes healthcare com Vitest
import { PatientService, } from '@/services/PatientService'
import { createMockPatient, createMockUser, } from '@/test/utils/healthcare-mocks'
import { fireEvent, render, screen, waitFor, } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest'

describe('PatientService - Healthcare Security', () => {
  let patientService: PatientService
  let mockAuditLog: any

  beforeEach(() => {
    patientService = new PatientService()
    mockAuditLog = vi.spyOn(patientService, 'logPatientAccess',)
  },)

  afterEach(() => {
    vi.restoreAllMocks()
  },)

  describe('createPatient', () => {
    it('should create patient with valid data and log audit', async () => {
      // Arrange
      const authorizedUser = createMockUser({ role: 'doctor', },)
      const validPatientData = createMockPatient({
        fullName: 'João Silva',
        cpf: '123.456.789-00',
        dateOfBirth: new Date('1990-01-01',),
      },)

      // Act
      const result = await patientService.createPatient(validPatientData, authorizedUser,)

      // Assert - Business Logic
      expect(result.success,).toBe(true,)
      expect(result.data,).toHaveProperty('id',)
      expect(result.data?.fullName,).toBe(validPatientData.fullName,)

      // Assert - Healthcare Compliance
      expect(mockAuditLog,).toHaveBeenCalledWith({
        action: 'create_patient',
        patientId: result.data?.id,
        userId: authorizedUser.id,
        timestamp: expect.any(Date,),
      },)
    })

    it('should reject patient creation without proper authorization', async () => {
      // Arrange
      const unauthorizedUser = createMockUser({ role: 'receptionist', },)
      const patientData = createMockPatient()

      // Act & Assert
      await expect(
        patientService.createPatient(patientData, unauthorizedUser,),
      ).rejects.toThrow('Permissão insuficiente para criar pacientes',)
    })

    it('should validate CPF format and reject invalid CPF', async () => {
      // Arrange
      const user = createMockUser({ role: 'doctor', },)
      const invalidPatientData = createMockPatient({
        cpf: '111.111.111-11', // CPF inválido
      },)

      // Act & Assert
      await expect(
        patientService.createPatient(invalidPatientData, user,),
      ).rejects.toThrow('CPF inválido',)
    })
  })

  describe('getPatientData - LGPD Compliance', () => {
    it('should require valid consent to access patient data', async () => {
      // Arrange
      const patient = createMockPatient()
      const user = createMockUser()

      // Mock consent check
      vi.spyOn(patientService, 'hasValidConsent',).mockResolvedValue(false,)

      // Act & Assert
      await expect(
        patientService.getPatientData(patient.id, user,),
      ).rejects.toThrow('Consentimento LGPD não encontrado ou expirado',)
    })

    it('should log all patient data access for audit trail', async () => {
      // Arrange
      const patient = createMockPatient()
      const user = createMockUser()

      vi.spyOn(patientService, 'hasValidConsent',).mockResolvedValue(true,)

      // Act
      await patientService.getPatientData(patient.id, user,)

      // Assert - Audit Trail
      expect(mockAuditLog,).toHaveBeenCalledWith({
        action: 'view_patient',
        patientId: patient.id,
        userId: user.id,
        timestamp: expect.any(Date,),
        ipAddress: expect.any(String,),
      },)
    })
  })
})
```

### **Integration Testing com MSW**

```typescript
// ✅ CORRETO - Testes de integração com mock de APIs
import { http, HttpResponse, } from 'msw'
import { setupServer, } from 'msw/node'
import { afterAll, afterEach, beforeAll, } from 'vitest'

// Mock server para Supabase API
const server = setupServer(
  // Mock Supabase auth
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: 'doctor@clinic.com',
        role: 'doctor',
      },
    },)
  },),
  // Mock patient data with RLS
  http.get('/rest/v1/patients', ({ request, },) => {
    const url = new URL(request.url,)
    const select = url.searchParams.get('select',)

    // Simula RLS - apenas dados que o usuário pode ver
    return HttpResponse.json([
      {
        id: 'patient-1',
        name: 'João Silva',
        // CPF omitido se não autorizado
        ...(select?.includes('cpf',) ? { cpf: '123.456.789-00', } : {}),
      },
    ],)
  },),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Patient Data Integration', () => {
  it('should fetch patient list with proper RLS filtering', async () => {
    // Arrange
    const user = createMockUser({ role: 'doctor', },)

    // Act
    const patients = await fetchPatients(user,)

    // Assert
    expect(patients,).toHaveLength(1,)
    expect(patients[0],).toHaveProperty('cpf',) // Doctor pode ver CPF
  })

  it('should restrict sensitive data for unauthorized users', async () => {
    // Arrange
    const user = createMockUser({ role: 'receptionist', },)

    // Mock unauthorized response
    server.use(
      http.get('/rest/v1/patients', () => {
        return HttpResponse.json(
          { error: 'Insufficient permissions', },
          { status: 403, },
        )
      },),
    )

    // Act & Assert
    await expect(fetchPatients(user,),).rejects.toThrow('Acesso negado',)
  })
})
```

### **E2E Testing com Playwright para Healthcare**

```typescript
// ✅ CORRETO - Testes E2E para fluxos críticos de clínica
import { expect, test, } from '@playwright/test'

test.describe('Emergency Patient Registration', () => {
  test('should allow quick patient registration in emergency scenarios', async ({ page, },) => {
    // Navigate to emergency registration
    await page.goto('/emergency/register',)

    // Fill emergency form
    await page.fill('[data-testid="patient-name"]', 'Maria Silva',)
    await page.fill('[data-testid="patient-cpf"]', '987.654.321-00',)
    await page.selectOption('[data-testid="emergency-level"]', 'high',)

    // Submit with emergency priority
    await page.click('[data-testid="emergency-submit"]',)

    // Should show success and redirect to patient view
    await expect(page.locator('[data-testid="success-message"]',),).toBeVisible()
    await expect(page,).toHaveURL(/\/patients\/.*\/emergency/,)

    // Verify audit log entry was created
    const auditLogs = await page.request.get('/api/audit-logs?action=emergency_registration',)
    expect(auditLogs.ok(),).toBeTruthy()
  })

  test('should handle LGPD consent flow during registration', async ({ page, },) => {
    await page.goto('/patients/register',)

    // Fill patient data
    await page.fill('[data-testid="patient-name"]', 'Pedro Santos',)
    await page.fill('[data-testid="patient-email"]', 'pedro@email.com',)

    // Should show LGPD consent dialog
    await expect(page.locator('[data-testid="lgpd-consent-dialog"]',),).toBeVisible()

    // Accept consent
    await page.check('[data-testid="consent-data-processing"]',)
    await page.check('[data-testid="consent-medical-records"]',)
    await page.click('[data-testid="accept-consent"]',)

    // Complete registration
    await page.click('[data-testid="register-patient"]',)

    // Verify consent was recorded
    await expect(page.locator('[data-testid="consent-confirmation"]',),).toBeVisible()
  })
})
```

### **Test Structure**

````
### **Test Categories**

```typescript
// 🔥 CRITICAL - Business logic, APIs, financial operations
describe('Financial Calculations', () => {
  // Testes críticos para cálculos financeiros
})

// ⚡ IMPORTANT - Complex hooks, utilities, data validation
describe('Data Validation Utils', () => {
  // Testes importantes para validações
})

// ✅ USEFUL - UI components with logic, helpers
describe('PatientCard Component', () => {
  // Testes úteis para componentes UI
})
````

## 📝 **Documentation Standards**

### **Code Comments**

```typescript
// ✅ CORRETO - Comentário explicando o "porquê"
// Aplicamos desconto especial para pacientes SUS conforme
// regulamentação ANVISA 2023, artigo 15.3
const susDiscount = basePrice * 0.15

/**
 * Calcula tempo de espera médio considerando prioridades médicas
 *
 * Pacientes em emergência têm prioridade máxima (0 min espera)
 * Pacientes com comorbidades têm prioridade alta (até 15 min)
 * Consultas de rotina seguem ordem de chegada
 *
 * @param appointments - Lista de agendamentos
 * @param priority - Nível de prioridade médica
 * @returns Tempo estimado em minutos
 */
function calculateWaitTime(
  appointments: Appointment[],
  priority: MedicalPriority,
): number {
  // Implementação...
}

// ❌ INCORRETO - Comentário óbvio
// Incrementa o contador
counter++
```

## 🔒 **Security & LGPD Standards**

### **Data Privacy**

```typescript
// ✅ CORRETO - Dados sensíveis protegidos
interface PatientPublicView {
  id: PatientId
  firstName: string // Apenas primeiro nome
  appointmentCount: number
  lastVisit: Date
  // CPF, endereço, telefone omitidos
}

function getPatientPublicView(patient: Patient,): PatientPublicView {
  return {
    id: patient.id,
    firstName: patient.personalInfo.fullName.split(' ',)[0],
    appointmentCount: patient.appointments.length,
    lastVisit: patient.lastAppointment?.date ?? new Date(),
  }
}

// ❌ INCORRETO - Exposição de dados sensíveis
function getPatientData(patient: Patient,) {
  return patient // Expõe todos os dados
}
```

## 📊 **Performance Standards**

### **Bundle Optimization**

```typescript
// ✅ CORRETO - Import específico
import { formatDate, } from '@neonpro/utils/date'
import { validateCPF, } from '@neonpro/utils/validation'

// ❌ INCORRETO - Import completo
import * as utils from '@neonpro/utils'
```

### **Component Lazy Loading**

```typescript
// ✅ CORRETO - Lazy loading para componentes pesados
const PatientReportsModal = lazy(() => 
  import('@/components/PatientReportsModal').then(module => ({
    default: module.PatientReportsModal
  }))
)

// Usage
<Suspense fallback={<ReportsModalSkeleton />}>
  <PatientReportsModal />
</Suspense>
```

## ✅ **Quality Checklist**

### **Pre-Commit Checklist**

- [ ] Código segue princípios KISS, YAGNI, e Chain of Thought
- [ ] Tipos TypeScript completos e precisos
- [ ] Testes escritos para lógica de negócio crítica
- [ ] Documentação atualizada para mudanças de API
- [ ] Sem vazamento de dados sensíveis
- [ ] Performance otimizada (imports, lazy loading)
- [ ] Nomenclatura healthcare consistente
- [ ] Error handling com contexto healthcare
- [ ] LGPD compliance verificado

### **Code Review Checklist**

- [ ] Arquitetura alinhada com padrões do projeto
- [ ] Segurança e privacidade de dados
- [ ] Acessibilidade (WCAG 2.1 AA+)
- [ ] Compatibilidade cross-browser
- [ ] Performance e otimização
- [ ] Testes adequados e cobertura ≥90%

---

**Status**: ✅ **ATIVO - ENHANCED**\
**Versão**: 2.1.0\
**Última Atualização**: 2025-09-09\
**Qualidade Target**: ≥9.5/10

---

## 📈 **Changelog v2.1.0 - Modern Tech Stack Enhancement**

### ✨ **Novas Seções Adicionadas**

#### 🚀 **TanStack Router Healthcare Patterns**

- Padrões de roteamento baseado em arquivos
- Navegação type-safe com auditoria LGPD
- Proteção de rotas com contexto healthcare
- Carregamento de dados com validação de permissões

#### 🏗️ **Vite Build Optimization para Clínicas**

- Configurações otimizadas para dispositivos de clínica
- Code splitting healthcare-specific
- Monitoramento de performance Core Web Vitals
- Métricas críticas para operações clínicas

#### 🗄️ **Supabase Healthcare Integration**

- Padrões Row Level Security (RLS) para dados de paciente
- Configuração de cliente healthcare-optimized
- Subscrições real-time para clínicas
- Auditoria automática LGPD integrada

#### 🎨 **shadcn/ui Healthcare Components**

- Variantes de componentes para emergência
- Cards para dados sensíveis com níveis de acesso
- Compliance WCAG 2.1 AA+ para acessibilidade
- Alertas críticos com auto-focus

### 🔄 **Seções Aprimoradas**

#### ⚙️ **TypeScript 5.7.2 Healthcare Domain Types**

- Branded types para segurança de tipos healthcare
- Schema validation com Zod para runtime safety
- Template literal types para status healthcare
- Conditional types para sistema de permissões
- Advanced mapped types para auditoria

#### ⚛️ **React 19 Healthcare Patterns**

- useOptimistic para atualizações de prontuário
- useTransition para operações concorrentes
- Suspense com concurrent features
- Error boundaries healthcare-specific

#### 🧪 **Vitest Healthcare Testing Patterns**

- Testes de segurança para acesso a pacientes
- Integration testing com MSW
- E2E testing com Playwright para fluxos críticos
- Mock patterns para dados healthcare
- Testes de compliance LGPD/ANVISA

### 🔒 **Compliance & Security Enhancements**

- Integração de auditoria LGPD em todos os padrões
- Padrões ANVISA para software médico
- Validação de CPF/CNPJ integrada
- Gestão de consentimento com versionamento
- Logs de auditoria obrigatórios para dados sensíveis

### 📊 **Performance & Monitoring**

- SLAs específicos para operações de clínica
- Métricas Core Web Vitals com contexto healthcare
- Monitoramento de carregamento de prontuário < 1.5s
- Otimizações para dispositivos de clínica

### 🎆 **Migration Guide**

Para migrar código existente para os novos padrões:

1. Atualizar imports de componentes para usar variantes healthcare
2. Implementar branded types gradualmente
3. Adicionar auditoria LGPD em operações de dados existentes
4. Migrar testes para usar novos patterns do Vitest
5. Configurar Vite build optimization

**Backward Compatibility**: ✅ Mantida - todos os padrões existentes continuam válidos
**Breaking Changes**: ❌ Nenhuma - apenas adições e melhorias

---
