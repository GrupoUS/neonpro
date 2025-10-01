// Test to verify that all barrel exports are working correctly
import { AppointmentStatus, PaymentStatus } from '../appointments/types'
import { useAppointments } from '../appointments/hooks'
import { AppointmentService } from '../appointments/services'
import { appointmentStatusLabels, paymentStatusLabels } from '../appointments/utils'

import { InvoiceStatus, PaymentMethod } from '../financeiro/types'
import { FinancialService } from '../financeiro/services'
import { paymentMethodLabels, invoiceStatusLabels } from '../financeiro/utils'

import { ProfessionalSpecialty } from '../profissionais/types'
import { useProfessionals } from '../profissionais/hooks'
import { ProfessionalService } from '../profissionais/services'
import { specialtyLabels } from '../profissionais/utils'

import { TreatmentCategory } from '../tratamentos/types'
import { useTreatments } from '../tratamentos/hooks'
import { TreatmentService } from '../tratamentos/services'
import { categoryLabels } from '../tratamentos/utils'

describe('Barrel exports', () => {
  test('should export appointment types', () => {
    expect(AppointmentStatus.SCHEDULED).toBe('scheduled')
    expect(PaymentStatus.PENDING).toBe('pending')
  })

  test('should export appointment hooks and services', () => {
    expect(useAppointments).toBeDefined()
    expect(AppointmentService).toBeDefined()
  })

  test('should export appointment utils', () => {
    expect(appointmentStatusLabels).toBeDefined()
    expect(paymentStatusLabels).toBeDefined()
  })

  test('should export financeiro types', () => {
    expect(InvoiceStatus.DRAFT).toBe('draft')
    expect(PaymentMethod.CASH).toBe('cash')
  })

  test('should export financeiro services and utils', () => {
    expect(FinancialService).toBeDefined()
    expect(paymentMethodLabels).toBeDefined()
    expect(invoiceStatusLabels).toBeDefined()
  })

  test('should export profissionais types', () => {
    expect(ProfessionalSpecialty.DERMATOLOGIST).toBe('dermatologist')
  })

  test('should export profissionais hooks, services and utils', () => {
    expect(useProfessionals).toBeDefined()
    expect(ProfessionalService).toBeDefined()
    expect(specialtyLabels).toBeDefined()
  })

  test('should export tratamentos types', () => {
    expect(TreatmentCategory.FACIAL_TREATMENTS).toBe('facial_treatments')
  })

  test('should export tratamentos hooks, services and utils', () => {
    expect(useTreatments).toBeDefined()
    expect(TreatmentService).toBeDefined()
    expect(categoryLabels).toBeDefined()
  })
})