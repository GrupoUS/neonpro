// Analytics and Business Intelligence Types
export type MetricType = 
  | 'APPOINTMENTS_COUNT' | 'REVENUE' | 'PATIENT_SATISFACTION' 
  | 'TREATMENT_SUCCESS' | 'COMPLIANCE_SCORE' | 'SYSTEM_PERFORMANCE'

export interface Analytics {
  id: string
  providerId?: string
  metricType: MetricType
  metricName: string
  metricValue: number
  metricUnit?: string
  periodStart: string
  periodEnd: string
  aggregationLevel: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  anonymized: boolean
  consentBased: boolean
  metadata?: any
  createdAt: string
}

export interface DashboardMetrics {
  totalPatients: number
  totalAppointments: number
  totalRevenue: number
  averageSatisfaction: number
  appointmentGrowth: number
  revenueGrowth: number
  patientRetention: number
  cancellationRate: number
}

export interface RevenueMetrics {
  period: string
  totalRevenue: number
  totalAppointments: number
  averageTicket: number
  paymentMethodDistribution: {
    [method: string]: number
  }
  revenueByService: {
    serviceId: string
    serviceName: string
    revenue: number
    appointments: number
  }[]
}

export interface PatientMetrics {
  totalPatients: number
  newPatients: number
  returningPatients: number
  patientRetention: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  topTreatments: {
    treatment: string
    count: number
  }[]
}

export interface PerformanceMetrics {
  providerId: string
  providerName: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowRate: number
  averageRating: number
  totalRevenue: number
  averageConsultationTime: number
  patientRetentionRate: number
}

export interface ServiceAnalytics {
  serviceId: string
  serviceName: string
  totalBookings: number
  completionRate: number
  averageRating: number
  totalRevenue: number
  averageDuration: number
  popularTimeSlots: {
    hour: number
    bookings: number
  }[]
  seasonalTrends: {
    month: number
    bookings: number
  }[]
}

export interface TrendAnalysis {
  metric: string
  period: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercentage: number
  dataPoints: {
    date: string
    value: number
  }[]
  forecast: {
    date: string
    predictedValue: number
    confidence: number
  }[]
}