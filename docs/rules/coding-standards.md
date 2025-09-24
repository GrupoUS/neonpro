---
title: "NeonPro Coding Standards"
last_updated: 2025-09-09
form: reference
tags: [coding-standards, healthcare, typescript, react, quality]
related:
  - ../architecture/architecture.md
  - ../architecture/tech-stack.md
  - ../AGENTS.md
---

# NeonPro Coding Standards

**Padrões de código para sistema de gestão em saúde com qualidade ≥9.5/10**

## 🎯 Core Principles

### KISS Principle - Keep It Simple, Stupid

- Choose simplest solution that meets requirements
- Prefer readable code over clever optimizations
- Use clear, descriptive naming and avoid over-engineering

### YAGNI Principle - You Aren't Gonna Need It

- Build only what current requirements specify
- Resist 'just in case' features
- Remove unused code immediately

### Chain of Thought

- Break problems into sequential steps
- Show intermediate decisions and validate against requirements
- Each step follows logically from previous steps

## 🏥 Healthcare-Specific Standards

### Healthcare Nomenclature

```typescript
// ✅ CORRECT - Clear medical terminology
interface PatientRecord {
  patientId: string;
  medicalRecordNumber: string;
  healthInsuranceNumber: string;
  emergencyContact: EmergencyContact;
  lgpdConsent: ConsentStatus;
}

// ❌ INCORRECT - Confusing abbreviations
interface PatRec {
  id: string;
  mrn: string;
  ins: string;
}
```

### Healthcare Error Handling

```typescript
// ✅ CORRECT - Healthcare context in errors
class HealthcareError extends Error {
  constructor(
    message: string,
    public readonly healthcareContext: {
      patientId?: string;
      appointmentId?: string;
      clinicId?: string;
      action?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    },
  ) {
    super(message);
    this.name = 'HealthcareError';
  }
}

// ❌ INCORRECT - Generic error
throw new Error('Something went wrong');
```

## 🔧 TypeScript 5.7.2 Standards

### Healthcare Domain Types

```typescript
// Branded types for healthcare safety
type PatientId = string & { readonly __brand: unique symbol };
type CPF = string & { readonly __brand: unique symbol };
type AppointmentId = string & { readonly __brand: unique symbol };

// Utility types for sensitive data
type SensitiveData<T> = T & { readonly __sensitive: true };
type AuditableAction = 'create' | 'read' | 'update' | 'delete' | 'export';

// Zod schema for runtime validation
const PatientSchema = z.object({
  id: z.string().transform((val): PatientId => val as PatientId),
  personalInfo: z.object({
    fullName: z.string().min(2).max(100),
    cpf: z
      .string()
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .transform((val): CPF => val as CPF),
    dateOfBirth: z.date().refine(date => date < new Date(), {
      message: 'Data de nascimento deve ser no passado',
    }),
  }),
  privacy: z.object({
    lgpdConsent: z.boolean(),
    consentDate: z.date(),
    dataRetentionUntil: z.date(),
  }),
});

type Patient = z.infer<typeof PatientSchema>;
```

### Advanced Type Patterns

```typescript
// Mapped types for audit trails
type AuditLog<T> = {
  [K in keyof T]: {
    oldValue: T[K];
    newValue: T[K];
    changedAt: Date;
    changedBy: string;
  };
};

// Discriminated unions for user types
type HealthcareUser =
  | { role: 'doctor'; crm: string; specialization: string }
  | { role: 'nurse'; coren: string; department: string }
  | { role: 'admin'; permissions: string[] }
  | { role: 'receptionist'; clinicId: string };

// Type guards for runtime validation
function isPatient(obj: unknown): obj is Patient {
  return PatientSchema.safeParse(obj).success;
}
```

### Function Signatures

```typescript
// ✅ CORRECT - Pure, typed, documented function
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
  // Implementation...
}

// ❌ INCORRECT - No types, no documentation
function getDate(date, options) {
  // Implementation...
}
```

## 🚀 TanStack Router Healthcare Patterns

### File-Based Routing Structure

```typescript
// ✅ CORRECT - Healthcare route structure
// src/routes/patients/$patientId.tsx
export const Route = createFileRoute('/patients/$patientId')({
  component: PatientDetailPage,
  beforeLoad: ({ params, context }) => {
    // Healthcare permission check required
    if (!hasPatientAccess(context.user.id, params.patientId)) {
      throw new HealthcareError('Acesso negado ao prontuário', {
        patientId: params.patientId,
        action: 'view_patient',
        severity: 'high',
      });
    }
  },
  loader: async ({ params }) => {
    // LGPD audit required
    await logPatientAccess({
      patientId: params.patientId,
      action: 'view',
      timestamp: new Date(),
    });
    return await getPatientData(params.patientId);
  },
  errorComponent: PatientErrorBoundary,
});
```

### Type-Safe Navigation

```typescript
// ✅ CORRECT - Type-safe navigation with audit
function usePatientNavigation() {
  const navigate = useNavigate();

  const goToPatient = (patientId: PatientId) => {
    navigate({
      to: '/patients/$patientId',
      params: { patientId },
      search: {
        referrer: 'patient-list',
        timestamp: Date.now(),
        auditTrail: true,
      },
    });
  };

  return { goToPatient };
}
```

### Protected Routes

```typescript
// ✅ CORRECT - Route protection with healthcare context
export const protectedPatientRoute = createFileRoute('/patients/$patientId')({
  beforeLoad: ({ params, context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/login' });
    }

    if (!hasPatientAccess(context.user.id, params.patientId)) {
      throw new HealthcareError('Acesso negado ao prontuário', {
        patientId: params.patientId,
        userId: context.user.id,
        action: 'view_patient',
        severity: 'high',
      });
    }
  },
  loader: async ({ params, context }) => {
    // LGPD audit required
    await logPatientAccess({
      patientId: params.patientId,
      userId: context.user.id,
      action: 'view',
      timestamp: new Date(),
    });
    return await getPatientData(params.patientId);
  },
});
```

## 🏗️ Vite Build Optimization

### Healthcare-Optimized Configuration

```typescript
// vite.config.ts - Optimized for clinic environment
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020', // Clinic devices compatibility
    rollupOptions: {
      output: {
        manualChunks: {
          'healthcare-core': [
            'src/components/patient',
            'src/components/appointment',
            'src/components/emergency',
          ],
          admin: ['src/components/admin', 'src/components/reports'],
          vendor: ['react', 'react-dom', '@tanstack/react-router'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB for critical features
  },
  server: {
    host: '0.0.0.0', // Local network access
    port: 3000,
  },
});
```

### Performance Monitoring

```typescript
// ✅ CORRECT - Healthcare-critical performance monitoring
function initHealthcareMetrics() {
  onLCP(metric => {
    // LCP < 2.5s critical for emergency forms
    if (metric.value > 2500) {
      reportHealthcareMetric('lcp_slow', {
        value: metric.value,
        page: window.location.pathname,
        severity: 'critical',
        impact: 'emergency_response_delay',
      });
    }
  });

  // Patient record loading SLA: < 1.5s
  performance.mark('patient-load-start');
  // ... data loading
  performance.mark('patient-load-end');
  performance.measure('patient-load', 'patient-load-start', 'patient-load-end');
}
```

## ⚛️ React 19 Healthcare Patterns

### Optimistic Updates for Patient Records

```typescript
// ✅ CORRECT - useOptimistic for patient updates
function usePatientUpdates(patientId: PatientId) {
  const [patient, setPatient] = useState<Patient>();
  const [optimisticPatient, updateOptimisticPatient] = useOptimistic(
    patient,
    (current, update: Partial<Patient>) => ({ ...current, ...update }),
  );
  const [isPending, startTransition] = useTransition();

  const updatePatient = async (updates: Partial<Patient>) => {
    updateOptimisticPatient(updates);

    startTransition(async () => {
      try {
        await updatePatientInDatabase(patientId, updates);
        await logPatientUpdate({
          patientId,
          changes: updates,
          timestamp: new Date(),
        });
        setPatient(prev => ({ ...prev, ...updates }));
      } catch (error) {
        setPatient(patient); // Revert optimistic update
        throw new HealthcareError('Falha ao atualizar prontuário', {
          patientId,
          action: 'update',
          severity: 'high',
        });
      }
    });
  };

  return { optimisticPatient, updatePatient, isPending };
}
```

### Component Structure

```typescript
// ✅ CORRECT - Well-structured component with React 19
interface PatientCardProps {
  patient: Patient;
  onEdit: (patientId: PatientId) => void;
  onDelete: (patientId: PatientId) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function PatientCard({
  patient,
  onEdit,
  onDelete,
  readOnly = false,
  className,
  'data-testid': testId,
}: PatientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      setIsDeleting(true);
      try {
        await onDelete(patient.id);
        await logHealthcareAction({
          action: 'delete_patient',
          patientId: patient.id,
          timestamp: new Date(),
        });
      } catch (error) {
        throw new HealthcareError('Falha ao excluir paciente', {
          patientId: patient.id,
          action: 'delete',
          severity: 'critical',
        });
      } finally {
        setIsDeleting(false);
      }
    });
  };

  if (!patient) {
    return <PatientCardSkeleton />;
  }

  return (
    <Card
      className={cn('patient-card', className, {
        'opacity-50': isPending,
        'cursor-not-allowed': isDeleting,
      })}
      data-testid={testId}
    >
      {/* Component content */}
    </Card>
  );
}
```

### Concurrent Data Loading

```typescript
// ✅ CORRECT - Suspense with concurrent features
function PatientDataProvider({ patientId, children }: {
  patientId: PatientId;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<PatientDataSkeleton />}>
      <PatientDataBoundary patientId={patientId}>
        {children}
      </PatientDataBoundary>
    </Suspense>
  );
}

function PatientDataBoundary({ patientId, children }: {
  patientId: PatientId;
  children: React.ReactNode;
}) {
  const patientPromise = getPatientData(patientId);
  const patient = use(patientPromise); // React 19 'use' hook

  if (!patient || !hasPatientAccess(patient.id)) {
    throw new HealthcareError('Acesso ao paciente não autorizado');
  }

  return (
    <PatientContext.Provider value={patient}>
      {children}
    </PatientContext.Provider>
  );
}
```

## 🗄️ Supabase Healthcare Integration

### Row Level Security for Patient Data

```sql
-- ✅ CORRECT - RLS for healthcare data protection
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

-- Automatic LGPD audit
CREATE POLICY "audit_patient_access" ON patient_audit_log
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
```

### Supabase Client Configuration

```typescript
// ✅ CORRECT - Healthcare-configured Supabase client
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Extra security for clinic environment
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Limited for clinic stability
      },
    },
    global: {
      headers: {
        'X-Healthcare-App': 'NeonPro',
        'X-Compliance': 'LGPD-ANVISA',
      },
    },
  },
);

// Healthcare-specific query helpers
export const healthcareQueries = {
  async getPatientWithAudit(patientId: string) {
    // Automatic audit
    await supabase.from('patient_audit_log').insert({
      patient_id: patientId,
      action: 'view',
      timestamp: new Date().toISOString(),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    return supabase.from('patients').select('*').eq('id', patientId).single();
  },
};
```

### Real-time Healthcare Subscriptions

```typescript
// ✅ CORRECT - Real-time subscriptions for clinics
function useAppointmentUpdates(clinicId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            showHealthcareNotification({
              type: 'new_appointment',
              message: 'Novo agendamento recebido',
              priority: 'medium',
            });
          }

          if (
            payload.eventType === 'UPDATE'
            && payload.new.status === 'emergency'
          ) {
            showHealthcareNotification({
              type: 'emergency',
              message: 'Agendamento de emergência!',
              priority: 'critical',
            });
          }

          setAppointments(prev => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prev, payload.new as Appointment];
              case 'UPDATE':
                return prev.map(apt =>
                  apt.id === payload.new.id
                    ? (payload.new as Appointment)
                    : apt
                );
              case 'DELETE':
                return prev.filter(apt => apt.id !== payload.old.id);
              default:
                return prev;
            }
          });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clinicId]);

  return appointments;
}
```

## 🎨 shadcn/ui Healthcare Components

### Healthcare Button Variants

```typescript
// ✅ CORRECT - Healthcare-specific button variants
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
        lg: 'h-12 px-6 text-base', // Larger for clinic tablets
        xl: 'h-14 px-8 text-lg', // Extra large for emergencies
      },
    },
    defaultVariants: {
      variant: 'healthcare',
      size: 'md',
    },
  },
);
```

### Healthcare Card Patterns

```typescript
// ✅ CORRECT - Card for sensitive data
interface PatientDataCardProps {
  patient: Patient;
  accessLevel: 'public' | 'sensitive' | 'confidential';
  showSensitiveData?: boolean;
  className?: string;
}

export function PatientDataCard({
  patient,
  accessLevel,
  showSensitiveData = false,
  className,
}: PatientDataCardProps) {
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
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            {patient.name}
          </CardTitle>
          <Badge variant={accessLevel === 'confidential' ? 'destructive' : 'secondary'}>
            {accessLevel === 'public' && 'Dados Públicos'}
            {accessLevel === 'sensitive' && 'Dados Sensíveis'}
            {accessLevel === 'confidential' && 'Confidencial'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-2'>
          <p>ID: {patient.id}</p>
          {(accessLevel === 'public' || showSensitiveData) && <p>CPF: {patient.cpf}</p>}
          {accessLevel === 'confidential' && showSensitiveData && (
            <div className='p-3 bg-red-100 rounded border border-red-200'>
              <p className='text-sm text-red-800 font-medium'>
                ⚠️ Informações confidenciais - Acesso restrito
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Emergency Alert Component

```typescript
// ✅ CORRECT - Accessible emergency alert
interface EmergencyAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  patientName?: string;
  onAcknowledge: () => void;
  autoFocus?: boolean;
}

export function EmergencyAlert({
  severity,
  message,
  patientName,
  onAcknowledge,
  autoFocus = false,
}: EmergencyAlertProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && severity === 'critical' && alertRef.current) {
      alertRef.current.focus();
    }
  }, [autoFocus, severity]);

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
      role='alert'
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
      aria-atomic='true'
      tabIndex={-1}
    >
      <AlertTriangle className='h-5 w-5' />
      <AlertTitle className='text-lg font-semibold'>
        {severity === 'critical' && '🚨 '}
        Alerta {severity === 'critical' ? 'CRÍTICO' : severity.toUpperCase()}
        {patientName && ` - ${patientName}`}
      </AlertTitle>
      <AlertDescription className='text-base'>
        {message}
      </AlertDescription>

      <div className='mt-4'>
        <Button
          variant={severity === 'critical' ? 'destructive' : 'default'}
          onClick={onAcknowledge}
          size={severity === 'critical' ? 'lg' : 'default'}
        >
          Reconhecer Alerta
        </Button>
      </div>
    </Alert>
  );
}
```

## 🧪 Testing Standards

### Vitest Healthcare Testing Patterns

```typescript
// ✅ CORRECT - Healthcare tests with Vitest
describe('PatientService - Healthcare Security', () => {
  let patientService: PatientService;
  let mockAuditLog: any;

  beforeEach(() => {
    patientService = new PatientService();
    mockAuditLog = vi.spyOn(patientService, 'logPatientAccess');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPatient', () => {
    it('should create patient with valid data and log audit', async () => {
      const authorizedUser = createMockUser({ role: 'doctor' });
      const validPatientData = createMockPatient({
        fullName: 'João Silva',
        cpf: '123.456.789-00',
        dateOfBirth: new Date('1990-01-01'),
      });

      const result = await patientService.createPatient(
        validPatientData,
        authorizedUser,
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data?.fullName).toBe(validPatientData.fullName);

      expect(mockAuditLog).toHaveBeenCalledWith({
        action: 'create_patient',
        patientId: result.data?.id,
        userId: authorizedUser.id,
        timestamp: expect.any(Date),
      });
    });

    it('should reject patient creation without proper authorization', async () => {
      const unauthorizedUser = createMockUser({ role: 'receptionist' });
      const patientData = createMockPatient();

      await expect(
        patientService.createPatient(patientData, unauthorizedUser),
      ).rejects.toThrow('Permissão insuficiente para criar pacientes');
    });

    it('should validate CPF format and reject invalid CPF', async () => {
      const user = createMockUser({ role: 'doctor' });
      const invalidPatientData = createMockPatient({
        cpf: '111.111.111-11', // Invalid CPF
      });

      await expect(
        patientService.createPatient(invalidPatientData, user),
      ).rejects.toThrow('CPF inválido');
    });
  });
});
```

### Integration Testing with MSW

```typescript
// ✅ CORRECT - Integration tests with API mocking
const server = setupServer(
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: 'doctor@clinic.com',
        role: 'doctor',
      },
    });
  }),
  http.get('/rest/v1/patients', ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get('select');

    return HttpResponse.json([
      {
        id: 'patient-1',
        name: 'João Silva',
        ...(select?.includes('cpf') ? { cpf: '123.456.789-00' } : {}),
      },
    ]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### E2E Testing with Playwright

```typescript
// ✅ CORRECT - E2E tests for critical healthcare flows
test.describe('Emergency Patient Registration', () => {
  test('should allow quick patient registration in emergency scenarios', async ({ page }) => {
    await page.goto('/emergency/register');

    await page.fill('[data-testid="patient-name"]', 'Maria Silva');
    await page.fill('[data-testid="patient-cpf"]', '987.654.321-00');
    await page.selectOption('[data-testid="emergency-level"]', 'high');

    await page.click('[data-testid="emergency-submit"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL(/\/patients\/.*\/emergency/);

    const auditLogs = await page.request.get(
      '/api/audit-logs?action=emergency_registration',
    );
    expect(auditLogs.ok()).toBeTruthy();
  });

  test('should handle LGPD consent flow during registration', async ({ page }) => {
    await page.goto('/patients/register');

    await page.fill('[data-testid="patient-name"]', 'Pedro Santos');
    await page.fill('[data-testid="patient-email"]', 'pedro@email.com');

    await expect(
      page.locator('[data-testid="lgpd-consent-dialog"]'),
    ).toBeVisible();

    await page.check('[data-testid="consent-data-processing"]');
    await page.check('[data-testid="consent-medical-records"]');
    await page.click('[data-testid="accept-consent"]');

    await page.click('[data-testid="register-patient"]');

    await expect(
      page.locator('[data-testid="consent-confirmation"]'),
    ).toBeVisible();
  });
});
```

## 🔒 Security & LGPD Standards

### Data Privacy

```typescript
// ✅ CORRECT - Protected sensitive data
interface PatientPublicView {
  id: PatientId;
  firstName: string; // Only first name
  appointmentCount: number;
  lastVisit: Date;
  // CPF, address, phone omitted
}

function getPatientPublicView(patient: Patient): PatientPublicView {
  return {
    id: patient.id,
    firstName: patient.personalInfo.fullName.split(' ')[0],
    appointmentCount: patient.appointments.length,
    lastVisit: patient.lastAppointment?.date ?? new Date(),
  };
}

// ❌ INCORRECT - Exposing sensitive data
function getPatientData(patient: Patient) {
  return patient; // Exposes all data
}
```

### Input Validation

```typescript
// ✅ CORRECT - Comprehensive input validation
const validatePatientInput = z.object({
  fullName: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .refine(validateCPF),
  email: z.string().email(),
  phone: z.string().regex(/^\+55\d{2}\d{8,9}$/),
});

// ❌ INCORRECT - No validation
function createPatient(data: any) {
  // Direct database insert without validation
}
```

## 📊 Performance Standards

### Bundle Optimization

```typescript
// ✅ CORRECT - Specific imports
import { formatDate } from '@neonpro/utils/date';
import { validateCPF } from '@neonpro/utils/validation';

// ❌ INCORRECT - Full import
import * as utils from '@neonpro/utils';
```

### Component Lazy Loading

```typescript
// ✅ CORRECT - Lazy loading for heavy components
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

## 📝 Documentation Standards

### Code Comments

```typescript
// ✅ CORRECT - Explains the "why"
// Apply special discount for SUS patients according to
// ANVISA 2023 regulation, article 15.3
const susDiscount = basePrice * 0.15;

/**
 * Calculate average wait time considering medical priorities
 *
 * Emergency patients have maximum priority (0 min wait)
 * Patients with comorbidities have high priority (up to 15 min)
 * Routine consultations follow arrival order
 */
function calculateWaitTime(
  appointments: Appointment[],
  priority: MedicalPriority,
): number {
  // Implementation...
}

// ❌ INCORRECT - Obvious comment
// Increment counter
counter++;
```

## ✅ Quality Checklist

### Pre-Commit Checklist

- [ ] Code follows KISS, YAGNI, and Chain of Thought principles
- [ ] Complete and accurate TypeScript types
- [ ] Tests written for critical business logic
- [ ] No sensitive data leaks
- [ ] Performance optimized (imports, lazy loading)
- [ ] Consistent healthcare nomenclature
- [ ] Error handling with healthcare context
- [ ] LGPD compliance verified

### Code Review Checklist

- [ ] Architecture aligned with project patterns
- [ ] Data security and privacy
- [ ] Accessibility (WCAG 2.1 AA+)
- [ ] Cross-browser compatibility
- [ ] Performance and optimization
- [ ] Adequate tests and ≥90% coverage

---

**Status**: ✅ **ACTIVE - OPTIMIZED**
**Version**: 3.0.0
**Last Updated**: 2025-09-09
**Quality Target**: ≥9.5/10
**Tech Stack Alignment**: ✅ Complete

---
