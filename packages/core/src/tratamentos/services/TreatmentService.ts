// Treatment service for aesthetic clinic procedures catalog
import { Treatment, TreatmentCategory } from '../types'
import { formatCurrency, getTreatmentDurationText } from '../../common/utils'

export class TreatmentService {
  // Validate treatment data for Brazilian aesthetic clinic
  static validateTreatment(treatment: Partial<Treatment>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!treatment.name || treatment.name.trim().length < 3) {
      errors.push('Nome do tratamento deve ter pelo menos 3 caracteres')
    }
    
    if (!treatment.description || treatment.description.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres')
    }
    
    if (!treatment.category) {
      errors.push('Categoria do tratamento é obrigatória')
    }
    
    const durationMinutes = treatment.duration_minutes
    if (durationMinutes === undefined || durationMinutes <= 0) {
      errors.push('Duração deve ser maior que zero minutos')
    }
    
    const basePrice = treatment.base_price
    if (basePrice === undefined || basePrice < 0) {
      errors.push('Preço base deve ser positivo ou zero')
    }
    
    const sessionCount = treatment.session_count
    if (sessionCount === undefined || sessionCount <= 0) {
      errors.push('Número de sessões deve ser maior que zero')
    }
    
    const intervalDays = treatment.interval_days
    if (intervalDays !== undefined && intervalDays < 0) {
      errors.push('Intervalo entre sessões não pode ser negativo')
    }
    
    // Brazilian-specific validations
    if (basePrice !== undefined && basePrice > 50000) {
      errors.push('Preço base muito alto para padrões de mercado brasileiro')
    }
    
    if (durationMinutes !== undefined && durationMinutes > 480) { // 8 hours
      errors.push('Duração do tratamento não pode exceder 8 horas')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Calculate treatment package price with discount
  static calculatePackagePrice(
    treatments: { treatment: Treatment; quantity: number }[],
    discountPercentage: number
  ): number {
    const subtotal = treatments.reduce((total, { treatment, quantity }) => {
      return total + (treatment.base_price * quantity)
    }, 0)
    
    const discount = subtotal * (discountPercentage / 100)
    return Math.max(0, subtotal - discount)
  }
  
  // Get treatments by category
  static getTreatmentsByCategory(
    treatments: Treatment[],
    category: TreatmentCategory
  ): Treatment[] {
    return treatments.filter(treatment => treatment.category === category)
  }
  
  // Get treatment duration including preparation and recovery
  static getTotalDuration(treatment: Treatment): {
    preparation: number
    procedure: number
    recovery: number
    total: number
    formattedText: string
  } {
    const preparation = treatment.requires_preparation ? 30 : 15 // 30min if preparation needed, 15min standard
    const procedure = treatment.duration_minutes
    const recovery = treatment.recovery_days ? treatment.recovery_days * 24 * 60 : 0 // Convert days to minutes
    const total = preparation + procedure + recovery
    
    return {
      preparation,
      procedure,
      recovery,
      total,
      formattedText: getTreatmentDurationText(total)
    }
  }
  
  // Check if treatment is appropriate for patient age
  static isAgeAppropriate(treatment: Treatment, patientAge: number): {
    isAppropriate: boolean
    reason?: string
  } {
    const ageRestrictions: Record<TreatmentCategory, { min?: number; max?: number; reason?: string }> = {
      [TreatmentCategory.FACIAL_TREATMENTS]: { min: 16, reason: 'Tratamentos faciais requerem mínimo de 16 anos' },
      [TreatmentCategory.BODY_TREATMENTS]: { min: 18, reason: 'Tratamentos corporais requerem maioridade' },
      [TreatmentCategory.INJECTABLES]: { min: 21, reason: 'Tratamentos injetáveis requerem 21 anos ou mais' },
      [TreatmentCategory.LASER_TREATMENTS]: { min: 18, reason: 'Tratamentos a laser requerem maioridade' },
      [TreatmentCategory.PEELINGS]: { min: 16, reason: 'Peelings químicos requerem mínimo de 16 anos' },
      [TreatmentCategory.THREAD_LIFT]: { min: 25, reason: 'Lifting com fios requer 25 anos ou mais' },
      [TreatmentCategory.HAIR_TREATMENTS]: { min: 14, reason: 'Tratamentos capilares requerem mínimo de 14 anos' },
      [TreatmentCategory.WELLNESS]: { min: 16, reason: 'Tratamentos de bem-estar requerem mínimo de 16 anos' }
    }
    
    const restriction = ageRestrictions[treatment.category]
    
    if (!restriction) return { isAppropriate: true }
    
    if (restriction.min && patientAge < restriction.min) {
      return {
        isAppropriate: false,
        reason: restriction.reason ?? 'Idade abaixo do recomendado para este tratamento'
      }
    }
    
    if (restriction.max && patientAge > restriction.max) {
      return {
        isAppropriate: false,
        reason: restriction.reason ?? 'Idade acima do recomendado para este tratamento'
      }
    }
    
    return { isAppropriate: true }
  }
  
  // Generate treatment summary for patients
  static generateTreatmentSummary(treatment: Treatment): string {
    const duration = getTreatmentDurationText(treatment.duration_minutes)
    const totalPrice = formatCurrency(treatment.base_price * treatment.session_count)
    
    return `
${treatment.name}

Descrição: ${treatment.description}
Duração por sessão: ${duration}
Número de sessões: ${treatment.session_count}
${treatment.interval_days > 0 ? `Intervalo: ${treatment.interval_days} dias entre sessões` : ''}
Valor total: ${totalPrice}
${treatment.recovery_days ? `Tempo de recuperação: ${treatment.recovery_days} dia(s)` : ''}
${treatment.contraindications && treatment.contraindications.length > 0 ? 
  `Contraindicações: ${treatment.contraindications.join(', ')}` : ''}

${treatment.benefits && treatment.benefits.length > 0 ? 
  `Benefícios: ${treatment.benefits.join(', ')}` : ''}
    `.trim()
  }
  
  // Get most popular treatments based on appointment data
  static getPopularTreatments(
    treatments: Treatment[],
    appointmentData: { treatment_id: string; count: number }[]
  ): Treatment[] {
    const treatmentCounts = new Map<string, number>()
    
    appointmentData.forEach(data => {
      treatmentCounts.set(data.treatment_id, data.count)
    })
    
    return treatments
      .filter(treatment => treatmentCounts.has(treatment.id))
      .sort((a, b) => {
        const countA = treatmentCounts.get(a.id) || 0
        const countB = treatmentCounts.get(b.id) || 0
        return countB - countA
      })
  }
  
  // Search treatments by name or description
  static searchTreatments(
    treatments: Treatment[],
    query: string
  ): Treatment[] {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (!normalizedQuery) return treatments
    
    return treatments.filter(treatment => 
      treatment.name.toLowerCase().includes(normalizedQuery) ||
      treatment.description.toLowerCase().includes(normalizedQuery) ||
      treatment.category.toLowerCase().includes(normalizedQuery) ||
      treatment.benefits?.some(benefit => benefit.toLowerCase().includes(normalizedQuery))
    )
  }
  
  // Get treatment price range for category
  static getPriceRangeByCategory(
    treatments: Treatment[],
    category: TreatmentCategory
  ): { min: number; max: number; average: number; formatted: string } {
    const categoryTreatments = this.getTreatmentsByCategory(treatments, category)
    
    if (categoryTreatments.length === 0) {
      return { min: 0, max: 0, average: 0, formatted: 'N/A' }
    }
    
    const prices = categoryTreatments.map(t => t.base_price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length
    
    return {
      min,
      max,
      average,
      formatted: `${formatCurrency(min)} - ${formatCurrency(max)}`
    }
  }
}