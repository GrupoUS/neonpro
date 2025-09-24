/**
 * Compliance Management Router - tRPC endpoints for Brazilian aesthetic clinic compliance
 * Handles LGPD, ANVISA, and Professional Council compliance requirements
 */

import { ComplianceManagementService } from '@neonpro/core-services'
import { createTRPCRouter } from '@trpc/server'
import { z } from 'zod'
// Removed unused @neonpro/types import

// Input schemas
const ComplianceAssessmentInputSchema = z.object({
  requirementId: z.string(),
  clinicId: z.string(),
  assessmentType: z.enum(['automated', 'manual', 'external_audit']),
  findings: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  evidenceUrls: z.array(z.string()).optional(),
  assessedBy: z.string().optional(),
})

const DataConsentInputSchema = z.object({
  clientId: z.string(),
  clinicId: z.string(),
  consentType: z.enum(['data_processing', 'marketing', 'photos', 'treatment_sharing']),
  consentVersion: z.string(),
  consentDocumentUrl: z.string().url().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
})

const DataSubjectRequestInputSchema = z.object({
  clientId: z.string(),
  clinicId: z.string(),
  requestType: z.enum(['access', 'rectification', 'erasure', 'portability', 'objection']),
  requestDescription: z.string().optional(),
  requestedData: z.array(z.string()).optional(),
})

const DataBreachInputSchema = z.object({
  clinicId: z.string(),
  breachType: z.enum(['unauthorized_access', 'data_loss', 'theft', 'disclosure']),
  severityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10),
  affectedDataTypes: z.array(z.string()).optional(),
  affectedClientsCount: z.number().int().min(0).optional(),
  reportedBy: z.string().optional(),
})

const ComplianceAlertInputSchema = z.object({
  clinicId: z.string(),
  alertType: z.enum([
    'consent_expiry',
    'license_expiry',
    'assessment_due',
    'data_breach',
    'compliance_violation',
  ]),
  severityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1),
  description: z.string().min(1),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
})

const ComplianceReportInputSchema = z.object({
  clinicId: z.string(),
  reportType: z.enum([
    'lgpd_summary',
    'anvisa_compliance',
    'license_status',
    'data_breach',
    'assessment_summary',
  ]),
  reportPeriodStart: z.string().datetime(),
  reportPeriodEnd: z.string().datetime(),
  generatedBy: z.string().optional(),
})

const UpdateAssessmentStatusSchema = z.object({
  assessmentId: z.string(),
  status: z.enum(['pending', 'in_progress', 'passed', 'failed', 'requires_action']),
  score: z.number().min(0).max(100).optional(),
})

const WithdrawConsentSchema = z.object({
  consentId: z.string(),
  withdrawalReason: z.string().optional(),
})

const ProcessDataSubjectRequestSchema = z.object({
  requestId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  responseText: z.string().optional(),
  processedBy: z.string().optional(),
})

const UpdateDataBreachSchema = z.object({
  incidentId: z.string(),
  breachStartDate: z.string().datetime().optional(),
  containmentDate: z.string().datetime().optional(),
  resolutionDate: z.string().datetime().optional(),
  mitigationActions: z.array(z.string()).optional(),
  notificationSentToAuthority: z.boolean().optional(),
  notificationSentToClients: z.boolean().optional(),
})

const UpdateAnvisaComplianceSchema = z.object({
  productId: z.string(),
  anvisaRegistrationNumber: z.string().optional(),
  registrationStatus: z.enum(['active', 'expired', 'suspended', 'cancelled']).optional(),
  registrationDate: z.string().date().optional(),
  expiryDate: z.string().date().optional(),
  lastVerificationDate: z.string().date().optional(),
  isCompliant: z.boolean().optional(),
  complianceNotes: z.string().optional(),
  alertThresholdDays: z.number().int().min(1).optional(),
})

const UpdateLicenseComplianceSchema = z.object({
  professionalId: z.string(),
  licenseType: z.enum(['CRM', 'COREN', 'CFF', 'CNEP']),
  licenseNumber: z.string(),
  issuingCouncil: z.string(),
  licenseStatus: z.enum(['active', 'expired', 'suspended', 'cancelled']),
  expiryDate: z.string().date(),
  renewalDate: z.string().date().optional(),
  isVerified: z.boolean().optional(),
  verificationDocumentUrl: z.string().url().optional(),
  lastVerificationDate: z.string().date().optional(),
  alertThresholdDays: z.number().int().min(1).optional(),
})

const ResolveAlertSchema = z.object({
  alertId: z.string(),
  resolvedBy: z.string(),
  resolutionNotes: z.string().optional(),
})

// Response schemas
const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
})

const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any(),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
})

export const complianceManagementRouter = createTRPCRouter({
  // Compliance Categories and Requirements
  getComplianceCategories: {
    input: z.object({
      regulatoryBody: z.string().optional(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const categories = await complianceService.getComplianceCategories(input.regulatoryBody)

        return {
          success: true,
          message: 'Categorias de compliance obtidas com sucesso',
          data: categories,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar categorias de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getComplianceRequirements: {
    input: z.object({
      categoryId: z.string().optional(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const requirements = await complianceService.getComplianceRequirements(input.categoryId)

        return {
          success: true,
          message: 'Requisitos de compliance obtidos com sucesso',
          data: requirements,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar requisitos de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Compliance Assessments
  createComplianceAssessment: {
    input: ComplianceAssessmentInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const assessment = await complianceService.createComplianceAssessment(input)

        return {
          success: true,
          message: 'Avaliação de compliance criada com sucesso',
          data: assessment,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao criar avaliação de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getComplianceAssessments: {
    input: z.object({
      clinicId: z.string(),
      status: z.string().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }),
    output: PaginatedResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const assessments = await complianceService.getComplianceAssessments(
          input.clinicId,
          input.status,
        )

        const startIndex = (input.page - 1) * input.pageSize
        const endIndex = startIndex + input.pageSize
        const paginatedData = assessments.slice(startIndex, endIndex)

        return {
          success: true,
          message: 'Avaliações de compliance obtidas com sucesso',
          data: paginatedData,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total: assessments.length,
            totalPages: Math.ceil(assessments.length / input.pageSize),
          },
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar avaliações de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  updateAssessmentStatus: {
    input: UpdateAssessmentStatusSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const assessment = await complianceService.updateAssessmentStatus(
          input.assessmentId,
          input.status,
          input.score,
        )

        return {
          success: true,
          message: 'Status da avaliação atualizado com sucesso',
          data: assessment,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao atualizar status da avaliação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Data Consent Management
  createDataConsent: {
    input: DataConsentInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const consent = await complianceService.createDataConsent(input)

        return {
          success: true,
          message: 'Registro de consentimento criado com sucesso',
          data: consent,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao criar registro de consentimento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getClientConsents: {
    input: z.object({
      clientId: z.string(),
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const consents = await complianceService.getClientConsents(input.clientId, input.clinicId)

        return {
          success: true,
          message: 'Consentimentos do cliente obtidos com sucesso',
          data: consents,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar consentimentos do cliente',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  withdrawConsent: {
    input: WithdrawConsentSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const consent = await complianceService.withdrawConsent(
          input.consentId,
          input.withdrawalReason,
        )

        return {
          success: true,
          message: 'Consentimento revogado com sucesso',
          data: consent,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao revogar consentimento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Data Subject Rights Management
  createDataSubjectRequest: {
    input: DataSubjectRequestInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const request = await complianceService.createDataSubjectRequest(input)

        return {
          success: true,
          message: 'Solicitação de titular criada com sucesso',
          data: request,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao criar solicitação de titular',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getDataSubjectRequests: {
    input: z.object({
      clinicId: z.string(),
      status: z.string().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }),
    output: PaginatedResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const requests = await complianceService.getDataSubjectRequests(
          input.clinicId,
          input.status,
        )

        const startIndex = (input.page - 1) * input.pageSize
        const endIndex = startIndex + input.pageSize
        const paginatedData = requests.slice(startIndex, endIndex)

        return {
          success: true,
          message: 'Solicitações de titulares obtidas com sucesso',
          data: paginatedData,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total: requests.length,
            totalPages: Math.ceil(requests.length / input.pageSize),
          },
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar solicitações de titulares',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  processDataSubjectRequest: {
    input: ProcessDataSubjectRequestSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const request = await complianceService.processDataSubjectRequest(
          input.requestId,
          input.status,
          input.responseText,
          input.processedBy,
        )

        return {
          success: true,
          message: 'Solicitação de titular processada com sucesso',
          data: request,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao processar solicitação de titular',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Data Breach Management
  createDataBreachIncident: {
    input: DataBreachInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const incident = await complianceService.createDataBreachIncident(input)

        return {
          success: true,
          message: 'Incidente de vazamento de dados criado com sucesso',
          data: incident,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao criar incidente de vazamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getDataBreachIncidents: {
    input: z.object({
      clinicId: z.string(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }),
    output: PaginatedResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const incidents = await complianceService.getDataBreachIncidents(input.clinicId)

        const startIndex = (input.page - 1) * input.pageSize
        const endIndex = startIndex + input.pageSize
        const paginatedData = incidents.slice(startIndex, endIndex)

        return {
          success: true,
          message: 'Incidentes de vazamento obtidos com sucesso',
          data: paginatedData,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total: incidents.length,
            totalPages: Math.ceil(incidents.length / input.pageSize),
          },
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar incidentes de vazamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  updateDataBreachIncident: {
    input: z.object({
      incidentId: z.string(),
      updates: UpdateDataBreachSchema,
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const incident = await complianceService.updateDataBreachIncident(
          input.incidentId,
          input.updates,
        )

        return {
          success: true,
          message: 'Incidente de vazamento atualizado com sucesso',
          data: incident,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao atualizar incidente de vazamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // ANVISA Compliance Management
  updateAnvisaCompliance: {
    input: UpdateAnvisaComplianceSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const compliance = await complianceService.updateAnvisaCompliance(input.productId, input)

        return {
          success: true,
          message: 'Compliance ANVISA atualizado com sucesso',
          data: compliance,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao atualizar compliance ANVISA',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getAnvisaComplianceStatus: {
    input: z.object({
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const compliance = await complianceService.getAnvisaComplianceStatus(input.clinicId)

        return {
          success: true,
          message: 'Status ANVISA obtido com sucesso',
          data: compliance,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar status ANVISA',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Professional License Compliance
  updateProfessionalLicenseCompliance: {
    input: UpdateLicenseComplianceSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const compliance = await complianceService.updateProfessionalLicenseCompliance(
          input.professionalId,
          input,
        )

        return {
          success: true,
          message: 'Compliance de licença profissional atualizado com sucesso',
          data: compliance,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao atualizar compliance de licença',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getProfessionalLicenseCompliance: {
    input: z.object({
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const compliance = await complianceService.getProfessionalLicenseCompliance(input.clinicId)

        return {
          success: true,
          message: 'Compliance de licenças profissionais obtido com sucesso',
          data: compliance,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar compliance de licenças',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Compliance Reports
  generateComplianceReport: {
    input: ComplianceReportInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const report = await complianceService.generateComplianceReport(input)

        return {
          success: true,
          message: 'Relatório de compliance gerado com sucesso',
          data: report,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao gerar relatório de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  getComplianceReports: {
    input: z.object({
      clinicId: z.string(),
      reportType: z.string().optional(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }),
    output: PaginatedResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        let query = ctx.supabase
          .from('compliance_reports')
          .select('*')
          .eq('clinic_id', input.clinicId)

        if (input.reportType) {
          query = query.eq('report_type', input.reportType)
        }

        query = query.order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
          throw error
        }

        const startIndex = (input.page - 1) * input.pageSize
        const endIndex = startIndex + input.pageSize
        const paginatedData = data?.slice(startIndex, endIndex) || []

        return {
          success: true,
          message: 'Relatórios de compliance obtidos com sucesso',
          data: paginatedData,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total: data?.length || 0,
            totalPages: Math.ceil((data?.length || 0) / input.pageSize),
          },
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar relatórios de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Compliance Alerts
  getComplianceAlerts: {
    input: z.object({
      clinicId: z.string(),
      unresolvedOnly: z.boolean().default(false),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
    }),
    output: PaginatedResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const alerts = await complianceService.getComplianceAlerts(
          input.clinicId,
          input.unresolvedOnly,
        )

        const startIndex = (input.page - 1) * input.pageSize
        const endIndex = startIndex + input.pageSize
        const paginatedData = alerts.slice(startIndex, endIndex)

        return {
          success: true,
          message: 'Alertas de compliance obtidos com sucesso',
          data: paginatedData,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total: alerts.length,
            totalPages: Math.ceil(alerts.length / input.pageSize),
          },
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao buscar alertas de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  createComplianceAlert: {
    input: ComplianceAlertInputSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const alert = await complianceService.createComplianceAlert(input)

        return {
          success: true,
          message: 'Alerta de compliance criado com sucesso',
          data: alert,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao criar alerta de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  resolveAlert: {
    input: ResolveAlertSchema,
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        const alert = await complianceService.resolveAlert(
          input.alertId,
          input.resolvedBy,
          input.resolutionNotes,
        )

        return {
          success: true,
          message: 'Alerta de compliance resolvido com sucesso',
          data: alert,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao resolver alerta de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Automated Compliance Checks
  runAutomatedComplianceChecks: {
    input: z.object({
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        await complianceService.runAutomatedComplianceChecks(input.clinicId)

        return {
          success: true,
          message: 'Verificações automáticas de compliance executadas com sucesso',
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao executar verificações automáticas de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Data Retention Management
  processScheduledDataRetention: {
    input: z.object({
      clinicId: z.string().optional(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)
        await complianceService.processScheduledDataRetention(input.clinicId)

        return {
          success: true,
          message: 'Processamento de retenção de dados agendado com sucesso',
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao processar retenção de dados',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Compliance Dashboard Data
  getComplianceDashboard: {
    input: z.object({
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)

        // Get compliance metrics
        const [alerts, assessments, anvisaCompliance, licenseCompliance] = await Promise.all([
          complianceService.getComplianceAlerts(input.clinicId, true),
          complianceService.getComplianceAssessments(input.clinicId),
          complianceService.getAnvisaComplianceStatus(input.clinicId),
          complianceService.getProfessionalLicenseCompliance(input.clinicId),
        ])

        // Calculate compliance scores
        const totalAssessments = assessments.length
        const passedAssessments = assessments.filter(a => a.status === 'passed').length
        const complianceScore = totalAssessments > 0
          ? (passedAssessments / totalAssessments) * 100
          : 0

        // Calculate alert severity breakdown
        const alertBreakdown = {
          critical: alerts.filter(a => a.severity_level === 'critical').length,
          high: alerts.filter(a => a.severity_level === 'high').length,
          medium: alerts.filter(a => a.severity_level === 'medium').length,
          low: alerts.filter(a => a.severity_level === 'low').length,
        }

        // Calculate compliance status breakdown
        const complianceStatus = {
          anvisaActive: anvisaCompliance.filter(a => a.registration_status === 'active').length,
          anvisaExpired: anvisaCompliance.filter(a => a.registration_status === 'expired').length,
          anvisaExpiringSoon: anvisaCompliance.filter(a => {
            const daysUntilExpiry = Math.ceil(
              (new Date(a.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            )
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0
          }).length,
          licensesActive: licenseCompliance.filter(l => l.license_status === 'active').length,
          licensesExpired: licenseCompliance.filter(l => l.license_status === 'expired').length,
          licensesExpiringSoon: licenseCompliance.filter(l => {
            const daysUntilExpiry = Math.ceil(
              (new Date(l.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            )
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0
          }).length,
        }

        const dashboardData = {
          complianceScore: Math.round(complianceScore),
          totalAlerts: alerts.length,
          totalAssessments,
          alertBreakdown,
          complianceStatus,
          recentAlerts: alerts.slice(0, 5),
          recentAssessments: assessments.slice(0, 5),
        }

        return {
          success: true,
          message: 'Dados do dashboard de compliance obtidos com sucesso',
          data: dashboardData,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao obter dados do dashboard de compliance',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },

  // Get Compliance Categories by Regulatory Body
  getComplianceByRegulatoryBody: {
    input: z.object({
      clinicId: z.string(),
    }),
    output: SuccessResponseSchema,
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const complianceService = new ComplianceManagementService(ctx.supabase)

        const [categories, requirements, assessments] = await Promise.all([
          complianceService.getComplianceCategories(),
          complianceService.getComplianceRequirements(),
          complianceService.getComplianceAssessments(input.clinicId),
        ])

        // Group by regulatory body
        const complianceByBody = categories.reduce((acc, category) => {
          const body = category.regulatory_body
          const bodyRequirements = requirements.filter(r => r.category_id === category.id)
          const bodyAssessments = assessments.filter(a =>
            bodyRequirements.some(r => r.id === a.requirement_id)
          )

          if (!acc[body]) {
            acc[body] = {
              categoryName: category.name,
              totalRequirements: bodyRequirements.length,
              completedAssessments: bodyAssessments.filter(a => a.status === 'passed').length,
              pendingAssessments: bodyAssessments.filter(a => a.status === 'pending').length,
              failedAssessments: bodyAssessments.filter(a => a.status === 'failed').length,
              complianceScore: bodyRequirements.length > 0
                ? (bodyAssessments.filter(a => a.status === 'passed').length /
                  bodyRequirements.length) * 100
                : 0,
            }
          }

          return acc
        }, {} as Record<string, any>)

        return {
          success: true,
          message: 'Compliance por órgão regulador obtido com sucesso',
          data: complianceByBody,
        }
      } catch {
        return {
          success: false,
          message: 'Erro ao obter compliance por órgão regulador',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        }
      }
    },
  },
})
