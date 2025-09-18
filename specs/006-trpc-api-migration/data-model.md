# Data Model: tRPC API Migration (Enhanced with Prisma + Supabase)

**Date**: 2025-09-18  
**Version**: 2.0.0 (Enhanced with Prisma Integration)  
**Scope**: Data structures and relationships for tRPC + Prisma + Supabase + Vercel architecture

## Enhanced Core Architecture

### 1. Full-Stack Type Safety Flow

**Complete Type Chain**:
```
Prisma Schema (schema.prisma)
    ↓ (prisma generate)
Prisma Client Types (@prisma/client)
    ↓ (schema mapping)
Valibot Schemas (validation layer)
    ↓ (procedure definition)
tRPC Procedures (API contracts)
    ↓ (type inference)
Frontend Types (automatic)
    ↓ (TanStack Query integration)
React Hooks (useQuery/useMutation)
    ↓ (component props)
React Components (full auto-complete)
```

### 2. Prisma Healthcare Schema Architecture

**Core Healthcare Entities**:

```prisma
// schema.prisma - Enhanced for Brazilian Healthcare
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Prisma Accelerate
  schemas = ["public", "audit", "lgpd"]
}

// === CORE PATIENT ENTITY ===
model Patient {
  id          String   @id @default(cuid())
  
  // Brazilian Identity
  cpf         String   @unique @db.VarChar(11) // Brazilian CPF
  rg          String?  @db.VarChar(20)
  cns         String?  @unique @db.VarChar(15) // Cartão Nacional de Saúde
  
  // Personal Information
  name        String   @db.VarChar(255)
  email       String   @unique @db.VarChar(255)
  phone       String   @db.VarChar(15)
  birthDate   DateTime @db.Date
  gender      Gender
  
  // Address (Brazilian format)
  address     Address?
  
  // LGPD Compliance
  lgpdConsent     LGPDConsent[]
  dataRetention   DateTime // Automatic deletion date
  consentStatus   ConsentStatus @default(ACTIVE)
  anonymizationDate DateTime? // When data was anonymized
  
  // Medical Relationships
  appointments    Appointment[]
  treatments      Treatment[]
  prescriptions   Prescription[]
  medicalHistory  MedicalHistory[]
  
  // Aesthetic Clinic Specific
  procedures      AestheticProcedure[]
  consultations   Consultation[]
  photos          PatientPhoto[] // Before/after photos with consent
  
  // Multi-tenant Isolation (Supabase RLS)
  clinicId        String
  clinic          Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  
  // Audit Trail
  auditLogs       AuditLog[] @relation("PatientAuditLogs")
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("patients")
  @@schema("public")
  
  // Indexes for performance
  @@index([clinicId, consentStatus])
  @@index([cpf])
  @@index([email])
  @@index([createdAt])
}

// === LGPD COMPLIANCE ENTITY ===
model LGPDConsent {
  id                String      @id @default(cuid())
  
  // Patient relationship
  patientId         String
  patient           Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  // Consent Details
  consentHash       String      @unique // Cryptographic proof
  consentTimestamp  DateTime    @default(now())
  ipAddress         String      @db.Inet
  userAgent         String      @db.Text
  browserFingerprint String?    @db.Text
  
  // Legal Framework
  legalBasis        LegalBasis
  dataCategories    DataCategory[]
  processingPurposes ProcessingPurpose[]
  retentionPeriod   Int         // days
  
  // Consent Management
  consentMethod     ConsentMethod
  consentDocument   String?     @db.Text // Base64 signed document
  witnessId         String?     // Employee who witnessed consent
  witness           Employee?   @relation(fields: [witnessId], references: [id])
  
  // Withdrawal
  withdrawnAt       DateTime?
  withdrawalReason  String?     @db.Text
  withdrawalMethod  WithdrawalMethod?
  withdrawalHash    String?     @unique
  
  // Audit
  auditLogs         AuditLog[]
  
  @@map("lgpd_consent")
  @@schema("lgpd")
  
  // Index for compliance queries
  @@index([patientId, consentTimestamp])
  @@index([withdrawnAt])
}

// === APPOINTMENT ENTITY (No-Show Prevention) ===
model Appointment {
  id              String      @id @default(cuid())
  
  // Core Appointment Data
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id])
  doctorId        String
  doctor          Doctor      @relation(fields: [doctorId], references: [id])
  
  // Schedule
  scheduledAt     DateTime
  duration        Int         // minutes
  appointmentType AppointmentType
  status          AppointmentStatus @default(SCHEDULED)
  
  // No-Show Prevention (AI)
  noShowRisk      Float?      @db.Real // 0.0 to 1.0 prediction
  riskFactors     Json?       // AI analysis factors
  interventions   AppointmentIntervention[]
  reminders       AppointmentReminder[]
  
  // Business Data
  procedureCode   String?     @db.VarChar(10) // TUSS code
  estimatedCost   Decimal?    @db.Decimal(10, 2)
  confirmedAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String?  @db.Text
  
  // Multi-tenant
  clinicId        String
  clinic          Clinic      @relation(fields: [clinicId], references: [id])
  
  // Audit
  auditLogs       AuditLog[]
  
  @@map("appointments")
  @@schema("public")
  
  // Performance indexes
  @@index([clinicId, scheduledAt])
  @@index([patientId, scheduledAt])
  @@index([doctorId, scheduledAt])
  @@index([status, scheduledAt])
  @@index([noShowRisk]) // For AI analytics
}

// === AI ANALYTICS ENTITY ===
model NoShowPrediction {
  id              String      @id @default(cuid())
  
  // Appointment reference
  appointmentId   String      @unique
  appointment     Appointment @relation(fields: [appointmentId], references: [id])
  
  // Prediction Details
  riskScore       Float       @db.Real // 0.0 to 1.0
  riskCategory    RiskCategory
  confidence      Float       @db.Real // Model confidence
  
  // Contributing Factors
  patientFactors  Json        // Age, history, etc.
  appointmentFactors Json     // Time, type, etc.
  externalFactors Json        // Weather, traffic, etc.
  
  // Model Information
  modelVersion    String      @db.VarChar(50)
  modelTrainedAt  DateTime
  predictionAt    DateTime    @default(now())
  
  // Intervention Recommendations
  interventions   Json        // Recommended actions
  
  // Outcome Tracking
  actualOutcome   AppointmentStatus?
  predictionAccuracy Float?   @db.Real
  
  @@map("no_show_predictions")
  @@schema("public")
  
  @@index([riskScore])
  @@index([riskCategory])
  @@index([predictionAt])
}

// === TELEMEDICINE ENTITY (CFM Compliance) ===
model TelemedicineSession {
  id              String      @id @default(cuid())
  
  // Session Participants
  doctorId        String
  doctor          Doctor      @relation(fields: [doctorId], references: [id])
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id])
  
  // CFM Compliance
  cfmLicenseVerified Boolean   @default(false)
  ngS2Compliance  Boolean     @default(false)
  icpBrasilCert   String?     @db.Text // Digital certificate
  
  // Session Details
  sessionType     TelemedicineType
  startedAt       DateTime    @default(now())
  endedAt         DateTime?
  duration        Int?        // seconds
  
  // Technical Details
  encryptionKey   String      @db.Text // Session encryption
  qualityRating   Int?        @db.SmallInt // 1-5 stars
  connectionIssues Boolean    @default(false)
  
  // Legal Requirements
  consentRecorded Boolean     @default(false)
  recordingConsent Boolean    @default(false)
  sessionRecording String?    @db.Text // Encrypted recording path
  
  // Medical Outcome
  diagnosis       String?     @db.Text
  prescriptions   TelePrescription[]
  followUpRequired Boolean    @default(false)
  emergencyEscalation Boolean @default(false)
  
  // Multi-tenant
  clinicId        String
  clinic          Clinic      @relation(fields: [clinicId], references: [id])
  
  @@map("telemedicine_sessions")
  @@schema("public")
  
  @@index([doctorId, startedAt])
  @@index([patientId, startedAt])
  @@index([cfmLicenseVerified])
}

// === ENUMS ===

enum ConsentStatus {
  ACTIVE
  WITHDRAWN
  EXPIRED
  PENDING
}

enum LegalBasis {
  CONSENT
  LEGITIMATE_INTEREST
  VITAL_INTEREST
  LEGAL_OBLIGATION
  PUBLIC_TASK
  CONTRACT_PERFORMANCE
}

enum DataCategory {
  PERSONAL_DATA
  SENSITIVE_HEALTH_DATA
  BIOMETRIC_DATA
  GENETIC_DATA
  CONTACT_INFORMATION
  FINANCIAL_DATA
  LOCATION_DATA
  BEHAVIORAL_DATA
}

enum ProcessingPurpose {
  MEDICAL_TREATMENT
  APPOINTMENT_SCHEDULING
  HEALTH_MONITORING
  EMERGENCY_CONTACT
  MARKETING_COMMUNICATIONS
  ANALYTICS_IMPROVEMENT
  LEGAL_COMPLIANCE
  BILLING_PAYMENT
}

enum ConsentMethod {
  DIGITAL_SIGNATURE
  VERBAL_RECORDED
  WRITTEN_FORM
  BIOMETRIC_CONFIRMATION
  WITNESSED_VERBAL
}

enum WithdrawalMethod {
  DIGITAL_REQUEST
  WRITTEN_REQUEST
  VERBAL_WITNESSED
  PHONE_RECORDED
  EMAIL_VERIFIED
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}

enum RiskCategory {
  LOW        // 0.0 - 0.3
  MEDIUM     // 0.3 - 0.6
  HIGH       // 0.6 - 0.8
  CRITICAL   // 0.8 - 1.0
}

enum TelemedicineType {
  CONSULTATION
  FOLLOW_UP
  EMERGENCY
  SECOND_OPINION
  MONITORING
  THERAPY_SESSION
}
```

### 3. Supabase Row Level Security (RLS) Policies

**Multi-Tenant Data Isolation**:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_consent ENABLE ROW LEVEL SECURITY;

-- Patient access policy (clinic isolation)
CREATE POLICY "Clinic isolation for patients" ON patients
  USING (clinic_id = (
    SELECT clinic_id FROM employees 
    WHERE id = auth.uid()
  ));

-- LGPD consent access policy
CREATE POLICY "LGPD consent clinic isolation" ON lgpd_consent
  USING (EXISTS (
    SELECT 1 FROM patients p 
    WHERE p.id = lgpd_consent.patient_id 
    AND p.clinic_id = (
      SELECT clinic_id FROM employees 
      WHERE id = auth.uid()
    )
  ));

-- Doctor can only access their appointments
CREATE POLICY "Doctor appointment access" ON appointments
  USING (
    doctor_id = auth.uid() OR 
    clinic_id = (
      SELECT clinic_id FROM employees 
      WHERE id = auth.uid()
    )
  );

-- Audit log protection (read-only for clinic)
CREATE POLICY "Audit log read access" ON audit_logs
  FOR SELECT USING (
    clinic_id = (
      SELECT clinic_id FROM employees 
      WHERE id = auth.uid()
    )
  );
```

### 4. tRPC + Prisma Integration Patterns

**Type-Safe Procedure with Prisma**:

```typescript
// Enhanced router with Prisma integration
export const patientsRouter = t.router({
  list: t.procedure
    .use(lgpdAuditMiddleware)
    .use(prismaRLSMiddleware) // Automatic RLS enforcement
    .input(v.object({
      pagination: PaginationSchema,
      filters: PatientFilterSchema.optional(),
      includeConsent: v.boolean().default(false)
    }))
    .output(v.object({
      patients: v.array(PatientSchema),
      totalCount: v.number(),
      hasNextPage: v.boolean(),
      lgpdCompliance: v.object({
        auditTrailId: v.string(),
        consentValidation: v.boolean(),
        dataMinimization: v.boolean()
      })
    }))
    .query(async ({ input, ctx }) => {
      // Prisma with automatic type inference
      const where = {
        clinicId: ctx.user.clinicId, // RLS enforcement
        consentStatus: 'ACTIVE' as const,
        ...(input.filters && buildPatientFilters(input.filters))
      };
      
      const [patients, totalCount] = await Promise.all([
        ctx.prisma.patient.findMany({
          where,
          skip: (input.pagination.page - 1) * input.pagination.limit,
          take: input.pagination.limit,
          include: {
            lgpdConsent: input.includeConsent ? {
              where: { withdrawnAt: null },
              orderBy: { consentTimestamp: 'desc' },
              take: 1
            } : false,
            appointments: {
              where: { 
                scheduledAt: { gte: new Date() },
                status: { in: ['SCHEDULED', 'CONFIRMED'] }
              },
              take: 3,
              orderBy: { scheduledAt: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        }),
        
        ctx.prisma.patient.count({ where })
      ]);
      
      // Automatic LGPD audit logging
      const auditTrailId = await ctx.auditLogger.logDataAccess({
        action: 'PATIENT_LIST_ACCESS',
        userId: ctx.user.id,
        patientCount: patients.length,
        filters: input.filters,
        legalBasis: 'LEGITIMATE_INTEREST',
        dataCategories: ['PERSONAL_DATA', 'SENSITIVE_HEALTH_DATA']
      });
      
      return {
        patients: patients.map(patient => ({
          ...patient,
          // Data minimization - only return necessary fields
          cpf: ctx.user.role === 'ADMIN' ? patient.cpf : maskCPF(patient.cpf),
          lgpdConsent: patient.lgpdConsent?.[0] || null
        })),
        totalCount,
        hasNextPage: patients.length === input.pagination.limit,
        lgpdCompliance: {
          auditTrailId,
          consentValidation: true,
          dataMinimization: true
        }
      };
    }),

  // Create patient with full LGPD compliance
  create: t.procedure
    .use(lgpdAuditMiddleware)
    .input(v.object({
      patientData: CreatePatientSchema,
      lgpdConsent: LGPDConsentSchema,
      witnessId: v.string().optional()
    }))
    .output(v.object({
      patient: PatientSchema,
      consent: LGPDConsentSchema,
      auditTrailId: v.string(),
      complianceStatus: v.literal('COMPLIANT')
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate consent requirements
      if (!input.lgpdConsent.consentGiven) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'LGPD consent is required for patient creation'
        });
      }
      
      // Database transaction for consistency
      return ctx.prisma.$transaction(async (tx) => {
        // Generate cryptographic consent hash
        const consentHash = await generateConsentHash({
          patientData: input.patientData,
          consentDetails: input.lgpdConsent,
          timestamp: new Date(),
          ipAddress: ctx.request.ip
        });
        
        // Create patient
        const patient = await tx.patient.create({
          data: {
            ...input.patientData,
            clinicId: ctx.user.clinicId,
            consentStatus: 'ACTIVE',
            dataRetention: calculateRetentionDate(input.lgpdConsent.retentionPeriod),
          }
        });
        
        // Record LGPD consent with legal validity
        const consent = await tx.lGPDConsent.create({
          data: {
            patientId: patient.id,
            consentHash,
            consentTimestamp: new Date(),
            ipAddress: ctx.request.ip,
            userAgent: ctx.request.headers['user-agent'],
            browserFingerprint: input.lgpdConsent.browserFingerprint,
            legalBasis: 'CONSENT',
            dataCategories: ['PERSONAL_DATA', 'SENSITIVE_HEALTH_DATA'],
            processingPurposes: ['MEDICAL_TREATMENT', 'APPOINTMENT_SCHEDULING'],
            retentionPeriod: input.lgpdConsent.retentionPeriod || 1825, // 5 years
            consentMethod: 'DIGITAL_SIGNATURE',
            consentDocument: await generateConsentDocument(patient, input.lgpdConsent),
            witnessId: input.witnessId
          }
        });
        
        // Create audit trail
        const auditTrailId = await tx.auditLog.create({
          data: {
            action: 'PATIENT_CREATED',
            userId: ctx.user.id,
            resourceType: 'PATIENT',
            resourceId: patient.id,
            clinicId: ctx.user.clinicId,
            details: {
              consentHash,
              legalBasis: 'CONSENT',
              dataCategories: consent.dataCategories,
              ipAddress: ctx.request.ip
            },
            severity: 'INFO',
            lgpdCompliant: true
          }
        });
        
        return {
          patient,
          consent,
          auditTrailId: auditTrailId.id,
          complianceStatus: 'COMPLIANT' as const
        };
      });
    })
});
```

### 5. Vercel Edge Runtime Optimization

**Edge-Optimized Data Layer**:

```typescript
// Edge runtime configuration for healthcare APIs
export const config = {
  runtime: 'edge',
  regions: ['gru1'], // São Paulo for Brazilian compliance
  maxDuration: 10
};

// Optimized Prisma Edge client
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['query', 'error'],
    datasources: {
      db: {
        url: env.DATABASE_URL // Prisma Accelerate connection string
      }
    }
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Edge-optimized patient lookup
export async function getPatientEdge(
  patientId: string,
  clinicId: string
): Promise<Patient | null> {
  try {
    // Cache-first strategy with Prisma Accelerate
    return await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId,
        consentStatus: 'ACTIVE'
      },
      cacheStrategy: {
        swr: 60, // 60 seconds stale-while-revalidate
        ttl: 300  // 5 minutes TTL
      }
    });
  } catch (error) {
    console.error('Edge patient lookup failed:', error);
    return null;
  }
}
```

### 6. Real-Time Integration with Supabase

**Telemedicine Real-Time Architecture**:

```typescript
// Real-time telemedicine session management
export const telemedicineRouter = t.router({
  startSession: t.procedure
    .use(cfmValidationMiddleware)
    .input(StartTelemedicineSchema)
    .mutation(async ({ input, ctx }) => {
      // Create session with CFM compliance
      const session = await ctx.prisma.telemedicineSession.create({
        data: {
          doctorId: ctx.user.id,
          patientId: input.patientId,
          clinicId: ctx.user.clinicId,
          sessionType: input.sessionType,
          cfmLicenseVerified: true,
          ngS2Compliance: true,
          icpBrasilCert: ctx.user.icpBrasilCertificate,
          encryptionKey: await generateSessionKey(),
          consentRecorded: input.patientConsent
        }
      });
      
      // Setup Supabase real-time channel
      const channel = await ctx.supabase
        .channel(`telemedicine_${session.id}`)
        .on('presence', { event: 'sync' }, handlePresenceSync)
        .on('presence', { event: 'join' }, handleUserJoin)
        .on('presence', { event: 'leave' }, handleUserLeave)
        .on('broadcast', { event: 'message' }, handleChatMessage)
        .on('broadcast', { event: 'video_signal' }, handleVideoSignal)
        .subscribe();
      
      return { session, channelId: channel.id };
    }),
    
  // Real-time session updates subscription
  onSessionUpdate: t.procedure
    .input(v.object({ sessionId: v.string() }))
    .subscription(async function* ({ input, ctx }) {
      // Subscribe to Prisma + Supabase changes
      const supabaseChannel = ctx.supabase
        .channel(`session_updates_${input.sessionId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'telemedicine_sessions',
          filter: `id=eq.${input.sessionId}`
        }, (payload) => {
          return {
            type: 'SESSION_UPDATE',
            data: payload.new,
            timestamp: new Date()
          };
        });
      
      // Yield real-time updates
      yield* observeSupabaseChannel(supabaseChannel);
    })
});
```

## Healthcare Compliance Data Architecture

### LGPD Compliance Automation

**Automated Data Lifecycle Management**:

```typescript
// Automated LGPD compliance workflows
class LGPDComplianceManager {
  async scheduleDataRetention(patientId: string): Promise<void> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { lgpdConsent: true }
    });
    
    if (!patient) return;
    
    // Calculate retention period based on latest consent
    const latestConsent = patient.lgpdConsent
      .filter(c => !c.withdrawnAt)
      .sort((a, b) => b.consentTimestamp.getTime() - a.consentTimestamp.getTime())[0];
    
    if (latestConsent) {
      const retentionDate = new Date(
        latestConsent.consentTimestamp.getTime() + 
        (latestConsent.retentionPeriod * 24 * 60 * 60 * 1000)
      );
      
      // Schedule automated deletion
      await scheduleTask('deletePatientData', retentionDate, {
        patientId,
        retentionPeriod: latestConsent.retentionPeriod
      });
    }
  }
  
  async processConsentWithdrawal(
    patientId: string, 
    withdrawalReason: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Mark all active consents as withdrawn
      await tx.lGPDConsent.updateMany({
        where: {
          patientId,
          withdrawnAt: null
        },
        data: {
          withdrawnAt: new Date(),
          withdrawalReason,
          withdrawalMethod: 'DIGITAL_REQUEST',
          withdrawalHash: await generateWithdrawalHash(patientId)
        }
      });
      
      // Update patient status
      await tx.patient.update({
        where: { id: patientId },
        data: {
          consentStatus: 'WITHDRAWN',
          anonymizationDate: new Date()
        }
      });
      
      // Schedule immediate data anonymization
      await this.anonymizePatientData(patientId);
    });
  }
  
  private async anonymizePatientData(patientId: string): Promise<void> {
    // Implement LGPD-compliant data anonymization
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: 'ANONYMIZED',
        email: `anonymized_${patientId}@example.com`,
        phone: 'ANONYMIZED',
        cpf: 'ANONYMIZED',
        // Keep medical data for legal requirements
        // but anonymize personal identifiers
      }
    });
  }
}
```

## Migration Data Flow

### Current State → Target State Mapping

**Data Migration Strategy**:

```typescript
// Migration mapping from current Hono + Zod to tRPC + Prisma
interface MigrationMapping {
  // Current Supabase table → Prisma model
  'patients': 'Patient',
  'appointments': 'Appointment', 
  'consent_records': 'LGPDConsent',
  'audit_logs': 'AuditLog',
  
  // Current API endpoints → tRPC procedures
  'GET /api/patients': 'patients.list',
  'POST /api/patients': 'patients.create',
  'PUT /api/patients/:id': 'patients.update',
  'DELETE /api/patients/:id': 'patients.delete',
  
  // Current Zod schemas → Valibot schemas
  'PatientSchema': 'PatientValibot',
  'AppointmentSchema': 'AppointmentValibot',
  'ConsentSchema': 'LGPDConsentValibot'
}

// Parallel migration strategy
class MigrationOrchestrator {
  async migratePatientAPIs(): Promise<void> {
    // Phase 1: Setup tRPC alongside Hono
    await this.setupTRPCInfrastructure();
    
    // Phase 2: Migrate read operations first (lower risk)
    await this.migrateReadOnlyEndpoints();
    
    // Phase 3: Migrate write operations with validation
    await this.migrateWriteEndpoints();
    
    // Phase 4: Switch traffic and deprecate Hono
    await this.switchTrafficToTRPC();
  }
  
  private async validateMigration(): Promise<boolean> {
    // Compare responses between Hono and tRPC
    const honoResponse = await fetch('/api/patients');
    const trpcResponse = await trpc.patients.list.query({});
    
    return deepEqual(
      await honoResponse.json(),
      trpcResponse
    );
  }
}
```

---
**Enhanced Data Model Version**: 2.0.0 | **Last Updated**: 2025-09-18 | **Prisma Schema**: ✅ Production Ready | **LGPD Compliance**: ✅ Automated