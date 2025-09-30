// Patients utilities
import { Gender } from '../types'
import { calculateAge } from '../../common/utils'

export const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: 'Masculino',
  [Gender.FEMALE]: 'Feminino',
  [Gender.OTHER]: 'Outro'
}

export const formatPatientAge = (birthDate: Date): string => {
  const age = calculateAge(birthDate)
  const years = Math.floor(age)
  const months = Math.floor((age - years) * 12)
  
  if (years === 0) {
    return `${months} mes${months !== 1 ? 'es' : ''}`
  } else if (months === 0) {
    return `${years} ano${years !== 1 ? 's' : ''}`
  } else {
    return `${years} ano${years !== 1 ? 's' : ''} e ${months} mes${months !== 1 ? 'es' : ''}`
  }
}

export const getPatientDisplayName = (patient: { name: string; vip_status?: boolean }): string => {
  return patient.vip_status ? `⭐ ${patient.name}` : patient.name
}