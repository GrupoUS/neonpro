# DEVELOPMENT PATTERNS - NEONPRO TECHNICAL STANDARDS

## TYPESCRIPT HEALTHCARE PATTERNS

### Code Style Guidelines
- **ALWAYS** use ES modules (import/export) syntax, NOT CommonJS (require)
- **MANDATORY** destructure imports: `import { foo } from 'bar'`
- **CRITICAL** TypeScript strict mode compliance required
- **REQUIRED** Multi-tenant isolation for clinic data: `clinic_id = auth.uid()`
- **ESSENTIAL** Audit trails for patient data access
- **MANDATORY** Encryption for sensitive medical information

### Character Encoding & Unicode Safety Rules
- **FORBIDDEN** Use of emojis or Unicode symbols in code, comments, or documentation
- **REQUIRED** ASCII-only characters in all code files to prevent UTF-16 surrogate issues
- **MANDATORY** Remove all emojis and Unicode symbols from documentation
- **CRITICAL** Use only basic ASCII punctuation: - * + = | < > ( ) [ ] { } " ' ` : ; , . ! ?
- **PROHIBITED** Characters: Any Unicode above U+007F (127) in source code
- **REQUIRED** UTF-8 encoding for all files, but content must be ASCII-safe for API compatibility

## NEXT.JS 15 HEALTHCARE PATTERNS

### Server Components Pattern (Mandatory for Patient Data)
```typescript
// Server Components - Always use server client for patient data
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedMedicalPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) redirect('/login')
  
  // CRITICAL: Multi-tenant isolation for clinic data
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id) // Multi-tenant isolation
    .eq('active', true) // Only active patient records
    .order('created_at', { ascending: false })
  
  // MANDATORY: Audit trail for patient data access
  await supabase
    .from('audit_log')
    .insert({
      user_id: session.user.id,
      action: 'view_patients',
      resource: 'patients',
      clinic_id: session.user.id,
      ip_address: headers().get('x-forwarded-for'),
      timestamp: new Date().toISOString()
    })
    
  return <PatientManagementInterface patients={patients} />
}
```

### Client Components Pattern
```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Healthcare form validation schema
const healthcareSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\\d{11}$/, 'CPF deve ter 11 dígitos'),
  consent_lgpd: z.boolean().refine(val => val === true, {
    message: 'Consentimento LGPD é obrigatório'
  })
})

export default function HealthcareForm() {
  const form = useForm({
    resolver: zodResolver(healthcareSchema),
    defaultValues: { name: '', email: '', phone: '', cpf: '', consent_lgpd: false }
  })

  const onSubmit = async (data) => {
    try {
      const supabase = createBrowserClient()
      
      // Multi-tenant data creation with audit trail
      const { data: result, error } = await supabase
        .from('patients')
        .insert({ ...data, clinic_id: session.user.id })
        .select()
      
      if (error) throw error
      toast.success('Paciente criado com sucesso')
    } catch (error) {
      toast.error('Erro ao criar paciente')
      console.error('Creation error:', error)
    }
  }
}
```

## SUPABASE INTEGRATION PATTERNS

### Database Query Patterns
```typescript
// Multi-tenant query pattern
const fetchClinicData = async (table: string, filters: any = {}) => {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Unauthorized')
  
  return await supabase
    .from(table)
    .select('*')
    .eq('clinic_id', session.user.id) // CRITICAL: Multi-tenant isolation
    .match(filters)
    .order('created_at', { ascending: false })
}

// Real-time subscription pattern
const useRealtimeData = (table: string) => {
  const [data, setData] = useState([])
  const supabase = createBrowserClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: `clinic_id=eq.${session.user.id}` // Multi-tenant filter
        }, 
        (payload) => {
          // Handle real-time updates
          setData(current => handleRealtimeUpdate(current, payload))
        }
      )
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }, [table])
  
  return data
}
```

### Edge Functions Pattern
```typescript
// Healthcare-compliant edge function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabase.auth.getUser(authHeader)
    
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Healthcare processing with multi-tenant isolation
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', user.id) // Multi-tenant isolation
    
    // Log for audit trail
    await supabase
      .from('audit_log')
      .insert({
        user_id: user.id,
        action: 'edge_function_access',
        resource: 'patients',
        clinic_id: user.id,
        timestamp: new Date().toISOString()
      })
    
    return new Response(JSON.stringify({ 
      data, 
      compliance: { audit_logged: true, lgpd_compliant: true } 
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

## TESTING PATTERNS

### Healthcare Testing Strategy
```typescript
// Jest test for healthcare functions
describe('Healthcare Patient Management', () => {
  beforeEach(() => {
    // Setup test database with multi-tenant isolation
    mockSupabase.mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: mockPatient, error: null })
    }))
  })

  test('should create patient with LGPD compliance', async () => {
    const patientData = {
      name: 'Test Patient',
      cpf: '12345678901',
      consent_lgpd: true,
      clinic_id: 'test-clinic-id'
    }
    
    const result = await createPatient(patientData)
    
    expect(result.compliance.lgpd_compliant).toBe(true)
    expect(result.compliance.audit_logged).toBe(true)
    expect(mockSupabase().from).toHaveBeenCalledWith('patients')
    expect(mockSupabase().eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
  })
  
  test('should enforce multi-tenant isolation', async () => {
    const query = await fetchPatients('test-clinic-id')
    
    expect(mockSupabase().eq).toHaveBeenCalledWith('clinic_id', 'test-clinic-id')
  })
})

// E2E testing with Playwright
test('Patient management workflow', async ({ page }) => {
  await page.goto('/patients')
  
  // Test authentication
  await expect(page).toHaveURL('/login')
  
  // Login and test multi-tenant isolation
  await page.fill('[data-testid="email"]', 'clinic@test.com')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login"]')
  
  // Verify only clinic's patients are shown
  await page.waitForSelector('[data-testid="patient-list"]')
  const patients = await page.locator('[data-testid="patient-item"]').count()
  expect(patients).toBeGreaterThan(0)
  
  // Test LGPD compliance
  await page.click('[data-testid="add-patient"]')
  await page.fill('[data-testid="patient-name"]', 'Test Patient')
  await page.fill('[data-testid="patient-cpf"]', '12345678901')
  await page.check('[data-testid="consent-lgpd"]') // LGPD consent required
  await page.click('[data-testid="save-patient"]')
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## PERFORMANCE OPTIMIZATION PATTERNS

### Caching Strategy
```typescript
// Multi-level caching with healthcare compliance
const cachePatientData = async (clinicId: string, patientId: string) => {
  const cacheKey = `patient:${clinicId}:${patientId}`
  
  // L1: In-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }
  
  // L2: Redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    memoryCache.set(cacheKey, JSON.parse(cached), 300) // 5min TTL
    return JSON.parse(cached)
  }
  
  // L3: Database with audit trail
  const supabase = createServerClient()
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('clinic_id', clinicId) // Multi-tenant isolation
    .single()
  
  // Cache with compliance metadata
  const cacheData = {
    ...data,
    _cached_at: new Date().toISOString(),
    _compliance: { lgpd_compliant: true, audit_logged: true }
  }
  
  await redis.setex(cacheKey, 1800, JSON.stringify(cacheData)) // 30min TTL
  memoryCache.set(cacheKey, cacheData, 300) // 5min TTL
  
  return cacheData
}
```

### Database Optimization
```typescript
// Optimized queries with proper indexing
const getPatientHistory = async (patientId: string, clinicId: string) => {
  return await supabase
    .from('medical_records')
    .select(`
      id,
      diagnosis,
      treatment_plan,
      created_at,
      appointments!inner(
        id,
        scheduled_at,
        status,
        services(name, duration)
      )
    `)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId) // Multi-tenant isolation
    .eq('appointments.status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)
}

// Batch operations for performance
const batchUpdatePatients = async (updates: PatientUpdate[], clinicId: string) => {
  const results = await Promise.allSettled(
    updates.map(update => 
      supabase
        .from('patients')
        .update(update.data)
        .eq('id', update.id)
        .eq('clinic_id', clinicId) // Multi-tenant isolation
        .select()
    )
  )
  
  return results.map((result, index) => ({
    id: updates[index].id,
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value.data : null,
    error: result.status === 'rejected' ? result.reason : null
  }))
}
```

## ERROR HANDLING PATTERNS

```typescript
// Healthcare-specific error handling
class HealthcareError extends Error {
  constructor(
    message: string,
    public code: string,
    public patientId?: string,
    public clinicId?: string
  ) {
    super(message)
    this.name = 'HealthcareError'
  }
}

const handleHealthcareOperation = async (operation: () => Promise<any>) => {
  try {
    return await operation()
  } catch (error) {
    // Log for audit trail
    await logHealthcareError(error, {
      timestamp: new Date().toISOString(),
      operation: operation.name,
      user_id: session?.user?.id,
      clinic_id: session?.user?.id
    })
    
    // Patient safety first - fail safely
    if (error instanceof HealthcareError) {
      throw error
    }
    
    throw new HealthcareError(
      'Erro interno do sistema médico',
      'INTERNAL_HEALTHCARE_ERROR'
    )
  }
}
```

## ACTIVATION KEYWORDS
**Auto-load when detected**: "implement", "refactor", "debug", "typescript", "supabase", "nextjs", "development", "code", "pattern", "test", "performance", "error", "api", "database", "query"