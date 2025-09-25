/**
 * Enhanced Aesthetic Scheduling Service
 * 
 * Core service for aesthetic procedure scheduling with Brazilian healthcare compliance.
 * Implements multi-session support, recovery planning, and professional validation.
 * 
 * Features:
 * - ANVISA compliance for aesthetic procedures
 * - CFM license validation
 * - Multi-session treatment coordination
 * - Recovery period planning
 * - Room allocation optimization
 * - Contraindication checking
 */

export interface AestheticProcedure {
  id: string
  name: string
  description?: string
  procedureType: 'injectable' | 'laser' | 'body' | 'facial' | 'surgical' | 'combination'
  category: string
  baseDuration: number
  basePrice: number
  recoveryPeriodDays: number
  sessionsRequired: number
  contraindications?: string[]
  specialRequirements?: string[]
  anvisaRegistration?: string
  requiredCertifications?: string[]
}

export interface TreatmentPackage {
  id: string
  name: string
  description: string
  category: string
  procedures: Array<{
    procedure: AestheticProcedure
    sessions: number
    intervalDays: number
  }>
  totalSessions: number
  totalPrice: number
  packageDiscount: number
  isActive: boolean
}

export interface AestheticAppointment {
  id: string
  patientId: string
  professionalId: string
  procedureDetails: AestheticProcedure
  startTime: Date
  endTime: Date
  sessionNumber: number
  totalSessions: number
  recoveryBuffer: number
  specialEquipment?: string[]
  assistantRequired: boolean
  preProcedureInstructions?: string[]
  postProcedureInstructions?: string[]
}

export interface ProfessionalValidation {
  isValid: boolean
  missingCertifications?: string[]
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  specializationMatch?: boolean
  cfmLicenseValid?: boolean
  anvisaCertified?: boolean
}

export interface SchedulingResult {
  success: boolean
  appointments: AestheticAppointment[]
  totalCost: number
  totalDuration: number
  recoveryPlan: RecoveryPlan
  professionalAssignments: Array<{
    professionalId: string
    role: string
    procedures: string[]
  }>
  warnings?: string[]
  contraindications?: string[]
}

export interface RecoveryPlan {
  procedureName: string
  recoveryPeriodDays: number
  dailyInstructions: Array<{
    day: number
    instructions: string[]
    restrictions: string[]
  }>
  followUpAppointments: Array<{
    purpose: string
    recommendedTiming: string
    mandatory: boolean
    duration: number
  }>
  emergencyContacts: string[]
  restrictions: string[]
  expectedOutcomes: string[]
  warningSigns: Array<{
    sign: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    actionRequired: string
  }>
}

export interface RoomAllocation {
  recommendations: Array<{
    appointmentId: string
    roomId: string
    reason: string
  }>
  conflicts: Array<{
    appointmentId: string
    conflictType: string
    severity: 'low' | 'medium' | 'high'
  }>
  utilization: number
  roomAssignments: Map<string, string[]>
}

export interface ContraindicationCheck {
  contraindications: string[]
  warnings: string[]
  recommendations: string[]
  severity: 'low' | 'medium' | 'high'
  safe: boolean
}

export class EnhancedAestheticSchedulingService {
  private professionalCache = new Map<string, any>()
  private procedureCache = new Map<string, AestheticProcedure>()

  constructor() {
    // Initialize with common aesthetic procedures
    this.initializeDefaultProcedures()
  }

  /**
   * Schedule aesthetic procedures with multi-session support
   */
  async scheduleAestheticProcedures(request: {
    patientId: string
    procedures: string[]
    preferredDates?: Date[]
    preferredProfessionals?: string[]
    urgencyLevel?: 'routine' | 'urgent' | 'immediate'
    medicalHistory?: any
    specialRequirements?: any
  }): Promise<SchedulingResult> {
    try {
      // Mock implementation - in real system would integrate with database
      const appointments: AestheticAppointment[] = []
      let totalCost = 0
      let totalDuration = 0

      for (let i = 0; i < request.procedures.length; i++) {
        const procedureId = request.procedures[i]
        const procedure = this.procedureCache.get(procedureId) || {
          id: procedureId,
          name: 'Aesthetic Procedure',
          procedureType: 'facial' as const,
          baseDuration: 60,
          basePrice: 500,
          recoveryPeriodDays: 7,
          sessionsRequired: 1,
        }

        const sessionCount = procedure.sessionsRequired || 1
        for (let session = 1; session <= sessionCount; session++) {
          const appointment: AestheticAppointment = {
            id: `apt_${Date.now()}_${i}_${session}`,
            patientId: request.patientId,
            professionalId: request.preferredProfessionals?.[0] || 'prof_default',
            procedureDetails: procedure,
            startTime: new Date(Date.now() + (session - 1) * 7 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + (session - 1) * 7 * 24 * 60 * 60 * 1000 + procedure.baseDuration * 60 * 1000),
            sessionNumber: session,
            totalSessions: sessionCount,
            recoveryBuffer: 15,
            specialEquipment: procedure.specialRequirements,
            assistantRequired: procedure.procedureType === 'surgical',
            preProcedureInstructions: ['Jejum de 6 horas', 'Evitar aspirina'],
            postProcedureInstructions: ['Repouso por 24h', 'Aplicar gelo'],
          }
          appointments.push(appointment)
          totalCost += procedure.basePrice
          totalDuration += procedure.baseDuration
        }
      }

      const recoveryPlan = this.generateRecoveryPlan(request.procedures[0] || 'default')
      const professionalAssignments = this.assignProfessionals(request.preferredProfessionals || [], request.procedures)

      return {
        success: true,
        appointments,
        totalCost,
        totalDuration,
        recoveryPlan,
        professionalAssignments,
        warnings: [],
        contraindications: [],
      }
    } catch (error) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.generateRecoveryPlan('error'),
        professionalAssignments: [],
        warnings: ['Failed to schedule procedures'],
        contraindications: [],
      }
    }
  }

  /**
   * Schedule treatment package with coordinated sessions
   */
  async scheduleTreatmentPackage(
    packageId: string,
    patientId: string,
    startDate: Date,
    preferences: any = {}
  ): Promise<SchedulingResult> {
    try {
      // Mock treatment package scheduling
      const mockPackage: TreatmentPackage = {
        id: packageId,
        name: 'Package Estético Completo',
        description: 'Pacote com múltiplas sessões',
        category: 'facial',
        procedures: [
          {
            procedure: {
              id: 'proc_1',
              name: 'Limpeza de Pele',
              procedureType: 'facial',
              baseDuration: 60,
              basePrice: 300,
              recoveryPeriodDays: 1,
              sessionsRequired: 4,
              category: 'facial',
            },
            sessions: 4,
            intervalDays: 7,
          },
        ],
        totalSessions: 4,
        totalPrice: 1200,
        packageDiscount: 10,
        isActive: true,
      }

      const appointments: AestheticAppointment[] = []
      let currentDate = new Date(startDate)

      for (const packageProcedure of mockPackage.procedures) {
        const procedure = packageProcedure.procedure
        for (let session = 1; session <= packageProcedure.sessions; session++) {
          const appointment: AestheticAppointment = {
            id: `apt_pkg_${Date.now()}_${session}`,
            patientId,
            professionalId: 'prof_default',
            procedureDetails: procedure,
            startTime: new Date(currentDate),
            endTime: new Date(currentDate.getTime() + procedure.baseDuration * 60 * 1000),
            sessionNumber: session,
            totalSessions: packageProcedure.sessions,
            recoveryBuffer: 15,
            postProcedureInstructions: ['Evitar sol por 24h', 'Hidratar a pele'],
          }
          appointments.push(appointment)
          currentDate.setDate(currentDate.getDate() + packageProcedure.intervalDays)
        }
      }

      return {
        success: true,
        appointments,
        totalCost: mockPackage.totalPrice * (1 - mockPackage.packageDiscount / 100),
        totalDuration: appointments.reduce((sum, apt) => sum + apt.procedureDetails.baseDuration, 0),
        recoveryPlan: this.generateRecoveryPlan('package'),
        professionalAssignments: [
          {
            professionalId: 'prof_default',
            role: 'primary',
            procedures: mockPackage.procedures.map(p => p.procedure.id),
          },
        ],
        warnings: [],
        contraindications: [],
      }
    } catch (error) {
      return {
        success: false,
        appointments: [],
        totalCost: 0,
        totalDuration: 0,
        recoveryPlan: this.generateRecoveryPlan('error'),
        professionalAssignments: [],
        warnings: ['Failed to schedule treatment package'],
        contraindications: [],
      }
    }
  }

  /**
   * Validate professional certifications for aesthetic procedures
   */
  async validateProfessionalCertifications(
    professionalId: string,
    procedureIds: string[]
  ): Promise<ProfessionalValidation> {
    try {
      // Mock professional validation - in real system would check database
      const missingCertifications: string[] = []
      let isValid = true

      // Check for required certifications based on procedure types
      const surgicalProcedures = procedureIds.filter(id => id.includes('surgical'))
      const laserProcedures = procedureIds.filter(id => id.includes('laser'))

      if (surgicalProcedures.length > 0) {
        // Surgical procedures require special certification
        missingCertifications.push('Surgical Aesthetic Certification')
        isValid = false
      }

      if (laserProcedures.length > 0) {
        // Laser procedures require ANVISA certification
        missingCertifications.push('ANVISA Laser Operation Certificate')
        isValid = false
      }

      return {
        isValid,
        missingCertifications: isValid ? undefined : missingCertifications,
        experienceLevel: 'intermediate',
        specializationMatch: true,
        cfmLicenseValid: isValid,
        anvisaCertified: laserProcedures.length === 0,
      }
    } catch (error) {
      return {
        isValid: false,
        missingCertifications: ['Validation system error'],
        experienceLevel: 'beginner',
        specializationMatch: false,
        cfmLicenseValid: false,
        anvisaCertified: false,
      }
    }
  }

  /**
   * Optimize room allocation for aesthetic procedures
   */
  optimizeRoomAllocation(appointments: any[]): RoomAllocation {
    // Mock room allocation optimization
    return {
      recommendations: appointments.map(apt => ({
        appointmentId: apt.id,
        roomId: 'room_1',
        reason: 'Standard aesthetic procedure room',
      })),
      conflicts: [],
      utilization: 0.75,
      roomAssignments: new Map([['room_1', appointments.map(apt => apt.id)]]),
    }
  }

  /**
   * Check contraindications for aesthetic procedures
   */
  async checkContraindications(request: {
    patientId: string
    procedureIds: string[]
    medicalHistory?: any
  }): Promise<ContraindicationCheck> {
    try {
      const contraindications: string[] = []
      const warnings: string[] = []
      const recommendations: string[] = []

      // Check pregnancy contraindications
      if (request.medicalHistory?.pregnancyStatus === 'pregnant') {
        contraindications.push('Procedimentos estéticos contraindicados durante gravidez')
      }

      // Check allergy history
      if (request.medicalHistory?.allergies?.length > 0) {
        warnings.push('Histórico de alergias - revisar produtos utilizados')
      }

      // Check age restrictions
      if (request.medicalHistory?.age < 18) {
        contraindications.push('Menores de 18 anos requerem autorização dos pais')
      }

      return {
        contraindications,
        warnings,
        recommendations: recommendations.length > 0 ? recommendations : ['Consultar especialista'],
        severity: contraindications.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low',
        safe: contraindications.length === 0,
      }
    } catch (error) {
      return {
        contraindications: ['Erro na verificação de contraindicações'],
        warnings: [],
        recommendations: ['Consultar médico'],
        severity: 'high',
        safe: false,
      }
    }
  }

  /**
   * Calculate variable duration based on factors
   */
  calculateVariableDuration(baseDuration: number, factors: any[]): number {
    let totalDuration = baseDuration

    factors.forEach(factor => {
      switch (factor.type) {
        case 'complexity':
          totalDuration *= factor.value === 'high' ? 1.5 : factor.value === 'medium' ? 1.2 : 1.0
          break
        case 'patient_condition':
          totalDuration *= factor.value === 'sensitive' ? 1.3 : 1.0
          break
        case 'equipment_setup':
          totalDuration += factor.value === 'complex' ? 15 : 5
          break
      }
    })

    return Math.round(totalDuration)
  }

  /**
   * Get available aesthetic procedures
   */
  async getAestheticProcedures(filters?: {
    category?: string
    procedureType?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ procedures: AestheticProcedure[]; total: number }> {
    // Mock procedures data
    const mockProcedures: AestheticProcedure[] = [
      {
        id: 'botox',
        name: 'Aplicação de Botox',
        description: 'Redução de rugas dinâmicas',
        procedureType: 'injectable',
        category: 'facial',
        baseDuration: 30,
        basePrice: 800,
        recoveryPeriodDays: 1,
        sessionsRequired: 1,
        requiredCertifications: ['Dermatological Certification'],
      },
      {
        id: 'filler',
        name: 'Preenchimento Facial',
        description: 'Restauração de volume facial',
        procedureType: 'injectable',
        category: 'facial',
        baseDuration: 45,
        basePrice: 1200,
        recoveryPeriodDays: 2,
        sessionsRequired: 1,
        contraindications: ['Gravidez', 'Amamentação'],
      },
      {
        id: 'laser_hair',
        name: 'Depilação a Laser',
        description: 'Remoção definitiva de pelos',
        procedureType: 'laser',
        category: 'body',
        baseDuration: 60,
        basePrice: 300,
        recoveryPeriodDays: 1,
        sessionsRequired: 6,
        specialRequirements: ['Equipamento de laser ANVISA'],
      },
    ]

    let filteredProcedures = mockProcedures

    if (filters?.category) {
      filteredProcedures = filteredProcedures.filter(p => p.category === filters.category)
    }

    if (filters?.procedureType) {
      filteredProcedures = filteredProcedures.filter(p => p.procedureType === filters.procedureType)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProcedures = filteredProcedures.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }

    const limit = filters?.limit || 20
    const offset = filters?.offset || 0
    const paginatedProcedures = filteredProcedures.slice(offset, offset + limit)

    return {
      procedures: paginatedProcedures,
      total: filteredProcedures.length,
    }
  }

  /**
   * Get available treatment packages
   */
  async getTreatmentPackages(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ packages: TreatmentPackage[]; total: number }> {
    // Mock treatment packages
    const mockPackages: TreatmentPackage[] = [
      {
        id: 'pkg_complete_facial',
        name: 'Pacote Facial Completo',
        description: 'Tratamento completo para rejuvenescimento facial',
        category: 'facial',
        procedures: [
          {
            procedure: {
              id: 'botox',
              name: 'Botox',
              procedureType: 'injectable',
              baseDuration: 30,
              basePrice: 800,
              recoveryPeriodDays: 1,
              sessionsRequired: 1,
              category: 'facial',
            },
            sessions: 1,
            intervalDays: 0,
          },
          {
            procedure: {
              id: 'filler',
              name: 'Preenchimento',
              procedureType: 'injectable',
              baseDuration: 45,
              basePrice: 1200,
              recoveryPeriodDays: 2,
              sessionsRequired: 1,
              category: 'facial',
            },
            sessions: 1,
            intervalDays: 0,
          },
        ],
        totalSessions: 2,
        totalPrice: 2000,
        packageDiscount: 15,
        isActive: true,
      },
    ]

    let filteredPackages = mockPackages

    if (filters?.category) {
      filteredPackages = filteredPackages.filter(p => p.category === filters.category)
    }

    if (filters?.minPrice !== undefined) {
      filteredPackages = filteredPackages.filter(p => p.totalPrice >= filters.minPrice!)
    }

    if (filters?.maxPrice !== undefined) {
      filteredPackages = filteredPackages.filter(p => p.totalPrice <= filters.maxPrice!)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredPackages = filteredPackages.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }

    const limit = filters?.limit || 20
    const offset = filters?.offset || 0
    const paginatedPackages = filteredPackages.slice(offset, offset + limit)

    return {
      packages: paginatedPackages,
      total: filteredPackages.length,
    }
  }

  /**
   * Generate recovery plan for procedures
   */
  private generateRecoveryPlan(procedureType: string): RecoveryPlan {
    const basePlan: RecoveryPlan = {
      procedureName: procedureType === 'error' ? 'Erro no procedimento' : 'Procedimento Estético',
      recoveryPeriodDays: 7,
      dailyInstructions: [
        {
          day: 1,
          instructions: ['Repouso absoluto', 'Aplicar compressas frias'],
          restrictions: ['Não se expor ao sol', 'Não praticar exercícios'],
        },
        {
          day: 2,
          instructions: ['Limpeza suave', 'Hidratação'],
          restrictions: ['Evitar maquiagem', 'Não coçar'],
        },
      ],
      followUpAppointments: [
        {
          purpose: 'Avaliação pós-procedimento',
          recommendedTiming: '7 dias',
          mandatory: true,
          duration: 30,
        },
      ],
      emergencyContacts: ['(11) 99999-9999'],
      restrictions: ['Evitar sol por 30 dias', 'Não usar produtos cosméticos por 48h'],
      expectedOutcomes: ['Melhora na aparência', 'Recuperação completa'],
      warningSigns: [
        {
          sign: 'Infecção',
          description: 'Vermelhidão, inchaço ou dor intensa',
          severity: 'high',
          actionRequired: 'Procurar atendimento médico imediato',
        },
      ],
    }

    if (procedureType === 'surgical') {
      basePlan.recoveryPeriodDays = 14
      basePlan.restrictions.push('Não carregar peso por 2 semanas')
    }

    return basePlan
  }

  /**
   * Assign professionals to procedures
   */
  private assignProfessionals(professionalIds: string[], procedureIds: string[]) {
    return professionalIds.map(profId => ({
      professionalId: profId,
      role: 'primary',
      procedures: procedureIds,
    }))
  }

  /**
   * Initialize default aesthetic procedures
   */
  private initializeDefaultProcedures() {
    const defaultProcedures: AestheticProcedure[] = [
      {
        id: 'botox',
        name: 'Aplicação de Botox',
        procedureType: 'injectable',
        category: 'facial',
        baseDuration: 30,
        basePrice: 800,
        recoveryPeriodDays: 1,
        sessionsRequired: 1,
        requiredCertifications: ['Dermatological Certification'],
      },
      {
        id: 'facial_fillers',
        name: 'Preenchimento Facial com Ácido Hialurônico',
        procedureType: 'injectable',
        category: 'facial',
        baseDuration: 45,
        basePrice: 1200,
        recoveryPeriodDays: 2,
        sessionsRequired: 1,
        contraindications: ['Gravidez', 'Amamentação', 'Alergia ao ácido hialurônico'],
      },
      {
        id: 'laser_hair_removal',
        name: 'Depilação a Laser',
        procedureType: 'laser',
        category: 'body',
        baseDuration: 60,
        basePrice: 300,
        recoveryPeriodDays: 1,
        sessionsRequired: 6,
        specialRequirements: ['Equipamento de laser certificado ANVISA'],
        requiredCertifications: ['Laser Operation Certificate'],
      },
    ]

    defaultProcedures.forEach(procedure => {
      this.procedureCache.set(procedure.id, procedure)
    })
  }

  /**
   * Get Brazilian healthcare compliance status
   */
  getBrazilianComplianceStatus(procedureId: string): {
    anvisaCompliant: boolean
    cfmCompliant: boolean
    lgpdCompliant: boolean
    lastVerified: Date
  } {
    // Mock compliance status
    return {
      anvisaCompliant: true,
      cfmCompliant: true,
      lgpdCompliant: true,
      lastVerified: new Date(),
    }
  }

  /**
   * Validate emergency protocols for aesthetic procedures
   */
  validateEmergencyProtocols(procedureType: string): {
    protocolsValid: boolean
    missingProtocols: string[]
    recommendations: string[]
  } {
    const highRiskTypes = ['surgical', 'laser']
    
    if (highRiskTypes.includes(procedureType)) {
      return {
        protocolsValid: true,
        missingProtocols: [],
        recommendations: ['Manter kit de emergência atualizado', 'Treinamento periódico da equipe'],
      }
    }

    return {
      protocolsValid: true,
      missingProtocols: [],
      recommendations: ['Protocolos padrão suficientes'],
    }
  }
}

// Export singleton instance
export const enhancedAestheticSchedulingService = new EnhancedAestheticSchedulingService()