/**
 * LGPD Consent Management API Routes
 * RESTful endpoints for consent operations with Brazilian healthcare compliance
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { timing } from 'hono/timing'
import { logger } from 'hono/logger'

import { 
  lgpdConsentManager, 
  consentWithdrawalService,
  consentAuditService,
  ConsentCategory,
  GranularConsent,
  ConsentWithdrawalRequest,
  DataSubjectRightsRequest
} from '@neonpro/security'

import { 
  authentication, 
  authorization,
  healthcareDataProtection,
  securityLogging 
} from '@neonpro/security/middleware'

// Create consent router
const consentRouter = new Hono()

// Apply middleware
consentRouter.use('*', timing())
consentRouter.use('*', logger())
consentRouter.use('*', healthcareDataProtection())

// Validation schemas
const createConsentSchema = z.object({
  selectedCategoryIds: z.array(z.string()).min(1),
  consentText: z.string().min(10),
  consentVersion: z.string().default('2.0'),
  metadata: z.record(z.any()).optional()
})

const withdrawalRequestSchema = z.object({
  consentId: z.string(),
  categories: z.array(z.string()).min(1),
  reason: z.string().min(5),
  method: z.enum('web', 'mobile', 'email', 'phone', 'in_person']).default('web'),
  effectiveImmediately: z.boolean().default(true)
})

const dataSubjectRightsSchema = z.object({
  rightType: z.enum('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection']),
  requestData: z.record(z.any()).optional()
})

const consentValidationSchema = z.object({
  dataType: z.enum('basic', 'sensitive', 'medical', 'genetic', 'biometric']),
  purpose: z.string().min(1),
  isEmergency: z.boolean().default(false)
})

/**
 * GET /api/consent/categories
 * Get available consent categories
 */
consentRouter.get('/categories', async (c) => {
  try {
    const categories = lgpdConsentManager.getConsentCategories()
    
    // Log access for audit
    await consentAuditService.logConsentEvent({
      eventType: 'data_accessed',
      patientId: c.get('user')?.id || 'unknown',
      clinicId: c.get('user')?.clinicId || 'unknown',
      categories: categories.map(cat => cat.id),
      dataType: 'basic',
      legalBasis: 'legitimate_interest',
      performedBy: {
        userId: c.get('user')?.id,
        role: c.get('user')?._role || 'unknown',
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent')
      },
      details: {
        scope: 'consent_categories_read',
        dataVolume: categories.length
      },
      compliance: {
        lgpdCompliant: true,
        frameworkVersion: '2.0',
        validationPassed: true
      }
    })

    return c.json({
      success: true,
      data: categories,
      metadata: {
        total: categories.length,
        healthcareSpecific: categories.filter(cat => cat.healthcareSpecific).length,
        required: categories.filter(cat => cat.required).length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching consent categories:', error)
    throw new HTTPException(500, { 
      message: 'Erro ao buscar categorias de consentimento' 
    })
  }
})

/**
 * GET /api/consent/patient/:patientId
 * Get patient's current consent status
 */
consentRouter.get('/patient/:patientId', 
  authentication(),
  authorization(['patient', 'healthcare_provider', 'admin']),
  async (c) => {
    try {
      const patientId = c.req.param('patientId')
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      // Authorization check - patients can only access their own data
      if (currentUser._role === 'patient' && currentUser.id !== patientId) {
        throw new HTTPException(403, { 
          message: 'Acesso não autorizado aos dados de outro paciente' 
        })
      }

      // Mock fetching patient consents - replace with actual database query
      const consents: GranularConsent[] = []

      // Log access for audit
      await consentAuditService.logConsentEvent({
        eventType: 'data_accessed',
        patientId,
        clinicId,
        categories: consents.flatMap(c => c.categories.map(cat => cat.id)),
        dataType: 'basic',
        legalBasis: 'consent',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          scope: 'patient_consent_read',
          dataVolume: consents.length
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: {
          patientId,
          clinicId,
          consents,
          activeConsent: consents.find(c => c.status === 'active'),
          summary: {
            totalConsents: consents.length,
            activeConsents: consents.filter(c => c.status === 'active').length,
            withdrawnConsents: consents.filter(c => c.status === 'withdrawn').length,
            expiredConsents: consents.filter(c => c.status === 'expired').length
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          accessedBy: currentUser._role
        }
      })

    } catch (error) {
      if (error instanceof HTTPException) throw error
      
      console.error('Error fetching patient consents:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao buscar consentimentos do paciente' 
      })
    }
  }
)

/**
 * POST /api/consent/patient/:patientId
 * Create new granular consent
 */
consentRouter.post('/patient/:patientId',
  authentication(),
  authorization(['patient', 'healthcare_provider', 'admin']),
  async (c) => {
    try {
      const patientId = c.req.param('patientId')
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      // Authorization check
      if (currentUser._role === 'patient' && currentUser.id !== patientId) {
        throw new HTTPException(403, { 
          message: 'Não autorizado a criar consentimento para outro paciente' 
        })
      }

      const body = await c.req.json()
      const validatedData = createConsentSchema.parse(body)

      // Create granular consent
      const consent = await lgpdConsentManager.createGranularConsent(
        patientId,
        clinicId,
        validatedData.selectedCategoryIds,
        validatedData.consentText,
        validatedData.metadata
      )

      // Log consent creation for audit
      await consentAuditService.logConsentEvent({
        eventType: 'consent_given',
        patientId,
        clinicId,
        consentId: consent.id,
        categories: validatedData.selectedCategoryIds,
        dataType: 'basic',
        legalBasis: 'consent',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          method: 'web_form',
          consentVersion: validatedData.consentVersion,
          categoryCount: validatedData.selectedCategoryIds.length
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: consent,
        message: 'Consentimento criado com sucesso',
        metadata: {
          consentId: consent.id,
          timestamp: new Date().toISOString(),
          version: validatedData.consentVersion
        }
      }, 201)

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Dados inválidos',
          cause: error.errors 
        })
      }
      
      if (error instanceof HTTPException) throw error
      
      console.error('Error creating consent:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao criar consentimento' 
      })
    }
  }
)

/**
 * POST /api/consent/withdraw
 * Process consent withdrawal request
 */
consentRouter.post('/withdraw',
  authentication(),
  authorization(['patient', 'healthcare_provider', 'admin']),
  async (c) => {
    try {
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      const body = await c.req.json()
      const validatedData = withdrawalRequestSchema.parse(body)

      // Verify consent ownership
      // In production, verify that the consent belongs to the requesting patient
      if (currentUser._role === 'patient') {
        // Mock validation - replace with actual database check
        const isConsentOwner = true // Should verify in database
        if (!isConsentOwner) {
          throw new HTTPException(403, { 
            message: 'Não autorizado a revogar consentimento de outro paciente' 
          })
        }
      }

      const withdrawalRequest: ConsentWithdrawalRequest = {
        patientId: currentUser.id, // For patient role, or specified patient for admin/provider
        clinicId,
        consentId: validatedData.consentId,
        categories: validatedData.categories,
        reason: validatedData.reason,
        method: validatedData.method,
        requestedAt: new Date(),
        effectiveImmediately: validatedData.effectiveImmediately
      }

      // Process withdrawal
      const result = await consentWithdrawalService.processWithdrawal(withdrawalRequest)

      // Log withdrawal for audit
      await consentAuditService.logConsentEvent({
        eventType: 'consent_withdrawn',
        patientId: withdrawalRequest.patientId,
        clinicId,
        consentId: validatedData.consentId,
        categories: validatedData.categories,
        dataType: 'basic',
        legalBasis: 'consent_withdrawal',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          reason: validatedData.reason,
          method: validatedData.method,
          effectiveImmediately: validatedData.effectiveImmediately,
          categoriesCount: validatedData.categories.length
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: {
          confirmationId: result.confirmationId,
          impact: result.impact,
          emergencyOverrides: result.emergencyOverrides,
          complianceDeadline: result.complianceDeadline
        },
        message: 'Solicitação de revogação processada com sucesso',
        metadata: {
          timestamp: new Date().toISOString(),
          processedBy: currentUser._role
        }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Dados inválidos',
          cause: error.errors 
        })
      }
      
      if (error instanceof HTTPException) throw error
      
      console.error('Error processing withdrawal:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao processar revogação de consentimento' 
      })
    }
  }
)

/**
 * POST /api/consent/validate
 * Validate consent for data access
 */
consentRouter.post('/validate',
  authentication(),
  authorization(['healthcare_provider', 'admin', 'system']),
  async (c) => {
    try {
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      const body = await c.req.json()
      const validatedData = consentValidationSchema.parse(body)

      // Extract patientId from request or context
      const patientId = body.patientId || c.req.param('patientId')
      
      if (!patientId) {
        throw new HTTPException(400, { 
          message: 'ID do paciente é obrigatório' 
        })
      }

      // Validate consent
      const validationResult = await lgpdConsentManager.validateConsentForDataAccess(
        patientId,
        clinicId,
        validatedData.dataType,
        validatedData.purpose,
        validatedData.isEmergency
      )

      // Log validation for audit
      await consentAuditService.logConsentEvent({
        eventType: validationResult.authorized ? 'data_accessed' : 'data_access_denied',
        patientId,
        clinicId,
        categories: [validatedData.dataType],
        dataType: validatedData.dataType,
        legalBasis: validationResult.emergencyOverride ? 'vital_interest' : 'consent',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          purpose: validatedData.purpose,
          dataType: validatedData.dataType,
          emergencyOverride: validationResult.emergencyOverride,
          authorized: validationResult.authorized
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: validationResult.authorized
        }
      })

      return c.json({
        success: true,
        data: validationResult,
        metadata: {
          timestamp: new Date().toISOString(),
          validatedBy: currentUser._role
        }
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Dados inválidos',
          cause: error.errors 
        })
      }
      
      if (error instanceof HTTPException) throw error
      
      console.error('Error validating consent:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao validar consentimento' 
      })
    }
  }
)

/**
 * POST /api/consent/data-subject-rights
 * Process data subject rights requests
 */
consentRouter.post('/data-subject-rights',
  authentication(),
  authorization(['patient', 'admin']),
  async (c) => {
    try {
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      const body = await c.req.json()
      const validatedData = dataSubjectRightsSchema.parse(body)

      const request: DataSubjectRightsRequest = {
        patientId: currentUser.id,
        clinicId,
        rightType: validatedData.rightType,
        requestData: validatedData.requestData || {},
        requestedAt: new Date(),
        status: 'pending'
      }

      // Process data subject rights request
      // In production, this would create a workflow and notify relevant teams
      const requestId = crypto.randomUUID()
      
      // Log rights request for audit
      await consentAuditService.logConsentEvent({
        eventType: 'data_accessed',
        patientId: request.patientId,
        clinicId,
        categories: ['data_subject_rights'],
        dataType: 'basic',
        legalBasis: 'legal_obligation',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          rightType: validatedData.rightType,
          requestData: validatedData.requestData,
          requestId
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: {
          requestId,
          rightType: validatedData.rightType,
          status: 'pending',
          estimatedProcessingTime: '15 dias corridos'
        },
        message: 'Solicitação de direitos do titular registrada com sucesso',
        metadata: {
          lgpdReference: 'Art. 18 da LGPD',
          timestamp: new Date().toISOString()
        }
      }, 202)

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { 
          message: 'Dados inválidos',
          cause: error.errors 
        })
      }
      
      if (error instanceof HTTPException) throw error
      
      console.error('Error processing data subject rights:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao processar solicitação de direitos do titular' 
      })
    }
  }
)

/**
 * GET /api/consent/audit/:patientId
 * Get patient's consent audit trail
 */
consentRouter.get('/audit/:patientId',
  authentication(),
  authorization(['patient', 'healthcare_provider', 'admin']),
  async (c) => {
    try {
      const patientId = c.req.param('patientId')
      const currentUser = c.get('user')
      const clinicId = currentUser.clinicId

      // Authorization check
      if (currentUser._role === 'patient' && currentUser.id !== patientId) {
        throw new HTTPException(403, { 
          message: 'Acesso não autorizado ao histórico de outro paciente' 
        })
      }

      const format = c.req.query('format') as 'json' | 'csv' | 'pdf' || 'json'
      
      // Export audit trail
      const auditExport = await consentAuditService.exportAuditTrail(
        patientId,
        clinicId,
        format
      )

      // Log audit export for compliance
      await consentAuditService.logConsentEvent({
        eventType: 'data_accessed',
        patientId,
        clinicId,
        categories: ['audit_trail'],
        dataType: 'basic',
        legalBasis: 'legal_obligation',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          exportFormat: format,
          recordCount: auditExport.recordCount
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      if (format === 'json') {
        return c.json({
          success: true,
          data: auditExport.data,
          metadata: {
            filename: auditExport.filename,
            generatedAt: auditExport.generatedAt.toISOString(),
            recordCount: auditExport.recordCount,
            exportedBy: currentUser._role
          }
        })
      } else {
        // For CSV/PDF, return file download
        return new Response(auditExport.data, {
          headers: {
            'Content-Type': format === 'csv' ? 'text/csv' : 'application/pdf',
            'Content-Disposition': `attachment; filename="${auditExport.filename}"`
          }
        })
      }

    } catch (error) {
      if (error instanceof HTTPException) throw error
      
      console.error('Error exporting audit trail:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao exportar histórico de auditoria' 
      })
    }
  }
)

/**
 * GET /api/consent/compliance/:clinicId
 * Get compliance metrics for clinic
 */
consentRouter.get('/compliance/:clinicId',
  authentication(),
  authorization(['admin', 'clinic_admin']),
  async (c) => {
    try {
      const clinicId = c.req.param('clinicId')
      const currentUser = c.get('user')

      // Get compliance metrics
      const metrics = await consentAuditService.getComplianceMetrics(clinicId)

      // Log compliance access for audit
      await consentAuditService.logConsentEvent({
        eventType: 'data_accessed',
        patientId: 'system',
        clinicId,
        categories: ['compliance_metrics'],
        dataType: 'basic',
        legalBasis: 'legitimate_interest',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          scope: 'compliance_dashboard',
          metricsGenerated: true
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: metrics,
        metadata: {
          timestamp: new Date().toISOString(),
          generatedBy: currentUser._role,
          clinicId
        }
      })

    } catch (error) {
      console.error('Error fetching compliance metrics:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao buscar métricas de compliance' 
      })
    }
  }
)

/**
 * POST /api/consent/report/:clinicId
 * Generate compliance report
 */
consentRouter.post('/report/:clinicId',
  authentication(),
  authorization(['admin', 'clinic_admin']),
  async (c) => {
    try {
      const clinicId = c.req.param('clinicId')
      const currentUser = c.get('user')

      const body = await c.req.json()
      const reportType = body.reportType || 'consent_summary'
      const startDate = body.startDate ? new Date(body.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = body.endDate ? new Date(body.endDate) : new Date()

      // Generate compliance report
      const report = await consentAuditService.generateAuditReport(
        clinicId,
        reportType,
        { start: startDate, end: endDate }
      )

      // Log report generation for audit
      await consentAuditService.logConsentEvent({
        eventType: 'data_accessed',
        patientId: 'system',
        clinicId,
        categories: ['compliance_report'],
        dataType: 'basic',
        legalBasis: 'legitimate_interest',
        performedBy: {
          userId: currentUser.id,
          role: currentUser._role,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent')
        },
        details: {
          reportType,
          period: { start: startDate, end: endDate },
          issuesFound: report.data.issues.length
        },
        compliance: {
          lgpdCompliant: true,
          frameworkVersion: '2.0',
          validationPassed: true
        }
      })

      return c.json({
        success: true,
        data: report,
        metadata: {
          timestamp: new Date().toISOString(),
          generatedBy: currentUser._role,
          reportId: report.id
        }
      })

    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw new HTTPException(500, { 
        message: 'Erro ao gerar relatório de compliance' 
      })
    }
  }
)

export default consentRouter