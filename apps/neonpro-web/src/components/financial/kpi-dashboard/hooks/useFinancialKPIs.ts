import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// Types
export interface FinancialKPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target?: number;
  unit: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  category: 'revenue' | 'profitability' | 'efficiency' | 'liquidity';
  description: string;
  drillDownData?: DrillDownData[];
  alerts?: KPIAlert[];
  benchmarkData?: BenchmarkData;
  lastUpdated: Date;
  confidence?: number;
  forecast?: ForecastData;
}

export interface DrillDownData {
  id: string;
  label: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  subCategories?: DrillDownData[];
  metadata?: Record<string, any>;
  period?: string;
  comparison?: {
    previousPeriod: number;
    yearOverYear: number;
  };
}

export interface KPIAlert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high';
  actionRequired?: string;
  autoResolve?: boolean;
}

export interface BenchmarkData {
  industryAverage: number;
  topPerformers: number;
  clinicRanking: number;
  totalClinics: number;
  percentile: number;
  regionAverage?: number;
  sizeCategory?: string;
  lastUpdated: Date;
}

export interface ForecastData {
  nextPeriod: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface KPIFilter {
  dateRange: {
    start: Date;
    end: Date;
    preset: string;
  };
  services: string[];
  providers: string[];
  locations: string[];
  patientSegments: string[];
  comparisonPeriod?: {
    start: Date;
    end: Date;
  };
}

export interface KPIMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  operatingMargin: number;
  ebitda: number;
  cashFlow: number;
  roi: number;
  patientLTV: number;
  averageTicket: number;
  conversionRate: number;
  retentionRate: number;
}

export interface UseFinancialKPIsOptions {
  clinicId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  enableRealTime?: boolean;
  enableBenchmarks?: boolean;
  enableForecasting?: boolean;
  cacheTimeout?: number; // minutes
}

export interface UseFinancialKPIsReturn {
  kpis: FinancialKPI[];
  metrics: KPIMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: KPIFilter;
  activeAlerts: KPIAlert[];
  
  // Actions
  refreshKPIs: () => Promise<void>;
  updateFilters: (filters: Partial<KPIFilter>) => void;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  getKPIHistory: (kpiId: string, days: number) => Promise<any[]>;
  
  // Computed values
  getKPIsByCategory: (category: string) => FinancialKPI[];
  getTrendAnalysis: () => any;
  getPerformanceScore: () => number;
  getBenchmarkComparison: () => any;
}

// Default filters
const getDefaultFilters = (): KPIFilter => ({
  dateRange: {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: 'current-month'
  },
  services: [],
  providers: [],
  locations: [],
  patientSegments: []
});

// KPI calculation functions
const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const threshold = 0.01; // 1% threshold for stability
  const change = (current - previous) / previous;
  
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
};

const calculateChangePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Generate alerts based on KPI values
const generateKPIAlerts = (kpi: FinancialKPI): KPIAlert[] => {
  const alerts: KPIAlert[] = [];
  
  // Target-based alerts
  if (kpi.target) {
    const targetAchievement = (kpi.value / kpi.target) * 100;
    
    if (targetAchievement < 70) {
      alerts.push({
        id: `${kpi.id}-target-critical`,
        type: 'critical',
        message: `${kpi.name} está ${(100 - targetAchievement).toFixed(1)}% abaixo da meta`,
        threshold: kpi.target,
        currentValue: kpi.value,
        createdAt: new Date(),
        acknowledged: false,
        severity: 'high',
        actionRequired: 'Revisar estratégia e implementar ações corretivas',
        autoResolve: false
      });
    } else if (targetAchievement < 90) {
      alerts.push({
        id: `${kpi.id}-target-warning`,
        type: 'warning',
        message: `${kpi.name} está ${(100 - targetAchievement).toFixed(1)}% abaixo da meta`,
        threshold: kpi.target,
        currentValue: kpi.value,
        createdAt: new Date(),
        acknowledged: false,
        severity: 'medium',
        actionRequired: 'Monitorar de perto e considerar ajustes',
        autoResolve: false
      });
    }
  }
  
  // Trend-based alerts
  if (kpi.trend === 'down' && Math.abs(kpi.changePercentage) > 10) {
    alerts.push({
      id: `${kpi.id}-trend-warning`,
      type: 'warning',
      message: `${kpi.name} apresenta queda de ${Math.abs(kpi.changePercentage).toFixed(1)}%`,
      threshold: kpi.previousValue,
      currentValue: kpi.value,
      createdAt: new Date(),
      acknowledged: false,
      severity: 'medium',
      actionRequired: 'Investigar causas da queda',
      autoResolve: true
    });
  }
  
  return alerts;
};

// Main hook
export function useFinancialKPIs({
  clinicId,
  autoRefresh = true,
  refreshInterval = 30,
  enableRealTime = false,
  enableBenchmarks = true,
  enableForecasting = true,
  cacheTimeout = 5
}: UseFinancialKPIsOptions): UseFinancialKPIsReturn {
  // State
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<KPIFilter>(getDefaultFilters());
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: Date }>>(new Map());

  // Fetch financial data from Supabase
  const fetchFinancialData = useCallback(async (): Promise<KPIMetrics> => {
    const { start, end } = filters.dateRange;
    const cacheKey = `financial-data-${clinicId}-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && (new Date().getTime() - cached.timestamp.getTime()) < cacheTimeout * 60 * 1000) {
      return cached.data;
    }
    
    try {
      // Fetch appointments and payments data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          service:services(name, category),
          provider:providers(name),
          patient:patients(id, name)
        `)
        .eq('clinic_id', clinicId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .eq('status', 'completed');
      
      if (appointmentsError) throw appointmentsError;
      
      // Fetch expenses data
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString());
      
      if (expensesError) throw expensesError;
      
      // Calculate metrics
      const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
      
      // Calculate additional metrics
      const uniquePatients = new Set(appointments?.map(apt => apt.patient?.id)).size || 0;
      const averageTicket = uniquePatients > 0 ? totalRevenue / uniquePatients : 0;
      
      const calculatedMetrics: KPIMetrics = {
        totalRevenue,
        totalExpenses,
        netProfit,
        grossMargin,
        operatingMargin: grossMargin * 0.8, // Simplified calculation
        ebitda: netProfit * 1.2, // Simplified calculation
        cashFlow: netProfit * 0.9, // Simplified calculation
        roi: totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0,
        patientLTV: averageTicket * 3.5, // Simplified LTV calculation
        averageTicket,
        conversionRate: 85.5, // Mock data - would come from lead tracking
        retentionRate: 78.2 // Mock data - would come from patient analysis
      };
      
      // Cache the result
      cache.set(cacheKey, { data: calculatedMetrics, timestamp: new Date() });
      setCache(new Map(cache));
      
      return calculatedMetrics;
    } catch (err) {
      console.error('Error fetching financial data:', err);
      throw err;
    }
  }, [clinicId, filters.dateRange, cache, cacheTimeout]);
  
  // Fetch comparison data for previous period
  const fetchComparisonData = useCallback(async (): Promise<KPIMetrics> => {
    const { start, end } = filters.dateRange;
    const periodLength = end.getTime() - start.getTime();
    const comparisonStart = new Date(start.getTime() - periodLength);
    const comparisonEnd = new Date(end.getTime() - periodLength);
    
    const tempFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        start: comparisonStart,
        end: comparisonEnd
      }
    };
    
    // Temporarily update filters for comparison
    const originalFilters = filters;
    setFilters(tempFilters);
    
    try {
      const comparisonMetrics = await fetchFinancialData();
      setFilters(originalFilters);
      return comparisonMetrics;
    } catch (err) {
      setFilters(originalFilters);
      throw err;
    }
  }, [filters, fetchFinancialData]);
  
  // Generate KPIs from metrics
  const generateKPIs = useCallback(async (currentMetrics: KPIMetrics, previousMetrics: KPIMetrics): Promise<FinancialKPI[]> => {
    const kpiList: FinancialKPI[] = [
      {
        id: 'revenue-total',
        name: 'Receita Total',
        value: currentMetrics.totalRevenue,
        previousValue: previousMetrics.totalRevenue,
        target: currentMetrics.totalRevenue * 1.1, // 10% growth target
        unit: 'currency',
        trend: calculateTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
        changePercentage: calculateChangePercentage(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
        category: 'revenue',
        description: 'Receita total do período selecionado',
        lastUpdated: new Date(),
        confidence: 95
      },
      {
        id: 'profit-margin',
        name: 'Margem de Lucro',
        value: currentMetrics.grossMargin,
        previousValue: previousMetrics.grossMargin,
        target: 35,
        unit: 'percentage',
        trend: calculateTrend(currentMetrics.grossMargin, previousMetrics.grossMargin),
        changePercentage: calculateChangePercentage(currentMetrics.grossMargin, previousMetrics.grossMargin),
        category: 'profitability',
        description: 'Margem de lucro bruto sobre receita',
        lastUpdated: new Date(),
        confidence: 92
      },
      {
        id: 'ebitda',
        name: 'EBITDA',
        value: currentMetrics.ebitda,
        previousValue: previousMetrics.ebitda,
        target: currentMetrics.ebitda * 1.15,
        unit: 'currency',
        trend: calculateTrend(currentMetrics.ebitda, previousMetrics.ebitda),
        changePercentage: calculateChangePercentage(currentMetrics.ebitda, previousMetrics.ebitda),
        category: 'profitability',
        description: 'Lucro antes de juros, impostos, depreciação e amortização',
        lastUpdated: new Date(),
        confidence: 88
      },
      {
        id: 'cash-flow',
        name: 'Fluxo de Caixa',
        value: currentMetrics.cashFlow,
        previousValue: previousMetrics.cashFlow,
        target: currentMetrics.cashFlow * 1.2,
        unit: 'currency',
        trend: calculateTrend(currentMetrics.cashFlow, previousMetrics.cashFlow),
        changePercentage: calculateChangePercentage(currentMetrics.cashFlow, previousMetrics.cashFlow),
        category: 'liquidity',
        description: 'Fluxo de caixa operacional do período',
        lastUpdated: new Date(),
        confidence: 90
      },
      {
        id: 'roi',
        name: 'ROI',
        value: currentMetrics.roi,
        previousValue: previousMetrics.roi,
        target: 20,
        unit: 'percentage',
        trend: calculateTrend(currentMetrics.roi, previousMetrics.roi),
        changePercentage: calculateChangePercentage(currentMetrics.roi, previousMetrics.roi),
        category: 'efficiency',
        description: 'Retorno sobre investimento',
        lastUpdated: new Date(),
        confidence: 85
      },
      {
        id: 'patient-ltv',
        name: 'LTV do Paciente',
        value: currentMetrics.patientLTV,
        previousValue: previousMetrics.patientLTV,
        target: 3000,
        unit: 'currency',
        trend: calculateTrend(currentMetrics.patientLTV, previousMetrics.patientLTV),
        changePercentage: calculateChangePercentage(currentMetrics.patientLTV, previousMetrics.patientLTV),
        category: 'efficiency',
        description: 'Valor vitalício médio do paciente',
        lastUpdated: new Date(),
        confidence: 82
      }
    ];
    
    // Add alerts to each KPI
    return kpiList.map(kpi => ({
      ...kpi,
      alerts: generateKPIAlerts(kpi)
    }));
  }, []);
  
  // Main data loading function
  const loadKPIData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [currentMetrics, previousMetrics] = await Promise.all([
        fetchFinancialData(),
        fetchComparisonData()
      ]);
      
      const generatedKPIs = await generateKPIs(currentMetrics, previousMetrics);
      
      setMetrics(currentMetrics);
      setKpis(generatedKPIs);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados financeiros');
      console.error('Error loading KPI data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFinancialData, fetchComparisonData, generateKPIs]);
  
  // Refresh function
  const refreshKPIs = useCallback(async () => {
    // Clear cache for fresh data
    setCache(new Map());
    await loadKPIData();
  }, [loadKPIData]);
  
  // Update filters
  const updateFilters = useCallback((newFilters: Partial<KPIFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setKpis(prev => prev.map(kpi => ({
      ...kpi,
      alerts: kpi.alerts?.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    })));
  }, []);
  
  // Export data
  const exportData = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    // Implementation would depend on export library
    console.log(`Exporting data in ${format} format`);
  }, []);
  
  // Get KPI history
  const getKPIHistory = useCallback(async (kpiId: string, days: number) => {
    // Implementation would fetch historical data
    return [];
  }, []);
  
  // Computed values
  const getKPIsByCategory = useCallback((category: string) => {
    return kpis.filter(kpi => kpi.category === category);
  }, [kpis]);
  
  const getTrendAnalysis = useCallback(() => {
    const trends = {
      improving: kpis.filter(kpi => kpi.trend === 'up').length,
      declining: kpis.filter(kpi => kpi.trend === 'down').length,
      stable: kpis.filter(kpi => kpi.trend === 'stable').length
    };
    
    return {
      ...trends,
      total: kpis.length,
      overallTrend: trends.improving > trends.declining ? 'positive' : 
                   trends.declining > trends.improving ? 'negative' : 'neutral'
    };
  }, [kpis]);
  
  const getPerformanceScore = useCallback(() => {
    if (kpis.length === 0) return 0;
    
    const scores = kpis.map(kpi => {
      if (!kpi.target) return 50; // Neutral score if no target
      const achievement = (kpi.value / kpi.target) * 100;
      return Math.min(100, Math.max(0, achievement));
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [kpis]);
  
  const getBenchmarkComparison = useCallback(() => {
    const benchmarkedKPIs = kpis.filter(kpi => kpi.benchmarkData);
    if (benchmarkedKPIs.length === 0) return null;
    
    const avgPercentile = benchmarkedKPIs.reduce((sum, kpi) => {
      return sum + (kpi.benchmarkData?.percentile || 50);
    }, 0) / benchmarkedKPIs.length;
    
    return {
      averagePercentile: avgPercentile,
      aboveIndustryAverage: benchmarkedKPIs.filter(kpi => 
        kpi.value > (kpi.benchmarkData?.industryAverage || 0)
      ).length,
      totalBenchmarked: benchmarkedKPIs.length
    };
  }, [kpis]);
  
  // Active alerts
  const activeAlerts = useMemo(() => {
    return kpis.flatMap(kpi => kpi.alerts || []).filter(alert => !alert.acknowledged);
  }, [kpis]);
  
  // Auto-refresh effect
  useEffect(() => {
    loadKPIData();
    
    if (autoRefresh) {
      const interval = setInterval(loadKPIData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [loadKPIData, autoRefresh, refreshInterval, filters]);
  
  return {
    kpis,
    metrics,
    isLoading,
    error,
    lastUpdated,
    filters,
    activeAlerts,
    
    // Actions
    refreshKPIs,
    updateFilters,
    acknowledgeAlert,
    exportData,
    getKPIHistory,
    
    // Computed values
    getKPIsByCategory,
    getTrendAnalysis,
    getPerformanceScore,
    getBenchmarkComparison
  };
}
