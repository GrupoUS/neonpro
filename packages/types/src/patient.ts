import type { BaseEntity, } from './common'

export interface Patient extends BaseEntity {
  name: string
  email: string
  phone: string
  birth_date: string
  address?: string
  medical_history?: string
}
