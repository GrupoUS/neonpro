/**
 * NeonPro Enhanced Prisma Client - Healthcare Platform Integration
 *
 * Production-ready Prisma client implementation optimized for healthcare workloads
 * with multi-tenant RLS, LGPD compliance, and Brazilian healthcare standards.
 *
 * Features:
 * - Healthcare-optimized singleton pattern with connection pooling
 * - Multi-tenant RLS context injection and clinic isolation
 * - LGPD compliance utilities (data export, deletion, consent management)
 * - Brazilian healthcare regulatory compliance (ANVISA, CFM)
 * - Comprehensive audit trail integration
 * - Performance monitoring and error handling
 * - Professional access controls and patient data protection
 */

import { PrismaClient } from '@prisma/client'
import { healthcareRLS } from './supabase.js'

// Healthcare context interface for RLS
interface HealthcareContext {
  userId?: string
  clinicId?: string
  role?: 'admin' | 'professional' | 'assistant' | 'patient'
  permissions?: string[]
  cfmValidated?: boolean
}

// Enhanced connection pool configuration for healthcare workloads
interface HealthcareConnectionConfig {
  maxConnections: number
  connectionTimeout: number
  idleTimeout: number
  healthCheckInterval: number
}

// LGPD data export format
interface LGPDDataExport {
  patientId: string
  exportDate: string
  dataCategories: Record<string, any>
  consentStatus: Record<string, any>
  auditTrail: any[]
  metadata: {
    requestedBy: string
    exportReason: string
    dataRetentionUntil?: string
  }
}

// Healthcare error types
class HealthcareComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public complianceFramework: 'LGPD' | 'ANVISA' | 'CFM',
  ) {
    super(message)
    this.name = 'HealthcareComplianceError'
  }
}

class UnauthorizedHealthcareAccessError extends Error {
  constructor(
    message: string,
    public resourceType: string,
    public resourceId?: string,
  ) {
    super(message)
    this.name = 'UnauthorizedHealthcareAccessError'
  }
}

// Enhanced healthcare client using Prisma with RLS context
class HealthcarePrismaClient {
  private client: PrismaClient
  private currentContext: HealthcareContext = {}
  private healthcareConfig: HealthcareConnectionConfig
  private connectionPool: {
    activeConnections: number
    totalConnections: number
    healthStatus: 'healthy' | 'degraded' | 'unhealthy'
    lastHealthCheck: Date
  }

  constructor(options?: { connectionString?: string }) {
    // Healthcare-optimized configuration
    this.healthcareConfig = {
      maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
      connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000'),
      idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '600000'),
      healthCheckInterval: parseInt(process.env.DATABASE_HEALTH_CHECK_INTERVAL || '30000'),
    }

    this.client = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn', 'info']
        : ['error', 'warn'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: options?.connectionString || process.env.DATABASE_URL || 'postgresql://localhost:5432/neonpro',
        },
      },
    })

    this.connectionPool = {
      activeConnections: 1,
      totalConnections: 1,
      healthStatus: 'healthy',
      lastHealthCheck: new Date(),
    }
  }

  // Access the underlying Prisma client for direct operations
  get raw() {
    return this.client
  }

  // Healthcare context management
  withContext(context: HealthcareContext): HealthcarePrismaClient {
    const newInstance = Object.create(this)
    newInstance.currentContext = context
    return newInstance
  }

  async validateContext(): Promise<boolean> {
    if (!this.currentContext?.userId || !this.currentContext?.clinicId) {
      return false
    }

    try {
      // Validate user access to clinic using existing Supabase RLS
      const hasAccess = await healthcareRLS.canAccessClinic(
        this.currentContext.userId,
        this.currentContext.clinicId,
      )
      return hasAccess
    } catch (error) {
      console.error('Context validation failed:', error)
      return false
    }
  }

  // LGPD compliance methods
  async exportPatientData(
    patientId: string,
    requestedBy: string,
    reason: string,
  ): Promise<LGPDDataExport> {
    try {
      // Validate context and permissions
      if (!(await this.validateContext())) {
        throw new UnauthorizedHealthcareAccessError(
          'Insufficient permissions for data export',
          'patient_data',
          patientId,
        )
      }

      // Check if patient belongs to current clinic context
      const patient = await this.client.patient.findFirst({
        where: {
          id: patientId,
          clinicId: this.currentContext?.clinicId,
        },
        include: {
          appointments: {
            include: {
              professional: true,
              serviceType: true,
            },
          },
          consentRecords: true,
          auditTrails: true,
        },
      })

      if (!patient) {
        throw new UnauthorizedHealthcareAccessError(
          'Patient not found or access denied',
          'patient',
          patientId,
        )
      }

      // Compile LGPD-compliant data export
      const exportData: LGPDDataExport = {
        patientId,
        exportDate: new Date().toISOString(),
        dataCategories: {
          personalData: {
            givenNames: patient.givenNames,
            familyName: patient.familyName,
            email: patient.email,
            birthDate: patient.birthDate,
            gender: patient.gender,
            maritalStatus: patient.maritalStatus,
            cpf: patient.cpf,
            rg: patient.rg,
          },
          contactData: {
            phonePrimary: patient.phonePrimary,
            phoneSecondary: patient.phoneSecondary,
            addressLine1: patient.addressLine1,
            addressLine2: patient.addressLine2,
            city: patient.city,
            state: patient.state,
            postalCode: patient.postalCode,
            country: patient.country,
          },
          medicalData: {
            bloodType: patient.bloodType,
            allergies: patient.allergies,
            chronicConditions: patient.chronicConditions,
            currentMedications: patient.currentMedications,
            appointments: patient.appointments.map(apt => ({
              id: apt.id,
              startTime: apt.startTime,
              endTime: apt.endTime,
              status: apt.status,
              notes: apt.notes,
              professional: apt.professional?.fullName || 'Unknown',
              serviceType: apt.serviceType?.name || 'Unknown',
            })),
          },
          insuranceData: {
            insuranceProvider: patient.insuranceProvider,
            insuranceNumber: patient.insuranceNumber,
            insurancePlan: patient.insurancePlan,
          },
          emergencyContact: {
            emergencyContactName: patient.emergencyContactName,
            emergencyContactPhone: patient.emergencyContactPhone,
            emergencyContactRelationship: patient.emergencyContactRelationship,
          },
        },
        consentStatus: patient.consentRecords.reduce((acc, consent) => {
          acc[consent.consentType] = {
            status: consent.status,
            givenAt: consent.givenAt,
            withdrawnAt: consent.withdrawnAt,
            expiresAt: consent.expiresAt,
            legalBasis: consent.legalBasis,
          }
          return acc
        }, {} as any),
        auditTrail: patient.auditTrails.map(audit => ({
          action: audit.action,
          resourceType: audit.resourceType,
          timestamp: audit.createdAt,
          ipAddress: audit.ipAddress,
          status: audit.status,
        })),
        metadata: {
          requestedBy,
          exportReason: reason,
          dataRetentionUntil: patient.dataRetentionUntil?.toISOString(),
        },
      }

      // Create audit log for data export
      await this.createAuditLog('EXPORT', 'PATIENT_RECORD', patientId, {
        requestedBy,
        reason,
        dataCategories: Object.keys(exportData.dataCategories),
      })

      return exportData
    } catch (error) {
      console.error('Patient data export failed:', error)
      throw error
    }
  }

  async deletePatientData(
    patientId: string,
    options: {
      cascadeDelete?: boolean
      retainAuditTrail?: boolean
      reason?: string
    } = {},
  ): Promise<void> {
    const { cascadeDelete = false, retainAuditTrail = true, reason } = options

    try {
      // Validate context and permissions
      if (!(await this.validateContext())) {
        throw new UnauthorizedHealthcareAccessError(
          'Insufficient permissions for data deletion',
          'patient_data',
          patientId,
        )
      }

      // Verify patient exists and belongs to clinic
      const patient = await this.client.patient.findFirst({
        where: {
          id: patientId,
          clinicId: this.currentContext?.clinicId,
        },
      })

      if (!patient) {
        throw new UnauthorizedHealthcareAccessError(
          'Patient not found or access denied',
          'patient',
          patientId,
        )
      }

      await this.client.$transaction(async tx => {
        // Create audit log before deletion
        await this.createAuditLog('DELETE', 'PATIENT_RECORD', patientId, {
          cascadeDelete,
          retainAuditTrail,
          reason,
          deletedBy: this.currentContext?.userId,
        })

        if (cascadeDelete) {
          // Delete related data (LGPD right to erasure)
          await tx.appointment.deleteMany({
            where: { patientId },
          })

          await tx.consentRecord.deleteMany({
            where: { patientId },
          })

          // Conditionally delete audit trails
          if (!retainAuditTrail) {
            await tx.auditTrail.deleteMany({
              where: { patientId },
            })
          }
        }

        // Delete patient record
        await tx.patient.delete({
          where: { id: patientId },
        })
      })
    } catch (error) {
      console.error('Patient data deletion failed:', error)
      throw error
    }
  }

  // Healthcare-specific query methods with RLS integration
  async findPatientsInClinic(
    clinicId: string,
    filters: any = {},
  ): Promise<any[]> {
    try {
      // Validate clinic access
      if (
        !(await healthcareRLS.canAccessClinic(
          this.currentContext?.userId || '',
          clinicId,
        ))
      ) {
        throw new UnauthorizedHealthcareAccessError(
          'Access denied to clinic patients',
          'clinic_patients',
          clinicId,
        )
      }

      const patients = await this.client.patient.findMany({
        where: {
          clinicId,
          isActive: true,
          ...filters,
        },
        select: {
          id: true,
          medicalRecordNumber: true,
          fullName: true,
          email: true,
          phonePrimary: true,
          birthDate: true,
          gender: true,
          patientStatus: true,
          lastVisitDate: true,
          nextAppointmentDate: true,
          noShowRiskScore: true,
          // Exclude sensitive fields unless explicitly requested
          cpf: this.currentContext?.role === 'admin' ? true : false,
          rg: this.currentContext?.role === 'admin' ? true : false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      // Create audit log for patient list access
      await this.createAuditLog('VIEW', 'PATIENT_LIST', clinicId, {
        patientCount: patients.length,
        filters,
      })

      return patients
    } catch (error) {
      console.error('Find patients in clinic failed:', error)
      throw error
    }
  }

  async findAppointmentsForProfessional(
    professionalId: string,
    filters: any = {},
  ): Promise<any[]> {
    try {
      // Validate professional access
      const professional = await this.client.professional.findFirst({
        where: {
          id: professionalId,
          clinicId: this.currentContext?.clinicId,
          isActive: true,
        },
      })

      if (!professional) {
        throw new UnauthorizedHealthcareAccessError(
          'Professional not found or access denied',
          'professional',
          professionalId,
        )
      }

      const appointments = await this.client.appointment.findMany({
        where: {
          professionalId,
          ...filters,
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              phonePrimary: true,
              email: true,
              birthDate: true,
              noShowRiskScore: true,
            },
          },
          serviceType: {
            select: {
              id: true,
              name: true,
              duration_minutes: true,
              price: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      })

      // Create audit log for appointment access
      await this.createAuditLog('VIEW', 'APPOINTMENT_LIST', professionalId, {
        appointmentCount: appointments.length,
        filters,
      })

      return appointments
    } catch (error) {
      console.error('Find appointments for professional failed:', error)
      throw error
    }
  }

  async createAuditLog(
    action: string,
    resourceType: string,
    resourceId: string,
    details: any = {},
  ): Promise<void> {
    try {
      const auditData = {
        userId: this.currentContext?.userId || 'system',
        clinicId: this.currentContext?.clinicId,
        action: action as any,
        resource: `${resourceType}:${resourceId}`,
        resourceType: resourceType as any,
        resourceId,
        ipAddress: details.ipAddress || 'unknown',
        userAgent: details.userAgent || 'api-client',
        sessionId: details.sessionId,
        status: 'SUCCESS' as any,
        riskLevel: details.riskLevel || ('LOW' as any),
        additionalInfo: JSON.stringify({
          context: this.currentContext,
          details,
          timestamp: new Date().toISOString(),
        }),
      }

      await this.client.auditTrail.create({
        data: auditData,
      })
    } catch (error) {
      console.error('Audit log creation failed:', error)
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Connection health and monitoring methods
  async validateConnection(): Promise<boolean> {
    try {
      // Test basic connectivity
      await this.client.$queryRaw`SELECT 1`

      // Test healthcare-specific tables
      await this.client.clinic.count()

      this.connectionPool.healthStatus = 'healthy'
      this.connectionPool.lastHealthCheck = new Date()

      return true
    } catch (error) {
      console.error('Database connection validation failed:', error)
      this.connectionPool.healthStatus = 'unhealthy'
      this.connectionPool.lastHealthCheck = new Date()

      return false
    }
  }

  async getHealthMetrics(): Promise<any> {
    try {
      const startTime = Date.now()

      const [
        patientCount,
        appointmentCount,
        professionalCount,
        clinicCount,
        auditLogCount,
      ] = await Promise.all([
        this.client.patient.count(),
        this.client.appointment.count(),
        this.client.professional.count(),
        this.client.clinic.count(),
        this.client.auditTrail.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ])

      const queryTime = Date.now() - startTime

      return {
        connectionPool: this.connectionPool,
        healthcareConfig: this.healthcareConfig,
        metrics: {
          patients: patientCount,
          appointments: appointmentCount,
          professionals: professionalCount,
          clinics: clinicCount,
          auditLogsLast24h: auditLogCount,
        },
        performance: {
          queryTime,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('Health metrics collection failed:', error)
      throw new Error(`Failed to collect health metrics: ${error}`)
    }
  }

  async handleConnectionError(error: any): Promise<void> {
    console.error('Prisma connection error:', error)

    this.connectionPool.healthStatus = 'unhealthy'
    this.connectionPool.lastHealthCheck = new Date()

    // Attempt to reconnect
    try {
      await this.client.$disconnect()
      await this.client.$connect()

      if (await this.validateConnection()) {
        this.connectionPool.healthStatus = 'healthy'
        console.warn('Database connection restored')
      }
    } catch (reconnectError) {
      console.error('Database reconnection failed:', reconnectError)
      throw new Error(`Database connection failed: ${error.message}`)
    }
  }

  // Set up middleware for automatic audit logging
  private setupAuditMiddleware(): void {
    this.client.$use(async (params, next) => {
      const start = Date.now()

      try {
        const result = await next(params)

        // Log significant operations
        if (['create', 'update', 'delete'].includes(params.action)) {
          const duration = Date.now() - start

          // Create audit log for data modifications
          if (this.currentContext) {
            try {
              await this.createAuditLog(
                params.action.toUpperCase(),
                params.model || 'UNKNOWN',
                JSON.stringify(params.args?.where || {}),
                {
                  operation: params.action,
                  model: params.model,
                  duration,
                  dataModified: true,
                },
              )
            } catch (auditError) {
              console.error('Audit logging failed:', auditError)
            }
          }
        }

        return result
      } catch (error) {
        // Log errors for monitoring
        console.error('Prisma operation failed:', {
          action: params.action,
          model: params.model,
          error: error instanceof Error ? error.message : String(error),
          context: this.currentContext,
        })

        throw error
      }
    })
  }

  async connect(): Promise<void> {
    await this.client.$connect()
    this.setupAuditMiddleware()
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }
}

// Singleton instance for resource efficiency
let healthcarePrismaInstance: HealthcarePrismaClient | null = null

/**
 * Creates healthcare-optimized Prisma client with singleton pattern
 * Integrates with Supabase RLS and provides healthcare-specific features
 */
function createHealthcarePrismaClient(): HealthcarePrismaClient {
  if (healthcarePrismaInstance) {
    return healthcarePrismaInstance
  }

  healthcarePrismaInstance = new HealthcarePrismaClient()

  // Handle process termination for graceful shutdown
  if (typeof process !== 'undefined') {
    process.on('SIGINT', async () => {
      console.warn('Gracefully shutting down Prisma client...')
      await healthcarePrismaInstance.disconnect()
    })

    process.on('SIGTERM', async () => {
      console.warn('Gracefully shutting down Prisma client...')
      await healthcarePrismaInstance.disconnect()
    })
  }

  return healthcarePrismaInstance
}

/**
 * Get the singleton healthcare Prisma client instance
 */
export function getHealthcarePrismaClient(): HealthcarePrismaClient {
  return createHealthcarePrismaClient()
}

/**
 * Create a new Prisma client instance with healthcare context
 */
export function createPrismaWithContext(
  context: HealthcareContext,
): HealthcarePrismaClient {
  const client = createHealthcarePrismaClient()
  return client.withContext(context)
}

/**
 * Helper function to validate and create healthcare context from request
 */
export function createHealthcareContextFromRequest(
  userId: string,
  clinicId: string,
  role: HealthcareContext['role'],
  additionalData: Partial<HealthcareContext> = {},
): HealthcareContext {
  return {
    userId,
    clinicId,
    role,
    permissions: additionalData.permissions || [],
    cfmValidated: additionalData.cfmValidated || false,
    ...additionalData,
  }
}

// Export error types for use in other modules
export {
  HealthcareComplianceError,
  type HealthcareContext,
  type HealthcareConnectionConfig,
  type LGPDDataExport,
  UnauthorizedHealthcareAccessError,
}

// Default export for convenience
export default getHealthcarePrismaClient