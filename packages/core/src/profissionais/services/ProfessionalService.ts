// Professional service for aesthetic clinic specialists management
import { Professional, AvailabilitySlot, ProfessionalRating } from '../types'
import { formatPhone, isValidCPF } from '../../common/utils'

export class ProfessionalService {
  // Validate professional registration for Brazilian aesthetic clinic
  static validateProfessional(professional: Partial<Professional>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!professional.name || professional.name.trim().length < 2) {
      errors.push('Nome completo é obrigatório')
    }
    
    if (!professional.cpf || !isValidCPF(professional.cpf)) {
      errors.push('CPF inválido')
    }
    
    if (!professional.professional_license || professional.professional_license.trim().length < 4) {
      errors.push('Número do registro profissional é obrigatório')
    }
    
    if (!professional.email || !professional.email.includes('@')) {
      errors.push('E-mail inválido')
    }
    
    if (!professional.phone || !formatPhone(professional.phone)) {
      errors.push('Telefone inválido')
    }
    
    if (!professional.specialty) {
      errors.push('Especialidade é obrigatória')
    }
    
    if (professional.commission_rate !== undefined) {
      if (professional.commission_rate < 0 || professional.commission_rate > 1) {
        errors.push('Taxa de comissão deve estar entre 0 e 1 (0-100%)')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Check if professional can perform specific treatment
  static canPerformTreatment(
    professional: Professional,
    requiredSpecialty: string
  ): boolean {
    // Map treatments to required specialties
    const treatmentSpecialtyMap: Record<string, string[]> = {
      'BOTOX': ['dermatologist', 'plastic_surgeon', 'aesthetic_physician'],
      'PREENCHIMENTO': ['dermatologist', 'plastic_surgeon', 'aesthetic_physician'],
      'LASER': ['dermatologist', 'plastic_surgeon', 'aesthetic_physician'],
      'PEELING_QUIMICO': ['dermatologist', 'aesthetic_physician', 'beauty_therapist'],
      'LIMPEZA_DE_PELE': ['beauty_therapist', 'nurse_aesthetician', 'aesthetic_physician'],
      'MASSAGEM': ['beauty_therapist', 'nurse_aesthetician'],
      'SOBRANCELHA': ['beauty_therapist', 'makeup_artist'],
      'MAQUIAGEM': ['makeup_artist', 'beauty_therapist']
    }
    
    const allowedSpecialties = treatmentSpecialtyMap[requiredSpecialty.toUpperCase()] || []
    return allowedSpecialties.includes(professional.specialty)
  }
  
  // Generate professional availability for a week
  static generateWeeklyAvailability(
    professional: Professional,
    weekStart: Date
  ): { date: Date; slots: AvailabilitySlot[] }[] {
    const weeklyAvailability = []
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)
      
      const dayOfWeek = currentDate.getDay()
      const daySlots = professional.availability.filter(slot => 
        slot.day_of_week === dayOfWeek && slot.is_available
      )
      
      weeklyAvailability.push({
        date: currentDate,
        slots: daySlots
      })
    }
    
    return weeklyAvailability
  }
  
  // Calculate professional rating average
  static calculateAverageRating(ratings: ProfessionalRating[]): {
    average: number
    totalRatings: number
    distribution: Record<number, number>
  } {
    if (ratings.length === 0) {
      return { average: 0, totalRatings: 0, distribution: {} }
    }
    
    const totalScore = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    const average = totalScore / ratings.length
    
    const distribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
    
    ratings.forEach(rating => {
      distribution[rating.rating]++
    })
    
    return {
      average: Math.round(average * 10) / 10,
      totalRatings: ratings.length,
      distribution
    }
  }
  
  // Check professional availability for specific time
  static isAvailableAtTime(
    professional: Professional,
    dateTime: Date
  ): boolean {
    const dayOfWeek = dateTime.getDay()
    const timeString = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`
    
    const dayAvailability = professional.availability.find(slot => 
      slot.day_of_week === dayOfWeek && slot.is_available
    )
    
    if (!dayAvailability) return false
    
    return timeString >= dayAvailability.start_time && timeString <= dayAvailability.end_time
  }
  
  // Get professional performance metrics
  static getPerformanceMetrics(
    professionalId: string,
    appointments: any[], // Would be Appointment[] type
    ratings: ProfessionalRating[]
  ) {
    const professionalAppointments = appointments.filter(apt => apt.professional_id === professionalId)
    const completedAppointments = professionalAppointments.filter(apt => apt.status === 'completed')
    
    const ratingData = this.calculateAverageRating(ratings)
    
    const monthlyEarnings = completedAppointments.reduce((total, apt) => {
      const month = new Date(apt.created_at).getMonth()
      const currentMonth = new Date().getMonth()
      
      if (month === currentMonth) {
        return total + (apt.price * professional.commission_rate)
      }
      return total
    }, 0)
    
    const noShowRate = professionalAppointments.length > 0 
      ? (professionalAppointments.filter(apt => apt.status === 'no_show').length / professionalAppointments.length) * 100 
      : 0
    
    return {
      totalAppointments: professionalAppointments.length,
      completedAppointments: completedAppointments.length,
      completionRate: professionalAppointments.length > 0 
        ? (completedAppointments.length / professionalAppointments.length) * 100 
        : 0,
      noShowRate,
      averageRating: ratingData.average,
      totalRatings: ratingData.totalRatings,
      monthlyEarnings,
      averageAppointmentValue: completedAppointments.length > 0 
        ? completedAppointments.reduce((sum, apt) => sum + apt.price, 0) / completedAppointments.length 
        : 0
    }
  }
  
  // Format professional display name
  static formatDisplayName(professional: Professional): string {
    const titles = {
      'dermatologist': 'Dra. Dr.',
      'plastic_surgeon': 'Dr. Dra.',
      'aesthetic_physician': 'Dr. Dra.',
      'beauty_therapist': '',
      'nurse_aesthetician': '',
      'makeup_artist': ''
    }
    
    const title = titles[professional.specialty] || ''
    return `${title} ${professional.name}`.trim()
  }
}