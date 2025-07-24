# NEONPRO CODE PATTERNS & EXAMPLES

## Next.js 15 Healthcare Patterns

### Healthcare Authentication Pattern (Mandatory)

```typescript
// Server Components - Always use server client for patient data
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedMedicalPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // LGPD Compliance: Multi-tenant isolation for clinic data
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id) // Multi-tenant isolation
    .eq('active', true) // Only active patient records
    .order('created_at', { ascending: false })
  
  // Audit trail for patient data access
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

### Healthcare Client Component Pattern

```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// LGPD-compliant patient data schema
const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  birthdate: z.date(),
  consent_lgpd: z.boolean().refine(val => val === true, {
    message: 'Consentimento LGPD é obrigatório'
  }),
  consent_marketing: z.boolean().optional(),
  // Healthcare-specific fields
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  emergency_contact: z.string().min(10, 'Contato de emergência obrigatório')
})

type PatientFormData = z.infer<typeof patientSchema>

export default function PatientForm() {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { 
      name: '', 
      email: '', 
      phone: '', 
      cpf: '',
      consent_lgpd: false,
      consent_marketing: false 
    }
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      const supabase = createBrowserClient()
      
      // LGPD Compliance: Log consent
      await supabase
        .from('consent_log')
        .insert({
          patient_cpf: data.cpf,
          consent_type: 'data_processing',
          consent_given: data.consent_lgpd,
          timestamp: new Date().toISOString(),
          ip_address: await fetch('/api/get-ip').then(r => r.text())
        })
      
      // Create patient with encrypted sensitive data
      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          ...data,
          // Encrypt sensitive medical data
          medical_conditions: data.medical_conditions ? encrypt(data.medical_conditions) : null,
          allergies: data.allergies ? encrypt(data.allergies) : null,
          medications: data.medications ? encrypt(data.medications) : null
        })
        .select()
      
      if (error) throw error
      
      toast.success('Paciente criado com sucesso')
    } catch (error) {
      toast.error('Erro ao criar paciente')
      console.error('Patient creation error:', error)
    }
  }
}
```

## Supabase Healthcare Configuration

### Healthcare Row Level Security (RLS) Policies

```sql
-- Multi-tenant isolation for clinic data
CREATE POLICY "Users can only access their clinic data" ON patients
FOR ALL USING (clinic_id = auth.uid());

-- LGPD compliance: Soft delete policy
CREATE POLICY "Soft delete for LGPD compliance" ON patients
FOR SELECT USING (deleted_at IS NULL OR deleted_at > NOW() - INTERVAL '5 years');

-- Audit trail policy
CREATE POLICY "Audit log access" ON audit_log
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Healthcare staff access control
CREATE POLICY "Healthcare staff can access assigned patients" ON patients
FOR SELECT USING (
  clinic_id IN (
    SELECT clinic_id FROM staff_assignments 
    WHERE user_id = auth.uid() AND active = true
  )
);
```

### Healthcare Database Schema

```sql
-- Patient table with LGPD compliance
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  birthdate DATE NOT NULL,
  medical_conditions TEXT, -- Encrypted
  allergies TEXT, -- Encrypted
  medications TEXT, -- Encrypted
  emergency_contact TEXT NOT NULL,
  consent_lgpd BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete for LGPD
  CONSTRAINT valid_cpf CHECK (cpf ~ '^\d{11}$')
);

-- Audit trail for LGPD compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  clinic_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- Consent management for LGPD
CREATE TABLE consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_cpf TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  legal_basis TEXT NOT NULL DEFAULT 'consent',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason TEXT
);
```

## TypeScript Healthcare Types

### Medical Data Types

```typescript
// Healthcare-specific type definitions
export interface Patient {
  id: string
  clinic_id: string
  name: string
  email?: string
  phone: string
  cpf: string
  birthdate: Date
  medical_conditions?: string // Encrypted
  allergies?: string // Encrypted
  medications?: string // Encrypted
  emergency_contact: string
  consent_lgpd: boolean
  consent_marketing: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date // Soft delete for LGPD
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  professional_id: string
  service_id: string
  scheduled_at: Date
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  procedure_performed?: string
  materials_used?: string[]
  photos_before?: string[]
  photos_after?: string[]
  consent_procedure: boolean
  created_at: Date
  updated_at: Date
}

export interface MedicalRecord {
  id: string
  patient_id: string
  clinic_id: string
  appointment_id: string
  diagnosis?: string
  treatment_plan?: string
  medications_prescribed?: MedicationPrescription[]
  follow_up_date?: Date
  notes: string
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface MedicationPrescription {
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

// LGPD compliance types
export interface ConsentRecord {
  id: string
  patient_cpf: string
  consent_type: 'data_processing' | 'marketing' | 'procedure'
  consent_given: boolean
  legal_basis: 'consent' | 'legitimate_interest' | 'vital_interest' | 'public_task'
  timestamp: Date
  ip_address?: string
  revoked_at?: Date
  revocation_reason?: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource: string
  resource_id?: string
  clinic_id: string
  ip_address?: string
  user_agent?: string
  timestamp: Date
  details?: Record<string, any>
}
```

### Healthcare API Response Types

```typescript
// Standardized healthcare API responses
export interface HealthcareApiResponse<T> {
  data: T
  success: boolean
  message?: string
  compliance: {
    lgpd_compliant: boolean
    audit_logged: boolean
    consent_verified: boolean
  }
  performance: {
    response_time_ms: number
    cache_hit: boolean
  }
}

export interface AppointmentAvailability {
  professional_id: string
  available_slots: Date[]
  blocked_slots: Date[]
  working_hours: {
    start: string
    end: string
    break_start?: string
    break_end?: string
  }
  timezone: string
}

export interface ClinicMetrics {
  total_patients: number
  active_patients: number
  appointments_today: number
  appointments_week: number
  revenue_month: number
  no_show_rate: number
  patient_satisfaction: number
  compliance_score: number
}
```

## Healthcare-Specific BMad Agents

### Medical Data Analyst Agent

```yaml
MEDICAL_DATA_ANALYST_AGENT:
  specialization: "LGPD compliance, patient data handling, medical analytics, audit trails"
  
  core_responsibilities:
    - "Ensure all patient data operations comply with LGPD requirements"
    - "Implement proper encryption for sensitive medical information"
    - "Design and maintain audit trails for all patient data access"
    - "Optimize database queries for healthcare performance requirements"
    - "Implement data anonymization and pseudonymization techniques"
    
  healthcare_patterns:
    - "Multi-tenant data isolation for clinic management"
    - "Consent management and tracking systems"
    - "Medical data retention and deletion policies"
    - "Real-time compliance monitoring and alerting"
    - "Healthcare analytics while preserving patient privacy"
```

### Healthcare UX Specialist Agent

```yaml
HEALTHCARE_UX_SPECIALIST_AGENT:
  specialization: "Patient-centric interfaces, medical workflow optimization, accessibility compliance"
  
  core_responsibilities:
    - "Design intuitive interfaces for healthcare professionals and patients"
    - "Ensure accessibility compliance for medical environments"
    - "Optimize appointment booking and patient management workflows"
    - "Implement responsive design for clinical mobile usage"
    - "Design for high-stress medical environments with error prevention"
```