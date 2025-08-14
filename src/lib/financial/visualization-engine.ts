/**
 * Financial Visualization Engine
 * 
 * Advanced visualization system for financial data with interactive charts and dashboards.
 * Provides comprehensive charting capabilities with real-time updates and customization.
 * 
 * Features:
 * - Multiple chart types (Line, Bar, Pie, Gauge, Heatmap, etc.)
 * - Interactive dashboards with drill-down capabilities
 * - Real-time data streaming and updates
 * - Responsive design and mobile optimization
 * - Export capabilities (PNG, SVG, PDF)
 * - Custom themes and styling
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import FinancialAnalyticsCalculator from './analytics-calculator';

// Types for Visualization Engine
export interface ChartConfiguration {
  chart_id: string;
  type: ChartType;
  title: string;
  description?: string;
  data_source: DataSource;
  styling: ChartStyling;
  interactions: ChartInteractions;
  responsive: ResponsiveConfig;
  animation: AnimationConfig;
  export_options: ExportOptions;
  real_time: RealTimeConfig;
  created_at: string;
  updated_at: string;
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'polar'
  | 'gauge'
  | 'funnel'
  | 'waterfall'
  | 'heatmap'
  | 'treemap'
  | 'sankey'
  | 'candlestick'
  | 'boxplot';

export interface DataSource {
  type: 'database' | 'api' | 'static' | 'calculated';
  source: string;
  query?: string;
  filters?: Record<string, any>;
  aggregations?: Aggregation[];
  transformations?: Transformation[];
  refresh_interval?: number; // in seconds
  cache_duration?: number; // in seconds
}

export interface Aggregation {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'std';
  group_by?: string[];
  having?: string;
}

export interface Transformation {
  type: 'filter' | 'sort' | 'group' | 'calculate' | 'format';
  config: Record<string, any>;
}

export interface ChartStyling {
  theme: 'light' | 'dark' | 'custom';
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    grid: string;
    axis: string;
  };
  fonts: {
    family: string;
    size: {
      title: number;
      subtitle: number;
      axis: number;
      legend: number;
      tooltip: number;
    };
    weight: {
      title: 'normal' | 'bold';
      subtitle: 'normal' | 'bold';
      axis: 'normal' | 'bold';
    };
  };
  layout: {
    margin: { top: number; right: number; bottom: number; left: number };
    padding: { top: number; right: number; bottom: number; left: number };
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right' | 'none';
      align: 'start' | 'center' | 'end';
    };
    grid: {
      show: boolean;
      style: 'solid' | 'dashed' | 'dotted';
      opacity: number;
    };
  };
  custom_css?: string;
}

export interface ChartInteractions {
  hover: {
    enabled: boolean;
    highlight: boolean;
    tooltip: TooltipConfig;
  };
  click: {
    enabled: boolean;
    action: 'drill_down' | 'filter' | 'navigate' | 'custom';
    config?: Record<string, any>;
  };
  zoom: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
    wheel: boolean;
    pinch: boolean;
  };
  pan: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
  };
  selection: {
    enabled: boolean;
    mode: 'single' | 'multiple';
    brush: boolean;
  };
  crossfilter: {
    enabled: boolean;
    linked_charts: string[];
  };
}

export interface TooltipConfig {
  enabled: boolean;
  format: 'default' | 'custom';
  template?: string;
  show_values: boolean;
  show_percentages: boolean;
  show_totals: boolean;
  custom_fields?: string[];
}

export interface ResponsiveConfig {
  enabled: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  adaptations: {
    mobile: Partial<ChartStyling>;
    tablet: Partial<ChartStyling>;
  };
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay: number;
  on_load: boolean;
  on_update: boolean;
  on_hover: boolean;
}

export interface ExportOptions {
  enabled: boolean;
  formats: ('png' | 'svg' | 'pdf' | 'csv' | 'json')[];
  quality: number; // 0-1 for image exports
  dimensions: {
    width: number;
    height: number;
  };
  include_data: boolean;
}

export interface RealTimeConfig {
  enabled: boolean;
  update_interval: number; // in seconds
  websocket_url?: string;
  auto_refresh: boolean;
  buffer_size: number;
  smooth_transitions: boolean;
}

export interface DashboardLayout {
  dashboard_id: string;
  name: string;
  description?: string;
  layout: {
    type: 'grid' | 'flex' | 'masonry';
    columns: number;
    gap: number;
    responsive: boolean;
  };
  widgets: DashboardWidget[];
  filters: GlobalFilter[];
  theme: ChartStyling;
  auto_refresh: {
    enabled: boolean;
    interval: number;
  };
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  widget_id: string;
  chart_id: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  title?: string;
  resizable: boolean;
  movable: boolean;
  min_size: { width: number; height: number };
  max_size: { width: number; height: number };
}

export interface GlobalFilter {
  filter_id: string;
  name: string;
  type: 'date_range' | 'select' | 'multi_select' | 'text' | 'number_range';
  field: string;
  options?: { value: any; label: string }[];
  default_value?: any;
  applies_to: string[]; // chart IDs
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
  metadata?: {
    total_records: number;
    last_updated: string;
    data_range: {
      start: string;
      end: string;
    };
  };
}

export interface Dataset {
  label: string;
  data: (number | { x: number; y: number } | any)[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  type?: ChartType;
  yAxisID?: string;
  stack?: string;
  order?: number;
}

export interface DrillDownConfig {
  enabled: boolean;
  levels: DrillDownLevel[];
  breadcrumb: {
    enabled: boolean;
    position: 'top' | 'bottom';
  };
  back_button: {
    enabled: boolean;
    text: string;
  };
}

export interface DrillDownLevel {
  level: number;
  name: string;
  data_source: DataSource;
  chart_config: Partial<ChartConfiguration>;
  filters_from_parent: string[];
}

class FinancialVisualizationEngine {
  private supabase: ReturnType<typeof createClient<Database>>;
  private analyticsCalculator: FinancialAnalyticsCalculator;
  private clinicId: string;
  private charts: Map<string, ChartConfiguration>;
  private dashboards: Map<string, DashboardLayout>;
  private dataCache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private websockets: Map<string, WebSocket>;
  private updateCallbacks: Map<string, Function[]>;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    clinicId: string
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.analyticsCalculator = new FinancialAnalyticsCalculator(supabaseUrl, supabaseKey, clinicId);
    this.clinicId = clinicId;
    this.charts = new Map();
    this.dashboards = new Map();
    this.dataCache = new Map();
    this.websockets = new Map();
    this.updateCallbacks = new Map();
    
    this.initializeEngine();
  }

  /**
   * Chart Management
   */
  async createChart(config: Omit<ChartConfiguration, 'chart_id' | 'created_at' | 'updated_at'>): Promise<ChartConfiguration> {
    try {
      const chart: ChartConfiguration = {
        ...config,
        chart_id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { error } = await this.supabase
        .from('chart_configurations')
        .insert({
          id: chart.chart_id,
          clinic_id: this.clinicId,
          type: chart.type,
          title: chart.title,
          description: chart.description,
          configuration: {
            data_source: chart.data_source,
            styling: chart.styling,
            interactions: chart.interactions,
            responsive: chart.responsive,
            animation: chart.animation,
            export_options: chart.export_options,
            real_time: chart.real_time
          }
        });

      if (error) throw error;

      this.charts.set(chart.chart_id, chart);
      
      // Setup real-time updates if enabled
      if (chart.real_time.enabled) {
        await this.setupRealTimeUpdates(chart.chart_id);
      }

      return chart;

    } catch (error) {
      console.error('Error creating chart:', error);
      throw new Error('Failed to create chart');
    }
  }

  async updateChart(chartId: string, updates: Partial<ChartConfiguration>): Promise<ChartConfiguration> {
    try {
      const existingChart = this.charts.get(chartId);
      if (!existingChart) {
        throw new Error('Chart not found');
      }

      const updatedChart: ChartConfiguration = {
        ...existingChart,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update in database
      const { error } = await this.supabase
        .from('chart_configurations')
        .update({
          type: updatedChart.type,
          title: updatedChart.title,
          description: updatedChart.description,
          configuration: {
            data_source: updatedChart.data_source,
            styling: updatedChart.styling,
            interactions: updatedChart.interactions,
            responsive: updatedChart.responsive,
            animation: updatedChart.animation,
            export_options: updatedChart.export_options,
            real_time: updatedChart.real_time
          },
          updated_at: updatedChart.updated_at
        })
        .eq('id', chartId)
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      this.charts.set(chartId, updatedChart);
      
      // Update real-time setup if changed
      if (updates.real_time) {
        await this.setupRealTimeUpdates(chartId);
      }

      // Notify subscribers of chart update
      this.notifyChartUpdate(chartId, updatedChart);

      return updatedChart;

    } catch (error) {
      console.error('Error updating chart:', error);
      throw new Error('Failed to update chart');
    }
  }

  async deleteChart(chartId: string): Promise<void> {
    try {
      // Remove from database
      const { error } = await this.supabase
        .from('chart_configurations')
        .delete()
        .eq('id', chartId)
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      // Cleanup real-time connections
      this.cleanupRealTimeUpdates(chartId);
      
      // Remove from memory
      this.charts.delete(chartId);
      this.dataCache.delete(chartId);
      this.updateCallbacks.delete(chartId);

    } catch (error) {
      console.error('Error deleting chart:', error);
      throw new Error('Failed to delete chart');
    }
  }

  /**
   * Data Management
   */
  async getChartData(chartId: string, filters?: Record<string, any>): Promise<ChartData> {
    try {
      const chart = this.charts.get(chartId);
      if (!chart) {
        throw new Error('Chart not found');
      }

      // Check cache first
      const cacheKey = `${chartId}_${JSON.stringify(filters || {})}`;
      const cached = this.dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }

      // Fetch fresh data
      const rawData = await this.fetchDataFromSource(chart.data_source, filters);
      const processedData = await this.processChartData(rawData, chart);
      
      // Cache the result
      const cacheDuration = chart.data_source.cache_duration || 300000; // 5 minutes default
      this.dataCache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now(),
        ttl: cacheDuration
      });

      return processedData;

    } catch (error) {
      console.error('Error getting chart data:', error);
      throw new Error('Failed to get chart data');
    }
  }

  async refreshChartData(chartId: string, filters?: Record<string, any>): Promise<ChartData> {
    try {
      // Clear cache for this chart
      const cacheKey = `${chartId}_${JSON.stringify(filters || {})}`;
      this.dataCache.delete(cacheKey);
      
      // Fetch fresh data
      const data = await this.getChartData(chartId, filters);
      
      // Notify subscribers
      this.notifyDataUpdate(chartId, data);
      
      return data;

    } catch (error) {
      console.error('Error refreshing chart data:', error);
      throw new Error('Failed to refresh chart data');
    }
  }

  /**
   * Dashboard Management
   */
  async createDashboard(layout: Omit<DashboardLayout, 'dashboard_id' | 'created_at' | 'updated_at'>): Promise<DashboardLayout> {
    try {
      const dashboard: DashboardLayout = {
        ...layout,
        dashboard_id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { error } = await this.supabase
        .from('dashboard_layouts')
        .insert({
          id: dashboard.dashboard_id,
          clinic_id: this.clinicId,
          name: dashboard.name,
          description: dashboard.description,
          layout_config: {
            layout: dashboard.layout,
            widgets: dashboard.widgets,
            filters: dashboard.filters,
            theme: dashboard.theme,
            auto_refresh: dashboard.auto_refresh
          }
        });

      if (error) throw error;

      this.dashboards.set(dashboard.dashboard_id, dashboard);
      
      // Setup auto-refresh if enabled
      if (dashboard.auto_refresh.enabled) {
        this.setupDashboardAutoRefresh(dashboard.dashboard_id);
      }

      return dashboard;

    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw new Error('Failed to create dashboard');
    }
  }

  async updateDashboard(dashboardId: string, updates: Partial<DashboardLayout>): Promise<DashboardLayout> {
    try {
      const existingDashboard = this.dashboards.get(dashboardId);
      if (!existingDashboard) {
        throw new Error('Dashboard not found');
      }

      const updatedDashboard: DashboardLayout = {
        ...existingDashboard,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update in database
      const { error } = await this.supabase
        .from('dashboard_layouts')
        .update({
          name: updatedDashboard.name,
          description: updatedDashboard.description,
          layout_config: {
            layout: updatedDashboard.layout,
            widgets: updatedDashboard.widgets,
            filters: updatedDashboard.filters,
            theme: updatedDashboard.theme,
            auto_refresh: updatedDashboard.auto_refresh
          },
          updated_at: updatedDashboard.updated_at
        })
        .eq('id', dashboardId)
        .eq('clinic_id', this.clinicId);

      if (error) throw error;

      this.dashboards.set(dashboardId, updatedDashboard);
      
      // Update auto-refresh if changed
      if (updates.auto_refresh) {
        this.setupDashboardAutoRefresh(dashboardId);
      }

      return updatedDashboard;

    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw new Error('Failed to update dashboard');
    }
  }

  /**
   * Visualization Generation
   */
  async generateFinancialCharts(): Promise<{
    revenue_trend: ChartConfiguration;
    profit_analysis: ChartConfiguration;
    expense_breakdown: ChartConfiguration;
    cash_flow: ChartConfiguration;
    kpi_dashboard: DashboardLayout;
  }> {
    try {
      // Revenue Trend Chart
      const revenueTrend = await this.createChart({
        type: 'line',
        title: 'Revenue Trend Analysis',
        description: 'Monthly revenue trends with forecasting',
        data_source: {
          type: 'calculated',
          source: 'revenue_analytics',
          aggregations: [
            {
              field: 'amount',
              operation: 'sum',
              group_by: ['month', 'year']
            }
          ],
          refresh_interval: 3600 // 1 hour
        },
        styling: this.getDefaultStyling('revenue'),
        interactions: {
          hover: {
            enabled: true,
            highlight: true,
            tooltip: {
              enabled: true,
              format: 'custom',
              template: 'Revenue: ${value} | Month: ${label}',
              show_values: true,
              show_percentages: false,
              show_totals: true
            }
          },
          click: {
            enabled: true,
            action: 'drill_down',
            config: { drill_to: 'daily_revenue' }
          },
          zoom: { enabled: true, type: 'x', wheel: true, pinch: true },
          pan: { enabled: true, type: 'x' },
          selection: { enabled: false, mode: 'single', brush: false },
          crossfilter: { enabled: false, linked_charts: [] }
        },
        responsive: this.getDefaultResponsive(),
        animation: this.getDefaultAnimation(),
        export_options: this.getDefaultExportOptions(),
        real_time: {
          enabled: true,
          update_interval: 300, // 5 minutes
          auto_refresh: true,
          buffer_size: 100,
          smooth_transitions: true
        }
      });

      // Profit Analysis Chart
      const profitAnalysis = await this.createChart({
        type: 'bar',
        title: 'Treatment Profitability Analysis',
        description: 'Profit margins by treatment type',
        data_source: {
          type: 'calculated',
          source: 'treatment_profitability',
          aggregations: [
            {
              field: 'profit_margin',
              operation: 'avg',
              group_by: ['treatment_type']
            }
          ]
        },
        styling: this.getDefaultStyling('profit'),
        interactions: {
          hover: {
            enabled: true,
            highlight: true,
            tooltip: {
              enabled: true,
              format: 'default',
              show_values: true,
              show_percentages: true,
              show_totals: false
            }
          },
          click: {
            enabled: true,
            action: 'filter',
            config: { filter_field: 'treatment_type' }
          },
          zoom: { enabled: false, type: 'xy', wheel: false, pinch: false },
          pan: { enabled: false, type: 'xy' },
          selection: { enabled: true, mode: 'multiple', brush: true },
          crossfilter: { enabled: true, linked_charts: ['revenue_trend'] }
        },
        responsive: this.getDefaultResponsive(),
        animation: this.getDefaultAnimation(),
        export_options: this.getDefaultExportOptions(),
        real_time: {
          enabled: false,
          update_interval: 0,
          auto_refresh: false,
          buffer_size: 0,
          smooth_transitions: false
        }
      });

      // Expense Breakdown Chart
      const expenseBreakdown = await this.createChart({
        type: 'pie',
        title: 'Expense Category Breakdown',
        description: 'Distribution of expenses by category',
        data_source: {
          type: 'database',
          source: 'expenses',
          aggregations: [
            {
              field: 'amount',
              operation: 'sum',
              group_by: ['category']
            }
          ]
        },
        styling: this.getDefaultStyling('expenses'),
        interactions: {
          hover: {
            enabled: true,
            highlight: true,
            tooltip: {
              enabled: true,
              format: 'default',
              show_values: true,
              show_percentages: true,
              show_totals: true
            }
          },
          click: {
            enabled: true,
            action: 'drill_down',
            config: { drill_to: 'expense_details' }
          },
          zoom: { enabled: false, type: 'xy', wheel: false, pinch: false },
          pan: { enabled: false, type: 'xy' },
          selection: { enabled: true, mode: 'single', brush: false },
          crossfilter: { enabled: false, linked_charts: [] }
        },
        responsive: this.getDefaultResponsive(),
        animation: this.getDefaultAnimation(),
        export_options: this.getDefaultExportOptions(),
        real_time: {
          enabled: true,
          update_interval: 1800, // 30 minutes
          auto_refresh: true,
          buffer_size: 50,
          smooth_transitions: true
        }
      });

      // Cash Flow Chart
      const cashFlow = await this.createChart({
        type: 'waterfall',
        title: 'Cash Flow Analysis',
        description: 'Monthly cash flow with inflows and outflows',
        data_source: {
          type: 'calculated',
          source: 'cash_flow_analytics',
          transformations: [
            {
              type: 'calculate',
              config: {
                field: 'net_flow',
                formula: 'inflow - outflow'
              }
            }
          ]
        },
        styling: this.getDefaultStyling('cashflow'),
        interactions: {
          hover: {
            enabled: true,
            highlight: true,
            tooltip: {
              enabled: true,
              format: 'custom',
              template: 'Net Flow: ${value} | Period: ${label}',
              show_values: true,
              show_percentages: false,
              show_totals: true
            }
          },
          click: {
            enabled: true,
            action: 'navigate',
            config: { url: '/financial/cash-flow-details' }
          },
          zoom: { enabled: true, type: 'x', wheel: true, pinch: true },
          pan: { enabled: true, type: 'x' },
          selection: { enabled: true, mode: 'single', brush: true },
          crossfilter: { enabled: false, linked_charts: [] }
        },
        responsive: this.getDefaultResponsive(),
        animation: this.getDefaultAnimation(),
        export_options: this.getDefaultExportOptions(),
        real_time: {
          enabled: true,
          update_interval: 600, // 10 minutes
          auto_refresh: true,
          buffer_size: 200,
          smooth_transitions: true
        }
      });

      // KPI Dashboard
      const kpiDashboard = await this.createDashboard({
        name: 'Financial KPI Dashboard',
        description: 'Comprehensive financial performance overview',
        layout: {
          type: 'grid',
          columns: 12,
          gap: 16,
          responsive: true
        },
        widgets: [
          {
            widget_id: 'revenue_widget',
            chart_id: revenueTrend.chart_id,
            position: { x: 0, y: 0, width: 6, height: 4 },
            title: 'Revenue Trends',
            resizable: true,
            movable: true,
            min_size: { width: 4, height: 3 },
            max_size: { width: 12, height: 8 }
          },
          {
            widget_id: 'profit_widget',
            chart_id: profitAnalysis.chart_id,
            position: { x: 6, y: 0, width: 6, height: 4 },
            title: 'Profitability',
            resizable: true,
            movable: true,
            min_size: { width: 4, height: 3 },
            max_size: { width: 12, height: 8 }
          },
          {
            widget_id: 'expenses_widget',
            chart_id: expenseBreakdown.chart_id,
            position: { x: 0, y: 4, width: 4, height: 4 },
            title: 'Expense Breakdown',
            resizable: true,
            movable: true,
            min_size: { width: 3, height: 3 },
            max_size: { width: 8, height: 6 }
          },
          {
            widget_id: 'cashflow_widget',
            chart_id: cashFlow.chart_id,
            position: { x: 4, y: 4, width: 8, height: 4 },
            title: 'Cash Flow',
            resizable: true,
            movable: true,
            min_size: { width: 6, height: 3 },
            max_size: { width: 12, height: 8 }
          }
        ],
        filters: [
          {
            filter_id: 'date_range',
            name: 'Date Range',
            type: 'date_range',
            field: 'date',
            default_value: {
              start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0]
            },
            applies_to: [revenueTrend.chart_id, profitAnalysis.chart_id, expenseBreakdown.chart_id, cashFlow.chart_id]
          },
          {
            filter_id: 'treatment_type',
            name: 'Treatment Type',
            type: 'multi_select',
            field: 'treatment_type',
            options: [
              { value: 'consultation', label: 'Consultation' },
              { value: 'procedure', label: 'Procedure' },
              { value: 'follow_up', label: 'Follow-up' },
              { value: 'emergency', label: 'Emergency' }
            ],
            applies_to: [revenueTrend.chart_id, profitAnalysis.chart_id]
          }
        ],
        theme: this.getDefaultStyling('dashboard'),
        auto_refresh: {
          enabled: true,
          interval: 300 // 5 minutes
        }
      });

      return {
        revenue_trend: revenueTrend,
        profit_analysis: profitAnalysis,
        expense_breakdown: expenseBreakdown,
        cash_flow: cashFlow,
        kpi_dashboard: kpiDashboard
      };

    } catch (error) {
      console.error('Error generating financial charts:', error);
      throw new Error('Failed to generate financial charts');
    }
  }

  /**
   * Real-time Updates
   */
  async setupRealTimeUpdates(chartId: string): Promise<void> {
    try {
      const chart = this.charts.get(chartId);
      if (!chart || !chart.real_time.enabled) return;

      // Setup WebSocket connection if specified
      if (chart.real_time.websocket_url) {
        const ws = new WebSocket(chart.real_time.websocket_url);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(chartId, data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error for chart', chartId, ':', error);
        };
        
        this.websockets.set(chartId, ws);
      }

      // Setup polling interval
      if (chart.real_time.update_interval > 0) {
        setInterval(async () => {
          try {
            await this.refreshChartData(chartId);
          } catch (error) {
            console.error('Error in real-time update for chart', chartId, ':', error);
          }
        }, chart.real_time.update_interval * 1000);
      }

    } catch (error) {
      console.error('Error setting up real-time updates:', error);
    }
  }

  private cleanupRealTimeUpdates(chartId: string): void {
    const ws = this.websockets.get(chartId);
    if (ws) {
      ws.close();
      this.websockets.delete(chartId);
    }
  }

  private handleRealTimeUpdate(chartId: string, data: any): void {
    // Process real-time data update
    const chart = this.charts.get(chartId);
    if (!chart) return;

    // Clear cache to force refresh
    for (const [key] of this.dataCache.entries()) {
      if (key.startsWith(chartId)) {
        this.dataCache.delete(key);
      }
    }

    // Notify subscribers
    this.notifyDataUpdate(chartId, data);
  }

  /**
   * Event Management
   */
  onChartUpdate(chartId: string, callback: (chart: ChartConfiguration) => void): void {
    if (!this.updateCallbacks.has(chartId)) {
      this.updateCallbacks.set(chartId, []);
    }
    this.updateCallbacks.get(chartId)!.push(callback);
  }

  onDataUpdate(chartId: string, callback: (data: ChartData) => void): void {
    const key = `${chartId}_data`;
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, []);
    }
    this.updateCallbacks.get(key)!.push(callback);
  }

  private notifyChartUpdate(chartId: string, chart: ChartConfiguration): void {
    const callbacks = this.updateCallbacks.get(chartId) || [];
    callbacks.forEach(callback => {
      try {
        callback(chart);
      } catch (error) {
        console.error('Error in chart update callback:', error);
      }
    });
  }

  private notifyDataUpdate(chartId: string, data: any): void {
    const key = `${chartId}_data`;
    const callbacks = this.updateCallbacks.get(key) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in data update callback:', error);
      }
    });
  }

  /**
   * Private helper methods
   */
  private async initializeEngine(): Promise<void> {
    try {
      // Load existing charts
      const { data: charts, error: chartsError } = await this.supabase
        .from('chart_configurations')
        .select('*')
        .eq('clinic_id', this.clinicId);

      if (chartsError) throw chartsError;

      for (const chart of charts || []) {
        const config = chart.configuration as any;
        const chartConfig: ChartConfiguration = {
          chart_id: chart.id,
          type: chart.type as ChartType,
          title: chart.title,
          description: chart.description || '',
          data_source: config.data_source,
          styling: config.styling,
          interactions: config.interactions,
          responsive: config.responsive,
          animation: config.animation,
          export_options: config.export_options,
          real_time: config.real_time,
          created_at: chart.created_at || '',
          updated_at: chart.updated_at || ''
        };
        
        this.charts.set(chart.id, chartConfig);
        
        // Setup real-time updates
        if (chartConfig.real_time.enabled) {
          await this.setupRealTimeUpdates(chart.id);
        }
      }

      // Load existing dashboards
      const { data: dashboards, error: dashboardsError } = await this.supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('clinic_id', this.clinicId);

      if (dashboardsError) throw dashboardsError;

      for (const dashboard of dashboards || []) {
        const config = dashboard.layout_config as any;
        const dashboardLayout: DashboardLayout = {
          dashboard_id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description || '',
          layout: config.layout,
          widgets: config.widgets,
          filters: config.filters,
          theme: config.theme,
          auto_refresh: config.auto_refresh,
          created_at: dashboard.created_at || '',
          updated_at: dashboard.updated_at || ''
        };
        
        this.dashboards.set(dashboard.id, dashboardLayout);
        
        // Setup auto-refresh
        if (dashboardLayout.auto_refresh.enabled) {
          this.setupDashboardAutoRefresh(dashboard.id);
        }
      }

    } catch (error) {
      console.error('Error initializing visualization engine:', error);
    }
  }

  private async fetchDataFromSource(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    switch (dataSource.type) {
      case 'database':
        return this.fetchDatabaseData(dataSource, filters);
      case 'api':
        return this.fetchAPIData(dataSource, filters);
      case 'calculated':
        return this.fetchCalculatedData(dataSource, filters);
      case 'static':
        return this.fetchStaticData(dataSource);
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }

  private async fetchDatabaseData(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    let query = this.supabase.from(dataSource.source).select('*').eq('clinic_id', this.clinicId);
    
    // Apply filters
    if (filters) {
      for (const [field, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(field, value);
        }
      }
    }
    
    // Apply data source filters
    if (dataSource.filters) {
      for (const [field, value] of Object.entries(dataSource.filters)) {
        query = query.eq(field, value);
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  }

  private async fetchAPIData(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    const url = new URL(dataSource.source);
    
    // Add filters as query parameters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        url.searchParams.set(key, String(value));
      }
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async fetchCalculatedData(dataSource: DataSource, filters?: Record<string, any>): Promise<any> {
    switch (dataSource.source) {
      case 'revenue_analytics':
        return this.analyticsCalculator.analyzeRevenueTrends(12);
      case 'treatment_profitability':
        return this.analyticsCalculator.calculateTreatmentProfitability();
      case 'cash_flow_analytics':
        return this.analyticsCalculator.calculateCashFlowMetrics();
      default:
        throw new Error(`Unknown calculated data source: ${dataSource.source}`);
    }
  }

  private fetchStaticData(dataSource: DataSource): any {
    // Return static data defined in the data source
    return dataSource.source;
  }

  private async processChartData(rawData: any, chart: ChartConfiguration): Promise<ChartData> {
    let processedData = rawData;
    
    // Apply aggregations
    if (chart.data_source.aggregations) {
      processedData = this.applyAggregations(processedData, chart.data_source.aggregations);
    }
    
    // Apply transformations
    if (chart.data_source.transformations) {
      processedData = this.applyTransformations(processedData, chart.data_source.transformations);
    }
    
    // Convert to chart format
    return this.convertToChartFormat(processedData, chart.type);
  }

  private applyAggregations(data: any[], aggregations: Aggregation[]): any[] {
    // Implementation for data aggregation
    // This would group data and apply aggregation functions
    return data; // Simplified for now
  }

  private applyTransformations(data: any[], transformations: Transformation[]): any[] {
    let result = data;
    
    for (const transformation of transformations) {
      switch (transformation.type) {
        case 'filter':
          result = result.filter(item => this.evaluateFilter(item, transformation.config));
          break;
        case 'sort':
          result = result.sort((a, b) => this.compareItems(a, b, transformation.config));
          break;
        case 'calculate':
          result = result.map(item => this.calculateField(item, transformation.config));
          break;
        case 'format':
          result = result.map(item => this.formatItem(item, transformation.config));
          break;
      }
    }
    
    return result;
  }

  private convertToChartFormat(data: any[], chartType: ChartType): ChartData {
    // Convert processed data to chart.js format
    // This would vary based on chart type
    return {
      labels: data.map(item => item.label || item.name || item.date),
      datasets: [{
        label: 'Data',
        data: data.map(item => item.value || item.amount || item.count),
        backgroundColor: this.generateColors(data.length),
        borderColor: '#2563eb',
        borderWidth: 2
      }],
      metadata: {
        total_records: data.length,
        last_updated: new Date().toISOString(),
        data_range: {
          start: data[0]?.date || '',
          end: data[data.length - 1]?.date || ''
        }
      }
    };
  }

  private evaluateFilter(item: any, config: any): boolean {
    // Implementation for filter evaluation
    return true; // Simplified
  }

  private compareItems(a: any, b: any, config: any): number {
    // Implementation for sorting comparison
    return 0; // Simplified
  }

  private calculateField(item: any, config: any): any {
    // Implementation for field calculation
    return item; // Simplified
  }

  private formatItem(item: any, config: any): any {
    // Implementation for item formatting
    return item; // Simplified
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
      '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }

  private getDefaultStyling(type: string): ChartStyling {
    const baseColors = {
      revenue: ['#2563eb', '#3b82f6', '#60a5fa'],
      profit: ['#059669', '#10b981', '#34d399'],
      expenses: ['#dc2626', '#ef4444', '#f87171'],
      cashflow: ['#7c3aed', '#8b5cf6', '#a78bfa'],
      dashboard: ['#2563eb', '#059669', '#dc2626', '#d97706']
    };

    return {
      theme: 'light',
      colors: {
        primary: baseColors[type as keyof typeof baseColors] || baseColors.dashboard,
        secondary: ['#64748b', '#94a3b8', '#cbd5e1'],
        background: '#ffffff',
        text: '#1e293b',
        grid: '#e2e8f0',
        axis: '#64748b'
      },
      fonts: {
        family: 'Inter, system-ui, sans-serif',
        size: {
          title: 16,
          subtitle: 14,
          axis: 12,
          legend: 12,
          tooltip: 11
        },
        weight: {
          title: 'bold',
          subtitle: 'normal',
          axis: 'normal'
        }
      },
      layout: {
        margin: { top: 20, right: 20, bottom: 40, left: 60 },
        padding: { top: 10, right: 10, bottom: 10, left: 10 },
        legend: {
          position: 'top',
          align: 'center'
        },
        grid: {
          show: true,
          style: 'solid',
          opacity: 0.1
        }
      }
    };
  }

  private getDefaultResponsive(): ResponsiveConfig {
    return {
      enabled: true,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      },
      adaptations: {
        mobile: {
          fonts: {
            family: 'Inter, system-ui, sans-serif',
            size: {
              title: 14,
              subtitle: 12,
              axis: 10,
              legend: 10,
              tooltip: 9
            },
            weight: {
              title: 'bold',
              subtitle: 'normal',
              axis: 'normal'
            }
          },
          layout: {
            margin: { top: 10, right: 10, bottom: 30, left: 40 },
            padding: { top: 5, right: 5, bottom: 5, left: 5 },
            legend: {
              position: 'bottom',
              align: 'center'
            },
            grid: {
              show: true,
              style: 'dotted',
              opacity: 0.05
            }
          }
        },
        tablet: {
          fonts: {
            family: 'Inter, system-ui, sans-serif',
            size: {
              title: 15,
              subtitle: 13,
              axis: 11,
              legend: 11,
              tooltip: 10
            },
            weight: {
              title: 'bold',
              subtitle: 'normal',
              axis: 'normal'
            }
          }
        }
      }
    };
  }

  private getDefaultAnimation(): AnimationConfig {
    return {
      enabled: true,
      duration: 750,
      easing: 'ease-out',
      delay: 0,
      on_load: true,
      on_update: true,
      on_hover: false
    };
  }

  private getDefaultExportOptions(): ExportOptions {
    return {
      enabled: true,
      formats: ['png', 'svg', 'pdf', 'csv'],
      quality: 1.0,
      dimensions: {
        width: 1200,
        height: 800
      },
      include_data: true
    };
  }

  private setupDashboardAutoRefresh(dashboardId: string): void {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard || !dashboard.auto_refresh.enabled) return;

    setInterval(async () => {
      try {
        // Refresh all charts in the dashboard
        for (const widget of dashboard.widgets) {
          await this.refreshChartData(widget.chart_id);
        }
      } catch (error) {
        console.error('Error in dashboard auto-refresh:', error);
      }
    }, dashboard.auto_refresh.interval * 1000);
  }
}

export default FinancialVisualizationEngine;
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
};