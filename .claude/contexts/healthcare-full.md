# HEALTHCARE FULL CONTEXT - NEONPRO MEDICAL COMPLIANCE

## BRAZILIAN HEALTHCARE REGULATORY COMPLIANCE

### LGPD Healthcare Requirements
- **Patient Data Protection**: Dados de saúde requerem proteção especial sob LGPD
- **Consent Management**: Consentimento por escrito para finalidade específica obrigatório
- **Data Subject Rights**: Confirmação, acesso, correção, anonimização, exclusão, portabilidade
- **Audit Trail**: Manter trilha de auditoria para todas as operações com dados de pacientes
- **Encryption**: Criptografia obrigatória para dados de saúde em trânsito e em repouso

### ANVISA & CFM Compliance
- **SaMD Compliance**: Software as Medical Device regulations (RDC 657/2022)
- **CFM Digital Health**: Telemedicine regulations (Resolution 2.314/2022)
- **Technical Responsibility**: Médico regularmente inscrito no CRM obrigatório

## HEALTHCARE AUTHENTICATION PATTERNS

### Multi-Tenant Healthcare Isolation
```typescript
// Server Components - Always for patient data
const supabase = createServerClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

// CRITICAL: Multi-tenant isolation for clinic data
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', session.user.id) // Multi-tenant isolation
  .eq('active', true) // Only active records
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
```

## HEALTHCARE DATABASE PATTERNS

### Patient Data Schema (LGPD Compliant)
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
  CONSTRAINT valid_cpf CHECK (cpf ~ '^\\d{11}$')
);

-- Multi-tenant isolation RLS
CREATE POLICY "Users can only access their clinic data" ON patients
FOR ALL USING (clinic_id = auth.uid());

-- LGPD compliance: Soft delete policy
CREATE POLICY "Soft delete for LGPD compliance" ON patients
FOR SELECT USING (deleted_at IS NULL OR deleted_at > NOW() - INTERVAL '5 years');
```

### Audit Trail Implementation
```sql
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

## HEALTHCARE TYPESCRIPT TYPES

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
```

## HEALTHCARE WORKFLOW PATTERNS

### Patient Data Form with LGPD Compliance
```typescript
// LGPD-compliant patient data schema
const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\\d{11}$/, 'CPF deve ter 11 dígitos'),
  birthdate: z.date(),
  consent_lgpd: z.boolean().refine(val => val === true, {
    message: 'Consentimento LGPD é obrigatório'
  }),
  consent_marketing: z.boolean().optional(),
  medical_conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  emergency_contact: z.string().min(10, 'Contato de emergência obrigatório')
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
```

## HEALTHCARE AI ENGINE INTEGRATION

### Treatment Success Prediction
```yaml
AI_HEALTHCARE_MODELS:
  treatment_success_prediction:
    model: "TensorFlow Deep Neural Network"
    accuracy: "≥85% prediction accuracy"
    features: "Patient profile, treatment history, skin analysis, lifestyle factors"
    inference_time: "<300ms"
    
  no_show_probability_calculator:
    model: "XGBoost Gradient Boosting"
    accuracy: "≥80% prediction accuracy"
    features: "Historical patterns, weather, demographics, appointment timing"
    inference_time: "<200ms"
    
  computer_vision_analysis:
    model: "ResNet-50 + Custom CNN"
    accuracy: "≥90% skin analysis accuracy"
    features: "Before/after photos, skin condition detection, progress tracking"
    inference_time: "<500ms"
```

## HEALTHCARE PERFORMANCE TARGETS

- **API Response Time**: <100ms (P95) for patient data access
- **Patient Data Access**: <50ms (P95) para dados críticos de pacientes
- **AI Inference Latency**: <500ms para todos os modelos de ML
- **System Availability**: ≥99.99% uptime for clinical operations
- **LGPD Compliance**: 100% for all patient data operations
- **Quality Threshold**: ≥9.5/10 maintained across all medical operations

## HEALTHCARE QUALITY GATES

```yaml
HEALTHCARE_QUALITY_GATES:
  patient_safety:
    medical_accuracy: "≥9.8/10 clinical accuracy (CRITICAL)"
    safety_protocols: "100% patient safety protocol implementation"
    error_prevention: "Comprehensive medical error prevention systems"
    
  regulatory_compliance:
    lgpd_compliance: "100% LGPD compliance for all patient data operations"
    anvisa_compliance: "Full ANVISA SaMD compliance where applicable"
    cfm_compliance: "Complete CFM digital health regulation adherence"
    
  clinical_performance:
    response_time: "≤300ms for critical patient data access operations"
    availability: "≥99.97% system availability for clinical operations"
    scalability: "Support for ≥10,000 concurrent patient records per clinic"
```

## DETAILED REGULATORY COMPLIANCE REQUIREMENTS

### LGPD Healthcare Specific Implementation
```yaml
LGPD_HEALTHCARE_DETAILED:
  patient_data_protection:
    sensitive_health_data: "Dados de saúde requerem proteção especial sob LGPD"
    consent_management: "Consentimento por escrito para finalidade específica - autorizações gerais são nulas"
    data_subject_rights: "Direitos dos titulares: confirmação, acesso, correção, anonimização, exclusão, portabilidade"
    
  clinic_compliance_obligations:
    dpo_requirement: "Encarregado de Dados obrigatório para processamento de dados sensíveis de saúde"
    legal_basis_documentation: "Documentar base legal para cada processamento de dados médicos"
    audit_trail: "Manter trilha de auditoria para todas as operações com dados de pacientes"
```

### ANVISA SaMD Detailed Requirements
```yaml
ANVISA_SAMD_DETAILED:
  regulatory_framework:
    rdc_657_2022: "Regulamentação para software como dispositivo médico (SaMD)"
    cybersecurity_requirements: "Requisitos específicos de cibersegurança para dispositivos médicos"
    electronic_ifu: "Instruções de uso em formato eletrônico para dispositivos médicos"
    
  compliance_obligations:
    good_manufacturing_practices: "Boas Práticas de Fabricação (B-GMP) obrigatórias"
    brazil_registration_holder: "Detentor de Registro no Brasil (BRH) obrigatório para fabricantes estrangeiros"
    vigilance_reporting: "Relatórios de vigilância obrigatórios para dispositivos médicos"
    
  software_classification:
    risk_assessment: "Classificação baseada em risco do software médico"
    clinical_evaluation: "Avaliação clínica para softwares de alto risco"
    post_market_surveillance: "Vigilância pós-comercialização obrigatória"
```

### CFM Digital Health Detailed Requirements
```yaml
CFM_DIGITAL_HEALTH_DETAILED:
  telemedicine_regulations:
    resolution_2314_2022: "Define telemedicina como prática médica mediada por TDICs"
    technological_infrastructure: "Infraestrutura tecnológica adequada obrigatória"
    data_security: "Armazenamento, manuseio, integridade, precisão, confidencialidade obrigatórios"
    patient_identification: "Identificação do paciente obrigatória através de dados pessoais"
    
  medical_practice_requirements:
    crm_registration: "Médico regularmente inscrito no CRM obrigatório"
    medical_responsibility: "Responsabilidade médica em telemedicina"
    remote_consultation_standards: "Padrões para consultas médicas remotas"
    medical_record_requirements: "Requisitos para prontuários médicos digitais"
```

## ACTIVATION KEYWORDS
**Auto-load when detected**: "healthcare", "patient", "LGPD", "ANVISA", "CFM", "compliance", "medical", "clinic", "treatment", "diagnosis", "consent", "audit", "encryption"