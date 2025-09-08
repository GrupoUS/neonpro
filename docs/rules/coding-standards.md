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

### **Type Definitions**

```typescript
// ✅ CORRETO - Tipos específicos e validados
interface Patient {
  readonly id: PatientId
  personalInfo: {
    fullName: string
    cpf: CPF
    dateOfBirth: Date
    gender: 'M' | 'F' | 'O'
  }
  contactInfo: {
    email: Email
    phone: PhoneNumber
    address: Address
  }
  medicalInfo: {
    bloodType?: BloodType
    allergies: Allergy[]
    medications: Medication[]
  }
  privacy: {
    lgpdConsent: boolean
    consentDate: Date
    dataRetentionUntil: Date
  }
}

// ❌ INCORRETO - Tipos genéricos demais
interface Patient {
  id: string
  name: string
  data: any
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

## ⚛️ **React & Components Standards**

### **Component Structure**

```typescript
// ✅ CORRETO - Componente bem estruturado
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
  // Hooks no topo
  const [isDeleting, setIsDeleting,] = useState(false,)

  // Event handlers
  const handleDelete = async () => {
    setIsDeleting(true,)
    try {
      await onDelete(patient.id,)
    } catch (error) {
      // Error handling
    } finally {
      setIsDeleting(false,)
    }
  }

  // Early returns
  if (!patient) {
    return <PatientCardSkeleton />
  }

  // Main render
  return (
    <Card className={cn('patient-card', className,)} data-testid={testId}>
      {/* Component content */}
    </Card>
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

## 🧪 **Testing Standards**

### **Test Structure**

```typescript
// ✅ CORRETO - Teste bem estruturado
describe('PatientService', () => {
  describe('createPatient', () => {
    it('should create patient with valid data', async () => {
      // Arrange
      const validPatientData: CreatePatientData = {
        fullName: 'João Silva',
        cpf: '123.456.789-00',
        dateOfBirth: new Date('1990-01-01',),
        email: 'joao@example.com',
      }

      // Act
      const result = await patientService.createPatient(validPatientData,)

      // Assert
      expect(result.success,).toBe(true,)
      expect(result.data,).toHaveProperty('id',)
      expect(result.data?.fullName,).toBe(validPatientData.fullName,)
    })

    it('should reject patient with invalid CPF', async () => {
      // Arrange
      const invalidPatientData = {
        ...validPatientData,
        cpf: '111.111.111-11', // CPF inválido
      }

      // Act & Assert
      await expect(
        patientService.createPatient(invalidPatientData,),
      ).rejects.toThrow('CPF inválido',)
    })
  })
})
```

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
```

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

**Status**: ✅ **ATIVO**\
**Última Atualização**: 2025-01-08\
**Qualidade Target**: ≥9.5/10
