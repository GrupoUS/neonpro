# 📋 Component Interface Specification - NeonPro Healthcare

## 🎯 **OBJETIVO**

Especificar todas as interfaces de componentes, contratos API e limites do sistema NeonPro baseado na estrutura Supabase validada.

**Status**: ✅ Supabase Validation Complete | 🔄 Interface Specification In Progress\
**Target**: Production-ready contracts with enterprise-grade healthcare compliance

---

## 🏗️ **1. CORE DATABASE INTERFACES**

### **1.1 Healthcare Entities (Based on Supabase Schema)**

```typescript
// Enhanced Patient Interface (based on real Supabase structure)
export interface Patient extends BaseEntity {
  // Core Identity
  id: string;
  clinic_id: string; // Multi-tenant isolation

  // Personal Information
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  cpf?: string; // Brazilian tax ID
  rg?: string; // Brazilian identity

  // Address (Brazil-specific)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string; // Default: 'Brazil'

  // Healthcare Specific
  medical_history?: string;
  allergies?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // LGPD Compliance
  data_consent_given: boolean;
  lgpd_consent_date?: string;
  lgpd_consent_version?: string;
  privacy_settings: PrivacySettings;
  communication_consent: CommunicationConsent;

  // Photo & UI
  photo_url?: string;
  preferred_language?: string; // Default: 'pt-BR'

  // System fields
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  deleted_at?: string;
}

// Enhanced Appointment Interface (based on Supabase validation)
export interface Appointment extends BaseEntity {
  // Core IDs
  id: string;
  clinic_id: string; // Multi-tenant
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  room_id?: string;

  // Scheduling
  start_time: string; // ISO timestamp with timezone
  end_time: string;
  status: AppointmentStatus;
  priority: number; // 1-5 scale

  // Communication & Reminders
  notes?: string;
  internal_notes?: string;
  reminder_sent_at?: string;
  confirmation_sent_at?: string;
  whatsapp_reminder_sent: boolean;
  sms_reminder_sent: boolean;

  // Cancellation
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}
```

### **1.2 Status Enums & Constants**

```typescript
export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum UserRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  NURSE = "nurse",
  RECEPTIONIST = "receptionist",
  PATIENT = "patient",
}
```

---

## 🔗 **2. API CONTRACT INTERFACES**

```typescript
// Complete Healthcare API Interface
export interface HealthcareAPI {
  // Patient Management
  patients: {
    list(params: {
      clinicId: string;
      page?: number;
      limit?: number;
      search?: string;
      active?: boolean;
    }): Promise<PaginatedResponse<Patient>>;

    getById(patientId: string): Promise<Patient>;
    create(data: CreatePatientRequest): Promise<Patient>;
    update(patientId: string, data: UpdatePatientRequest): Promise<Patient>;
    delete(patientId: string): Promise<{ success: boolean; message: string; }>;

    // LGPD Methods
    getConsentStatus(patientId: string): Promise<ConsentStatus>;
    updateConsent(patientId: string, consent: ConsentUpdate): Promise<void>;
    exportData(patientId: string): Promise<PatientDataExport>;
  };

  // Appointment System
  appointments: {
    list(params: {
      clinicId: string;
      startDate?: string;
      endDate?: string;
      patientId?: string;
      professionalId?: string;
      status?: AppointmentStatus[];
    }): Promise<PaginatedResponse<Appointment>>;

    book(data: AppointmentBookingRequest): Promise<Appointment>;
    cancel(appointmentId: string, data: { reason: string; }): Promise<void>;
    confirm(appointmentId: string): Promise<Appointment>;

    // Availability
    getAvailability(params: {
      professionalId: string;
      date: string;
      duration: number;
    }): Promise<TimeSlot[]>;
  };

  // Authentication & Authorization
  auth: {
    signIn(credentials: SignInCredentials): Promise<AuthResult>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<User>;
    refreshToken(refreshToken: string): Promise<TokenPair>;
  };
}
```

---

## 📦 **3. PACKAGE INTERFACES**

### **3.1 @neonpro/database - Database Operations**

```typescript
export interface DatabaseClient {
  // Repository pattern
  patients: PatientRepository;
  appointments: AppointmentRepository;
  professionals: ProfessionalRepository;

  // RLS Management
  rls: RLSManager;

  // Connection management
  health(): Promise<DatabaseHealth>;
}

export interface PatientRepository extends BaseRepository<Patient> {
  findByClinic(clinicId: string): Promise<Patient[]>;
  findByEmail(email: string, clinicId: string): Promise<Patient | null>;
  searchByName(query: string, clinicId: string): Promise<Patient[]>;
}
```

### **3.2 @neonpro/auth - Authentication & Authorization**

```typescript
export interface AuthProvider {
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  authorize(resource: string, action: string): Promise<boolean>;
}
```

### **3.3 @neonpro/compliance - LGPD & Healthcare Compliance**

```typescript
export interface ComplianceManager {
  validateConsent(patientId: string): Promise<ConsentValidation>;
  recordDataAccess(operation: DataAccessOperation): Promise<void>;
  generateAuditReport(params: AuditReportParams): Promise<AuditReport>;

  // Brazilian Healthcare Compliance
  validateCRM(crm: string, state: string): Promise<CRMValidation>;
  validateCPF(cpf: string): Promise<boolean>;
}
```

---

## 🔄 **4. ERROR HANDLING**

```typescript
export interface ErrorHandlingSystem {
  ValidationError: ErrorConstructor<ValidationErrorDetails>;
  AuthenticationError: ErrorConstructor<AuthErrorDetails>;
  DatabaseError: ErrorConstructor<DatabaseErrorDetails>;

  handleError(error: Error): ErrorResponse;
  retryOperation<T>(operation: () => Promise<T>, policy: RetryPolicy): Promise<T>;
}
```

---

## ✅ **ACCEPTANCE CRITERIA CHECKLIST**

- [x] ✅ **Supabase Schema Analysis**: Complete healthcare database structure validated
- [x] 🔄 **TypeScript Contracts**: Enhanced interfaces based on real database structure
- [ ] 📝 **OpenAPI 3.0 Specification**: REST API documentation with healthcare operations
- [ ] 📦 **Package Interface Definitions**: Clear contracts for all @neonpro/* packages
- [ ] 🔗 **Component Responsibility Matrix**: Clear separation of concerns
- [x] ✅ **Brazilian Healthcare Compliance**: LGPD + ANVISA + CRM validation patterns
- [ ] 🛡️ **Error Handling Strategies**: Comprehensive error types and recovery patterns

**STATUS**: 🔄 **Interface specification in progress** - Foundation established
