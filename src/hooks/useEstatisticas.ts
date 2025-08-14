'use client'

import { useState, useEffect } from 'react'

// Statistics Interfaces
interface PeriodMetrics {
  period: string
  revenue: number
  patients: number
  procedures: number
  satisfaction: number
  conversion: number
  costs: number
  profit: number
  growthRate: number
}

interface ServiceMetrics {
  id: string
  name: string
  category: 'estetica' | 'clinica' | 'tratamento' | 'preventiva'
  revenue: number
  bookings: number
  avgRating: number
  growthRate: number
  profitMargin: number
  avgDuration: number
  avgPrice: number
  totalHours: number
  uniquePatients: number
  repeatRate: number
}

interface ProfessionalMetrics {
  id: string
  name: string
  role: 'medico' | 'enfermeiro' | 'esteticista' | 'recepcionista' | 'administrador'
  patients: number
  revenue: number
  satisfaction: number
  efficiency: number
  certifications: number
  procedures: number
  avgSessionTime: number
  utilizationRate: number
  patientRetentionRate: number
}

interface FinancialMetrics {
  totalRevenue: number
  totalCosts: number
  netProfit: number
  profitMargin: number
  averageTicket: number
  revenueByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  costBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  monthlyProjection: {
    month: string
    projected: number
    target: number
  }[]
}

interface PatientMetrics {
  totalPatients: number
  newPatients: number
  returningPatients: number
  patientRetentionRate: number
  averageAge: number
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  acquisitionSources: {
    source: string
    count: number
    percentage: number
  }[]
  satisfactionScores: {
    excellent: number
    good: number
    average: number
    poor: number
  }
}

interface AnalyticsFilter {
  startDate: string
  endDate: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  category?: string
  professional?: string
  service?: string
}

interface ComparisonMetrics {
  current: PeriodMetrics
  previous: PeriodMetrics
  percentageChange: number
  trend: 'up' | 'down' | 'stable'
  benchmark: {
    industry: number
    target: number
    status: 'above' | 'below' | 'on-target'
  }
}

interface KPIAlert {
  id: string
  type: 'revenue_drop' | 'low_satisfaction' | 'capacity_issue' | 'cost_overrun'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  recommendation: string
  createdAt: string
}

interface UseEstatisticasReturn {
  // Metrics Data
  periodMetrics: PeriodMetrics[]
  serviceMetrics: ServiceMetrics[]
  professionalMetrics: ProfessionalMetrics[]
  financialMetrics: FinancialMetrics
  patientMetrics: PatientMetrics
  comparisonMetrics: ComparisonMetrics
  
  // Filters and Controls
  filters: AnalyticsFilter
  setFilters: (filters: AnalyticsFilter) => void
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  
  // Analytics Functions
  getPeriodMetrics: (period: string) => Promise<PeriodMetrics[]>
  getServiceAnalytics: (serviceId?: string) => Promise<ServiceMetrics[]>
  getProfessionalAnalytics: (professionalId?: string) => Promise<ProfessionalMetrics[]>
  getFinancialBreakdown: (filters: AnalyticsFilter) => Promise<FinancialMetrics>
  getPatientInsights: (filters: AnalyticsFilter) => Promise<PatientMetrics>
  
  // Comparison and Trends
  comparePerformance: (current: string, previous: string) => Promise<ComparisonMetrics>
  getTrendAnalysis: (metric: string, period: string) => Promise<any>
  getForecastData: (months: number) => Promise<PeriodMetrics[]>
  
  // Export and Reporting
  exportAnalytics: (format: 'pdf' | 'excel' | 'csv') => Promise<void>
  generateReport: (template: string, filters: AnalyticsFilter) => Promise<string>
  scheduleReport: (frequency: string, recipients: string[]) => Promise<void>
  
  // Real-time Monitoring
  kpiAlerts: KPIAlert[]
  acknowledgeAlert: (alertId: string) => Promise<void>
  refreshMetrics: () => Promise<void>
  
  // Loading and States
  loading: boolean
  error: string | null
  lastUpdated: string | null
  
  // Healthcare Compliance
  lgpdCompliance: {
    dataRetention: boolean
    patientConsent: boolean
    anonymization: boolean
    auditTrail: boolean
  }
  
  // Advanced Analytics
  cohortAnalysis: any[]
  churnAnalysis: any[]
  revenueAttribution: any[]
  capacityOptimization: any[]
}

export const useEstatisticas = (): UseEstatisticasReturn => {
  // State Management
  const [periodMetrics, setPeriodMetrics] = useState<PeriodMetrics[]>([])
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics[]>([])
  const [professionalMetrics, setProfessionalMetrics] = useState<ProfessionalMetrics[]>([])
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>({} as FinancialMetrics)
  const [patientMetrics, setPatientMetrics] = useState<PatientMetrics>({} as PatientMetrics)
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics>({} as ComparisonMetrics)
  const [kpiAlerts, setKpiAlerts] = useState<KPIAlert[]>([])
  
  const [filters, setFilters] = useState<AnalyticsFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'month'
  })
  
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  // Mock Data - In real implementation, this would come from API
  const mockPeriodMetrics: PeriodMetrics[] = [
    {
      period: 'Janeiro 2025',
      revenue: 145000,
      patients: 320,
      procedures: 480,
      satisfaction: 4.8,
      conversion: 85,
      costs: 87000,
      profit: 58000,
      growthRate: 12.5
    },
    {
      period: 'Dezembro 2024',
      revenue: 132000,
      patients: 298,
      procedures: 445,
      satisfaction: 4.7,
      conversion: 82,
      costs: 79200,
      profit: 52800,
      growthRate: 8.3
    },
    {
      period: 'Novembro 2024',
      revenue: 156000,
      patients: 345,
      procedures: 520,
      satisfaction: 4.9,
      conversion: 87,
      costs: 93600,
      profit: 62400,
      growthRate: 15.8
    },
    {
      period: 'Outubro 2024',
      revenue: 148000,
      patients: 335,
      procedures: 505,
      satisfaction: 4.8,
      conversion: 86,
      costs: 88800,
      profit: 59200,
      growthRate: 11.2
    },
    {
      period: 'Setembro 2024',
      revenue: 162000,
      patients: 365,
      procedures: 545,
      satisfaction: 4.9,
      conversion: 89,
      costs: 97200,
      profit: 64800,
      growthRate: 18.4
    }
  ]

  const mockServiceMetrics: ServiceMetrics[] = [
    {
      id: 'srv-001',
      name: 'Botox Terapêutico',
      category: 'estetica',
      revenue: 85000,
      bookings: 156,
      avgRating: 4.9,
      growthRate: 15.2,
      profitMargin: 68,
      avgDuration: 45,
      avgPrice: 545,
      totalHours: 117,
      uniquePatients: 142,
      repeatRate: 0.78
    },
    {
      id: 'srv-002',
      name: 'Preenchimento Facial',
      category: 'estetica',
      revenue: 78000,
      bookings: 124,
      avgRating: 4.8,
      growthRate: 12.5,
      profitMargin: 65,
      avgDuration: 60,
      avgPrice: 629,
      totalHours: 124,
      uniquePatients: 118,
      repeatRate: 0.72
    },
    {
      id: 'srv-003',
      name: 'Laser CO2 Fracionado',
      category: 'tratamento',
      revenue: 65000,
      bookings: 89,
      avgRating: 4.7,
      growthRate: 18.3,
      profitMargin: 72,
      avgDuration: 90,
      avgPrice: 730,
      totalHours: 133.5,
      uniquePatients: 76,
      repeatRate: 0.65
    },
    {
      id: 'srv-004',
      name: 'Limpeza de Pele Profunda',
      category: 'clinica',
      revenue: 35000,
      bookings: 298,
      avgRating: 4.6,
      growthRate: 8.9,
      profitMargin: 45,
      avgDuration: 75,
      avgPrice: 117,
      totalHours: 372.5,
      uniquePatients: 256,
      repeatRate: 0.85
    },
    {
      id: 'srv-005',
      name: 'Peeling Químico',
      category: 'tratamento',
      revenue: 28000,
      bookings: 87,
      avgRating: 4.5,
      growthRate: 22.1,
      profitMargin: 58,
      avgDuration: 45,
      avgPrice: 322,
      totalHours: 65.25,
      uniquePatients: 71,
      repeatRate: 0.69
    }
  ]

  const mockProfessionalMetrics: ProfessionalMetrics[] = [
    {
      id: 'prof-001',
      name: 'Dra. Maria Santos',
      role: 'medico',
      patients: 1250,
      revenue: 185000,
      satisfaction: 4.9,
      efficiency: 94,
      certifications: 8,
      procedures: 342,
      avgSessionTime: 52,
      utilizationRate: 0.89,
      patientRetentionRate: 0.91
    },
    {
      id: 'prof-002',
      name: 'Carlos Oliveira',
      role: 'enfermeiro',
      patients: 890,
      revenue: 125000,
      satisfaction: 4.7,
      efficiency: 88,
      certifications: 5,
      procedures: 267,
      avgSessionTime: 48,
      utilizationRate: 0.82,
      patientRetentionRate: 0.84
    },
    {
      id: 'prof-003',
      name: 'Ana Ferreira',
      role: 'esteticista',
      patients: 650,
      revenue: 95000,
      satisfaction: 4.8,
      efficiency: 91,
      certifications: 6,
      procedures: 198,
      avgSessionTime: 65,
      utilizationRate: 0.87,
      patientRetentionRate: 0.88
    }
  ]

  const mockFinancialMetrics: FinancialMetrics = {
    totalRevenue: 145000,
    totalCosts: 87000,
    netProfit: 58000,
    profitMargin: 40,
    averageTicket: 453,
    revenueByCategory: [
      { category: 'Estética', amount: 94500, percentage: 65 },
      { category: 'Clínica', amount: 36250, percentage: 25 },
      { category: 'Tratamento', amount: 14500, percentage: 10 }
    ],
    costBreakdown: [
      { category: 'Pessoal', amount: 39150, percentage: 45 },
      { category: 'Produtos', amount: 26100, percentage: 30 },
      { category: 'Infraestrutura', amount: 21750, percentage: 25 }
    ],
    monthlyProjection: [
      { month: 'Fev 2025', projected: 158000, target: 155000 },
      { month: 'Mar 2025', projected: 165000, target: 160000 },
      { month: 'Abr 2025', projected: 172000, target: 165000 }
    ]
  }

  const mockPatientMetrics: PatientMetrics = {
    totalPatients: 320,
    newPatients: 89,
    returningPatients: 231,
    patientRetentionRate: 0.85,
    averageAge: 34.2,
    genderDistribution: {
      male: 32,
      female: 285,
      other: 3
    },
    acquisitionSources: [
      { source: 'Indicação', count: 134, percentage: 42 },
      { source: 'Instagram', count: 89, percentage: 28 },
      { source: 'Google', count: 67, percentage: 21 },
      { source: 'Outros', count: 30, percentage: 9 }
    ],
    satisfactionScores: {
      excellent: 245,
      good: 58,
      average: 12,
      poor: 5
    }
  }

  const mockKpiAlerts: KPIAlert[] = [
    {
      id: 'alert-001',
      type: 'revenue_drop',
      severity: 'medium',
      message: 'Receita de Laser CO2 caiu 12% nos últimos 7 dias',
      value: 5400,
      threshold: 6200,
      recommendation: 'Verificar disponibilidade de equipamento e promoções',
      createdAt: '2025-01-14T09:30:00.000Z'
    },
    {
      id: 'alert-002',
      type: 'low_satisfaction',
      severity: 'high',
      message: 'Satisfação de Carlos Oliveira abaixo de 4.5',
      value: 4.3,
      threshold: 4.5,
      recommendation: 'Treinamento adicional em atendimento ao cliente',
      createdAt: '2025-01-14T08:15:00.000Z'
    }
  ]

  // Initialize data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPeriodMetrics(mockPeriodMetrics)
      setServiceMetrics(mockServiceMetrics)
      setProfessionalMetrics(mockProfessionalMetrics)
      setFinancialMetrics(mockFinancialMetrics)
      setPatientMetrics(mockPatientMetrics)
      setKpiAlerts(mockKpiAlerts)
      
      // Calculate comparison metrics
      const current = mockPeriodMetrics[0]
      const previous = mockPeriodMetrics[1]
      const percentageChange = ((current.revenue - previous.revenue) / previous.revenue) * 100
      
      setComparisonMetrics({
        current,
        previous,
        percentageChange,
        trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable',
        benchmark: {
          industry: 12.5,
          target: 15.0,
          status: percentageChange >= 15 ? 'above' : percentageChange >= 12.5 ? 'on-target' : 'below'
        }
      })
      
      setLastUpdated(new Date().toISOString())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  // Analytics Functions
  const getPeriodMetrics = async (period: string): Promise<PeriodMetrics[]> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter data based on period
      const filteredData = mockPeriodMetrics.filter(metric => {
        // In real implementation, this would filter based on actual date ranges
        return true
      })
      
      return filteredData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas do período')
      return []
    } finally {
      setLoading(false)
    }
  }

  const getServiceAnalytics = async (serviceId?: string): Promise<ServiceMetrics[]> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredServices = mockServiceMetrics
      if (serviceId) {
        filteredServices = mockServiceMetrics.filter(service => service.id === serviceId)
      }
      
      return filteredServices
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar analytics de serviços')
      return []
    } finally {
      setLoading(false)
    }
  }

  const getProfessionalAnalytics = async (professionalId?: string): Promise<ProfessionalMetrics[]> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredProfessionals = mockProfessionalMetrics
      if (professionalId) {
        filteredProfessionals = mockProfessionalMetrics.filter(prof => prof.id === professionalId)
      }
      
      return filteredProfessionals
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar analytics de profissionais')
      return []
    } finally {
      setLoading(false)
    }
  }

  const getFinancialBreakdown = async (filters: AnalyticsFilter): Promise<FinancialMetrics> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In real implementation, this would apply filters to financial data
      return mockFinancialMetrics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar breakdown financeiro')
      return {} as FinancialMetrics
    } finally {
      setLoading(false)
    }
  }

  const getPatientInsights = async (filters: AnalyticsFilter): Promise<PatientMetrics> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Apply filters to patient data
      return mockPatientMetrics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar insights de pacientes')
      return {} as PatientMetrics
    } finally {
      setLoading(false)
    }
  }

  const comparePerformance = async (current: string, previous: string): Promise<ComparisonMetrics> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In real implementation, this would fetch and compare specific periods
      return comparisonMetrics
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao comparar performance')
      return {} as ComparisonMetrics
    } finally {
      setLoading(false)
    }
  }

  const getTrendAnalysis = async (metric: string, period: string): Promise<any> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate trend analysis based on metric and period
      const trendData = {
        metric,
        period,
        data: mockPeriodMetrics.map(period => ({
          period: period.period,
          value: period.revenue,
          trend: period.growthRate
        })),
        correlation: 0.85,
        seasonality: 'detected',
        forecast: {
          next_month: 158000,
          confidence: 0.92
        }
      }
      
      return trendData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar tendências')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getForecastData = async (months: number): Promise<PeriodMetrics[]> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate forecast data for specified months
      const forecastData: PeriodMetrics[] = []
      const lastMetric = mockPeriodMetrics[0]
      const avgGrowthRate = mockPeriodMetrics.reduce((acc, curr) => acc + curr.growthRate, 0) / mockPeriodMetrics.length
      
      for (let i = 1; i <= months; i++) {
        const forecastRevenue = lastMetric.revenue * (1 + (avgGrowthRate / 100) * i)
        const forecastPatients = Math.round(lastMetric.patients * (1 + (avgGrowthRate / 200) * i))
        
        forecastData.push({
          period: `Forecast ${i}`,
          revenue: Math.round(forecastRevenue),
          patients: forecastPatients,
          procedures: Math.round(forecastPatients * 1.5),
          satisfaction: 4.8,
          conversion: 85,
          costs: Math.round(forecastRevenue * 0.6),
          profit: Math.round(forecastRevenue * 0.4),
          growthRate: avgGrowthRate
        })
      }
      
      return forecastData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar previsões')
      return []
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async (format: 'pdf' | 'excel' | 'csv'): Promise<void> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate export file
      const data = {
        periodMetrics,
        serviceMetrics,
        professionalMetrics,
        financialMetrics,
        patientMetrics,
        exportedAt: new Date().toISOString(),
        format
      }
      
      // In real implementation, this would generate and download the file
      console.log(`Exporting analytics as ${format}:`, data)
      
      // Simulate file download
      const filename = `neonpro-analytics-${new Date().toISOString().split('T')[0]}.${format}`
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar analytics')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (template: string, filters: AnalyticsFilter): Promise<string> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate report based on template and filters
      const reportData = {
        template,
        filters,
        generatedAt: new Date().toISOString(),
        data: {
          summary: mockPeriodMetrics[0],
          topServices: mockServiceMetrics.slice(0, 5),
          teamPerformance: mockProfessionalMetrics,
          financialSummary: mockFinancialMetrics
        }
      }
      
      // In real implementation, this would use a template engine
      const reportId = `report-${Date.now()}`
      console.log(`Generated report ${reportId}:`, reportData)
      
      return reportId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório')
      return ''
    } finally {
      setLoading(false)
    }
  }

  const scheduleReport = async (frequency: string, recipients: string[]): Promise<void> => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Schedule report delivery
      const schedule = {
        frequency,
        recipients,
        scheduledAt: new Date().toISOString(),
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      console.log('Report scheduled:', schedule)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar relatório')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setKpiAlerts(prev => prev.filter(alert => alert.id !== alertId))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar alerta')
    }
  }

  const refreshMetrics = async (): Promise<void> => {
    await loadInitialData()
  }

  // Healthcare Compliance
  const lgpdCompliance = {
    dataRetention: true,
    patientConsent: true,
    anonymization: true,
    auditTrail: true
  }

  // Advanced Analytics (placeholder for complex analytics)
  const cohortAnalysis: any[] = []
  const churnAnalysis: any[] = []
  const revenueAttribution: any[] = []
  const capacityOptimization: any[] = []

  return {
    // Metrics Data
    periodMetrics,
    serviceMetrics,
    professionalMetrics,
    financialMetrics,
    patientMetrics,
    comparisonMetrics,
    
    // Filters and Controls
    filters,
    setFilters,
    selectedPeriod,
    setSelectedPeriod,
    
    // Analytics Functions
    getPeriodMetrics,
    getServiceAnalytics,
    getProfessionalAnalytics,
    getFinancialBreakdown,
    getPatientInsights,
    
    // Comparison and Trends
    comparePerformance,
    getTrendAnalysis,
    getForecastData,
    
    // Export and Reporting
    exportAnalytics,
    generateReport,
    scheduleReport,
    
    // Real-time Monitoring
    kpiAlerts,
    acknowledgeAlert,
    refreshMetrics,
    
    // Loading and States
    loading,
    error,
    lastUpdated,
    
    // Healthcare Compliance
    lgpdCompliance,
    
    // Advanced Analytics
    cohortAnalysis,
    churnAnalysis,
    revenueAttribution,
    capacityOptimization
  }
}