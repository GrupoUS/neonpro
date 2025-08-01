/**
 * Dashboard Widget System
 * 
 * Comprehensive widget management system for the executive dashboard,
 * handling widget lifecycle, configuration, and rendering optimization.
 */

import { 
  DashboardWidget, 
  WidgetType, 
  WidgetConfig, 
  WidgetData, 
  WidgetLayout,
  KPIMetric,
  ChartConfig,
  TableConfig,
  AlertConfig,
  WidgetPermissions
} from './types';
import { kpiCalculator } from './kpi-calculator';
import { realTimeService } from './real-time-service';

// ============================================================================
// WIDGET FACTORY TYPES
// ============================================================================

interface WidgetFactory {
  create(config: WidgetConfig): DashboardWidget;
  validate(config: WidgetConfig): boolean;
  getDefaultConfig(): Partial<WidgetConfig>;
}

interface WidgetRenderer {
  render(widget: DashboardWidget, data: WidgetData): Promise<any>;
  update(widget: DashboardWidget, data: WidgetData): Promise<any>;
  destroy(widget: DashboardWidget): Promise<void>;
}

interface WidgetCache {
  widgetId: string;
  data: WidgetData;
  timestamp: Date;
  ttl: number;
}

// ============================================================================
// WIDGET SYSTEM CLASS
// ============================================================================

export class DashboardWidgetSystem {
  private widgets: Map<string, DashboardWidget> = new Map();
  private factories: Map<WidgetType, WidgetFactory> = new Map();
  private renderers: Map<WidgetType, WidgetRenderer> = new Map();
  private cache: Map<string, WidgetCache> = new Map();
  private updateSubscriptions: Map<string, string> = new Map(); // widgetId -> subscriptionId
  
  // Configuration
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_WIDGETS_PER_DASHBOARD = 50;
  private readonly WIDGET_UPDATE_DEBOUNCE = 1000; // 1 second

  constructor() {
    this.initializeFactories();
    this.initializeRenderers();
    this.startCacheCleanup();
  }

  // ============================================================================
  // WIDGET LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Create a new widget
   */
  async createWidget(
    dashboardId: string,
    config: WidgetConfig,
    permissions: WidgetPermissions
  ): Promise<DashboardWidget> {
    // Validate widget limit
    const dashboardWidgets = Array.from(this.widgets.values())
      .filter(w => w.dashboardId === dashboardId);
    
    if (dashboardWidgets.length >= this.MAX_WIDGETS_PER_DASHBOARD) {
      throw new Error(`Maximum widgets per dashboard (${this.MAX_WIDGETS_PER_DASHBOARD}) exceeded`);
    }

    // Get factory for widget type
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new Error(`No factory found for widget type: ${config.type}`);
    }

    // Validate configuration
    if (!factory.validate(config)) {
      throw new Error('Invalid widget configuration');
    }

    // Create widget
    const widget = factory.create({
      ...factory.getDefaultConfig(),
      ...config,
      id: config.id || this.generateWidgetId(),
      dashboardId,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Store widget
    this.widgets.set(widget.id, widget);

    // Setup real-time updates if enabled
    if (widget.config.realTimeUpdates) {
      await this.setupRealTimeUpdates(widget);
    }

    // Load initial data
    await this.loadWidgetData(widget);

    console.log(`Widget created: ${widget.id} (${widget.config.type})`);
    return widget;
  }

  /**
   * Update widget configuration
   */
  async updateWidget(
    widgetId: string,
    updates: Partial<WidgetConfig>
  ): Promise<DashboardWidget> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget not found: ${widgetId}`);
    }

    // Validate permissions
    if (!widget.permissions.canEdit) {
      throw new Error('Insufficient permissions to edit widget');
    }

    // Update configuration
    const updatedConfig = { ...widget.config, ...updates };
    
    // Validate updated configuration
    const factory = this.factories.get(updatedConfig.type);
    if (!factory || !factory.validate(updatedConfig)) {
      throw new Error('Invalid widget configuration update');
    }

    // Apply updates
    widget.config = updatedConfig;
    widget.updatedAt = new Date();

    // Update real-time subscription if needed
    if (updates.realTimeUpdates !== undefined) {
      if (updates.realTimeUpdates) {
        await this.setupRealTimeUpdates(widget);
      } else {
        await this.removeRealTimeUpdates(widget);
      }
    }

    // Invalidate cache
    this.cache.delete(widgetId);

    // Reload data
    await this.loadWidgetData(widget);

    this.widgets.set(widgetId, widget);
    console.log(`Widget updated: ${widgetId}`);
    return widget;
  }

  /**
   * Delete widget
   */
  async deleteWidget(widgetId: string): Promise<boolean> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      return false;
    }

    // Check permissions
    if (!widget.permissions.canDelete) {
      throw new Error('Insufficient permissions to delete widget');
    }

    // Remove real-time updates
    await this.removeRealTimeUpdates(widget);

    // Destroy renderer
    const renderer = this.renderers.get(widget.config.type);
    if (renderer) {
      await renderer.destroy(widget);
    }

    // Clean up cache
    this.cache.delete(widgetId);

    // Remove widget
    this.widgets.delete(widgetId);

    console.log(`Widget deleted: ${widgetId}`);
    return true;
  }

  /**
   * Get widget by ID
   */
  getWidget(widgetId: string): DashboardWidget | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * Get all widgets for a dashboard
   */
  getDashboardWidgets(dashboardId: string): DashboardWidget[] {
    return Array.from(this.widgets.values())
      .filter(widget => widget.dashboardId === dashboardId)
      .sort((a, b) => a.config.layout.order - b.config.layout.order);
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  /**
   * Load data for a widget
   */
  async loadWidgetData(widget: DashboardWidget): Promise<WidgetData> {
    // Check cache first
    const cached = this.getFromCache(widget.id);
    if (cached) {
      widget.data = cached;
      return cached;
    }

    try {
      let data: WidgetData;

      switch (widget.config.type) {
        case 'kpi':
          data = await this.loadKPIData(widget);
          break;
        case 'chart':
          data = await this.loadChartData(widget);
          break;
        case 'table':
          data = await this.loadTableData(widget);
          break;
        case 'alert':
          data = await this.loadAlertData(widget);
          break;
        case 'metric':
          data = await this.loadMetricData(widget);
          break;
        default:
          throw new Error(`Unsupported widget type: ${widget.config.type}`);
      }

      // Cache the data
      this.setCache(widget.id, data);
      
      // Update widget
      widget.data = data;
      widget.lastDataUpdate = new Date();
      
      return data;
    } catch (error) {
      console.error(`Failed to load data for widget ${widget.id}:`, error);
      throw error;
    }
  }

  /**
   * Refresh widget data
   */
  async refreshWidget(widgetId: string): Promise<DashboardWidget> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget not found: ${widgetId}`);
    }

    // Clear cache
    this.cache.delete(widgetId);
    
    // Reload data
    await this.loadWidgetData(widget);
    
    // Re-render if needed
    const renderer = this.renderers.get(widget.config.type);
    if (renderer && widget.data) {
      await renderer.update(widget, widget.data);
    }

    return widget;
  }

  /**
   * Refresh all widgets for a dashboard
   */
  async refreshDashboard(dashboardId: string): Promise<DashboardWidget[]> {
    const widgets = this.getDashboardWidgets(dashboardId);
    
    const refreshPromises = widgets.map(widget => 
      this.refreshWidget(widget.id).catch(error => {
        console.error(`Failed to refresh widget ${widget.id}:`, error);
        return widget; // Return original widget on error
      })
    );

    return Promise.all(refreshPromises);
  }

  // ============================================================================
  // WIDGET DATA LOADERS
  // ============================================================================

  private async loadKPIData(widget: DashboardWidget): Promise<WidgetData> {
    const config = widget.config as WidgetConfig & { kpiId?: string };
    const dateRange = this.getDateRangeFromWidget(widget);
    
    if (config.kpiId) {
      // Load specific KPI
      const allKPIs = await kpiCalculator.calculateAllKPIs(
        widget.dashboardId.split('_')[0], // Extract clinic ID
        dateRange
      );
      
      const kpi = allKPIs.find(k => k.id === config.kpiId);
      if (!kpi) {
        throw new Error(`KPI not found: ${config.kpiId}`);
      }
      
      return {
        type: 'kpi',
        value: kpi,
        timestamp: new Date(),
        metadata: {
          source: 'kpi-calculator',
          widgetId: widget.id
        }
      };
    } else {
      // Load all KPIs
      const kpis = await kpiCalculator.calculateAllKPIs(
        widget.dashboardId.split('_')[0],
        dateRange
      );
      
      return {
        type: 'kpi',
        value: kpis,
        timestamp: new Date(),
        metadata: {
          source: 'kpi-calculator',
          widgetId: widget.id,
          count: kpis.length
        }
      };
    }
  }

  private async loadChartData(widget: DashboardWidget): Promise<WidgetData> {
    const config = widget.config as WidgetConfig & ChartConfig;
    const dateRange = this.getDateRangeFromWidget(widget);
    
    // Mock chart data - replace with actual data source
    const chartData = {
      labels: this.generateDateLabels(dateRange),
      datasets: await this.generateChartDatasets(config, dateRange)
    };
    
    return {
      type: 'chart',
      value: chartData,
      timestamp: new Date(),
      metadata: {
        source: 'chart-data-service',
        widgetId: widget.id,
        chartType: config.chartType
      }
    };
  }

  private async loadTableData(widget: DashboardWidget): Promise<WidgetData> {
    const config = widget.config as WidgetConfig & TableConfig;
    
    // Mock table data - replace with actual data source
    const tableData = {
      columns: config.columns || [],
      rows: await this.generateTableRows(config),
      pagination: {
        page: 1,
        pageSize: config.pageSize || 10,
        total: 100 // Mock total
      }
    };
    
    return {
      type: 'table',
      value: tableData,
      timestamp: new Date(),
      metadata: {
        source: 'table-data-service',
        widgetId: widget.id,
        rowCount: tableData.rows.length
      }
    };
  }

  private async loadAlertData(widget: DashboardWidget): Promise<WidgetData> {
    const config = widget.config as WidgetConfig & AlertConfig;
    
    // Mock alert data - replace with actual alert service
    const alerts = [
      {
        id: 'alert-1',
        title: 'Revenue Below Target',
        message: 'Monthly revenue is 15% below target',
        severity: 'warning' as const,
        timestamp: new Date(),
        acknowledged: false
      }
    ];
    
    return {
      type: 'alert',
      value: alerts,
      timestamp: new Date(),
      metadata: {
        source: 'alert-service',
        widgetId: widget.id,
        alertCount: alerts.length
      }
    };
  }

  private async loadMetricData(widget: DashboardWidget): Promise<WidgetData> {
    const config = widget.config as WidgetConfig & { metricId?: string };
    
    // Mock metric data - replace with actual metric service
    const metric = {
      id: config.metricId || 'default-metric',
      name: 'Sample Metric',
      value: Math.random() * 100,
      unit: '%',
      trend: 'up' as const,
      change: 5.2
    };
    
    return {
      type: 'metric',
      value: metric,
      timestamp: new Date(),
      metadata: {
        source: 'metric-service',
        widgetId: widget.id
      }
    };
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  private async setupRealTimeUpdates(widget: DashboardWidget): Promise<void> {
    // Remove existing subscription
    await this.removeRealTimeUpdates(widget);
    
    // Create new subscription
    const subscriptionId = realTimeService.subscribe(
      widget.dashboardId.split('_')[0], // Extract clinic ID
      'system', // System user for widget updates
      [widget.id],
      widget.config.updateFrequency || 'medium',
      async (update) => {
        await this.handleRealTimeUpdate(widget, update);
      }
    );
    
    this.updateSubscriptions.set(widget.id, subscriptionId);
    console.log(`Real-time updates enabled for widget: ${widget.id}`);
  }

  private async removeRealTimeUpdates(widget: DashboardWidget): Promise<void> {
    const subscriptionId = this.updateSubscriptions.get(widget.id);
    if (subscriptionId) {
      realTimeService.unsubscribe(subscriptionId);
      this.updateSubscriptions.delete(widget.id);
      console.log(`Real-time updates disabled for widget: ${widget.id}`);
    }
  }

  private async handleRealTimeUpdate(widget: DashboardWidget, update: any): Promise<void> {
    try {
      // Invalidate cache
      this.cache.delete(widget.id);
      
      // Reload data
      await this.loadWidgetData(widget);
      
      // Update renderer
      const renderer = this.renderers.get(widget.config.type);
      if (renderer && widget.data) {
        await renderer.update(widget, widget.data);
      }
      
      console.log(`Widget ${widget.id} updated via real-time`);
    } catch (error) {
      console.error(`Failed to handle real-time update for widget ${widget.id}:`, error);
    }
  }

  // ============================================================================
  // WIDGET FACTORIES
  // ============================================================================

  private initializeFactories(): void {
    // KPI Widget Factory
    this.factories.set('kpi', {
      create: (config) => ({
        id: config.id!,
        dashboardId: config.dashboardId!,
        config,
        permissions: config.permissions!,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: null,
        lastDataUpdate: null
      }),
      validate: (config) => {
        return config.type === 'kpi' && !!config.title;
      },
      getDefaultConfig: () => ({
        type: 'kpi' as WidgetType,
        title: 'KPI Widget',
        layout: { x: 0, y: 0, width: 4, height: 2, order: 0 },
        realTimeUpdates: true,
        updateFrequency: 'medium'
      })
    });

    // Chart Widget Factory
    this.factories.set('chart', {
      create: (config) => ({
        id: config.id!,
        dashboardId: config.dashboardId!,
        config,
        permissions: config.permissions!,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: null,
        lastDataUpdate: null
      }),
      validate: (config) => {
        const chartConfig = config as ChartConfig;
        return config.type === 'chart' && !!config.title && !!chartConfig.chartType;
      },
      getDefaultConfig: () => ({
        type: 'chart' as WidgetType,
        title: 'Chart Widget',
        layout: { x: 0, y: 0, width: 6, height: 4, order: 0 },
        chartType: 'line',
        realTimeUpdates: false,
        updateFrequency: 'low'
      })
    });

    // Add more factories for other widget types...
  }

  // ============================================================================
  // WIDGET RENDERERS
  // ============================================================================

  private initializeRenderers(): void {
    // KPI Renderer
    this.renderers.set('kpi', {
      render: async (widget, data) => {
        console.log(`Rendering KPI widget: ${widget.id}`);
        return { rendered: true, type: 'kpi' };
      },
      update: async (widget, data) => {
        console.log(`Updating KPI widget: ${widget.id}`);
        return { updated: true, type: 'kpi' };
      },
      destroy: async (widget) => {
        console.log(`Destroying KPI widget: ${widget.id}`);
      }
    });

    // Chart Renderer
    this.renderers.set('chart', {
      render: async (widget, data) => {
        console.log(`Rendering chart widget: ${widget.id}`);
        return { rendered: true, type: 'chart' };
      },
      update: async (widget, data) => {
        console.log(`Updating chart widget: ${widget.id}`);
        return { updated: true, type: 'chart' };
      },
      destroy: async (widget) => {
        console.log(`Destroying chart widget: ${widget.id}`);
      }
    });

    // Add more renderers for other widget types...
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getDateRangeFromWidget(widget: DashboardWidget): { start: Date; end: Date } {
    const config = widget.config as any;
    const now = new Date();
    
    if (config.dateRange) {
      return config.dateRange;
    }
    
    // Default to last 30 days
    return {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now
    };
  }

  private generateDateLabels(dateRange: { start: Date; end: Date }): string[] {
    const labels: string[] = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      labels.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return labels;
  }

  private async generateChartDatasets(config: ChartConfig, dateRange: { start: Date; end: Date }): Promise<any[]> {
    // Mock chart datasets - replace with actual data
    return [
      {
        label: 'Revenue',
        data: Array.from({ length: 30 }, () => Math.random() * 10000),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }
    ];
  }

  private async generateTableRows(config: TableConfig): Promise<any[]> {
    // Mock table rows - replace with actual data
    return Array.from({ length: config.pageSize || 10 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.random() * 1000,
      status: Math.random() > 0.5 ? 'active' : 'inactive'
    }));
  }

  private generateWidgetId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFromCache(widgetId: string): WidgetData | null {
    const cached = this.cache.get(widgetId);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(widgetId);
      return null;
    }
    
    return cached.data;
  }

  private setCache(widgetId: string, data: WidgetData, ttl: number = this.CACHE_TTL): void {
    this.cache.set(widgetId, {
      widgetId,
      data,
      timestamp: new Date(),
      ttl
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      this.cache.forEach((cached, widgetId) => {
        if (now - cached.timestamp.getTime() > cached.ttl) {
          this.cache.delete(widgetId);
        }
      });
    }, 60000); // Clean up every minute
  }

  /**
   * Get system statistics
   */
  getStats(): {
    totalWidgets: number;
    widgetsByType: Record<WidgetType, number>;
    cacheSize: number;
    activeSubscriptions: number;
  } {
    const widgetsByType = {} as Record<WidgetType, number>;
    
    this.widgets.forEach(widget => {
      widgetsByType[widget.config.type] = (widgetsByType[widget.config.type] || 0) + 1;
    });
    
    return {
      totalWidgets: this.widgets.size,
      widgetsByType,
      cacheSize: this.cache.size,
      activeSubscriptions: this.updateSubscriptions.size
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    // Remove all real-time subscriptions
    this.updateSubscriptions.forEach((subscriptionId) => {
      realTimeService.unsubscribe(subscriptionId);
    });
    this.updateSubscriptions.clear();

    // Clear all caches
    this.cache.clear();

    // Clear widgets
    this.widgets.clear();

    console.log('Dashboard widget system cleaned up');
  }
}

// Export singleton instance
export const widgetSystem = new DashboardWidgetSystem();
