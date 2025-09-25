/**
 * Recovery Planning Service
 * Handles post-procedure recovery planning, aftercare instructions, and follow-up appointments
 * Ensures proper recovery protocols for aesthetic procedures
 */

import type {
  AestheticAppointment,
  AestheticProcedureDetails,
  FollowUpAppointment,
  RecoveryPlan,
} from './enhanced-aesthetic-scheduling-service'

export interface RecoveryAssessment {
  procedureName: string
  recoveryPeriodDays: number
  careLevel: 'low' | 'medium' | 'high' | 'intensive'
  riskFactors: string[]
  specialInstructions: string[]
  activityRestrictions: string[]
  medicationRequirements?: string[]
}

export class RecoveryPlanningService {
  private recoveryProtocols: Map<string, RecoveryAssessment> = new Map()

  constructor() {
    this.initializeRecoveryProtocols()
  }

  /**
   * Create comprehensive recovery plan for procedures
   */
  createRecoveryPlan(
    procedures: AestheticProcedureDetails[],
    _appointments: AestheticAppointment[],
  ): RecoveryPlan {
    if (procedures.length === 0) {
      return this.createEmptyRecoveryPlan()
    }

    // Find the maximum recovery period
    const maxRecovery = Math.max(...procedures.map(p => p.recoveryPeriodDays))

    // Determine overall care level
    const careLevel = this.determineCareLevel(procedures)

    // Generate combined recovery instructions
    const dailyInstructions = this.generateDailyInstructions(procedures, careLevel)

    // Create follow-up appointments
    const followUpAppointments = this.createFollowUpSchedule(procedures, maxRecovery)

    // Identify activity restrictions
    const restrictions = this.generateActivityRestrictions(procedures)

    // Set expected outcomes
    const expectedOutcomes = this.generateExpectedOutcomes(procedures)

    return {
      procedureName: procedures.map(p => p.name).join(' + '),
      recoveryPeriodDays: maxRecovery,
      dailyInstructions,
      followUpAppointments,
      emergencyContacts: this.getEmergencyContacts(),
      restrictions,
      expectedOutcomes,
      careLevel,
      phases: this.createRecoveryPhases(procedures, maxRecovery),
      totalRecoveryTime: maxRecovery,
      instructions: dailyInstructions,
      warningSigns: this.getWarningSigns(procedures),
      risks: this.getRiskFactors(procedures),
      activityRestrictions: restrictions,
      careInstructions: dailyInstructions,
    }
  }

  /**
   * Determine recovery care level based on procedures
   */
  private determineCareLevel(
    procedures: AestheticProcedureDetails[],
  ): 'low' | 'medium' | 'high' | 'intensive' {
    const severityMap = {
      surgical: 'intensive',
      injectable: 'medium',
      laser: 'high',
      body: 'medium',
      facial: 'low',
      combination: 'intensive',
    }

    const careLevels = procedures.map(p => severityMap[p.procedureType])

    // Return the highest care level required
    if (careLevels.includes('intensive')) return 'intensive'
    if (careLevels.includes('high')) return 'high'
    if (careLevels.includes('medium')) return 'medium'
    return 'low'
  }

  /**
   * Generate daily recovery instructions
   */
  private generateDailyInstructions(
    procedures: AestheticProcedureDetails[],
    careLevel: 'low' | 'medium' | 'high' | 'intensive',
  ): string[] {
    const instructions: string[] = []

    // General instructions for all procedures
    instructions.push('Keep treated area clean and moisturized')
    instructions.push('Avoid sun exposure on treated areas')
    instructions.push('Use recommended skincare products')
    instructions.push('Attend all follow-up appointments')

    // Care level specific instructions
    switch (careLevel) {
      case 'intensive':
        instructions.push('Rest for 24-48 hours post-procedure')
        instructions.push('Avoid any strenuous activity for 1 week')
        instructions.push('Monitor for any signs of complications')
        instructions.push('Keep emergency contact information readily available')
        break
      case 'high':
        instructions.push('Rest for 24 hours post-procedure')
        instructions.push('Avoid strenuous activity for 3-5 days')
        instructions.push('Apply cold compresses as recommended')
        break
      case 'medium':
        instructions.push('Avoid strenuous activity for 24-48 hours')
        instructions.push('Follow specific aftercare product instructions')
        break
      case 'low':
        instructions.push('Return to normal activities within 24 hours')
        instructions.push('Use gentle skincare products')
        break
    }

    // Procedure-specific instructions
    for (const procedure of procedures) {
      instructions.push(...procedure.aftercareInstructions)
    }

    return [...new Set(instructions)] // Remove duplicates
  }

  /**
   * Create follow-up appointment schedule
   */
  private createFollowUpSchedule(
    procedures: AestheticProcedureDetails[],
    maxRecovery: number,
  ): FollowUpAppointment[] {
    const followUps: FollowUpAppointment[] = []

    // Initial follow-up (1 week)
    followUps.push({
      dayNumber: 7,
      purpose: 'Initial healing assessment',
      durationMinutes: 15,
      inPerson: true,
    })

    // Progress check (2-4 weeks based on recovery period)
    const progressCheckDay = Math.min(14, Math.max(7, maxRecovery / 4))
    followUps.push({
      dayNumber: progressCheckDay,
      purpose: 'Progress evaluation and adjustment',
      durationMinutes: 20,
      inPerson: true,
    })

    // Final assessment (based on recovery period)
    const finalAssessmentDay = Math.min(30, maxRecovery)
    followUps.push({
      dayNumber: finalAssessmentDay,
      purpose: 'Final results assessment',
      durationMinutes: 30,
      inPerson: true,
    })

    // Long-term follow-up for surgical procedures
    if (procedures.some(p => p.procedureType === 'surgical')) {
      followUps.push({
        dayNumber: 90,
        purpose: 'Long-term results evaluation',
        durationMinutes: 45,
        inPerson: true,
      })
    }

    return followUps
  }

  /**
   * Generate activity restrictions
   */
  private generateActivityRestrictions(procedures: AestheticProcedureDetails[]): string[] {
    const restrictions: string[] = []

    const hasSurgical = procedures.some(p => p.procedureType === 'surgical')
    const hasInjectable = procedures.some(p => p.procedureType === 'injectable')
    const hasLaser = procedures.some(p => p.procedureType === 'laser')

    if (hasSurgical) {
      restrictions.push('No strenuous exercise for 2 weeks')
      restrictions.push('No lifting heavy objects for 4 weeks')
      restrictions.push('Avoid swimming for 2 weeks')
      restrictions.push('No alcohol consumption for 1 week')
    }

    if (hasInjectable) {
      restrictions.push('No facial pressure for 48 hours')
      restrictions.push('Avoid extreme temperatures for 1 week')
      restrictions.push('No alcohol for 48 hours')
    }

    if (hasLaser) {
      restrictions.push('No sun exposure for 2 weeks')
      restrictions.push('Use SPF 30+ sunscreen daily')
      restrictions.push('Avoid harsh skincare products for 1 week')
    }

    // General restrictions
    restrictions.push('Avoid blood thinners unless prescribed by doctor')
    restrictions.push('Do not pick or scratch treated areas')
    restrictions.push('Report any unusual symptoms immediately')

    return [...new Set(restrictions)]
  }

  /**
   * Generate expected outcomes
   */
  private generateExpectedOutcomes(procedures: AestheticProcedureDetails[]): string[] {
    const outcomes: string[] = []

    const maxRecovery = Math.max(...procedures.map(p => p.recoveryPeriodDays))

    outcomes.push(`Initial healing: 1-2 weeks`)
    outcomes.push(`Significant improvement: ${Math.ceil(maxRecovery / 2)}-${maxRecovery} days`)
    outcomes.push(`Final results: ${maxRecovery}-${Math.ceil(maxRecovery * 1.5)} days`)
    outcomes.push('Results may vary based on individual factors')
    outcomes.push('Multiple sessions may be required for optimal results')

    // Procedure-specific outcomes
    for (const procedure of procedures) {
      switch (procedure.procedureType) {
        case 'injectable':
          outcomes.push('Results typically last 3-6 months')
          break
        case 'laser':
          outcomes.push('Results may require multiple sessions')
          outcomes.push('Skin continues to improve for 3-6 months')
          break
        case 'surgical':
          outcomes.push('Final results visible after swelling subsides')
          outcomes.push('Scars will fade over 6-12 months')
          break
      }
    }

    return [...new Set(outcomes)]
  }

  /**
   * Create recovery phases
   */
  private createRecoveryPhases(
    _procedures: AestheticProcedureDetails[],
    maxRecovery: number,
  ): Array<{
    phase: string
    days: number
    instructions: string[]
    milestones: string[]
  }> {
    return [
      {
        phase: 'Immediate Recovery',
        days: Math.min(3, Math.ceil(maxRecovery * 0.1)),
        instructions: [
          'Rest and avoid activity',
          'Apply cold compresses',
          'Take prescribed medications',
          'Monitor for complications',
        ],
        milestones: ['Swelling begins to subside', 'Initial healing starts'],
      },
      {
        phase: 'Early Recovery',
        days: Math.ceil(maxRecovery * 0.3),
        instructions: [
          'Gradually increase activity',
          'Follow skincare routine',
          'Attend follow-up appointments',
        ],
        milestones: ['Visible improvement begins', 'Most side effects resolve'],
      },
      {
        phase: 'Active Recovery',
        days: Math.ceil(maxRecovery * 0.6),
        instructions: [
          'Resume normal activities',
          'Use recommended products',
          'Protect from sun exposure',
        ],
        milestones: ['Significant improvement visible', 'Final results developing'],
      },
    ]
  }

  /**
   * Get warning signs for procedures
   */
  private getWarningSigns(procedures: AestheticProcedureDetails[]): string[] {
    const warningSigns = [
      'Severe pain not relieved by medication',
      'Excessive swelling or redness',
      'Fever above 38°C (100.4°F)',
      'Pus or unusual discharge',
      'Numbness or tingling that persists',
      'Difficulty breathing or swallowing',
      'Chest pain or palpitations',
    ]

    // Procedure-specific warning signs
    if (procedures.some(p => p.procedureType === 'surgical')) {
      warningSigns.push('Wound separation or dehiscence')
      warningSigns.push('Signs of infection at incision sites')
    }

    if (procedures.some(p => p.procedureType === 'injectable')) {
      warningSigns.push('Vision changes or eye pain')
      warningSigns.push('Severe headache or neck stiffness')
    }

    return warningSigns
  }

  /**
   * Get risk factors for procedures
   */
  private getRiskFactors(procedures: AestheticProcedureDetails[]): string[] {
    const riskFactors: string[] = []

    for (const procedure of procedures) {
      if (procedure.procedureType === 'surgical') {
        riskFactors.push('Infection', 'Bleeding', 'Scarring', 'Anesthesia risks')
      }
      if (procedure.procedureType === 'injectable') {
        riskFactors.push('Allergic reaction', 'Injection site reactions', 'Vascular complications')
      }
      if (procedure.procedureType === 'laser') {
        riskFactors.push('Burns', 'Pigmentation changes', 'Scarring')
      }
    }

    return [...new Set(riskFactors)]
  }

  /**
   * Get emergency contacts
   */
  private getEmergencyContacts(): string[] {
    return [
      'Emergency Hotline: +55 11 9999-9999',
      'Clinic Reception: +55 11 8888-8888',
      'After Hours Emergency: +55 11 7777-7777',
    ]
  }

  /**
   * Create empty recovery plan
   */
  public createEmptyRecoveryPlan(): RecoveryPlan {
    return {
      procedureName: '',
      recoveryPeriodDays: 0,
      dailyInstructions: [],
      followUpAppointments: [],
      emergencyContacts: [],
      restrictions: [],
      expectedOutcomes: [],
    }
  }

  /**
   * Update recovery plan with patient-specific information
   */
  updateRecoveryPlanForPatient(
    plan: RecoveryPlan,
    patientId: string,
    customNotes?: string,
  ): RecoveryPlan {
    return {
      ...plan,
      patientId,
      customNotes: customNotes || plan.customNotes,
    }
  }

  /**
   * Get recovery assessment for specific procedure
   */
  getRecoveryAssessment(procedureId: string): RecoveryAssessment | undefined {
    return this.recoveryProtocols.get(procedureId)
  }

  private initializeRecoveryProtocols(): void {
    // Initialize recovery protocols for common procedures
    // This would typically be loaded from database
  }
}
