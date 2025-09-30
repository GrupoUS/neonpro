/**
 * Professional Council Integration API Router
 * 
 * Backend API for integration with Brazilian professional councils
 * Features:
 * - CFM (Conselho Federal de Medicina) validation
 * - COREN (Conselho Regional de Enfermagem) verification
 * - CFF (Conselho Federal de Farmácia) compliance
 * - Professional license validation
 * - Continuing education tracking
 * - Regulatory compliance reporting
 */

import { z } from 'zod'
import { router, procedure } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

// Types
export interface ProfessionalLicense {
  id: string
  professionalId: string
  councilType: 'CFM' | 'COREN' | 'CFF' | 'CRP' | 'CRO' | 'OUTRO'
  councilNumber: string
  councilState: string
  registrationDate: Date
  expiryDate: Date
  status: 'active' | 'suspended' | 'expired' | 'revoked'
  specialty?: string
  issuingCouncil: string
  verificationCode?: string
  qrCode?: string
  isValid: boolean
  lastVerified: Date
  verificationDetails: {
    source: string
    verificationMethod: 'api' | 'qr' | 'manual' | 'document'
    verifiedBy: string
    confidence: number
  }
}

export interface ProfessionalValidation {
  id: string
  professionalId: string
  licenseId: string
  validationType: 'initial' | 'renewal' | 'compliance' | 'investigation'
  results: {
    isValid: boolean
    score: number // 0-100
    issues: Array<{
      type: 'warning' | 'error' | 'critical'
      description: string
      recommendation: string
      deadline?: Date
    }>
    recommendations: string[]
  }
  councilResponse: {
    status: 'valid' | 'invalid' | 'pending' | 'error'
    responseCode: string
    responseMessage: string
    responseData: Record<string, any>
    responseDate: Date
  }
  createdAt: Date
  expiresAt: Date
}

export interface ContinuingEducation {
  id: string
  professionalId: string
  councilType: 'CFM' | 'COREN' | 'CFF' | 'CRP' | 'CRO' | 'OUTRO'
  educationType: 'course' | 'conference' | 'workshop' | 'research' | 'publication'
  title: string
  provider: string
  startDate: Date
  endDate: Date
  workload: number // hours
  modality: 'presential' | 'online' | 'hybrid'
  certificateUrl?: string
  credits: number
  category: string
  isValid: boolean
  verifiedAt?: Date
  verificationDetails?: {
    method: 'automatic' | 'manual' | 'external'
    verifiedBy: string
    confidence: number
  }
}

export interface ComplianceReport {
  id: string
  clinicId: string
  reportType: 'monthly' | 'quarterly' | 'annual' | 'special'
  period: {
    startDate: Date
    endDate: Date
  }
  summary: {
    totalProfessionals: number
    validLicenses: number
    expiredLicenses: number
    pendingVerifications: number
    complianceScore: number // 0-100
  }
  details: {
    professionalValidations: ProfessionalValidation[]
    educationCredits: Array<{
      professionalId: string
      totalCredits: number
      requiredCredits: number
      complianceStatus: 'compliant' | 'non_compliant' | 'pending'
    }>
    incidents: Array<{
      type: 'complaint' | 'violation' | 'sanction'
      description: string
      date: Date
      status: 'open' | 'closed' | 'under_investigation'
    }>
  }
  generatedAt: Date
  generatedBy: string
}

// Input schemas
const ValidateLicenseSchema = z.object({
  professionalId: z.string().uuid(),
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CRP', 'CRO', 'OUTRO']),
  councilNumber: z.string().min(1),
  councilState: z.string().length(2),
  specialty: z.string().optional(),
  verificationCode: z.string().optional(),
})

const RegisterContinuingEducationSchema = z.object({
  professionalId: z.string().uuid(),
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CRP', 'CRO', 'OUTRO']),
  educationType: z.enum(['course', 'conference', 'workshop', 'research', 'publication']),
  title: z.string().min(1),
  provider: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  workload: z.number().min(1),
  modality: z.enum(['presential', 'online', 'hybrid']),
  certificateUrl: z.string().url().optional(),
  category: z.string().optional(),
})

const GenerateComplianceReportSchema = z.object({
  clinicId: z.string().uuid(),
  reportType: z.enum(['monthly', 'quarterly', 'annual', 'special']),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  includeDetails: z.boolean().default(true),
});

const CheckProfessionalStatusSchema = z.object({
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CRP', 'CRO', 'OUTRO']),
  councilNumber: z.string().min(1),
  councilState: z.string().length(2),
  verificationCode: z.string().optional(),
});

export const professionalCouncilRouter = router({
  // Validate professional license
  validateLicense: procedure
    .input(ValidateLicenseSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if professional exists in clinic
        const { data: professional, error: professionalError } = await ctx.supabase
          .from('professionals')
          .select('*')
          .eq('id', input.professionalId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (professionalError || !professional) {
          throw new Error('Professional not found or access denied')
        }

        // Perform council validation
        const validationResult = await validateCouncilLicense(input)

        // Store validation result
        const licenseId = crypto.randomUUID()
        const licenseRecord: ProfessionalLicense = {
          id: licenseId,
          professionalId: input.professionalId,
          councilType: input.councilType,
          councilNumber: input.councilNumber,
          councilState: input.councilState,
          registrationDate: validationResult.registrationDate || new Date(),
          expiryDate: validationResult.expiryDate || new Date(),
          status: validationResult.status,
          specialty: input.specialty,
          issuingCouncil: `${input.councilType} - ${input.councilState}`,
          verificationCode: input.verificationCode,
          isValid: validationResult.isValid,
          lastVerified: new Date(),
          verificationDetails: {
            source: validationResult.source,
            verificationMethod: validationResult.verificationMethod,
            verifiedBy: 'neonpro_system',
            confidence: validationResult.confidence,
          },
        }

        // Save to database
        const { data: savedLicense, error: saveError } = await ctx.supabase
          .from('professional_licenses')
          .insert(licenseRecord)
          .select()
          .single()

        if (saveError) throw saveError

        // Update professional record
        await ctx.supabase
          .from('professionals')
          .update({
            council_type: input.councilType,
            council_number: input.councilNumber,
            council_state: input.councilState,
            license_status: validationResult.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.professionalId)

        // Log validation for audit
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'professional_license_validated',
            resource_type: 'professional_council',
            resource_id: input.professionalId,
            details: {
              council_type: input.councilType,
              council_number: input.councilNumber,
              validation_result: validationResult.isValid,
              confidence: validationResult.confidence,
              verification_method: validationResult.verificationMethod,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          license: savedLicense,
          validationResult,
        }
      } catch (error) {
        console.error('Failed to validate license:', error)
        throw new Error('Failed to validate professional license')
      }
    }),

  // Check professional status (public endpoint for quick verification)
  checkProfessionalStatus: procedure
    .input(CheckProfessionalStatusSchema)
    .query(async ({ ctx, input }) => {
      try {
        const statusResult = await checkCouncilStatus(input)

        return {
          success: true,
          status: statusResult,
          verifiedAt: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Failed to check professional status:', error)
        throw new Error('Failed to check professional status')
      }
    }),

  // Register continuing education
  registerContinuingEducation: procedure
    .input(RegisterContinuingEducationSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify professional exists
        const { data: professional, error: professionalError } = await ctx.supabase
          .from('professionals')
          .select('*')
          .eq('id', input.professionalId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (professionalError || !professional) {
          throw new Error('Professional not found or access denied')
        }

        // Create education record
        const educationRecord: ContinuingEducation = {
          id: crypto.randomUUID(),
          professionalId: input.professionalId,
          councilType: input.councilType,
          educationType: input.educationType,
          title: input.title,
          provider: input.provider,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          workload: input.workload,
          modality: input.modality,
          certificateUrl: input.certificateUrl,
          credits: calculateEducationCredits(input),
          category: input.category || 'general',
          isValid: true,
        }

        const { data: savedEducation, error: saveError } = await ctx.supabase
          .from('continuing_education')
          .insert(educationRecord)
          .select()
          .single()

        if (saveError) throw saveError

        // Log education registration
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'continuing_education_registered',
            resource_type: 'professional_council',
            resource_id: input.professionalId,
            details: {
              council_type: input.councilType,
              education_type: input.educationType,
              title: input.title,
              workload: input.workload,
              credits: educationRecord.credits,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          education: savedEducation,
        }
      } catch (error) {
        console.error('Failed to register continuing education:', error)
        throw new Error('Failed to register continuing education')
      }
    }),

  // Get professional education history
  getEducationHistory: procedure
    .input(z.object({
      professionalId: z.string().uuid(),
      councilType: z.enum(['CFM', 'COREN', 'CFF', 'CRP', 'CRO', 'OUTRO']).optional(),
      year: z.number().optional(),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabase
          .from('continuing_education')
          .select('*')
          .eq('professional_id', input.professionalId)

        if (input.councilType) {
          query = query.eq('council_type', input.councilType)
        }

        if (input.year) {
          query = query.gte('start_date', `${input.year}-01-01`)
                     .lte('end_date', `${input.year}-12-31`)
        }

        query = query.order('start_date', { ascending: false })

        const { data: education, error } = await query

        if (error) throw error

        // Calculate totals
        const totalCredits = education?.reduce((sum, item) => sum + item.credits, 0) || 0
        const totalHours = education?.reduce((sum, item) => sum + item.workload, 0) || 0

        return {
          success: true,
          education: education || [],
          summary: {
            totalRecords: education?.length || 0,
            totalCredits,
            totalHours,
            currentYearCredits: education?.filter(item => 
              new Date(item.start_date).getFullYear() === new Date().getFullYear()
            ).reduce((sum, item) => sum + item.credits, 0) || 0,
          },
        }
      } catch (error) {
        console.error('Failed to get education history:', error)
        throw new Error('Failed to get education history')
      }
    }),

  // Generate compliance report
  generateComplianceReport: procedure
    .input(GenerateComplianceReportSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get all professionals for the clinic
        const { data: professionals, error: professionalsError } = await ctx.supabase
          .from('professionals')
          .select('*')
          .eq('clinic_id', input.clinicId)

        if (professionalsError) throw professionalsError

        // Get license validations for the period
        const { data: validations, error: validationsError } = await ctx.supabase
          .from('professional_validations')
          .select('*')
          .eq('clinic_id', input.clinicId)
          .gte('created_at', input.period.startDate)
          .lte('created_at', input.period.endDate)

        if (validationsError) throw validationsError

        // Get education credits for the period
        const { data: education, error: educationError } = await ctx.supabase
          .from('continuing_education')
          .select('*')
          .in('professional_id', professionals?.map(p => p.id) || [])
          .gte('start_date', input.period.startDate)
          .lte('end_date', input.period.endDate)

        if (educationError) throw educationError

        // Calculate compliance metrics
        const totalProfessionals = professionals?.length || 0
        const validLicenses = professionals?.filter(p => p.license_status === 'active').length || 0
        const expiredLicenses = professionals?.filter(p => p.license_status === 'expired').length || 0

        const educationCredits = education?.reduce((acc, item) => {
          const existing = acc.find(e => e.professionalId === item.professional_id)
          if (existing) {
            existing.totalCredits += item.credits
          } else {
            acc.push({
              professionalId: item.professional_id,
              totalCredits: item.credits,
              requiredCredits: getRequiredCredits(item.council_type),
              complianceStatus: 'pending' as const,
            })
          }
          return acc
        }, [] as any[]) || []

        // Update compliance status
        educationCredits.forEach(item => {
          item.complianceStatus = item.totalCredits >= item.requiredCredits ? 'compliant' : 'non_compliant'
        })

        const compliantProfessionals = educationCredits.filter(e => e.complianceStatus === 'compliant').length
        const complianceScore = totalProfessionals > 0 ? Math.round((compliantProfessionals / totalProfessionals) * 100) : 0

        // Create compliance report
        const report: ComplianceReport = {
          id: crypto.randomUUID(),
          clinicId: input.clinicId,
          reportType: input.reportType,
          period: {
            startDate: new Date(input.period.startDate),
            endDate: new Date(input.period.endDate),
          },
          summary: {
            totalProfessionals,
            validLicenses,
            expiredLicenses,
            pendingVerifications: professionals?.filter(p => p.license_status === 'pending').length || 0,
            complianceScore,
          },
          details: {
            professionalValidations: validations || [],
            educationCredits,
            incidents: [], // Would fetch from incidents table
          },
          generatedAt: new Date(),
          generatedBy: ctx.session?.id || 'system',
        }

        // Save report
        const { data: savedReport, error: saveError } = await ctx.supabase
          .from('compliance_reports')
          .insert(report)
          .select()
          .single()

        if (saveError) throw saveError

        // Log report generation
        await ctx.supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: input.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'compliance_report_generated',
            resource_type: 'professional_council',
            resource_id: savedReport.id,
            details: {
              report_type: input.reportType,
              period_start: input.period.startDate,
              period_end: input.period.endDate,
              compliance_score: complianceScore,
              total_professionals: totalProfessionals,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          report: savedReport,
        }
      } catch (error) {
        console.error('Failed to generate compliance report:', error)
        throw new Error('Failed to generate compliance report')
      }
    }),

  // Get compliance alerts
  getComplianceAlerts: procedure
    .input(z.object({
      clinicId: z.string().uuid(),
      alertType: z.enum(['expired_licenses', 'missing_education', 'pending_verifications', 'all']).default('all'),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      try {
        const alerts = []

        // Check for expired licenses
        if (input.alertType === 'expired_licenses' || input.alertType === 'all') {
          const { data: expiredProfessionals } = await ctx.supabase
            .from('professionals')
            .select('*')
            .eq('clinic_id', input.clinicId)
            .in('license_status', ['expired', 'revoked'])

          if (expiredProfessionals) {
            alerts.push(...expiredProfessionals.map(professional => ({
              type: 'expired_license',
              severity: 'high',
              professionalId: professional.id,
              professionalName: professional.name,
              councilType: professional.council_type,
              councilNumber: professional.council_number,
              message: `Licença expirada - ${professional.council_type}/${professional.council_number}`,
              action: 'immediate_renewal_required',
              createdAt: new Date(),
            })))
          }
        }

        // Check for missing education credits
        if (input.alertType === 'missing_education' || input.alertType === 'all') {
          const currentYear = new Date().getFullYear()
          const { data: professionals } = await ctx.supabase
            .from('professionals')
            .select('*')
            .eq('clinic_id', input.clinicId)

          for (const professional of professionals || []) {
            const { data: education } = await ctx.supabase
              .from('continuing_education')
              .select('credits')
              .eq('professional_id', professional.id)
              .gte('start_date', `${currentYear}-01-01`)
              .lte('end_date', `${currentYear}-12-31`)

            const totalCredits = education?.reduce((sum, item) => sum + item.credits, 0) || 0
            const requiredCredits = getRequiredCredits(professional.council_type)

            if (totalCredits < requiredCredits) {
              alerts.push({
                type: 'missing_education',
                severity: 'medium',
                professionalId: professional.id,
                professionalName: professional.name,
                councilType: professional.council_type,
                currentCredits: totalCredits,
                requiredCredits,
                message: `Créditos de educação continuada insuficientes: ${totalCredits}/${requiredCredits}`,
                action: 'complete_education_requirements',
                createdAt: new Date(),
              })
            }
          }
        }

        // Sort by severity and date
        alerts.sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 }
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
        })

        return {
          success: true,
          alerts,
          summary: {
            total: alerts.length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length,
          },
        }
      } catch (error) {
        console.error('Failed to get compliance alerts:', error)
        throw new Error('Failed to get compliance alerts')
      }
    }),
})

// Helper functions (mock implementations - would integrate with actual council APIs)
async function validateCouncilLicense(input: any): Promise<any> {
  // Mock council API validation
  // In production, this would call actual council APIs
  
  const councilAPIs = {
    CFM: {
      endpoint: 'https://www.cfm.org.br/api',
      validationEndpoint: '/profissionais/validacao',
    },
    COREN: {
      endpoint: 'https://portal.coren-sp.gov.br/api',
      validationEndpoint: '/profissionais/consulta',
    },
    CFF: {
      endpoint: 'https://www.cff.org.br/api',
      validationEndpoint: '/profissionais/validacao',
    },
  }

  const council = councilAPIs[input.councilType as keyof typeof councilAPIs]
  
  // Mock validation response
  return {
    isValid: true,
    status: 'active',
    registrationDate: new Date('2015-03-15'),
    expiryDate: new Date('2025-12-31'),
    source: council?.endpoint || 'mock_api',
    verificationMethod: 'api',
    confidence: 95,
    professionalData: {
      name: 'Professional Name',
      councilType: input.councilType,
      councilNumber: input.councilNumber,
      councilState: input.councilState,
      specialty: input.specialty,
    },
  }
}

async function checkCouncilStatus(input: any): Promise<any> {
  // Mock public council status check
  return {
    exists: true,
    status: 'active',
    councilType: input.councilType,
    councilNumber: input.councilNumber,
    councilState: input.councilState,
    name: 'Nome do Profissional',
    lastUpdated: new Date().toISOString(),
    source: 'council_public_api',
  }
}

function calculateEducationCredits(input: any): number {
  // Calculate credits based on workload and type
  const baseCredits = input.workload / 60 // Convert hours to credits (60min = 1 credit)
  const typeMultiplier = {
    course: 1.0,
    conference: 0.8,
    workshop: 1.2,
    research: 1.5,
    publication: 2.0,
  }
  
  return Math.round(baseCredits * (typeMultiplier[input.educationType] || 1.0))
}

function getRequiredCredits(councilType: string): number {
  // Required annual credits by council type
  const requirements = {
    CFM: 40,  // Medical Council
    COREN: 30, // Nursing Council
    CFF: 20,  // Pharmacy Council
    CRP: 36,  // Psychology Council
    CRO: 24,  // Dentistry Council
    OUTRO: 30, // Other councils
  }
  
  return requirements[councilType as keyof typeof requirements] || 30
}