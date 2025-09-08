// Minimal analytics types for dashboards; extend as needed.

export interface KPIEntry {
  key: string // e.g., "revenue", "appointments"
  label: string
  value: number
  delta?: number // percentage change vs previous period
}

export interface TimeSeriesPoint {
  t: string // ISO date
  v: number
}

export interface AnalyticsReport {
  range: 'daily' | 'weekly' | 'monthly'
  kpis: KPIEntry[]
  series?: Record<string, TimeSeriesPoint[]>
}
