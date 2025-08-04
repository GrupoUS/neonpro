/**
 * Financial System - Main Export Module
 * 
 * Unified interface for the complete financial management system.
 * Provides centralized access to all financial modules and utilities.
 * 
 * Features:
 * - Dashboard Engine for real-time financial monitoring
 * - Analytics Calculator for advanced financial analysis
 * - BI Integration for business intelligence tools
 * - Report Generator for automated reporting
 * - Visualization Engine for interactive charts
 * - Unified configuration and initialization
 */

// Core Financial Modules
export { default as FinancialDashboardEngine } from './dashboard-engine';
export { default as FinancialAnalyticsCalculator } from './analytics-calculator';
export { default as FinancialBIIntegration } from './bi-integration';
export { default as FinancialReportGenerator } from './report-generator';
export { default as FinancialVisualizationEngine } from './visualization-engine';

// Type Exports - Dashboard Engine
export type {
  FinancialKPIs,
  FinancialMetrics,
  DashboardConfig,
  PerformanceMetrics,
  CacheConfig,
  WebSocketConfig,
  AlertConfig,
  Alert,
  KPITarget,
  MetricThreshold
} from './dashboard-engine';

// Type Exports - Analytics Calculator
export type {
  TreatmentProfitability,
  RevenueTrends,
  FinancialBenchmarks,
  FinancialInsights,
  CostOptimization,
  PredictiveMetrics,
  AnalyticsConfig,
  TrendAnalysis,
  ProfitabilityAnalysis,
  BenchmarkComparison,
  InsightGeneration,
  OptimizationRecommendation
} from './analytics-calculator';

// Type Exports - BI Integration
export type {
  BIConnection,
  DataExport,
  StreamingConfig,
  EmbeddedDashboard,
  MetricDefinition,
  DataPipeline,
  BIProvider,
  ExportFormat,
  StreamingMetrics,
  DashboardEmbed,
  DataTransformation,
  QualityCheck
} from './bi-integration';

// Type Exports - Report Generator
export type {
  ReportTemplate,
  ReportSection,
  ReportStyling,
  ReportParameter,
  ReportSchedule,
  GeneratedReport,
  ChartConfig
} from './report-generator';

// Type Exports - Visualization Engine
export type {
  ChartConfiguration,
  ChartType,
  DataSource,
  ChartStyling,
  ChartInteractions,
  DashboardLayout,
  DashboardWidget,
  ChartData,
  Dataset
} from './visualization-engine';

// Unified Financial System Configuration
export interface FinancialSystemConfig {
  supabase: {
    url: string;
    key: string;
  };
  clinic_id: string;
  modules: {
    dashboard: {
      enabled: boolean;
      real_time: boolean;
      cache_duration: number;
      websocket_url?: string;
    };
    analytics: {
      enabled: boolean;
      advanced_calculations: boolean;
      predictive_modeling: boolean;
      benchmark_comparison: boolean;
    };
    bi_integration: {
      enabled: boolean;
      providers: string[];
      auto_sync: boolean;
      streaming: boolean;
    };
    reporting: {
      enabled: boolean;
      auto_generation: boolean;
      scheduled_reports: boolean;
      distribution: boolean;
    };
    visualization: {
      enabled: boolean;
      interactive_charts: boolean;
      real_time_updates: boolean;
      export_capabilities: boolean;
    };
  };
  performance: {
    cache_size: number;
    max_concurrent_operations: number;
    timeout_ms: number;
    retry_attempts: number;
  };
  security: {
    encryption_enabled: boolean;
    audit_logging: boolean;
    access_control: boolean;
    data_masking: boolean;
  };
}

// Unified Financial System Class
export class FinancialSystem {
  private config: FinancialSystemConfig;
  private dashboardEngine?: FinancialDashboardEngine;
  private analyticsCalculator?: FinancialAnalyticsCalculator;
  private biIntegration?: FinancialBIIntegration;
  private reportGenerator?: FinancialReportGenerator;
  private visualizationEngine?: FinancialVisualizationEngine;
  private initialized: boolean = false;

  constructor(config: FinancialSystemConfig) {
    this.config = config;
  }

  /**
   * Initialize the complete financial system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Financial System...');

      // Initialize Dashboard Engine
      if (this.config.modules.dashboard.enabled) {
        this.dashboardEngine = new FinancialDashboardEngine(
          this.config.supabase.url,
          this.config.supabase.key,
          this.config.clinic_id
        );
        console.log('✅ Dashboard Engine initialized');
      }

      // Initialize Analytics Calculator
      if (this.config.modules.analytics.enabled) {
        this.analyticsCalculator = new FinancialAnalyticsCalculator(
          this.config.supabase.url,
          this.config.supabase.key,
          this.config.clinic_id
        );
        console.log('✅ Analytics Calculator initialized');
      }

      // Initialize BI Integration
      if (this.config.modules.bi_integration.enabled) {
        this.biIntegration = new FinancialBIIntegration(
          this.config.supabase.url,
          this.config.supabase.key,
          this.config.clinic_id
        );
        console.log('✅ BI Integration initialized');
      }

      // Initialize Report Generator
      if (this.config.modules.reporting.enabled) {
        this.reportGenerator = new FinancialReportGenerator(
          this.config.supabase.url,
          this.config.supabase.key,
          this.config.clinic_id
        );
        console.log('✅ Report Generator initialized');
      }

      // Initialize Visualization Engine
      if (this.config.modules.visualization.enabled) {
        this.visualizationEngine = new FinancialVisualizationEngine(
          this.config.supabase.url,
          this.config.supabase.key,
          this.config.clinic_id
        );
        console.log('✅ Visualization Engine initialized');
      }

      this.initialized = true;
      console.log('🚀 Financial System fully initialized');

    } catch (error) {
      console.error('❌ Error initializing Financial System:', error);
      throw new Error('Failed to initialize Financial System');
    }
  }

  /**
   * Get Dashboard Engine instance
   */
  getDashboard(): FinancialDashboardEngine {
    if (!this.initialized || !this.dashboardEngine) {
      throw new Error('Dashboard Engine not initialized');
    }
    return this.dashboardEngine;
  }

  /**
   * Get Analytics Calculator instance
   */
  getAnalytics(): FinancialAnalyticsCalculator {
    if (!this.initialized || !this.analyticsCalculator) {
      throw new Error('Analytics Calculator not initialized');
    }
    return this.analyticsCalculator;
  }

  /**
   * Get BI Integration instance
   */
  getBI(): FinancialBIIntegration {
    if (!this.initialized || !this.biIntegration) {
      throw new Error('BI Integration not initialized');
    }
    return this.biIntegration;
  }

  /**
   * Get Report Generator instance
   */
  getReporting(): FinancialReportGenerator {
    if (!this.initialized || !this.reportGenerator) {
      throw new Error('Report Generator not initialized');
    }
    return this.reportGenerator;
  }

  /**
   * Get Visualization Engine instance
   */
  getVisualization(): FinancialVisualizationEngine {
    if (!this.initialized || !this.visualizationEngine) {
      throw new Error('Visualization Engine not initialized');
    }
    return this.visualizationEngine;
  }

  /**
   * Get comprehensive financial overview
   */
  async getFinancialOverview(timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    kpis: any;
    analytics: any;
    charts: any;
    reports: any;
    insights: any;
  }> {
    try {
      if (!this.initialized) {
        throw new Error('Financial System not initialized');
      }

      const results: any = {};

      // Get KPIs from Dashboard
      if (this.dashboardEngine) {
        results.kpis = await this.dashboardEngine.calculateKPIs();
      }

      // Get Analytics
      if (this.analyticsCalculator) {
        results.analytics = {
          profitability: await this.analyticsCalculator.calculateTreatmentProfitability(),
          trends: await this.analyticsCalculator.analyzeRevenueTrends(12),
          insights: await this.analyticsCalculator.generateFinancialInsights()
        };
      }

      // Get Charts
      if (this.visualizationEngine) {
        results.charts = await this.visualizationEngine.generateFinancialCharts();
      }

      // Get Recent Reports
      if (this.reportGenerator) {
        results.reports = await this.reportGenerator.getReportAnalytics(timeframe);
      }

      // Generate Insights
      results.insights = await this.generateSystemInsights(results);

      return results;

    } catch (error) {
      console.error('Error getting financial overview:', error);
      throw new Error('Failed to get financial overview');
    }
  }

  /**
   * Generate automated financial insights
   */
  private async generateSystemInsights(data: any): Promise<any[]> {
    const insights = [];

    try {
      // Revenue insights
      if (data.analytics?.trends) {
        const trends = data.analytics.trends;
        if (trends.growth_rate > 10) {
          insights.push({
            type: 'positive',
            category: 'revenue',
            title: 'Strong Revenue Growth',
            description: `Revenue is growing at ${trends.growth_rate.toFixed(1)}% rate`,
            recommendation: 'Consider expanding successful treatment offerings'
          });
        } else if (trends.growth_rate < -5) {
          insights.push({
            type: 'warning',
            category: 'revenue',
            title: 'Revenue Decline Detected',
            description: `Revenue is declining at ${Math.abs(trends.growth_rate).toFixed(1)}% rate`,
            recommendation: 'Review pricing strategy and patient acquisition'
          });
        }
      }

      // Profitability insights
      if (data.analytics?.profitability) {
        const profitability = data.analytics.profitability;
        const avgMargin = profitability.reduce((sum: number, item: any) => sum + item.profit_margin, 0) / profitability.length;
        
        if (avgMargin > 30) {
          insights.push({
            type: 'positive',
            category: 'profitability',
            title: 'Excellent Profit Margins',
            description: `Average profit margin is ${avgMargin.toFixed(1)}%`,
            recommendation: 'Maintain current operational efficiency'
          });
        } else if (avgMargin < 15) {
          insights.push({
            type: 'warning',
            category: 'profitability',
            title: 'Low Profit Margins',
            description: `Average profit margin is only ${avgMargin.toFixed(1)}%`,
            recommendation: 'Review costs and optimize treatment pricing'
          });
        }
      }

      // KPI insights
      if (data.kpis) {
        if (data.kpis.patient_satisfaction > 4.5) {
          insights.push({
            type: 'positive',
            category: 'operations',
            title: 'High Patient Satisfaction',
            description: `Patient satisfaction score: ${data.kpis.patient_satisfaction}/5`,
            recommendation: 'Leverage positive reviews for marketing'
          });
        }

        if (data.kpis.appointment_utilization < 70) {
          insights.push({
            type: 'warning',
            category: 'operations',
            title: 'Low Appointment Utilization',
            description: `Only ${data.kpis.appointment_utilization}% of slots are filled`,
            recommendation: 'Improve scheduling efficiency and patient outreach'
          });
        }
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    return insights;
  }

  /**
   * Health check for all financial modules
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    modules: Record<string, { status: string; message?: string }>;
    overall_score: number;
  }> {
    const moduleHealth: Record<string, { status: string; message?: string }> = {};
    let healthyModules = 0;
    let totalModules = 0;

    try {
      // Check Dashboard Engine
      if (this.config.modules.dashboard.enabled) {
        totalModules++;
        try {
          if (this.dashboardEngine) {
            await this.dashboardEngine.calculateKPIs();
            moduleHealth.dashboard = { status: 'healthy' };
            healthyModules++;
          } else {
            moduleHealth.dashboard = { status: 'unhealthy', message: 'Not initialized' };
          }
        } catch (error) {
          moduleHealth.dashboard = { status: 'unhealthy', message: 'Health check failed' };
        }
      }

      // Check Analytics Calculator
      if (this.config.modules.analytics.enabled) {
        totalModules++;
        try {
          if (this.analyticsCalculator) {
            await this.analyticsCalculator.generateFinancialInsights();
            moduleHealth.analytics = { status: 'healthy' };
            healthyModules++;
          } else {
            moduleHealth.analytics = { status: 'unhealthy', message: 'Not initialized' };
          }
        } catch (error) {
          moduleHealth.analytics = { status: 'unhealthy', message: 'Health check failed' };
        }
      }

      // Check BI Integration
      if (this.config.modules.bi_integration.enabled) {
        totalModules++;
        try {
          if (this.biIntegration) {
            moduleHealth.bi_integration = { status: 'healthy' };
            healthyModules++;
          } else {
            moduleHealth.bi_integration = { status: 'unhealthy', message: 'Not initialized' };
          }
        } catch (error) {
          moduleHealth.bi_integration = { status: 'unhealthy', message: 'Health check failed' };
        }
      }

      // Check Report Generator
      if (this.config.modules.reporting.enabled) {
        totalModules++;
        try {
          if (this.reportGenerator) {
            moduleHealth.reporting = { status: 'healthy' };
            healthyModules++;
          } else {
            moduleHealth.reporting = { status: 'unhealthy', message: 'Not initialized' };
          }
        } catch (error) {
          moduleHealth.reporting = { status: 'unhealthy', message: 'Health check failed' };
        }
      }

      // Check Visualization Engine
      if (this.config.modules.visualization.enabled) {
        totalModules++;
        try {
          if (this.visualizationEngine) {
            moduleHealth.visualization = { status: 'healthy' };
            healthyModules++;
          } else {
            moduleHealth.visualization = { status: 'unhealthy', message: 'Not initialized' };
          }
        } catch (error) {
          moduleHealth.visualization = { status: 'unhealthy', message: 'Health check failed' };
        }
      }

      const healthScore = totalModules > 0 ? (healthyModules / totalModules) * 100 : 0;
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

      if (healthScore >= 90) {
        overallStatus = 'healthy';
      } else if (healthScore >= 60) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'unhealthy';
      }

      return {
        status: overallStatus,
        modules: moduleHealth,
        overall_score: healthScore
      };

    } catch (error) {
      console.error('Error during health check:', error);
      return {
        status: 'unhealthy',
        modules: moduleHealth,
        overall_score: 0
      };
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down Financial System...');

      // Cleanup modules
      this.dashboardEngine = undefined;
      this.analyticsCalculator = undefined;
      this.biIntegration = undefined;
      this.reportGenerator = undefined;
      this.visualizationEngine = undefined;

      this.initialized = false;
      console.log('✅ Financial System shutdown complete');

    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
}

// Utility Functions
export const createFinancialSystem = (config: FinancialSystemConfig): FinancialSystem => {
  return new FinancialSystem(config);
};

export const getDefaultFinancialConfig = (clinicId: string, supabaseUrl: string, supabaseKey: string): FinancialSystemConfig => {
  return {
    supabase: {
      url: supabaseUrl,
      key: supabaseKey
    },
    clinic_id: clinicId,
    modules: {
      dashboard: {
        enabled: true,
        real_time: true,
        cache_duration: 300000, // 5 minutes
        websocket_url: undefined
      },
      analytics: {
        enabled: true,
        advanced_calculations: true,
        predictive_modeling: true,
        benchmark_comparison: true
      },
      bi_integration: {
        enabled: true,
        providers: ['tableau', 'powerbi', 'looker'],
        auto_sync: true,
        streaming: true
      },
      reporting: {
        enabled: true,
        auto_generation: true,
        scheduled_reports: true,
        distribution: true
      },
      visualization: {
        enabled: true,
        interactive_charts: true,
        real_time_updates: true,
        export_capabilities: true
      }
    },
    performance: {
      cache_size: 1000,
      max_concurrent_operations: 10,
      timeout_ms: 30000,
      retry_attempts: 3
    },
    security: {
      encryption_enabled: true,
      audit_logging: true,
      access_control: true,
      data_masking: true
    }
  };
};

// Export the main system class as default
export default FinancialSystem;

/**
 * Financial System Usage Example:
 * 
 * ```typescript
 * import { FinancialSystem, getDefaultFinancialConfig } from '@/lib/financial';
 * 
 * // Initialize the system
 * const config = getDefaultFinancialConfig('clinic_123', supabaseUrl, supabaseKey);
 * const financialSystem = new FinancialSystem(config);
 * 
 * await financialSystem.initialize();
 * 
 * // Get comprehensive overview
 * const overview = await financialSystem.getFinancialOverview('month');
 * 
 * // Access individual modules
 * const dashboard = financialSystem.getDashboard();
 * const analytics = financialSystem.getAnalytics();
 * const reporting = financialSystem.getReporting();
 * 
 * // Generate reports
 * const monthlyReport = await reporting.generateReport('monthly_summary');
 * 
 * // Create visualizations
 * const charts = await financialSystem.getVisualization().generateFinancialCharts();
 * 
 * // Health check
 * const health = await financialSystem.healthCheck();
 * 
 * // Cleanup
 * await financialSystem.shutdown();
 * ```
 */