/**
 * Risk Scoring Algorithm
 * Story 3.2: AI-powered Risk Assessment + Insights Implementation
 * 
 * This module implements advanced risk scoring algorithms:
 * - Multi-dimensional risk scoring with weighted factors
 * - Dynamic risk thresholds based on treatment type
 * - Real-time risk score updates
 * - Risk trend analysis and prediction
 * - Comparative risk assessment
 * - Brazilian healthcare compliance scoring
 */

import { createClient } from '@/lib/supabase/client'

// Risk Score Components
interface RiskScoreComponents {
  patientFactors: {
    demographic: number // Age, gender, BMI
    medical: number     // Medical history, conditions
    lifestyle: number   // Smoking, exercise, diet
    medication: number  // Current medications, interactions
  }
  treatmentFactors: {
    complexity: number    // Procedure complexity
    invasiveness: number  // Level of invasiveness
    duration: number      // Treatment duration
    anesthesia: number    // Anesthesia requirements
  }
  environmentalFactors: {
    facility: number      // Facility capabilities
    staff: number         // Staff experience
    equipment: number     // Equipment quality
    emergency: number     // Emergency preparedness
  }
  historicalFactors: {
    previousOutcomes: number  // Past treatment results
    complications: number     // Previous complications
    recovery: number          // Recovery patterns
    adherence: number         // Treatment adherence
  }
}

// Risk Score Result
interface RiskScoreResult {
  totalScore: number
  normalizedScore: number // 0-100
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'critical'
  confidence: number
  components: RiskScoreComponents
  breakdown: {
    category: string
    score: number
    weight: number
    contribution: number
    factors: string[]
  }[]
  trends: {
    direction: 'improving' | 'stable' | 'worsening'
    velocity: number // Rate of change
    prediction: number // Predicted score in 30 days
  }
  benchmarks: {
    populationAverage: number
    ageGroupAverage: number
    treatmentTypeAverage: number
    facilityAverage: number
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    monitoring: string[]
  }
}

// Scoring Configuration
interface ScoringConfig {
  weights: {
    patientFactors: number
    treatmentFactors: number
    environmentalFactors: number
    historicalFactors: number
  }
  thresholds: {
    minimal: number
    low: number
    moderate: number
    high: number
  }
  adjustments: {
    ageMultiplier: Record<string, number>
    treatmentMultiplier: Record<string, number>
    facilityMultiplier: Record<string, number>
  }
  compliance: {
    cfmWeight: number
    anvisaWeight: number
    ethicsWeight: number
  }
}

// Risk Factor Definition
interface RiskFactorDefinition {
  id: string
  name: string
  category: keyof RiskScoreComponents
  subcategory: string
  weight: number
  scoreFunction: (value: any, context: any) => number
  description: string
  evidenceLevel: 'low' | 'moderate' | 'high' | 'very_high'
  sources: string[]
  lastUpdated: Date
}

// Historical Risk Data Point
interface RiskDataPoint {
  timestamp: Date
  score: number
  riskLevel: string
  factors: Record<string, number>
  outcome?: 'success' | 'complication' | 'failure'
  notes?: string
}

class RiskScoringAlgorithm {
  private supabase = createClient()
  private config: ScoringConfig
  private riskFactors: Map<string, RiskFactorDefinition> = new Map()
  private historicalData: Map<string, RiskDataPoint[]> = new Map()
  private populationStats: any = null

  constructor(config?: Partial<ScoringConfig>) {
    this.config = this.initializeConfig(config)
    this.loadRiskFactors()
    this.loadPopulationStats()
  }

  /**
   * Calculate comprehensive risk score
   */
  async calculateRiskScore(
    patientId: string,
    treatmentId: string,
    inputData: any
  ): Promise<RiskScoreResult> {
    try {
      console.log(`Calculating risk score for patient ${patientId}, treatment ${treatmentId}`)

      // Step 1: Calculate component scores
      const components = await this.calculateComponents(patientId, treatmentId, inputData)

      // Step 2: Apply weights and calculate total score
      const totalScore = this.calculateTotalScore(components)

      // Step 3: Normalize score (0-100)
      const normalizedScore = this.normalizeScore(totalScore, inputData.treatmentData?.type)

      // Step 4: Determine risk level
      const riskLevel = this.determineRiskLevel(normalizedScore)

      // Step 5: Calculate confidence
      const confidence = this.calculateConfidence(components, inputData)

      // Step 6: Generate breakdown
      const breakdown = this.generateBreakdown(components)

      // Step 7: Analyze trends
      const trends = await this.analyzeTrends(patientId, normalizedScore)

      // Step 8: Calculate benchmarks
      const benchmarks = await this.calculateBenchmarks(inputData, normalizedScore)

      // Step 9: Generate recommendations
      const recommendations = this.generateRecommendations(components, riskLevel, trends)

      const result: RiskScoreResult = {
        totalScore,
        normalizedScore,
        riskLevel,
        confidence,
        components,
        breakdown,
        trends,
        benchmarks,
        recommendations
      }

      // Store for trend analysis
      await this.storeRiskScore(patientId, result)

      console.log(`Risk score calculated: ${normalizedScore} (${riskLevel})`)
      return result

    } catch (error) {
      console.error('Error calculating risk score:', error)
      throw new Error('Failed to calculate risk score')
    }
  }

  /**
   * Calculate component scores
   */
  private async calculateComponents(
    patientId: string,
    treatmentId: string,
    inputData: any
  ): Promise<RiskScoreComponents> {
    const components: RiskScoreComponents = {
      patientFactors: {
        demographic: 0,
        medical: 0,
        lifestyle: 0,
        medication: 0
      },
      treatmentFactors: {
        complexity: 0,
        invasiveness: 0,
        duration: 0,
        anesthesia: 0
      },
      environmentalFactors: {
        facility: 0,
        staff: 0,
        equipment: 0,
        emergency: 0
      },
      historicalFactors: {
        previousOutcomes: 0,
        complications: 0,
        recovery: 0,
        adherence: 0
      }
    }

    // Calculate patient factors
    components.patientFactors.demographic = this.calculateDemographicScore(inputData.patientData)
    components.patientFactors.medical = this.calculateMedicalScore(inputData.patientData)
    components.patientFactors.lifestyle = this.calculateLifestyleScore(inputData.patientData)
    components.patientFactors.medication = this.calculateMedicationScore(inputData.patientData)

    // Calculate treatment factors
    components.treatmentFactors.complexity = this.calculateComplexityScore(inputData.treatmentData)
    components.treatmentFactors.invasiveness = this.calculateInvasivenessScore(inputData.treatmentData)
    components.treatmentFactors.duration = this.calculateDurationScore(inputData.treatmentData)
    components.treatmentFactors.anesthesia = this.calculateAnesthesiaScore(inputData.treatmentData)

    // Calculate environmental factors
    components.environmentalFactors.facility = this.calculateFacilityScore(inputData.environmentalFactors)
    components.environmentalFactors.staff = this.calculateStaffScore(inputData.environmentalFactors)
    components.environmentalFactors.equipment = this.calculateEquipmentScore(inputData.environmentalFactors)
    components.environmentalFactors.emergency = this.calculateEmergencyScore(inputData.environmentalFactors)

    // Calculate historical factors
    const historicalData = await this.getHistoricalData(patientId)
    components.historicalFactors.previousOutcomes = this.calculateOutcomesScore(historicalData)
    components.historicalFactors.complications = this.calculateComplicationsScore(historicalData)
    components.historicalFactors.recovery = this.calculateRecoveryScore(historicalData)
    components.historicalFactors.adherence = this.calculateAdherenceScore(historicalData)

    return components
  }

  /**
   * Calculate demographic risk score
   */
  private calculateDemographicScore(patientData: any): number {
    let score = 0

    // Age factor
    const age = patientData.age
    if (age < 1) score += 20        // Neonatal
    else if (age < 5) score += 15   // Pediatric
    else if (age < 18) score += 5   // Adolescent
    else if (age < 65) score += 0   // Adult
    else if (age < 75) score += 10  // Elderly
    else if (age < 85) score += 20  // Very elderly
    else score += 30                // Extreme elderly

    // BMI factor
    const bmi = patientData.bmi
    if (bmi < 16) score += 25       // Severely underweight
    else if (bmi < 18.5) score += 15 // Underweight
    else if (bmi < 25) score += 0    // Normal
    else if (bmi < 30) score += 5    // Overweight
    else if (bmi < 35) score += 15   // Obese Class I
    else if (bmi < 40) score += 25   // Obese Class II
    else score += 35                 // Obese Class III

    // Gender-specific factors
    if (patientData.gender === 'female') {
      // Pregnancy considerations would be added here
      // For now, no additional risk
    }

    return Math.min(100, score)
  }

  /**
   * Calculate medical history risk score
   */
  private calculateMedicalScore(patientData: any): number {
    let score = 0
    const conditions = patientData.medicalHistory || []

    // High-risk conditions
    const highRiskConditions = [
      'heart_disease', 'diabetes', 'kidney_disease', 'liver_disease',
      'cancer', 'autoimmune_disease', 'bleeding_disorder'
    ]

    // Medium-risk conditions
    const mediumRiskConditions = [
      'hypertension', 'asthma', 'depression', 'anxiety',
      'arthritis', 'osteoporosis'
    ]

    conditions.forEach((condition: string) => {
      const conditionLower = condition.toLowerCase()
      
      if (highRiskConditions.some(risk => conditionLower.includes(risk))) {
        score += 20
      } else if (mediumRiskConditions.some(risk => conditionLower.includes(risk))) {
        score += 10
      } else {
        score += 5 // Other conditions
      }
    })

    // Family history factor
    const familyHistory = patientData.familyHistory || []
    familyHistory.forEach((condition: string) => {
      if (highRiskConditions.some(risk => condition.toLowerCase().includes(risk))) {
        score += 5
      }
    })

    return Math.min(100, score)
  }

  /**
   * Calculate lifestyle risk score
   */
  private calculateLifestyleScore(patientData: any): number {
    let score = 0
    const lifestyle = patientData.lifestyle || {}

    // Smoking
    if (lifestyle.smoking) {
      score += 25
    }

    // Alcohol consumption
    switch (lifestyle.alcohol) {
      case 'heavy': score += 20; break
      case 'moderate': score += 10; break
      case 'occasional': score += 5; break
      case 'none': score += 0; break
    }

    // Exercise level
    switch (lifestyle.exercise) {
      case 'sedentary': score += 15; break
      case 'light': score += 10; break
      case 'moderate': score += 5; break
      case 'active': score += 0; break
    }

    // Diet quality
    switch (lifestyle.diet) {
      case 'poor': score += 15; break
      case 'average': score += 10; break
      case 'good': score += 5; break
      case 'excellent': score += 0; break
    }

    return Math.min(100, score)
  }

  /**
   * Calculate medication risk score
   */
  private calculateMedicationScore(patientData: any): number {
    let score = 0
    const medications = patientData.medications || []

    // High-risk medications
    const highRiskMeds = [
      'warfarin', 'heparin', 'chemotherapy', 'immunosuppressants',
      'steroids', 'insulin'
    ]

    // Medium-risk medications
    const mediumRiskMeds = [
      'aspirin', 'nsaids', 'antidepressants', 'antipsychotics',
      'beta_blockers', 'ace_inhibitors'
    ]

    medications.forEach((medication: string) => {
      const medLower = medication.toLowerCase()
      
      if (highRiskMeds.some(risk => medLower.includes(risk))) {
        score += 15
      } else if (mediumRiskMeds.some(risk => medLower.includes(risk))) {
        score += 8
      } else {
        score += 3 // Other medications
      }
    })

    // Polypharmacy (multiple medications)
    if (medications.length > 5) {
      score += 10
    } else if (medications.length > 10) {
      score += 20
    }

    // Drug allergies
    const allergies = patientData.allergies || []
    score += allergies.length * 5

    return Math.min(100, score)
  }

  /**
   * Calculate treatment complexity score
   */
  private calculateComplexityScore(treatmentData: any): number {
    let score = 0

    // Base complexity by treatment type
    const complexityMap: Record<string, number> = {
      'consultation': 5,
      'cleaning': 10,
      'filling': 15,
      'extraction': 25,
      'root_canal': 35,
      'crown': 30,
      'implant': 45,
      'surgery': 60,
      'orthodontics': 20
    }

    const treatmentType = treatmentData.type?.toLowerCase() || 'consultation'
    score += complexityMap[treatmentType] || 20

    // Duration factor
    const duration = treatmentData.duration || 30
    if (duration > 180) score += 20      // >3 hours
    else if (duration > 120) score += 15 // 2-3 hours
    else if (duration > 60) score += 10  // 1-2 hours
    else if (duration > 30) score += 5   // 30min-1hour

    // Equipment complexity
    const equipment = treatmentData.equipmentRequired || []
    score += equipment.length * 3

    return Math.min(100, score)
  }

  /**
   * Calculate invasiveness score
   */
  private calculateInvasivenessScore(treatmentData: any): number {
    const invasivenessMap: Record<string, number> = {
      'non_invasive': 5,
      'minimally_invasive': 20,
      'invasive': 40,
      'surgical': 60
    }

    return invasivenessMap[treatmentData.invasiveness] || 20
  }

  /**
   * Calculate duration score
   */
  private calculateDurationScore(treatmentData: any): number {
    const duration = treatmentData.duration || 30
    
    if (duration > 240) return 40      // >4 hours
    if (duration > 180) return 30      // 3-4 hours
    if (duration > 120) return 20      // 2-3 hours
    if (duration > 60) return 10       // 1-2 hours
    return 5                           // <1 hour
  }

  /**
   * Calculate anesthesia score
   */
  private calculateAnesthesiaScore(treatmentData: any): number {
    if (!treatmentData.anesthesiaRequired) return 0

    const anesthesiaMap: Record<string, number> = {
      'local': 10,
      'regional': 25,
      'general': 40
    }

    return anesthesiaMap[treatmentData.anesthesiaType] || 15
  }

  /**
   * Calculate facility score
   */
  private calculateFacilityScore(environmentalFactors: any): number {
    let score = 0

    // Facility type
    const facilityMap: Record<string, number> = {
      'hospital': 5,
      'surgical_center': 10,
      'clinic': 15
    }

    score += facilityMap[environmentalFactors.facilityType] || 10

    // Emergency capability
    if (!environmentalFactors.emergencyCapability) {
      score += 15
    }

    return score
  }

  /**
   * Calculate staff experience score
   */
  private calculateStaffScore(environmentalFactors: any): number {
    const experienceMap: Record<string, number> = {
      'expert': 5,
      'experienced': 10,
      'junior': 20
    }

    return experienceMap[environmentalFactors.staffExperience] || 15
  }

  /**
   * Calculate equipment quality score
   */
  private calculateEquipmentScore(environmentalFactors: any): number {
    const qualityMap: Record<string, number> = {
      'advanced': 5,
      'standard': 10,
      'basic': 20
    }

    return qualityMap[environmentalFactors.equipmentQuality] || 15
  }

  /**
   * Calculate emergency preparedness score
   */
  private calculateEmergencyScore(environmentalFactors: any): number {
    let score = 0

    if (!environmentalFactors.emergencyCapability) {
      score += 20
    }

    // Distance to hospital (if clinic)
    if (environmentalFactors.facilityType === 'clinic') {
      score += 10
    }

    return score
  }

  /**
   * Get historical data for patient
   */
  private async getHistoricalData(patientId: string): Promise<any[]> {
    try {
      const { data } = await this.supabase
        .from('treatment_outcomes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10)

      return data || []
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return []
    }
  }

  /**
   * Calculate previous outcomes score
   */
  private calculateOutcomesScore(historicalData: any[]): number {
    if (historicalData.length === 0) return 0

    const complications = historicalData.filter(record => 
      record.outcome === 'complication' || record.outcome === 'failure'
    )

    const complicationRate = complications.length / historicalData.length
    return Math.round(complicationRate * 50) // Max 50 points
  }

  /**
   * Calculate complications score
   */
  private calculateComplicationsScore(historicalData: any[]): number {
    if (historicalData.length === 0) return 0

    let score = 0
    historicalData.forEach(record => {
      const complications = JSON.parse(record.complications || '[]')
      score += complications.length * 5
    })

    return Math.min(50, score)
  }

  /**
   * Calculate recovery patterns score
   */
  private calculateRecoveryScore(historicalData: any[]): number {
    if (historicalData.length === 0) return 0

    const slowRecoveries = historicalData.filter(record => 
      record.recovery_time > record.expected_recovery_time * 1.5
    )

    const slowRecoveryRate = slowRecoveries.length / historicalData.length
    return Math.round(slowRecoveryRate * 30) // Max 30 points
  }

  /**
   * Calculate treatment adherence score
   */
  private calculateAdherenceScore(historicalData: any[]): number {
    if (historicalData.length === 0) return 0

    const poorAdherence = historicalData.filter(record => 
      record.adherence_score < 0.7 // Less than 70% adherence
    )

    const poorAdherenceRate = poorAdherence.length / historicalData.length
    return Math.round(poorAdherenceRate * 20) // Max 20 points
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(components: RiskScoreComponents): number {
    const weights = this.config.weights

    const patientScore = (
      components.patientFactors.demographic +
      components.patientFactors.medical +
      components.patientFactors.lifestyle +
      components.patientFactors.medication
    ) / 4

    const treatmentScore = (
      components.treatmentFactors.complexity +
      components.treatmentFactors.invasiveness +
      components.treatmentFactors.duration +
      components.treatmentFactors.anesthesia
    ) / 4

    const environmentalScore = (
      components.environmentalFactors.facility +
      components.environmentalFactors.staff +
      components.environmentalFactors.equipment +
      components.environmentalFactors.emergency
    ) / 4

    const historicalScore = (
      components.historicalFactors.previousOutcomes +
      components.historicalFactors.complications +
      components.historicalFactors.recovery +
      components.historicalFactors.adherence
    ) / 4

    return (
      patientScore * weights.patientFactors +
      treatmentScore * weights.treatmentFactors +
      environmentalScore * weights.environmentalFactors +
      historicalScore * weights.historicalFactors
    )
  }

  /**
   * Normalize score to 0-100 range
   */
  private normalizeScore(totalScore: number, treatmentType?: string): number {
    // Apply treatment-specific adjustments
    let adjustedScore = totalScore
    
    if (treatmentType && this.config.adjustments.treatmentMultiplier[treatmentType]) {
      adjustedScore *= this.config.adjustments.treatmentMultiplier[treatmentType]
    }

    // Normalize to 0-100
    return Math.min(100, Math.max(0, Math.round(adjustedScore)))
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): 'minimal' | 'low' | 'moderate' | 'high' | 'critical' {
    const thresholds = this.config.thresholds
    
    if (score >= thresholds.high) return 'critical'
    if (score >= thresholds.moderate) return 'high'
    if (score >= thresholds.low) return 'moderate'
    if (score >= thresholds.minimal) return 'low'
    return 'minimal'
  }

  /**
   * Calculate confidence in the score
   */
  private calculateConfidence(components: RiskScoreComponents, inputData: any): number {
    let confidence = 100

    // Reduce confidence for missing data
    if (!inputData.patientData.medicalHistory?.length) confidence -= 10
    if (!inputData.patientData.medications?.length) confidence -= 5
    if (!inputData.patientData.familyHistory?.length) confidence -= 5
    
    // Reduce confidence for incomplete lifestyle data
    const lifestyle = inputData.patientData.lifestyle || {}
    if (!lifestyle.smoking && !lifestyle.alcohol && !lifestyle.exercise) {
      confidence -= 15
    }

    // Reduce confidence for missing historical data
    const totalHistorical = Object.values(components.historicalFactors)
      .reduce((sum, score) => sum + score, 0)
    if (totalHistorical === 0) confidence -= 20

    return Math.max(0, confidence)
  }

  /**
   * Generate score breakdown
   */
  private generateBreakdown(components: RiskScoreComponents) {
    const breakdown = []
    const weights = this.config.weights

    // Patient factors
    const patientTotal = Object.values(components.patientFactors).reduce((sum, score) => sum + score, 0) / 4
    breakdown.push({
      category: 'Patient Factors',
      score: Math.round(patientTotal),
      weight: weights.patientFactors,
      contribution: Math.round(patientTotal * weights.patientFactors),
      factors: ['Demographics', 'Medical History', 'Lifestyle', 'Medications']
    })

    // Treatment factors
    const treatmentTotal = Object.values(components.treatmentFactors).reduce((sum, score) => sum + score, 0) / 4
    breakdown.push({
      category: 'Treatment Factors',
      score: Math.round(treatmentTotal),
      weight: weights.treatmentFactors,
      contribution: Math.round(treatmentTotal * weights.treatmentFactors),
      factors: ['Complexity', 'Invasiveness', 'Duration', 'Anesthesia']
    })

    // Environmental factors
    const environmentalTotal = Object.values(components.environmentalFactors).reduce((sum, score) => sum + score, 0) / 4
    breakdown.push({
      category: 'Environmental Factors',
      score: Math.round(environmentalTotal),
      weight: weights.environmentalFactors,
      contribution: Math.round(environmentalTotal * weights.environmentalFactors),
      factors: ['Facility', 'Staff', 'Equipment', 'Emergency Preparedness']
    })

    // Historical factors
    const historicalTotal = Object.values(components.historicalFactors).reduce((sum, score) => sum + score, 0) / 4
    breakdown.push({
      category: 'Historical Factors',
      score: Math.round(historicalTotal),
      weight: weights.historicalFactors,
      contribution: Math.round(historicalTotal * weights.historicalFactors),
      factors: ['Previous Outcomes', 'Complications', 'Recovery', 'Adherence']
    })

    return breakdown
  }

  /**
   * Analyze risk trends
   */
  private async analyzeTrends(patientId: string, currentScore: number) {
    try {
      const { data: historicalScores } = await this.supabase
        .from('risk_scores')
        .select('score, created_at')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!historicalScores || historicalScores.length < 2) {
        return {
          direction: 'stable' as const,
          velocity: 0,
          prediction: currentScore
        }
      }

      const scores = [currentScore, ...historicalScores.map(h => h.score)]
      const trend = this.calculateTrend(scores)
      
      return {
        direction: trend > 5 ? 'worsening' : trend < -5 ? 'improving' : 'stable',
        velocity: Math.abs(trend),
        prediction: Math.max(0, Math.min(100, currentScore + trend))
      }
    } catch (error) {
      console.error('Error analyzing trends:', error)
      return {
        direction: 'stable' as const,
        velocity: 0,
        prediction: currentScore
      }
    }
  }

  /**
   * Calculate trend from score array
   */
  private calculateTrend(scores: number[]): number {
    if (scores.length < 2) return 0

    let trend = 0
    for (let i = 1; i < scores.length; i++) {
      trend += scores[i-1] - scores[i]
    }

    return trend / (scores.length - 1)
  }

  /**
   * Calculate benchmark comparisons
   */
  private async calculateBenchmarks(inputData: any, currentScore: number) {
    try {
      // Population average
      const populationAverage = this.populationStats?.averageScore || 25

      // Age group average
      const ageGroup = this.getAgeGroup(inputData.patientData.age)
      const ageGroupAverage = this.populationStats?.ageGroups?.[ageGroup] || 25

      // Treatment type average
      const treatmentType = inputData.treatmentData.type
      const treatmentTypeAverage = this.populationStats?.treatmentTypes?.[treatmentType] || 25

      // Facility average
      const facilityType = inputData.environmentalFactors.facilityType
      const facilityAverage = this.populationStats?.facilityTypes?.[facilityType] || 25

      return {
        populationAverage,
        ageGroupAverage,
        treatmentTypeAverage,
        facilityAverage
      }
    } catch (error) {
      console.error('Error calculating benchmarks:', error)
      return {
        populationAverage: 25,
        ageGroupAverage: 25,
        treatmentTypeAverage: 25,
        facilityAverage: 25
      }
    }
  }

  /**
   * Get age group for benchmarking
   */
  private getAgeGroup(age: number): string {
    if (age < 18) return 'pediatric'
    if (age < 35) return 'young_adult'
    if (age < 50) return 'middle_aged'
    if (age < 65) return 'mature'
    if (age < 80) return 'elderly'
    return 'very_elderly'
  }

  /**
   * Generate recommendations based on score and trends
   */
  private generateRecommendations(
    components: RiskScoreComponents,
    riskLevel: string,
    trends: any
  ) {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
      monitoring: [] as string[]
    }

    // Risk level based recommendations
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.immediate.push('Comprehensive pre-operative assessment required')
      recommendations.immediate.push('Specialist consultation recommended')
      recommendations.monitoring.push('Continuous monitoring during procedure')
      recommendations.monitoring.push('Extended post-operative observation')
    }

    if (riskLevel === 'moderate') {
      recommendations.immediate.push('Enhanced pre-operative preparation')
      recommendations.monitoring.push('Standard monitoring with additional precautions')
    }

    // Trend-based recommendations
    if (trends.direction === 'worsening') {
      recommendations.shortTerm.push('Address factors contributing to increasing risk')
      recommendations.monitoring.push('More frequent risk assessments')
    }

    // Component-specific recommendations
    const patientTotal = Object.values(components.patientFactors).reduce((sum, score) => sum + score, 0) / 4
    if (patientTotal > 40) {
      recommendations.longTerm.push('Lifestyle modification counseling')
      recommendations.longTerm.push('Chronic disease management optimization')
    }

    const treatmentTotal = Object.values(components.treatmentFactors).reduce((sum, score) => sum + score, 0) / 4
    if (treatmentTotal > 40) {
      recommendations.immediate.push('Consider less invasive alternatives')
      recommendations.immediate.push('Staged treatment approach evaluation')
    }

    return recommendations
  }

  /**
   * Store risk score for trend analysis
   */
  private async storeRiskScore(patientId: string, result: RiskScoreResult): Promise<void> {
    try {
      await this.supabase
        .from('risk_scores')
        .insert({
          patient_id: patientId,
          score: result.normalizedScore,
          risk_level: result.riskLevel,
          confidence: result.confidence,
          components: JSON.stringify(result.components),
          breakdown: JSON.stringify(result.breakdown),
          trends: JSON.stringify(result.trends),
          benchmarks: JSON.stringify(result.benchmarks),
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error storing risk score:', error)
    }
  }

  /**
   * Initialize scoring configuration
   */
  private initializeConfig(config?: Partial<ScoringConfig>): ScoringConfig {
    const defaultConfig: ScoringConfig = {
      weights: {
        patientFactors: 0.4,
        treatmentFactors: 0.3,
        environmentalFactors: 0.2,
        historicalFactors: 0.1
      },
      thresholds: {
        minimal: 10,
        low: 25,
        moderate: 50,
        high: 75
      },
      adjustments: {
        ageMultiplier: {
          'pediatric': 1.2,
          'elderly': 1.3,
          'very_elderly': 1.5
        },
        treatmentMultiplier: {
          'surgery': 1.4,
          'implant': 1.3,
          'extraction': 1.1,
          'consultation': 0.8
        },
        facilityMultiplier: {
          'clinic': 1.2,
          'surgical_center': 1.0,
          'hospital': 0.9
        }
      },
      compliance: {
        cfmWeight: 0.3,
        anvisaWeight: 0.4,
        ethicsWeight: 0.3
      }
    }

    return { ...defaultConfig, ...config }
  }

  /**
   * Load risk factors from database
   */
  private async loadRiskFactors(): Promise<void> {
    try {
      const { data: factors } = await this.supabase
        .from('risk_factors')
        .select('*')

      if (factors) {
        factors.forEach(factor => {
          this.riskFactors.set(factor.id, {
            id: factor.id,
            name: factor.name,
            category: factor.category,
            subcategory: factor.subcategory,
            weight: factor.weight,
            scoreFunction: this.createScoreFunction(factor.score_function),
            description: factor.description,
            evidenceLevel: factor.evidence_level,
            sources: JSON.parse(factor.sources || '[]'),
            lastUpdated: new Date(factor.updated_at)
          })
        })
      }
    } catch (error) {
      console.error('Error loading risk factors:', error)
    }
  }

  /**
   * Load population statistics
   */
  private async loadPopulationStats(): Promise<void> {
    try {
      const { data: stats } = await this.supabase
        .from('population_statistics')
        .select('*')
        .single()

      if (stats) {
        this.populationStats = {
          averageScore: stats.average_score,
          ageGroups: JSON.parse(stats.age_groups || '{}'),
          treatmentTypes: JSON.parse(stats.treatment_types || '{}'),
          facilityTypes: JSON.parse(stats.facility_types || '{}')
        }
      }
    } catch (error) {
      console.error('Error loading population stats:', error)
    }
  }

  /**
   * Create score function from string definition
   */
  private createScoreFunction(functionDef: string): (value: any, context: any) => number {
    // This would parse and create a function from the database definition
    // For now, return a simple function
    return (value: any, context: any) => {
      if (typeof value === 'number') return Math.min(100, Math.max(0, value))
      if (typeof value === 'boolean') return value ? 20 : 0
      return 10 // Default score
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config }
  }

  /**
   * Get risk factor definitions
   */
  getRiskFactors(): Map<string, RiskFactorDefinition> {
    return new Map(this.riskFactors)
  }
}

export {
  RiskScoringAlgorithm,
  type RiskScoreComponents,
  type RiskScoreResult,
  type ScoringConfig,
  type RiskFactorDefinition,
  type RiskDataPoint
}

