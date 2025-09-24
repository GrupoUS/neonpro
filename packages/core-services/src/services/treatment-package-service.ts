/**
 * Treatment Package Service (T017)
 * Handles treatment package management, pricing, and bundling logic for aesthetic procedures
 * 
 * Features:
 * - Package creation and management with Brazilian pricing
 * - Multi-procedure bundle pricing with volume discounts
 * - Session scheduling and interval management
 * - Package customization and modification
 * - Integration with aesthetic procedures service
 * - Brazilian market pricing strategies
 */

import type { AestheticProcedureDetails } from './enhanced-aesthetic-scheduling-service'
import { AestheticAppointmentService } from './aesthetic-appointment-service'

export interface TreatmentPackage {
  id: string
  name: string
  description: string
  procedures: AestheticProcedureDetails[]
  totalSessions: number
  totalDurationMinutes: number
  totalPrice: number
  recoveryPeriodDays: number
  recommendedIntervalWeeks: number
  packageDiscount: number
  isActive: boolean
  validUntil?: Date
  customizations?: TreatmentPackageCustomization[]
}

export interface TreatmentPackageCustomization {
  id: string
  type: 'session_addition' | 'interval_adjustment' | 'procedure_replacement' | 'intensity_boost'
  description: string
  priceImpact: number
  durationImpact?: number
  recoveryImpact?: number
}

export interface TreatmentPackageRequest {
  packageId: string
  patientId: string
  clinicId: string
  customizations?: TreatmentPackageCustomization[]
  preferredStartDate?: Date
  specialRequests?: string
}

export interface TreatmentPackagePricing {
  basePrice: number
  packageDiscount: number
  customizationFees: number
  totalPrice: number
  paymentOptions: PaymentOption[]
  installmentPlan?: InstallmentPlan
}

export interface PaymentOption {
  type: 'full_payment' | 'installment' | 'membership'
  discount: number
  maxInstallments?: number
  interestRate?: number
}

export interface InstallmentPlan {
  totalInstallments: number
  installmentAmount: number
  firstPaymentDate: Date
  frequency: 'weekly' | 'biweekly' | 'monthly'
  interestRate: number
}

export interface TreatmentPackageResult {
  package: TreatmentPackage
  pricing: TreatmentPackagePricing
  schedule: Date[]
  totalPrice: number
  requiresDeposit: boolean
  depositAmount?: number
  customizations: TreatmentPackageCustomization[]
  paymentPlan: PaymentOption[]
}

export class TreatmentPackageService {
  private packages: Map<string, TreatmentPackage> = new Map()
  private appointmentService: AestheticAppointmentService

  constructor(appointmentService: AestheticAppointmentService) {
    this.appointmentService = appointmentService
    this.initializeDefaultPackages()
  }

  /**
   * Creates a new treatment package
   */
  async createTreatmentPackage(
    packageData: Omit<TreatmentPackage, 'id'>,
  ): Promise<TreatmentPackage> {
    const newPackage: TreatmentPackage = {
      ...packageData,
      id: this.generatePackageId(),
      isActive: true,
    }

    // Validate package integrity
    this.validatePackage(newPackage)

    // Calculate derived fields
    this.calculatePackageMetrics(newPackage)

    this.packages.set(newPackage.id, newPackage)
    return newPackage
  }

  /**
   * Gets a treatment package by ID
   */
  async getTreatmentPackage(packageId: string): Promise<TreatmentPackage | null> {
    return this.packages.get(packageId) || null
  }

  /**
   * Lists all available treatment packages
   */
  async listTreatmentPackages(
    filters: {
      procedureType?: string
      maxPrice?: number
      minSessions?: number
      isActive?: boolean
    } = {},
  ): Promise<TreatmentPackage[]> {
    let packages = Array.from(this.packages.values())

    // Apply filters
    if (filters.procedureType) {
      packages = packages.filter(pkg => 
        pkg.procedures.some(proc => proc.procedureType === filters.procedureType)
      )
    }

    if (filters.maxPrice) {
      packages = packages.filter(pkg => pkg.totalPrice <= filters.maxPrice!)
    }

    if (filters.minSessions) {
      packages = packages.filter(pkg => pkg.totalSessions >= filters.minSessions!)
    }

    if (filters.isActive !== undefined) {
      packages = packages.filter(pkg => pkg.isActive === filters.isActive)
    }

    return packages.sort((a, b) => a.totalPrice - b.totalPrice)
  }

  /**
   * Schedules a treatment package for a patient
   */
  async scheduleTreatmentPackage(
    request: TreatmentPackageRequest,
  ): Promise<TreatmentPackageResult> {
    const treatmentPackage = this.packages.get(request.packageId)
    if (!treatmentPackage) {
      throw new Error(`Treatment package ${request.packageId} not found`)
    }

    if (!treatmentPackage.isActive) {
      throw new Error(`Treatment package ${request.packageId} is not active`)
    }

    // Apply customizations
    const customizedPackage = this.applyCustomizations(treatmentPackage, request.customizations || [])

    // Calculate pricing with customizations
    const pricing = this.calculatePackagePricing(customizedPackage, request.customizations || [])

    // Generate session schedule
    const schedule = this.generatePackageSchedule(
      request.preferredStartDate || new Date(),
      customizedPackage,
    )

    // Check if deposit is required
    const requiresDeposit = pricing.totalPrice > 1000 // BRL 1000+
    const depositAmount = requiresDeposit ? pricing.totalPrice * 0.3 : undefined

    return {
      package: customizedPackage,
      pricing,
      schedule,
      totalPrice: pricing.totalPrice,
      requiresDeposit,
      depositAmount,
      customizations: request.customizations || [],
      paymentPlan: pricing.paymentOptions,
    }
  }

  /**
   * Updates an existing treatment package
   */
  async updateTreatmentPackage(
    packageId: string,
    updates: Partial<TreatmentPackage>,
  ): Promise<TreatmentPackage> {
    const existingPackage = this.packages.get(packageId)
    if (!existingPackage) {
      throw new Error(`Treatment package ${packageId} not found`)
    }

    const updatedPackage = {
      ...existingPackage,
      ...updates,
    }

    // Recalculate metrics if procedures changed
    if (updates.procedures) {
      this.calculatePackageMetrics(updatedPackage)
    }

    this.validatePackage(updatedPackage)
    this.packages.set(packageId, updatedPackage)

    return updatedPackage
  }

  /**
   * Deactivates a treatment package
   */
  async deactivateTreatmentPackage(packageId: string): Promise<void> {
    const package_ = this.packages.get(packageId)
    if (!package_) {
      throw new Error(`Treatment package ${packageId} not found`)
    }

    package_.isActive = false
    this.packages.set(packageId, package_)
  }

  /**
   * Creates a custom treatment package
   */
  async createCustomPackage(
    procedures: AestheticProcedureDetails[],
    patientRequirements: {
      budget?: number
      timeConstraint?: number
      priorityAreas?: string[]
    },
  ): Promise<TreatmentPackage> {
    // Validate procedure compatibility
    this.validateProcedureCompatibility(procedures)

    // Calculate optimal package configuration
    const packageConfig = this.optimizePackageConfiguration(procedures, patientRequirements)

    const customPackage: TreatmentPackage = {
      id: this.generatePackageId(),
      name: `Pacote Personalizado ${new Date().toLocaleDateString('pt-BR')}`,
      description: this.generatePackageDescription(procedures),
      procedures,
      totalSessions: packageConfig.totalSessions,
      totalDurationMinutes: packageConfig.totalDuration,
      totalPrice: packageConfig.totalPrice,
      recoveryPeriodDays: packageConfig.recoveryPeriod,
      recommendedIntervalWeeks: packageConfig.recommendedInterval,
      packageDiscount: packageConfig.discount,
      isActive: true,
      customizations: packageConfig.customizations,
    }

    this.packages.set(customPackage.id, customPackage)
    return customPackage
  }

  /**
   * Validates package integrity and business rules
   */
  private validatePackage(package_: TreatmentPackage): void {
    if (!package_.name || package_.name.trim().length === 0) {
      throw new Error('Package name is required')
    }

    if (!package_.procedures || package_.procedures.length === 0) {
      throw new Error('Package must include at least one procedure')
    }

    if (package_.totalPrice <= 0) {
      throw new Error('Package price must be positive')
    }

    if (package_.packageDiscount < 0 || package_.packageDiscount > 0.5) {
      throw new Error('Package discount must be between 0% and 50%')
    }

    // Validate Brazilian pricing rules
    if (package_.totalPrice < 100) {
      throw new Error('Package price must be at least BRL 100')
    }

    // Validate procedure compatibility
    this.validateProcedureCompatibility(package_.procedures)
  }

  /**
   * Validates that procedures can be bundled together
   */
  private validateProcedureCompatibility(procedures: AestheticProcedureDetails[]): void {
    const procedureTypes = procedures.map(p => p.procedureType)
    
    // Check for incompatible combinations
    const incompatibleCombinations = [
      ['surgical', 'injectable'], // Cannot mix surgical and injectable in same session
      ['surgical', 'laser'],      // Cannot mix surgical and laser in same session
    ]

    for (const [type1, type2] of incompatibleCombinations) {
      if (type1 && type2 && procedureTypes.includes(type1 as any) && procedureTypes.includes(type2 as any)) {
        throw new Error(`Cannot combine ${type1} and ${type2} procedures in same package`)
      }
    }

    // Check recovery period conflicts
    const maxRecovery = Math.max(...procedures.map(p => p.recoveryPeriodDays))
    if (maxRecovery > 30) {
      throw new Error('Package recovery period cannot exceed 30 days')
    }
  }

  /**
   * Calculates package metrics (total duration, price, etc.)
   */
  private calculatePackageMetrics(package_: TreatmentPackage): void {
    package_.totalSessions = package_.procedures.length
    package_.totalDurationMinutes = package_.procedures.reduce(
      (sum, proc) => sum + this.appointmentService.calculateDuration(proc.baseDurationMinutes, proc.variableDurationFactors || []),
      0
    )
    
    // Calculate base price without discount
    const basePrice = package_.procedures.reduce((sum, _proc) => sum + 1000, 0) // Mock price
    
    // Apply package discount
    package_.totalPrice = Math.round(basePrice * (1 - package_.packageDiscount))
    
    // Calculate maximum recovery period
    package_.recoveryPeriodDays = Math.max(...package_.procedures.map(p => p.recoveryPeriodDays))
    
    // Set recommended interval based on procedures
    package_.recommendedIntervalWeeks = this.calculateRecommendedInterval(package_.procedures)
  }

  /**
   * Calculates recommended interval between sessions
   */
  private calculateRecommendedInterval(procedures: AestheticProcedureDetails[]): number {
    const avgRecovery = procedures.reduce((sum, p) => sum + p.recoveryPeriodDays, 0) / procedures.length
    
    if (avgRecovery <= 7) return 1   // Weekly for light procedures
    if (avgRecovery <= 14) return 2  // Biweekly for medium procedures
    if (avgRecovery <= 21) return 3  // Every 3 weeks for heavier procedures
    return 4 // Monthly for intensive procedures
  }

  /**
   * Applies customizations to a treatment package
   */
  private applyCustomizations(
    package_: TreatmentPackage,
    customizations: TreatmentPackageCustomization[],
  ): TreatmentPackage {
    const customizedPackage = { ...package_ }

    for (const customization of customizations) {
      switch (customization.type) {
        case 'session_addition':
          customizedPackage.totalSessions += 1
          customizedPackage.totalDurationMinutes += 60 // Default session duration
          break
        case 'interval_adjustment':
          customizedPackage.recommendedIntervalWeeks += customization.durationImpact || 0
          break
        case 'intensity_boost':
          customizedPackage.totalPrice += customization.priceImpact
          break
        case 'procedure_replacement':
          // Would replace a procedure - implementation depends on business rules
          break
      }
    }

    return customizedPackage
  }

  /**
   * Calculates pricing for a treatment package
   */
  private calculatePackagePricing(
    package_: TreatmentPackage,
    customizations: TreatmentPackageCustomization[],
  ): TreatmentPackagePricing {
    const customizationFees = customizations.reduce((sum, c) => sum + c.priceImpact, 0)
    const basePrice = package_.procedures.reduce((sum, _p) => sum + 1000, 0) // Mock price
    
    const totalPrice = package_.totalPrice + customizationFees

    // Generate payment options
    const paymentOptions: PaymentOption[] = [
      {
        type: 'full_payment',
        discount: 0.1, // 10% discount for full payment
      },
    ]

    // Add installment option for packages over BRL 500
    if (totalPrice > 500) {
      paymentOptions.push({
        type: 'installment',
        discount: 0,
        maxInstallments: Math.min(12, Math.ceil(totalPrice / 100)),
        interestRate: 0.0399, // 3.99% monthly interest
      })
    }

    return {
      basePrice,
      packageDiscount: package_.packageDiscount,
      customizationFees,
      totalPrice,
      paymentOptions,
    }
  }

  /**
   * Generates session schedule for a treatment package
   */
  private generatePackageSchedule(startDate: Date, package_: TreatmentPackage): Date[] {
    const dates: Date[] = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < package_.totalSessions; i++) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + (package_.recommendedIntervalWeeks * 7))
    }

    return dates
  }

  /**
   * Optimizes package configuration based on patient requirements
   */
  private optimizePackageConfiguration(
    procedures: AestheticProcedureDetails[],
    requirements: {
      budget?: number
      timeConstraint?: number
      priorityAreas?: string[]
    },
  ) {
    let totalPrice = procedures.reduce((sum, _p) => sum + 1000, 0) // Mock price
    let totalDuration = procedures.reduce((sum, p) => sum + p.baseDurationMinutes, 0)
    const totalSessions = procedures.length
    const recoveryPeriod = Math.max(...procedures.map(p => p.recoveryPeriodDays))
    const recommendedInterval = this.calculateRecommendedInterval(procedures)

    let discount = 0
    const customizations: TreatmentPackageCustomization[] = []

    // Apply budget constraint
    if (requirements.budget && totalPrice > requirements.budget) {
      const excessPercentage = (totalPrice - requirements.budget) / requirements.budget
      discount = Math.min(0.3, excessPercentage * 0.5) // Up to 30% discount
    }

    // Apply time constraint
    if (requirements.timeConstraint && totalDuration > requirements.timeConstraint) {
      // Remove non-essential procedures or reduce intensity
      const reduction = (totalDuration - requirements.timeConstraint) / totalDuration
      totalDuration = requirements.timeConstraint
      totalPrice = Math.round(totalPrice * (1 - reduction * 0.5))
    }

    return {
      totalSessions,
      totalDuration,
      totalPrice: Math.round(totalPrice * (1 - discount)),
      recoveryPeriod,
      recommendedInterval,
      discount,
      customizations,
    }
  }

  /**
   * Generates package description based on procedures
   */
  private generatePackageDescription(procedures: AestheticProcedureDetails[]): string {
    const procedureNames = procedures.map(p => p.name)
    
    if (procedureNames.length === 1) {
      return `Pacote de ${procedureNames[0]?.toLowerCase() || 'procedimento'}`
    }

    if (procedureNames.length === 2) {
      return `Pacote combinado de ${procedureNames.join(' e ')}`
    }

    const lastProcedure = procedureNames.pop()
    return `Pacote completo de ${procedureNames.join(', ')} e ${lastProcedure}`
  }

  /**
   * Generates unique package ID
   */
  private generatePackageId(): string {
    return `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initializes default treatment packages
   */
  private initializeDefaultPackages(): void {
    // Basic facial rejuvenation package
    const facialPackage: TreatmentPackage = {
      id: 'pkg_facial_rejuvenation',
      name: 'Pacote Rejuvenescimento Facial',
      description: 'Combinação completa para rejuvenescimento facial com resultados naturais',
      procedures: [], // Would be populated with actual procedure details
      totalSessions: 4,
      totalDurationMinutes: 240,
      totalPrice: 2800,
      recoveryPeriodDays: 7,
      recommendedIntervalWeeks: 2,
      packageDiscount: 0.15,
      isActive: true,
    }

    // Advanced anti-aging package
    const antiAgingPackage: TreatmentPackage = {
      id: 'pkg_anti_aging_advanced',
      name: 'Pacote Anti-aging Avançado',
      description: 'Tratamento completo anti-aging com tecnologia de ponta',
      procedures: [], // Would be populated with actual procedure details
      totalSessions: 6,
      totalDurationMinutes: 360,
      totalPrice: 4500,
      recoveryPeriodDays: 14,
      recommendedIntervalWeeks: 3,
      packageDiscount: 0.2,
      isActive: true,
    }

    // Body contouring package
    const bodyPackage: TreatmentPackage = {
      id: 'pkg_body_contouring',
      name: 'Pacote Modelagem Corporal',
      description: 'Soluções completas para modelagem corporal e redução de medidas',
      procedures: [], // Would be populated with actual procedure details
      totalSessions: 8,
      totalDurationMinutes: 480,
      totalPrice: 6200,
      recoveryPeriodDays: 21,
      recommendedIntervalWeeks: 2,
      packageDiscount: 0.25,
      isActive: true,
    }

    this.packages.set(facialPackage.id, facialPackage)
    this.packages.set(antiAgingPackage.id, antiAgingPackage)
    this.packages.set(bodyPackage.id, bodyPackage)
  }
}

/**
 * Factory function to create TreatmentPackageService instance
 */
export function createTreatmentPackageService(
  appointmentService: AestheticAppointmentService,
): TreatmentPackageService {
  return new TreatmentPackageService(appointmentService)
}

export default TreatmentPackageService