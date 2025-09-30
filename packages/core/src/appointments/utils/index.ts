// Appointments utilities
import { AppointmentStatus, PaymentStatus } from '../types'

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Agendado',
  [AppointmentStatus.CONFIRMED]: 'Confirmado',
  [AppointmentStatus.IN_PROGRESS]: 'Em Andamento',
  [AppointmentStatus.COMPLETED]: 'Concluído',
  [AppointmentStatus.CANCELLED]: 'Cancelado',
  [AppointmentStatus.NO_SHOW]: 'Não Compareceu',
  [AppointmentStatus.RESCHEDULED]: 'Remarcado'
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendente',
  [PaymentStatus.PAID]: 'Pago',
  [PaymentStatus.PARTIAL]: 'Parcial',
  [PaymentStatus.REFUNDED]: 'Reembolsado',
  [PaymentStatus.CANCELLED]: 'Cancelado'
}

export const getStatusColor = (status: AppointmentStatus): string => {
  const colors = {
    [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
    [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800',
    [AppointmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [AppointmentStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
    [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [AppointmentStatus.NO_SHOW]: 'bg-orange-100 text-orange-800',
    [AppointmentStatus.RESCHEDULED]: 'bg-purple-100 text-purple-800'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}