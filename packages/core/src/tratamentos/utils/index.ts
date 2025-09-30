// Treatments utilities
import { TreatmentCategory } from '../types'

export const categoryLabels: Record<TreatmentCategory, string> = {
  [TreatmentCategory.FACIAL_TREATMENTS]: 'Tratamentos Faciais',
  [TreatmentCategory.BODY_TREATMENTS]: 'Tratamentos Corporais',
  [TreatmentCategory.INJECTABLES]: 'Injetáveis',
  [TreatmentCategory.LASER_TREATMENTS]: 'Tratamentos a Laser',
  [TreatmentCategory.PEELINGS]: 'Peelings',
  [TreatmentCategory.THREAD_LIFT]: 'Lifting com Fios',
  [TreatmentCategory.HAIR_TREATMENTS]: 'Tratamentos Capilares',
  [TreatmentCategory.WELLNESS]: 'Bem-Estar'
}

export const getCategoryIcon = (category: TreatmentCategory): string => {
  const icons = {
    [TreatmentCategory.FACIAL_TREATMENTS]: '😊',
    [TreatmentCategory.BODY_TREATMENTS]: '💆‍♀️',
    [TreatmentCategory.INJECTABLES]: '💉',
    [TreatmentCategory.LASER_TREATMENTS]: '⚡',
    [TreatmentCategory.PEELINGS]: '🧪',
    [TreatmentCategory.THREAD_LIFT]: '🪡',
    [TreatmentCategory.HAIR_TREATMENTS]: '💇‍♀️',
    [TreatmentCategory.WELLNESS]: '🌿'
  }
  
  return icons[category] || '✨'
}