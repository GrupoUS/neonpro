# NeonPro Component Interface Contracts

## 📋 Overview

This document defines the comprehensive interface contracts for all components in the NeonPro Healthcare Platform, ensuring type safety, clear communication boundaries, and adherence to Brazilian healthcare regulations.

### Interface Design Principles

1. **Type Safety**: All interfaces use TypeScript for compile-time validation
2. **Immutability**: Read-only properties where data shouldn't be modified
3. **LGPD Compliance**: Special handling for personal data fields
4. **Healthcare Context**: Brazilian healthcare-specific validations
5. **Security First**: Role-based access control built into interfaces

---

## 🔐 Authentication & Authorization Interfaces

### Core Authentication Types

```typescript
// Healthcare-specific role enumeration
export enum HealthcareRole {
  ADMIN = "admin",
  EMERGENCY_PHYSICIAN = "emergency_physician", // Special emergency access
  HEALTHCARE_PROVIDER = "healthcare_provider", // Licensed professionals
  CLINIC_MANAGER = "clinic_manager",
  CLINIC_STAFF = "clinic_staff",
  PATIENT = "patient",
}

// User authentication interface
export interface AuthUser {
  readonly id: string; // UUID
  readonly email: string;
  readonly fullName: string;
  readonly role: HealthcareRole;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly isMFAEnabled: boolean;
  readonly createdAt: string; // ISO timestamp
  readonly permissions: readonly string[]; // Permission array
  readonly licenseNumber?: string; // For healthcare providers
  readonly emergencyAccess?: boolean; // Emergency override capability
}

// Authentication tokens interface
export interface AuthToken {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number; // Seconds
  readonly issuedAt?: string;
  readonly scope?: readonly string[];
}

// Authentication request interfaces
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly mfaToken?: string; // Optional MFA token
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly role: Exclude<HealthcareRole, "admin">; // Can't register as admin
  readonly licenseNumber?: string; // Required for healthcare_provider
  readonly profession?: ProfessionType;
  readonly termsAccepted: true; // Must be true
  readonly privacyPolicyAccepted: true; // LGPD requirement
}

// Authentication response wrapper
export interface AuthResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message: string;
  readonly error?: string;
  readonly timestamp: string;
}
```

### Permission System Interface

```typescript
// Permission structure
export interface Permission {
  readonly resource: string; // e.g., "patients", "appointments"
  readonly action: string; // e.g., "read", "write", "delete"
  readonly scope?: "own" | "clinic" | "all"; // Data scope limitation
  readonly emergency?: boolean; // Emergency override capability
}

// Role-based access control
export interface RoleDefinition {
  readonly role: HealthcareRole;
  readonly permissions: readonly Permission[];
  readonly inherits?: readonly HealthcareRole[]; // Role inheritance
  readonly restrictions: readonly string[]; // Additional restrictions
}
```

---

## 🏥 Healthcare Professional Interfaces

### Professional Management

```typescript
// Professional types in Brazilian healthcare
export type ProfessionType =
  | "dermatologist"
  | "plastic_surgeon"
  | "esthetician"
  | "nurse"
  | "administrator"
  | "physiotherapist"
  | "nutritionist";

// Brazilian professional license types
export type LicenseType =
  | "CRM" // Conselho Regional de Medicina
  | "CRF" // Conselho Regional de Farmácia
  | "CRN" // Conselho Regional de Nutrição
  | "CREFITO" // Conselho Regional de Fisioterapia
  | "COFEN"; // Conselho Federal de Enfermagem

// Professional registration interface
export interface ProfessionalRegistration {
  readonly licenseNumber: string;
  readonly licenseType: LicenseType;
  readonly issuingState: string; // Brazilian state code
  readonly expirationDate: string; // ISO date
  readonly isActive: boolean;
  readonly verifiedAt?: string; // Verification timestamp
}

// Working hours structure
export interface WorkingHours {
  readonly monday?: readonly [string, string]; // ["09:00", "18:00"]
  readonly tuesday?: readonly [string, string];
  readonly wednesday?: readonly [string, string];
  readonly thursday?: readonly [string, string];
  readonly friday?: readonly [string, string];
  readonly saturday?: readonly [string, string];
  readonly sunday?: readonly [string, string];
}

// Complete professional interface
export interface HealthcareProfessional {
  readonly id: string; // UUID
  readonly fullName: string;
  readonly email: string;
  readonly phone: string; // Brazilian format: +5511999999999
  readonly profession: ProfessionType;
  readonly specialization?: string;
  readonly registration: ProfessionalRegistration;
  readonly workingHours: WorkingHours;
  readonly permissions: readonly string[];
  readonly isActive: boolean;
  readonly clinic?: {
    readonly id: string;
    readonly name: string;
    readonly role: "owner" | "employee" | "contractor";
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Professional statistics interface
export interface ProfessionalStats {
  readonly totalAppointments: number;
  readonly completedAppointments: number;
  readonly cancelledAppointments: number;
  readonly totalPatients: number;
  readonly averageRating: number;
  readonly monthlyRevenue: number;
  readonly upcomingAppointments: number;
  readonly lastActiveDate: string;
}

// Professional availability interface
export interface ProfessionalAvailability {
  readonly professionalId: string;
  readonly date: string; // YYYY-MM-DD format
  readonly availableSlots: readonly string[]; // ["09:00", "09:30", ...]
  readonly bookedSlots: readonly string[];
  readonly blockedSlots?: readonly string[]; // Manually blocked
  readonly emergencyAvailable: boolean; // Emergency availability
}
```

---

## 🏥 Patient Data Interfaces (LGPD Compliant)

### Core Patient Interfaces

```typescript
// Patient consent structure (LGPD compliance)
export interface PatientConsent {
  readonly dataProcessing: boolean; // Required by LGPD
  readonly marketing: boolean;
  readonly thirdPartySharing: boolean;
  readonly researchParticipation?: boolean;
  readonly consentDate: string; // ISO timestamp
  readonly consentVersion: string; // Terms version
  readonly revokedAt?: string; // If consent was revoked
}

// Brazilian address structure
export interface BrazilianAddress {
  readonly street: string;
  readonly number: string;
  readonly complement?: string;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string; // Two-letter state code
  readonly zipCode: string; // CEP format: 01234-567
  readonly country: "BR"; // Always Brazil
}

// Emergency contact information
export interface EmergencyContact {
  readonly name: string; // Encrypted field
  readonly phone: string; // Encrypted field
  readonly relationship: string;
  readonly isPrimary: boolean;
}

// Patient interface with LGPD compliance
export interface Patient {
  readonly id: string; // UUID
  readonly fullName: string; // Encrypted field
  readonly email: string; // Encrypted field
  readonly phone: string; // Encrypted field
  readonly cpf: string; // Encrypted Brazilian CPF
  readonly dateOfBirth: string; // ISO date, encrypted
  readonly gender?: "M" | "F" | "O"; // Optional
  readonly address: BrazilianAddress; // Encrypted fields
  readonly emergencyContact: EmergencyContact;
  readonly consent: PatientConsent;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastAccessDate?: string; // LGPD tracking
}

// Patient data view interfaces (for different permission levels)
export interface PatientBasicView {
  readonly id: string;
  readonly fullName: string; // May be masked
  readonly email: string; // Masked: j***@email.com
  readonly phone: string; // Masked: +55119****9999
  readonly cpf: string; // Masked: ***.***.***-**
  readonly isActive: boolean;
  readonly consentStatus: {
    readonly dataProcessing: boolean;
    readonly marketing: boolean;
    readonly thirdPartySharing: boolean;
  };
}

export interface PatientFullView extends Patient {
  // Full access with all decrypted fields
  readonly medicalHistory?: readonly MedicalRecord[];
  readonly appointmentHistory?: readonly AppointmentSummary[];
  readonly preferences: PatientPreferences;
}

// Medical record structure
export interface MedicalRecord {
  readonly id: string;
  readonly patientId: string;
  readonly professionalId: string;
  readonly appointmentId?: string;
  readonly recordType: "consultation" | "procedure" | "diagnosis" | "treatment";
  readonly content: string; // Encrypted medical data
  readonly createdAt: string;
  readonly lastModified: string;
  readonly accessLog: readonly AccessLogEntry[];
}
```

### Patient Management Interfaces

```typescript
// Patient preferences
export interface PatientPreferences {
  readonly communicationChannel: "email" | "sms" | "whatsapp" | "phone";
  readonly reminderEnabled: boolean;
  readonly reminderTime: number; // Hours before appointment
  readonly language: "pt-BR" | "en-US";
  readonly timezone: string;
  readonly newsletterSubscription: boolean;
}

// Patient creation request
export interface CreatePatientRequest {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly cpf: string; // Must be valid Brazilian CPF
  readonly dateOfBirth: string;
  readonly address: BrazilianAddress;
  readonly emergencyContact: EmergencyContact;
  readonly consent: Omit<PatientConsent, "consentDate" | "consentVersion">;
  readonly preferences?: Partial<PatientPreferences>;
}

// Patient update request
export interface UpdatePatientRequest {
  readonly fullName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: Partial<BrazilianAddress>;
  readonly emergencyContact?: Partial<EmergencyContact>;
  readonly preferences?: Partial<PatientPreferences>;
  readonly consent?: Partial<PatientConsent>;
}
```

---

## 📅 Appointment System Interfaces

### Core Appointment Interfaces

```typescript
// Appointment status enumeration
export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
  RESCHEDULED = "rescheduled",
}

// Service type interface
export interface HealthcareService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly duration: number; // Minutes
  readonly price: number; // Brazilian Real (centavos)
  readonly category: string;
  readonly requiredLicense?: LicenseType[];
  readonly isActive: boolean;
  readonly preparation?: string; // Pre-appointment instructions
}

// Appointment interface
export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly professionalId: string;
  readonly serviceId: string;
  readonly clinicId: string;
  readonly scheduledDate: string; // ISO timestamp
  readonly duration: number; // Minutes
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly cancellationReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly confirmedAt?: string;
  readonly completedAt?: string;
}

// Appointment creation request
export interface CreateAppointmentRequest {
  readonly patientId: string;
  readonly professionalId: string;
  readonly serviceId: string;
  readonly scheduledDate: string;
  readonly notes?: string;
  readonly priority?: "normal" | "urgent" | "emergency";
}

// Appointment summary for lists
export interface AppointmentSummary {
  readonly id: string;
  readonly patientName: string; // May be masked based on permissions
  readonly professionalName: string;
  readonly serviceName: string;
  readonly scheduledDate: string;
  readonly duration: number;
  readonly status: AppointmentStatus;
  readonly isUrgent: boolean;
}
```

---

## ⚖️ Compliance System Interfaces

### LGPD Compliance Interfaces

```typescript
// LGPD data subject request types
export enum LGPDRequestType {
  ACCESS = "access", // Right to access data
  RECTIFICATION = "rectification", // Right to correct data
  ERASURE = "erasure", // Right to be forgotten
  PORTABILITY = "portability", // Data portability
  RESTRICTION = "restriction", // Processing restriction
  OBJECTION = "objection", // Object to processing
}

// LGPD request interface
export interface LGPDDataSubjectRequest {
  readonly id: string;
  readonly requestType: LGPDRequestType;
  readonly subjectCpf: string; // Encrypted
  readonly requestorEmail: string; // Encrypted
  readonly description: string;
  readonly status: "pending" | "processing" | "completed" | "denied";
  readonly createdAt: string;
  readonly processedAt?: string;
  readonly response?: string;
  readonly documents?: readonly string[]; // File URLs
}

// Consent management interface
export interface ConsentRecord {
  readonly id: string;
  readonly patientId: string;
  readonly consentType: "data_processing" | "marketing" | "third_party_sharing";
  readonly granted: boolean;
  readonly grantedAt: string;
  readonly revokedAt?: string;
  readonly legalBasis: string; // LGPD legal basis
  readonly purpose: string; // Processing purpose
  readonly version: string; // Terms version
}
```

### Healthcare Regulatory Compliance

```typescript
// ANVISA compliance interfaces
export interface AnvisaReportData {
  readonly reportType: "adverse_events" | "medication_tracking" | "facility_inspection";
  readonly startDate: string;
  readonly endDate: string;
  readonly includeDetails: boolean;
  readonly facilityId: string;
  readonly responsibleProfessional: string;
}

// CFM (Conselho Federal de Medicina) compliance
export interface CFMComplianceRecord {
  readonly professionalId: string;
  readonly licenseNumber: string;
  readonly complianceStatus: "compliant" | "pending" | "non_compliant";
  readonly lastVerification: string;
  readonly violations?: readonly string[];
  readonly correctionActions?: readonly string[];
}

// Audit log entry interface
export interface AuditLogEntry {
  readonly id: string;
  readonly userId: string;
  readonly userRole: HealthcareRole;
  readonly action: string; // CRUD operation
  readonly resource: string; // Resource type
  readonly resourceId: string; // Specific resource
  readonly timestamp: string;
  readonly ipAddress: string;
  readonly userAgent?: string;
  readonly changes?: Record<string, unknown>; // Before/after values
  readonly success: boolean;
  readonly errorMessage?: string;
}

// Compliance validation result
export interface ComplianceValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly recommendations?: readonly string[];
  readonly complianceScore: number; // 0-100
}
```

---

## 🏢 Clinic Management Interfaces

### Clinic Structure

```typescript
// Clinic interface
export interface Clinic {
  readonly id: string;
  readonly name: string;
  readonly cnpj: string; // Brazilian business ID
  readonly address: BrazilianAddress;
  readonly phone: string;
  readonly email: string;
  readonly anvisaLicense?: string; // ANVISA registration
  readonly operatingHours: WorkingHours;
  readonly services: readonly string[]; // Service IDs
  readonly professionals: readonly string[]; // Professional IDs
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Clinic statistics interface
export interface ClinicStats {
  readonly totalProfessionals: number;
  readonly activePatients: number;
  readonly monthlyAppointments: number;
  readonly monthlyRevenue: number;
  readonly averageRating: number;
  readonly complianceScore: number;
}
```

---

## 🤖 AI & Analytics Interfaces

### AI Service Interfaces

```typescript
// AI analysis request interface
export interface AIAnalysisRequest {
  readonly type: "appointment_optimization" | "risk_assessment" | "patient_insights";
  readonly data: Record<string, unknown>;
  readonly professionalId?: string;
  readonly patientId?: string;
  readonly clinicId?: string;
}

// AI analysis result interface
export interface AIAnalysisResult {
  readonly analysisId: string;
  readonly type: string;
  readonly confidence: number; // 0-1
  readonly insights: readonly string[];
  readonly recommendations: readonly string[];
  readonly riskFactors?: readonly string[];
  readonly createdAt: string;
  readonly expiresAt: string;
}

// Patient risk assessment interface
export interface PatientRiskAssessment {
  readonly patientId: string;
  readonly riskLevel: "low" | "medium" | "high" | "critical";
  readonly factors: readonly {
    readonly category: string;
    readonly risk: number; // 0-1
    readonly description: string;
  }[];
  readonly recommendations: readonly string[];
  readonly lastAssessment: string;
  readonly nextReview?: string;
}
```

---

## 🔒 Security & Middleware Interfaces

### Security Context Interface

```typescript
// Security context passed through middleware
export interface SecurityContext {
  readonly user: AuthUser;
  readonly permissions: readonly Permission[];
  readonly sessionId: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly emergencyAccess: boolean;
  readonly auditRequired: boolean;
}

// Rate limiting interface
export interface RateLimitConfig {
  readonly windowMs: number; // Time window in milliseconds
  readonly max: number; // Maximum requests per window
  readonly skipSuccessfulRequests?: boolean;
  readonly skipFailedRequests?: boolean;
  readonly keyGenerator?: (context: SecurityContext) => string;
}

// CORS configuration interface
export interface CorsConfig {
  readonly origin: string | string[] | RegExp;
  readonly methods: readonly string[];
  readonly allowedHeaders: readonly string[];
  readonly exposedHeaders?: readonly string[];
  readonly credentials: boolean;
  readonly maxAge?: number;
}
```

### Encryption Interfaces

```typescript
// Encryption configuration interface
export interface EncryptionConfig {
  readonly algorithm: "aes-256-gcm";
  readonly keyDerivation: "pbkdf2" | "scrypt";
  readonly iterations: number;
  readonly keyLength: number;
  readonly ivLength: number;
  readonly tagLength: number;
}

// Field encryption metadata
export interface EncryptedField {
  readonly value: string; // Encrypted value
  readonly algorithm: string;
  readonly keyVersion: string;
  readonly encryptedAt: string;
}
```

---

## 📊 Common Response Interfaces

### API Response Wrapper

```typescript
// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly message: string;
  readonly error?: string;
  readonly timestamp: string;
  readonly requestId: string;
  readonly metadata?: Record<string, unknown>;
}

// Pagination interface
export interface PaginationInfo {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly pages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

// Paginated response interface
export interface PaginatedResponse<T> extends
  ApiResponse<{
    readonly items: readonly T[];
    readonly pagination: PaginationInfo;
  }>
{}

// Error response interface
export interface ErrorResponse extends ApiResponse<never> {
  readonly success: false;
  readonly error: string;
  readonly details?: Record<string, unknown>;
  readonly code?: string;
  readonly statusCode: number;
}
```

### Validation Interfaces

```typescript
// Field validation result
export interface FieldValidationResult {
  readonly field: string;
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly value?: unknown;
}

// Complete validation result
export interface ValidationResult {
  readonly isValid: boolean;
  readonly fields: readonly FieldValidationResult[];
  readonly globalErrors?: readonly string[];
}

// Brazilian document validation
export interface DocumentValidationResult {
  readonly isValid: boolean;
  readonly type: "CPF" | "CNPJ" | "RG";
  readonly formatted: string;
  readonly errors: readonly string[];
}
```

---

## 🌟 Interface Usage Guidelines

### Implementation Best Practices

1. **Type Safety**: Always use readonly properties for data integrity
2. **Null Safety**: Use optional properties (?) for optional fields
3. **Immutability**: Prefer readonly arrays and objects
4. **Naming Convention**: Use PascalCase for interfaces, camelCase for properties
5. **Documentation**: Include JSDoc comments for complex interfaces

### LGPD Compliance Guidelines

1. **Encrypted Fields**: Mark sensitive fields with comments
2. **Consent Tracking**: Always include consent information
3. **Access Control**: Implement view-based interfaces for different permission levels
4. **Audit Trail**: Include audit information in data modification interfaces

### Healthcare Regulatory Guidelines

1. **License Validation**: Include professional license information
2. **Emergency Access**: Provide emergency override capabilities
3. **Audit Logging**: Comprehensive audit trail for all actions
4. **Data Retention**: Include data retention and expiration information

---

This comprehensive interface contract documentation ensures type-safe, compliant, and maintainable component interactions throughout the NeonPro Healthcare Platform.
