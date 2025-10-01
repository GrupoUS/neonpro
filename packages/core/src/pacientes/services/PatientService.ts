// Patient service for aesthetic clinic client management
import { Patient, MedicalHistory, ConsentData } from '../types'
import { calculateAge, isValidCPF, isValidPhone } from '../../common/utils'

export class PatientService {
  // Validate patient data for Brazilian aesthetic clinic
  static validatePatient(patient: Partial<Patient>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!patient.name || patient.name.trim().length < 2) {
      errors.push('Nome completo é obrigatório')
    }
    
    if (!patient.cpf || !isValidCPF(patient.cpf)) {
      errors.push('CPF inválido')
    }
    
    if (!patient.phone || !isValidPhone(patient.phone)) {
      errors.push('Telefone inválido')
    }
    
    if (!patient.birth_date) {
      errors.push('Data de nascimento é obrigatória')
    } else {
      const age = calculateAge(patient.birth_date)
      if (age < 18) {
        errors.push('Paciente deve ser maior de idade')
      }
      if (age > 100) {
        errors.push('Data de nascimento inválida')
      }
    }
    
    if (patient.email && !patient.email.includes('@')) {
      errors.push('E-mail inválido')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Check if patient has active consent for LGPD compliance
  static hasValidConsent(consent: ConsentData): boolean {
    const now = new Date()
    const consentAge = Math.floor(
      (now.getTime() - consent.consent_date.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Consent must be less than 2 years old
    return consentAge < 730 && 
           consent.lgpd_consent && 
           consent.treatment_consent && 
           consent.data_processing_consent
  }
  
  // Update patient VIP status based on treatment history
  static updateVIPStatus(
    patient: Patient,
    totalAppointments: number,
    totalSpent: number,
    monthsAsClient: number
  ): boolean {
    const vipThresholds = {
      minAppointments: 10,
      minSpent: 5000,
      minMonths: 6
    }
    
    const shouldBeVIP = 
      totalAppointments >= vipThresholds.minAppointments &&
      totalSpent >= vipThresholds.minSpent &&
      monthsAsClient >= vipThresholds.minMonths
    
    return shouldBeVIP
  }
  
  // Check for contraindications based on medical history
  static checkContraindications(
    medicalHistory: MedicalHistory,
    _treatmentCategory: string
  ): { hasContraindications: boolean; reasons: string[] } {
    const reasons: string[] = []
    
    // Check for allergies
    if (medicalHistory.allergies && medicalHistory.allergies.length > 0) {
      reasons.push(`Alergias conhecidas: ${medicalHistory.allergies.join(', ')}`)
    }
    
    // Check for medications that might interfere
    if (medicalHistory.medications) {
      const interferingMeds = medicalHistory.medications.filter(med => 
        med.toLowerCase().includes('anticoagulant') ||
        med.toLowerCase().includes('isotretinoin') ||
        med.toLowerCase().includes('antibiotic')
      )
      
      if (interferingMeds.length > 0) {
        reasons.push(`Medicamentos que podem interferir: ${interferingMeds.join(', ')}`)
      }
    }
    
    // Check skin conditions
    if (medicalHistory.skin_conditions && medicalHistory.skin_conditions.length > 0) {
      reasons.push(`Condições de pele: ${medicalHistory.skin_conditions.join(', ')}`)
    }
    
    // Check existing contraindications
    if (medicalHistory.contraindications && medicalHistory.contraindications.length > 0) {
      reasons.push(`Contraindicações existentes: ${medicalHistory.contraindications.join(', ')}`)
    }
    
    return {
      hasContraindications: reasons.length > 0,
      reasons
    }
  }
  
  // Generate patient summary for clinical use
  static generatePatientSummary(patient: Patient): string {
    const age = calculateAge(patient.birth_date)
    const vipStatus = patient.vip_status ? 'VIP' : 'Regular'
    
    return `
Paciente: ${patient.name}
Idade: ${age} anos
Contato: ${patient.phone} ${patient.email ? '| ' + patient.email : ''}
Status: ${vipStatus}
CPF: ${patient.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')}
${patient.address ? `Endereço: ${patient.address.street}, ${patient.address.number}` : ''}
    `.trim()
  }
}