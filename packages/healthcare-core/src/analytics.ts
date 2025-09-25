/**
 * Analytics Types - Business Intelligence and Metrics
 */

// Dashboard metrics
export interface DashboardMetrics {
  clinic: ClinicSummary
  appointments: AppointmentMetrics
  financial: FinancialMetrics
  clients: ClientMetrics
  performance: PerformanceMetrics
  period: DateRange
}

export interface ClinicSummary {
  totalClients: number
  totalProfessionals: number
  totalServices: number
  activeAppointments: number
  todayAppointments: number
  thisWeekRevenue: number
  growthRate: number
}

export interface AppointmentMetrics {
  total: number
  completed: number
  cancelled: number
  noShows: number
  completionRate: number
  cancellationRate: number
  noShowRate: number
  averageDuration: number
  busyHours: HourlyData[]
  busyDays: DailyData[]
}

export interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  averageTicket: number
  revenueByService: ServiceRevenue[]
  revenueByProfessional: ProfessionalRevenue[]
  monthlyTrend: MonthlyData[]
  paymentMethodDistribution: PaymentMethodData[]
}

export interface ClientMetrics {
  total: number
  new: number
  returning: number
  churnRate: number
  retentionRate: number
  averageLifetime: number
  topClients: ClientData[]
  demographicDistribution: DemographicData
}

export interface PerformanceMetrics {
  professionalUtilization: ProfessionalUtilization[]
  servicePopularity: ServicePopularity[]
  peakHours: TimeSlot[]
  seasonalTrends: SeasonalData[]
}

// Time-based data structures
export interface DateRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  hour: number
  day: string
  utilization: number
  appointments: number
}

export interface HourlyData {
  hour: number
  count: number
  revenue?: number
}

export interface DailyData {
  date: string
  count: number
  revenue?: number
}

export interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
  appointments: number
}

export interface SeasonalData {
  season: string
  appointments: number
  revenue: number
  growthRate: number
}

// Entity-specific metrics
export interface ServiceRevenue {
  serviceId: string
  serviceName: string
  totalRevenue: number
  appointmentCount: number
  averagePrice: number
  growthRate: number
}

export interface ProfessionalRevenue {
  professionalId: string
  professionalName: string
  totalRevenue: number
  appointmentCount: number
  utilizationRate: number
  customerSatisfaction?: number
}

export interface ProfessionalUtilization {
  professionalId: string
  professionalName: string
  totalHours: number
  bookedHours: number
  utilizationRate: number
  efficiency: number
}

export interface ServicePopularity {
  serviceId: string
  serviceName: string
  bookings: number
  revenue: number
  popularityScore: number
  trend: 'up' | 'down' | 'stable'
}

export interface ClientData {
  clientId: string
  clientName: string
  totalSpent: number
  appointmentCount: number
  lastVisit: Date
  lifetimeValue: number
}

export interface PaymentMethodData {
  method: string
  count: number
  percentage: number
  totalAmount: number
}

export interface DemographicData {
  ageGroups: AgeGroupData[]
  genderDistribution: GenderData[]
  locationDistribution: LocationData[]
}

export interface AgeGroupData {
  range: string
  count: number
  percentage: number
}

export interface GenderData {
  gender: string
  count: number
  percentage: number
}

export interface LocationData {
  city: string
  count: number
  percentage: number
}

// Report types
export interface Report {
  id: string
  type: ReportType
  title: string
  description?: string
  parameters: ReportParameters
  data: Record<string, unknown>
  generatedAt: Date
  generatedBy: string
  format: ReportFormat
}

export enum ReportType {
  FINANCIAL = 'financial',
  APPOINTMENTS = 'appointments',
  CLIENTS = 'clients',
  PROFESSIONALS = 'professionals',
  SERVICES = 'services',
  COMPLIANCE = 'compliance',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export interface ReportParameters {
  dateRange: DateRange
  filters?: Record<string, unknown>
  groupBy?: string[]
  metrics?: string[]
}

// KPI types
export interface KPI {
  id: string
  name: string
  value: number
  target?: number
  unit: string
  trend: TrendData
  category: KPICategory
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  period: string
}

export enum KPICategory {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  CUSTOMER = 'customer',
  GROWTH = 'growth',
}

// Alert types
export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  threshold?: number
  currentValue?: number
  metadata: Record<string, unknown>
  acknowledged: boolean
  createdAt: Date
}

export enum AlertType {
  LOW_REVENUE = 'low_revenue',
  HIGH_CANCELLATION = 'high_cancellation',
  CAPACITY_WARNING = 'capacity_warning',
  COMPLIANCE_ISSUE = 'compliance_issue',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}
