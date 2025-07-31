# Healthcare System Patterns - NeonPro Architecture

**Last Updated**: 2025-07-30  
**Version**: 1.0  
**Specialization**: Healthcare Architecture with LGPD/ANVISA/CFM Compliance  

## Medical Architecture Overview

### Healthcare System Design Principles
```yaml
HEALTHCARE_ARCHITECTURE_PRINCIPLES:
  security_first:
    - "Multi-tenant isolation as foundation"
    - "Encryption at rest and in transit for medical data"
    - "Row Level Security (RLS) for all patient operations"
    - "Audit logging for every medical data access"
    
  performance_critical:
    - "<100ms response for patient data access"
    - "Real-time synchronization for medical records"
    - "Optimized queries for healthcare operations"
    - "Caching strategies for medical workflows"
    
  compliance_mandatory:
    - "LGPD-compliant by design"
    - "ANVISA medical device software standards"
    - "CFM telemedicine compliance integration"
    - "Automated compliance monitoring"
    
  scalability_healthcare:
    - "Multi-clinic architecture support"
    - "Horizontal scaling for medical loads"
    - "Microservices for healthcare domains"
    - "Event-driven medical workflow processing"
```

## Core Healthcare Patterns

### Multi-Tenant Medical Isolation Pattern
```typescript
// MANDATORY: All healthcare queries must include clinic isolation
export const getPatients = async (session: Session) => {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', session.user.id) // Multi-tenant isolation
    .eq('active', true)
    .order('created_at', { ascending: false });
    
  // MANDATORY: Audit trail for patient data access
  await auditLog({
    user_id: session.user.id,
    action: 'view_patients',
    resource: 'patients',
    clinic_id: session.user.id,
    timestamp: new Date().toISOString()
  });
  
  return { patients, error };
};
```

### Healthcare Data Access Pattern
```typescript
// Healthcare data access with encryption and validation
export const getPatientMedicalRecord = async (
  patientId: string, 
  session: Session
) => {
  // Step 1: Validate clinic ownership
  const patientOwnership = await validatePatientOwnership(patientId, session.user.id);
  if (!patientOwnership) {
    throw new Error('Unauthorized: Patient not in clinic');
  }
  
  // Step 2: Retrieve encrypted medical data
  const { data: medicalRecord } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', session.user.id)
    .single();
    
  // Step 3: Decrypt sensitive medical information
  const decryptedRecord = await decryptMedicalData(medicalRecord);
  
  // Step 4: Audit trail with LGPD compliance
  await auditLog({
    user_id: session.user.id,
    action: 'view_medical_record',
    resource: 'medical_records',
    resource_id: patientId,
    clinic_id: session.user.id,
    lgpd_basis: 'medical_treatment'
  });
  
  return decryptedRecord;
};
```

### LGPD Consent Management Pattern
```typescript
// Patient consent management with LGPD compliance
export const manageLGPDConsent = async (
  patientId: string,
  consentType: string,
  granted: boolean,
  session: Session
) => {
  const consentRecord = {
    patient_id: patientId,
    clinic_id: session.user.id,
    consent_type: consentType,
    granted: granted,
    granted_at: granted ? new Date().toISOString() : null,
    revoked_at: !granted ? new Date().toISOString() : null,
    legal_basis: 'LGPD Article 7',
    ip_address: await getClientIP(),
    user_agent: await getClientUserAgent()
  };
  
  const { data, error } = await supabase
    .from('lgpd_consents')
    .insert(consentRecord);
    
  // Audit trail for consent changes
  await auditLog({
    user_id: session.user.id,
    action: granted ? 'grant_consent' : 'revoke_consent',
    resource: 'lgpd_consents',
    resource_id: patientId,
    clinic_id: session.user.id,
    details: { consent_type: consentType }
  });
  
  return { data, error };
};
```

## Healthcare Frontend Patterns

### Medical Component Architecture
```typescript
// Healthcare component with built-in compliance
interface MedicalComponentProps {
  patientId: string;
  clinicId: string;
  requiredConsent?: string[];
  auditAction: string;
}

export const MedicalDataComponent: React.FC<MedicalComponentProps> = ({
  patientId,
  clinicId,
  requiredConsent = [],
  auditAction
}) => {
  const { data: patient, loading, error } = useMedicalData(
    patientId,
    clinicId,
    requiredConsent,
    auditAction
  );
  
  // MANDATORY: Loading state for medical data
  if (loading) return <MedicalDataSkeleton />;
  
  // MANDATORY: Error handling for healthcare
  if (error) return <MedicalErrorBoundary error={error} />;
  
  // MANDATORY: Consent validation before rendering
  if (!validateConsent(patient, requiredConsent)) {
    return <ConsentRequiredDialog patientId={patientId} />;
  }
  
  return (
    <div className="medical-data-container">
      {/* Medical component implementation */}
    </div>
  );
};
```

### Healthcare Form Validation Pattern
```typescript
// Medical form with LGPD validation
import { z } from 'zod';

const PatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  birth_date: z.string().refine(date => {
    const age = calculateAge(date);
    return age >= 0 && age <= 150;
  }, 'Data de nascimento inválida'),
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Consentimento LGPD é obrigatório'
  })
});

export const PatientForm: React.FC = () => {
  const form = useForm<z.infer<typeof PatientSchema>>({
    resolver: zodResolver(PatientSchema)
  });
  
  const onSubmit = async (data: z.infer<typeof PatientSchema>) => {
    // MANDATORY: Encrypt sensitive data before submission
    const encryptedData = await encryptPatientData(data);
    
    // MANDATORY: Include clinic isolation
    const patientData = {
      ...encryptedData,
      clinic_id: session.user.id,
      created_by: session.user.id
    };
    
    await createPatient(patientData);
  };
  
  return (
    <Form {...form}>
      {/* Form implementation with healthcare validation */}
    </Form>
  );
};
```

## Healthcare Backend Patterns

### Medical API Security Pattern
```typescript
// Healthcare API with complete security
export async function POST(request: Request) {
  try {
    // Step 1: Authentication validation
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access to medical data' },
        { status: 401 }
      );
    }
    
    // Step 2: Request validation and sanitization
    const body = await request.json();
    const validatedData = MedicalRequestSchema.parse(body);
    
    // Step 3: Rate limiting for medical operations
    const rateLimitResult = await checkMedicalRateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Medical API rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Step 4: Business logic with clinic isolation
    const result = await processMedicalOperation({
      ...validatedData,
      clinic_id: session.user.id,
      user_id: session.user.id
    });
    
    // Step 5: Audit trail
    await auditLog({
      user_id: session.user.id,
      action: 'medical_api_call',
      resource: validatedData.resource,
      clinic_id: session.user.id,
      success: true
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    // MANDATORY: Error logging for healthcare
    await logMedicalError(error, session?.user?.id);
    
    return NextResponse.json(
      { error: 'Medical operation failed' },
      { status: 500 }
    );
  }
}
```

### Healthcare Database Pattern
```sql
-- Multi-tenant healthcare database design

-- Patients table with RLS
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  medical_record_number TEXT UNIQUE,
  encrypted_data JSONB, -- Encrypted sensitive information
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for multi-tenant isolation
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_isolation_patients" ON patients
  FOR ALL USING (clinic_id = auth.uid());

-- Audit log table for LGPD compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  clinic_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  lgpd_basis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGPD consent management
CREATE TABLE lgpd_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  clinic_id UUID REFERENCES auth.users(id),
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  legal_basis TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Performance Optimization Patterns

### Healthcare Caching Strategy
```typescript
// Medical data caching with security
export class MedicalDataCache {
  private redis: Redis;
  private encryptionKey: string;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.encryptionKey = process.env.MEDICAL_CACHE_KEY;
  }
  
  async cachePatientData(
    patientId: string,
    clinicId: string,
    data: any,
    ttl: number = 300 // 5 minutes for medical data
  ) {
    const cacheKey = this.generateCacheKey('patient', patientId, clinicId);
    const encryptedData = await encrypt(JSON.stringify(data), this.encryptionKey);
    
    await this.redis.setex(cacheKey, ttl, encryptedData);
  }
  
  async getCachedPatientData(patientId: string, clinicId: string) {
    const cacheKey = this.generateCacheKey('patient', patientId, clinicId);
    const encryptedData = await this.redis.get(cacheKey);
    
    if (!encryptedData) return null;
    
    const decryptedData = await decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(decryptedData);
  }
  
  private generateCacheKey(type: string, id: string, clinicId: string): string {
    return `medical:${type}:${clinicId}:${id}`;
  }
}
```

### Healthcare Query Optimization
```typescript
// Optimized medical queries
export const getPatientAppointments = async (
  patientId: string,
  clinicId: string,
  startDate?: string,
  endDate?: string
) => {
  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      type,
      healthcare_professional:healthcare_professionals(name, specialty),
      patient:patients(name, medical_record_number)
    `)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('appointment_date', { ascending: false });
    
  if (startDate) {
    query = query.gte('appointment_date', startDate);
  }
  
  if (endDate) {
    query = query.lte('appointment_date', endDate);
  }
  
  const { data, error } = await query.limit(50); // Pagination for performance
  
  return { data, error };
};
```

## Healthcare Error Handling Patterns

### Medical Error Boundary
```typescript
// Healthcare-specific error handling
export class MedicalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // MANDATORY: Log medical errors with context
    logMedicalError({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      severity: 'high', // Medical errors are high severity
      patient_safety_impact: true
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="medical-error-container">
          <h2>Erro no Sistema Médico</h2>
          <p>
            Ocorreu um erro no sistema. A equipe técnica foi notificada.
            Por favor, tente novamente ou contate o suporte.
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Tentar Novamente
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Healthcare Integration Patterns

### ANVISA Compliance Pattern
```typescript
// ANVISA medical device software compliance
export const anvisaCompliance = {
  // Software as Medical Device (SAMD) classification
  validateSAMDRequirements: async (feature: string) => {
    const classification = await classifyMedicalFeature(feature);
    
    if (classification.samdClass >= 2) {
      // Class II or higher requires additional validation
      await validateMedicalAlgorithm(feature);
      await documentClinicalEvaluation(feature);
      await performRiskAnalysis(feature);
    }
    
    return classification;
  },
  
  // Quality management system compliance
  implementQMS: async () => {
    await implementDocumentControl();
    await establishTraceability();
    await performVerificationValidation();
    await maintainPostMarketSurveillance();
  },
  
  // Medical device registration
  registerMedicalDevice: async (deviceData: any) => {
    const registrationData = {
      ...deviceData,
      samd_classification: await classifyDevice(deviceData),
      risk_classification: await performRiskClassification(deviceData),
      clinical_evaluation: await getClinicalEvaluation(deviceData),
      post_market_plan: await createPostMarketPlan(deviceData)
    };
    
    return await submitAnvisaRegistration(registrationData);
  }
};
```

### CFM Telemedicine Compliance
```typescript
// CFM Resolution 2.314/2022 compliance
export const cfmTelemedicineCompliance = {
  validateTelemedicineConsultation: async (consultationData: any) => {
    // Validate patient identification
    await validatePatientIdentification(consultationData.patientId);
    
    // Ensure informed consent for telemedicine
    await validateTelemedicineConsent(consultationData.patientId);
    
    // Validate healthcare professional credentials
    await validateProfessionalCRM(consultationData.professionalId);
    
    // Ensure secure communication
    await validateSecureCommunication(consultationData.sessionId);
    
    // Document telemedicine session
    await documentTelemedicineSession(consultationData);
    
    return true;
  },
  
  maintainMedicalRecords: async (sessionId: string) => {
    // Maintain complete medical records as per CFM requirements
    const medicalRecord = await createTelemedicineRecord({
      session_id: sessionId,
      consultation_type: 'telemedicine',
      recording_consent: true, // If consultation was recorded
      prescription_issued: false, // Updated if prescription given
      follow_up_required: false, // Updated based on consultation
      cfm_compliance_verified: true
    });
    
    return medicalRecord;
  }
};
```

---

**Healthcare Architecture Excellence**: Multi-tenant isolation | LGPD/ANVISA/CFM compliance  
**Performance Standards**: <100ms patient data | ≥99.99% uptime | Real-time sync  
**Security Foundation**: Encryption + Audit + RLS | Patient safety first