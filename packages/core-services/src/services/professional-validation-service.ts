/**
 * Professional Validation Service
 * Handles professional certification validation, experience verification, and assignment logic
 * Ensures all aesthetic procedures are performed by qualified professionals
 */

import type {
  AestheticProcedureDetails,
  ProfessionalAssignment
} from './enhanced-aesthetic-scheduling-service'

export interface ProfessionalDetails {
  id: string
  name: string
  specialties: string[]
  certifications: string[]
  experienceLevel: number
  role?: string
  specialNotes?: string
  availabilities?: any[]
  councilType?: 'CFM' | 'COREN' | 'CFF' | 'CNEP'
  councilNumber?: string
  activeLicense: boolean
}

export class ProfessionalValidationService {
  private professionals: Map<string, ProfessionalDetails> = new Map()

  constructor() {
    this.initializeProfessionals()
  }

  /**
   * Validate professional certifications for specific procedures
   */
  async validateProfessionalCertifications(
    professionalId: string,
    procedureIds: string[],
    procedures: Map<string, AestheticProcedureDetails>
  ): Promise<{
    isValid: boolean
    missingCertifications: string[]
    experienceLevel: number
    warnings: string[]
  }> {
    const professional = await this.getProfessionalDetails(professionalId)
    if (!professional) {
      return {
        isValid: false,
        missingCertifications: ['Professional not found'],
        experienceLevel: 0,
        warnings: []
      }
    }

    const missingCertifications: string[] = []
    const warnings: string[] = []
    let isValid = true

    // Check if professional has active license
    if (!professional.activeLicense) {
      missingCertifications.push('Professional license is not active')
      isValid = false
    }

    for (const procedureId of procedureIds) {
      const procedure = procedures.get(procedureId)
      if (!procedure) continue

      // Check required certifications
      for (const cert of procedure.requiredCertifications) {
        if (!professional.certifications?.includes(cert)) {
          missingCertifications.push(`${procedure.name}: ${cert}`)
          isValid = false
        }
      }

      // Check experience level
      if (professional.experienceLevel < procedure.minExperienceLevel) {
        missingCertifications.push(
          `${procedure.name}: Insufficient experience (requires ${procedure.minExperienceLevel}+ years, has ${professional.experienceLevel})`
        )
        isValid = false
      }

      // Check council-specific requirements
      if (procedure.procedureType === 'injectable' && !['CFM', 'CNEP'].includes(professional.councilType || '')) {
        warnings.push(`${procedure.name}: Consider medical council validation for injectables`)
      }

      if (procedure.procedureType === 'surgical' && professional.councilType !== 'CFM') {
        missingCertifications.push(`${procedure.name}: Surgical procedures require CFM certification`)
        isValid = false
      }
    }

    return {
      isValid,
      missingCertifications,
      experienceLevel: professional.experienceLevel,
      warnings
    }
  }

  /**
   * Find suitable professionals for a procedure
   */
  async findSuitableProfessionals(
    procedure: AestheticProcedureDetails,
    preferredProfessionals?: string[]
  ): Promise<ProfessionalDetails[]> {
    const allProfessionals = Array.from(this.professionals.values())
    const suitable: ProfessionalDetails[] = []

    for (const professional of allProfessionals) {
      if (!professional.activeLicense) continue

      // Check if professional has required certifications
      const hasRequiredCerts = procedure.requiredCertifications.every(cert =>
        professional.certifications.includes(cert)
      )

      if (!hasRequiredCerts) continue

      // Check experience level
      if (professional.experienceLevel < procedure.minExperienceLevel) continue

      // Check council requirements for surgical procedures
      if (procedure.procedureType === 'surgical' && professional.councilType !== 'CFM') {
        continue
      }

      // Prioritize preferred professionals
      if (preferredProfessionals && preferredProfessionals.includes(professional.id)) {
        suitable.unshift(professional) // Add to beginning
      } else {
        suitable.push(professional)
      }
    }

    return suitable
  }

  /**
   * Create professional assignments with validation
   */
  async createProfessionalAssignments(
    procedures: AestheticProcedureDetails[],
    preferredProfessionals?: string[]
  ): Promise<ProfessionalAssignment[]> {
    const assignments: ProfessionalAssignment[] = []

    for (const procedure of procedures) {
      const suitableProfessionals = await this.findSuitableProfessionals(
        procedure,
        preferredProfessionals
      )

      if (suitableProfessionals.length > 0) {
        const primary = suitableProfessionals[0]
        if (primary) {
          assignments.push({
            professionalId: primary.id,
            procedureId: procedure.id,
            role: 'primary',
            certificationVerified: true,
            experienceLevel: primary.experienceLevel,
            specialNotes: primary.specialNotes,
          })

          // Assign assistant if required
          if (procedure.specialRequirements.includes('assistant_required')) {
            const assistant = suitableProfessionals.find((p) => p.role === 'assistant')
            if (assistant) {
              assignments.push({
                professionalId: assistant.id,
                procedureId: procedure.id,
                role: 'assistant',
                certificationVerified: true,
                experienceLevel: assistant.experienceLevel,
              })
            }
          }

          // Assign anesthesiologist for surgical procedures
          if (procedure.procedureType === 'surgical') {
            const anesthesiologist = suitableProfessionals.find((p) => p.role === 'anesthesiologist')
            if (anesthesiologist) {
              assignments.push({
                professionalId: anesthesiologist.id,
                procedureId: procedure.id,
                role: 'anesthesiologist',
                certificationVerified: true,
                experienceLevel: anesthesiologist.experienceLevel,
              })
            }
          }
        }
      }
    }

    return assignments
  }

  /**
   * Get professional availability for time slots
   */
  async getProfessionalAvailability(
    professionalId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    start: Date
    end: Date
    available: boolean
  }>> {
    const professional = this.professionals.get(professionalId)
    if (!professional) return []

    // Mock implementation - would integrate with calendar system
    const availability: Array<{
      start: Date
      end: Date
      available: boolean
    }> = []

    const current = new Date(startDate)
    while (current <= endDate) {
      availability.push({
        start: new Date(current),
        end: new Date(current.getTime() + 60 * 60 * 1000), // 1 hour slots
        available: Math.random() > 0.3 // 70% availability
      })
      current.setHours(current.getHours() + 1)
    }

    return availability
  }

  /**
   * Check if professional is available for specific time
   */
  async isProfessionalAvailable(
    professionalId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const availability = await this.getProfessionalAvailability(
      professionalId,
      new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      new Date(endTime.getTime() + 24 * 60 * 60 * 1000) // 1 day after
    )

    return availability.some(slot => 
      slot.start <= startTime && slot.end >= endTime && slot.available
    )
  }

  /**
   * Get professional details by ID
   */
  async getProfessionalDetails(professionalId: string): Promise<ProfessionalDetails | undefined> {
    return this.professionals.get(professionalId)
  }

  /**
   * Add or update professional
   */
  async upsertProfessional(professional: ProfessionalDetails): Promise<void> {
    this.professionals.set(professional.id, professional)
  }

  /**
   * Validate professional license status
   */
  async validateLicenseStatus(professionalId: string): Promise<{
    isValid: boolean
    expires?: Date
    warnings: string[]
  }> {
    const professional = this.professionals.get(professionalId)
    if (!professional) {
      return {
        isValid: false,
        warnings: ['Professional not found']
      }
    }

    // Mock implementation - would integrate with council APIs
    const warnings: string[] = []
    
    // Check if license is expiring soon (within 30 days)
    // const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    // if (professional.licenseExpiry && professional.licenseExpiry <= thirtyDaysFromNow) {
    //   warnings.push('License expiring soon')
    // }

    return {
      isValid: professional.activeLicense,
      // expires: professional.licenseExpiry,
      warnings
    }
  }

  private initializeProfessionals(): void {
    // Initialize with mock professionals
    // This would typically be loaded from database
  }
}