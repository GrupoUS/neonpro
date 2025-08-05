import type { createClient } from "@supabase/supabase-js";
import type {
  KPIMetric,
  KPIAlert,
  KPIBenchmark,
  KPIForecast,
  FinancialData,
  ServiceMetrics,
  ProviderMetrics,
  LocationMetrics,
  PatientSegmentMetrics,
  FinancialReport,
  ExportOptions,
  ShareOptions,
  KPIFilter,
  DateRange,
  APIResponse,
  PerformanceMetrics,
} from "./types";
import type { API_CONFIG, API_ENDPOINTS, CACHE_KEYS } from "./config";

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Cache implementation
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = API_CONFIG.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const cache = new CacheManager();

// API Client with retry logic
class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = API_CONFIG.retryAttempts,
  ): Promise<APIResponse<T>> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
        error: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (retries > 0 && error instanceof Error && error.name !== "AbortError") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, retries - 1);
      }

      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

const apiClient = new APIClient();

// Financial KPI Service
export class FinancialKPIService {
  // Fetch KPI data with caching
  static async getKPIData(
    filters: KPIFilter,
    useCache: boolean = true,
  ): Promise<APIResponse<KPIMetric[]>> {
    const cacheKey = `${CACHE_KEYS.KPI_DATA}_${JSON.stringify(filters)}`;

    if (useCache) {
      const cached = cache.get<KPIMetric[]>(cacheKey);
      if (cached) {
        return {
          data: cached,
          success: true,
          error: null,
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (API_CONFIG.enableMocking) {
      return this.getMockKPIData(filters);
    }

    const response = await apiClient.get<KPIMetric[]>(API_ENDPOINTS.KPI_DATA, filters);

    if (response.success && response.data) {
      cache.set(cacheKey, response.data);
    }

    return response;
  }

  // Fetch alerts
  static async getAlerts(filters?: Partial<KPIFilter>): Promise<APIResponse<KPIAlert[]>> {
    if (API_CONFIG.enableMocking) {
      return this.getMockAlerts();
    }

    return apiClient.get<KPIAlert[]>(API_ENDPOINTS.ALERTS, filters);
  }

  // Fetch benchmarks
  static async getBenchmarks(kpiIds: string[]): Promise<APIResponse<KPIBenchmark[]>> {
    if (API_CONFIG.enableMocking) {
      return this.getMockBenchmarks(kpiIds);
    }

    return apiClient.get<KPIBenchmark[]>(API_ENDPOINTS.BENCHMARKS, { kpiIds });
  }

  // Fetch forecasts
  static async getForecasts(
    kpiIds: string[],
    horizon: number = 30,
  ): Promise<APIResponse<KPIForecast[]>> {
    if (API_CONFIG.enableMocking) {
      return this.getMockForecasts(kpiIds, horizon);
    }

    return apiClient.get<KPIForecast[]>(API_ENDPOINTS.FORECASTS, { kpiIds, horizon });
  }

  // Export data
  static async exportData(options: ExportOptions): Promise<APIResponse<{ downloadUrl: string }>> {
    return apiClient.post<{ downloadUrl: string }>(API_ENDPOINTS.EXPORT, options);
  }

  // Share report
  static async shareReport(options: ShareOptions): Promise<APIResponse<{ shareUrl: string }>> {
    return apiClient.post<{ shareUrl: string }>(API_ENDPOINTS.SHARE, options);
  }

  // Mock data generators
  private static async getMockKPIData(filters: KPIFilter): Promise<APIResponse<KPIMetric[]>> {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

    const mockData: KPIMetric[] = [
      {
        id: "total-revenue",
        name: "Receita Total",
        value: 125000,
        previousValue: 118000,
        target: 130000,
        unit: "currency",
        trend: "up",
        changePercent: 5.93,
        status: "good",
        lastUpdated: new Date(),
        category: "revenue",
        description: "Receita total do período selecionado",
      },
      {
        id: "gross-margin",
        name: "Margem Bruta",
        value: 38.5,
        previousValue: 36.2,
        target: 40,
        unit: "percentage",
        trend: "up",
        changePercent: 6.35,
        status: "good",
        lastUpdated: new Date(),
        category: "profitability",
        description: "Margem bruta de lucro",
      },
      {
        id: "cash-flow",
        name: "Fluxo de Caixa",
        value: 45000,
        previousValue: 42000,
        target: 50000,
        unit: "currency",
        trend: "up",
        changePercent: 7.14,
        status: "warning",
        lastUpdated: new Date(),
        category: "cash-flow",
        description: "Fluxo de caixa líquido",
      },
      {
        id: "utilization-rate",
        name: "Taxa de Utilização",
        value: 82.3,
        previousValue: 79.1,
        target: 85,
        unit: "percentage",
        trend: "up",
        changePercent: 4.04,
        status: "good",
        lastUpdated: new Date(),
        category: "efficiency",
        description: "Taxa de utilização dos recursos",
      },
    ];

    return {
      data: mockData,
      success: true,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  private static async getMockAlerts(): Promise<APIResponse<KPIAlert[]>> {
    const mockAlerts: KPIAlert[] = [
      {
        id: "alert-1",
        kpiId: "cash-flow",
        title: "Fluxo de Caixa Abaixo da Meta",
        message: "O fluxo de caixa está 10% abaixo da meta mensal",
        severity: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        threshold: 50000,
        currentValue: 45000,
      },
      {
        id: "alert-2",
        kpiId: "utilization-rate",
        title: "Excelente Taxa de Utilização",
        message: "Taxa de utilização superou a meta em 3%",
        severity: "info",
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        threshold: 80,
        currentValue: 82.3,
      },
    ];

    return {
      data: mockAlerts,
      success: true,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  private static async getMockBenchmarks(kpiIds: string[]): Promise<APIResponse<KPIBenchmark[]>> {
    const mockBenchmarks: KPIBenchmark[] = [
      {
        id: "benchmark-1",
        kpiId: "total-revenue",
        industry: "healthcare",
        segment: "dental-clinic",
        percentile25: 80000,
        percentile50: 120000,
        percentile75: 180000,
        percentile90: 250000,
        source: "Industry Report 2024",
        lastUpdated: new Date(),
      },
      {
        id: "benchmark-2",
        kpiId: "gross-margin",
        industry: "healthcare",
        segment: "dental-clinic",
        percentile25: 30,
        percentile50: 38,
        percentile75: 45,
        percentile90: 55,
        source: "Industry Report 2024",
        lastUpdated: new Date(),
      },
    ];

    return {
      data: mockBenchmarks.filter((b) => kpiIds.includes(b.kpiId)),
      success: true,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }

  private static async getMockForecasts(
    kpiIds: string[],
    horizon: number,
  ): Promise<APIResponse<KPIForecast[]>> {
    const mockForecasts: KPIForecast[] = [
      {
        id: "forecast-1",
        kpiId: "total-revenue",
        predictions: Array.from({ length: horizon }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          value: 125000 + Math.random() * 20000 - 10000,
          confidence: 0.85 - i * 0.01,
        })),
        model: "ARIMA",
        accuracy: 0.92,
        lastTrained: new Date(),
        createdAt: new Date(),
      },
    ];

    return {
      data: mockForecasts.filter((f) => kpiIds.includes(f.kpiId)),
      success: true,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}

// Supabase Service for real-time data
export class SupabaseKPIService {
  // Real-time KPI subscription
  static subscribeToKPIUpdates(callback: (data: KPIMetric[]) => void, filters?: KPIFilter) {
    return supabase
      .channel("kpi-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_kpis",
        },
        (payload) => {
          // Process real-time updates
          this.processKPIUpdate(payload, callback, filters);
        },
      )
      .subscribe();
  }

  // Process real-time updates
  private static async processKPIUpdate(
    payload: any,
    callback: (data: KPIMetric[]) => void,
    filters?: KPIFilter,
  ) {
    try {
      // Fetch updated data
      const response = await FinancialKPIService.getKPIData(filters || {}, false);
      if (response.success && response.data) {
        callback(response.data);
      }
    } catch (error) {
      console.error("Error processing KPI update:", error);
    }
  }

  // Fetch financial data from Supabase
  static async getFinancialData(
    dateRange: DateRange,
    filters?: Partial<KPIFilter>,
  ): Promise<FinancialData | null> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          total_amount,
          status,
          created_at,
          service:services(name, category),
          provider:providers(name),
          patient:patients(name)
        `)
        .gte("created_at", dateRange.startDate.toISOString())
        .lte("created_at", dateRange.endDate.toISOString());

      if (error) throw error;

      // Process and aggregate data
      return this.processFinancialData(data || []);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      return null;
    }
  }

  // Process raw financial data
  private static processFinancialData(rawData: any[]): FinancialData {
    const totalRevenue = rawData
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + (item.total_amount || 0), 0);

    const totalAppointments = rawData.length;
    const completedAppointments = rawData.filter((item) => item.status === "completed").length;
    const averageTicket = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    return {
      totalRevenue,
      totalAppointments,
      completedAppointments,
      averageTicket,
      conversionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      period: {
        startDate: new Date(),
        endDate: new Date(),
      },
    };
  }

  // Get service metrics
  static async getServiceMetrics(dateRange: DateRange): Promise<ServiceMetrics[]> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          service:services(id, name, category, price),
          total_amount,
          status
        `)
        .gte("created_at", dateRange.startDate.toISOString())
        .lte("created_at", dateRange.endDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;

      // Group by service and calculate metrics
      const serviceGroups =
        data?.reduce(
          (acc, item) => {
            const serviceId = item.service?.id;
            if (!serviceId) return acc;

            if (!acc[serviceId]) {
              acc[serviceId] = {
                id: serviceId,
                name: item.service.name,
                category: item.service.category,
                revenue: 0,
                appointments: 0,
                averagePrice: item.service.price || 0,
              };
            }

            acc[serviceId].revenue += item.total_amount || 0;
            acc[serviceId].appointments += 1;

            return acc;
          },
          {} as Record<string, ServiceMetrics>,
        ) || {};

      return Object.values(serviceGroups);
    } catch (error) {
      console.error("Error fetching service metrics:", error);
      return [];
    }
  }

  // Get provider metrics
  static async getProviderMetrics(dateRange: DateRange): Promise<ProviderMetrics[]> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          provider:providers(id, name),
          total_amount,
          status,
          duration
        `)
        .gte("created_at", dateRange.startDate.toISOString())
        .lte("created_at", dateRange.endDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;

      // Group by provider and calculate metrics
      const providerGroups =
        data?.reduce(
          (acc, item) => {
            const providerId = item.provider?.id;
            if (!providerId) return acc;

            if (!acc[providerId]) {
              acc[providerId] = {
                id: providerId,
                name: item.provider.name,
                revenue: 0,
                appointments: 0,
                averageTicket: 0,
                utilizationRate: 0,
              };
            }

            acc[providerId].revenue += item.total_amount || 0;
            acc[providerId].appointments += 1;

            return acc;
          },
          {} as Record<string, ProviderMetrics>,
        ) || {};

      // Calculate averages
      Object.values(providerGroups).forEach((provider) => {
        provider.averageTicket =
          provider.appointments > 0 ? provider.revenue / provider.appointments : 0;
        // Note: utilizationRate would need additional schedule data
        provider.utilizationRate = 75 + Math.random() * 20; // Mock for now
      });

      return Object.values(providerGroups);
    } catch (error) {
      console.error("Error fetching provider metrics:", error);
      return [];
    }
  }
}

// Performance monitoring
export class PerformanceService {
  private static metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    dataFreshness: 0,
    errorRate: 0,
    cacheHitRate: 0,
  };

  static startTimer(operation: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  static recordMetric(operation: string, value: number): void {
    switch (operation) {
      case "load":
        this.metrics.loadTime = value;
        break;
      case "render":
        this.metrics.renderTime = value;
        break;
      case "data-freshness":
        this.metrics.dataFreshness = value;
        break;
    }
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static clearMetrics(): void {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      dataFreshness: 0,
      errorRate: 0,
      cacheHitRate: 0,
    };
  }
}

// Export all services
export default {
  FinancialKPIService,
  SupabaseKPIService,
  PerformanceService,
  cache,
};
